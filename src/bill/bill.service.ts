import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Bill } from './entities/bill.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUtil } from 'src/utils/response.util';
import { MailerService } from 'src/utils/mailer.service';
import { v4 as uuidv4 } from 'uuid';
import { BranchOffices } from 'src/branch-offices/entities/branch-office.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Client } from 'src/clients/entities/client.entity';
import { PDFGenerator } from 'src/utils/pdfgenerator.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { CommonService } from 'src/common-services/common.service';
import { RequestService } from 'src/request/request.service';
import { Request } from 'src/request/entities/request.entity';
import { LogReportService } from 'src/log-report/log-report.service';
import { LogReport } from 'src/log-report/entities/log-report.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ConfigurationSheetService } from 'src/configuration-sheet/configuration-sheet.service';
import { Mutex } from 'async-mutex';
import * as moment from 'moment-timezone';
import { PropaneTruck } from 'src/propane-truck/entities/propane-truck.entity';
import { CourseLogService } from 'src/course-log/course-log.service';
import { CourseLog } from 'src/course-log/entities/course-log.entity';

function transformDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${'20' + year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

@Injectable()
export class BillService {
  dataEmail: any;
  private mutex = new Mutex();

  constructor(
    @InjectRepository(Bill) private billRepository: Repository<Bill>,
    @InjectRepository(BranchOffices) private branchOfficeRepository: Repository<BranchOffices>,
    @InjectRepository(Usuario) private userRepository: Repository<Usuario>,
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(Request) private requestRepository: Repository<Request>,
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(LogReport) private logReportRepository: Repository<LogReport>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(PropaneTruck) private propaneTruckRepository: Repository<PropaneTruck>,
    @InjectRepository(CourseLog) private courseLogRepository: Repository<CourseLog>,

    @Inject(NotificationsService) private notificationsService: NotificationsService,
    @Inject(UsuariosService) private userService: UsuariosService,
    @Inject(CourseLogService) private courseLogService: CourseLogService,
    private commonService: CommonService,
    private requestService: RequestService,
    private logReportService: LogReportService,
    private configurationSheetService: ConfigurationSheetService,
  ) { }

  async create(billData: Bill): Promise<any> {
    return this.mutex.runExclusive(async () => {
      console.log(`================= BillData ${billData.plate} ================`);
      console.log(billData);
      console.log('======================================================');

      // Validación temprana fuera de la transacción
      if (billData.charge.masaTotal <= 0) {
        const logReport = this.logReportRepository.create({
          code_event: 1,
          userId: billData.operator.toString(),
        });
        const createdLogReport = await this.logReportService.create(logReport);
        return ResponseUtil.error(
          401,
          'La masa no puede ser menor o igual a 0, se ha creado un informe de error',
          createdLogReport
        );
      }

      const userId = billData.operator.toString();
      const existingUser = await this.userService.findUserById(userId);
      if (existingUser.statusCode !== 200) {
        return ResponseUtil.error(400, 'Usuario no válido');
      }

      const queryRunner = this.billRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Validación de fechas dentro de la transacción
        if (!isValidDateFormat(billData.charge.fechaInicial)) {
          billData.charge.fechaInicial = getCurrentDateFormatted();
        }
        if (!isValidDateFormat(billData.charge.fechaFinal)) {
          billData.charge.fechaFinal = getCurrentDateFormatted();
        }

        const existingBill = await queryRunner.manager
          .createQueryBuilder(Bill, "bill")
          .setLock("pessimistic_write")
          .where("JSON_EXTRACT(bill.charge, '$.fechaInicial') = :fechaInicial", { fechaInicial: billData.charge.fechaInicial })
          .andWhere("JSON_EXTRACT(bill.charge, '$.horaInicial') = :horaInicial", { horaInicial: billData.charge.horaInicial })
          .andWhere("bill.bill_code = :bill_code", { bill_code: billData.charge.consecutivo })
          .andWhere("bill.plate = :plate", { plate: billData.plate })
          .getOne();

        if (existingBill) {
          await queryRunner.rollbackTransaction();
          console.log('===================== FACTURA EXISTENTE ========================');
          console.log(billData.plate);
          console.log('Masa:', billData.charge.masaTotal);
          console.log('Fecha:', billData.charge.fechaInicial, billData.charge.horaInicial);
          console.log('se ha creado un informe de error STATUS SEND 200');
          console.log('================================================================');
          return ResponseUtil.error(
            200,
            'Ya existe una factura con los mismos datos, se ha creado un informe de error',
            billData.plate
          );
        }

        // Consultas paralelas optimizadas
        const [branchOffice, operator, client] = await Promise.all([
          queryRunner.manager.findOne(BranchOffices, {
            where: { id: billData.branch_office.toString() },
            select: ['name', 'nit', 'address', 'branch_office_code', 'kilogramValue', 'latitude', 'longitude']
          }),
          queryRunner.manager.findOne(Usuario, {
            where: { id: billData.operator.toString() },
            select: ['firstName', 'lastName', 'idNumber']
          }),
          queryRunner.manager.findOne(Client, {
            where: { id: billData.client.toString() },
            select: ['firstName', 'lastName', 'cc', 'email']
          }),
        ]);

        if (!branchOffice || !operator || !client) {
          await queryRunner.rollbackTransaction();
          return ResponseUtil.error(400, 'Datos relacionados no encontrados');
        }

        // Cálculos optimizados
        const total = branchOffice.kilogramValue * billData.charge.masaTotal;
        const fechaInicial = formatFecha(billData.charge.fechaInicial, billData.charge.horaInicial);
        const fechaFinal = formatFecha(billData.charge.fechaFinal, billData.charge.horaFinal);
        const duration = Math.abs(new Date(fechaFinal).getTime() - new Date(fechaInicial).getTime());
        const service_time = msToTime(duration);
        const bill_code = billData.charge.consecutivo;
      
        if (billData) {
          const newBill = this.billRepository.create({
            ...billData,
            id: uuidv4(),
            bill_code,
            branch_office_name: branchOffice.name,
            branch_office_nit: branchOffice.nit,
            branch_office_address: branchOffice.address,
            branch_office_code: branchOffice.branch_office_code,
            client_firstName: client.firstName,
            client_lastName: client.lastName,
            client_cc: client.cc,
            operator_firstName: operator.firstName,
            operator_lastName: operator.lastName,
            densidad: billData.charge.densidad,
            temperatura: billData.charge.temperatura,
            masaTotal: parseFloat(billData.charge.masaTotal),
            volumenTotal: billData.charge.volumenTotal,
            fecha: formatFecha(billData.charge.fechaInicial, billData.charge.horaInicial),
            horaInicial: billData.charge.horaInicial,
            horaFinal: billData.charge.horaFinal,
            fechaInicial: billData.charge.fechaInicial,
            fechaFinal: billData.charge.fechaFinal,
            service_time,
            total,
          });

          // Crear courseLog
          const courseLog = this.courseLogRepository.create({
            plate: billData.plate,
            operator: `${operator.firstName} ${operator.lastName}`,
            scheduling_date: billData.charge.fechaInicial,
            orders: [billData.folio.toString()],
            delivered_volume: billData.charge.volumenTotal,
            delivered_mass: billData.charge.masaTotal,
            last_delivery: branchOffice.name,
            last_latitude: branchOffice.latitude,
            last_longitude: branchOffice.longitude,
          });

          const createdBill = await queryRunner.manager.save(newBill);

          console.log('===================== FACTURA CREADA ========================');
          console.log(createdBill.branch_office_name, 'Recibo: ', createdBill.bill_code);
          console.log(createdBill.fecha);
          console.log('Masa Total: ', billData.charge.masaTotal);
          console.log(createdBill.operator_firstName, createdBill.operator_lastName);
          console.log(billData.plate);
          console.log('=============================================================');

          await queryRunner.commitTransaction();

          // Para las actualizaciones relacionadas

          if (createdBill) {
            await Promise.all([
              this.commonService.updateBranchOfficeStatus(billData.branch_office, { status: "CARGADO" }),
              this.orderRepository.findOne({ where: { folio: billData.folio } })
                .then(order => order && this.commonService.updateOrder(order.id, { status: "FINALIZADO" })),
              this.courseLogService.update(courseLog),
            ]);

            this.updateStatus(branchOffice.id);
            PDFGenerator.generatePDF(createdBill); // Llama al generador de PDF

            const dataEmail = await this.loadDataEmail();
            MailerService.sendEmail(createdBill, client.email, dataEmail);

            this.notificationsService.create(this.notificationRepository.create({
              status: "NO LEIDO",
              message: `Se ha creado una nueva remisión con el código ${createdBill.id} en el establecimiento ${createdBill.branch_office_name}`,
              title: `Nueva remisión en ${createdBill.branch_office_name}`,
              type: "CARGUE",
              intercourse: createdBill.id
            }));

            await this.requestService.create(this.requestRepository.create({
              folio: billData.folio,
              payment_type: billData.payment_type,
              plate: billData.plate,
              idNumber: operator.idNumber,
              branch_office_code: branchOffice.branch_office_code,
              data_series: {
                densidad: billData.charge.densidad,
                temperatura: billData.charge.temperatura,
                masaTotal: billData.charge.masaTotal,
                volumenTotal: billData.charge.volumenTotal,
                fechaInicial,
                fechaFinal,
                service_time,
                total
              }
            }));

            return ResponseUtil.success(200, 'Factura creada exitosamente', createdBill);
          } else {
            await queryRunner.rollbackTransaction();
            return ResponseUtil.error(400, 'Ha ocurrido un problema al crear la factura',);
          }
        }
      } catch (error) {
        console.log(error.message);
        await queryRunner.rollbackTransaction();
        return ResponseUtil.error(500, 'Ha ocurrido un error al crear la factura', error.message);
      } finally {
        await queryRunner.release();
      }
    });
  }

  async findAll(): Promise<any> {
    try {
      const bills = await this.billRepository.find({
        relations: [
          'branch_office',
          'branch_office.city',
          'branch_office.city.department',
          'branch_office.zone',

          'operator',
          'operator.role',

          'client',
          'client.occupation',
        ]
      })

      if (!bills) {
        return ResponseUtil.error(
          400,
          'No se han encontrado facturas'
        );
      }

      return ResponseUtil.success(
        200,
        'facturas encontradas',
        bills
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener las facturas',
      );
    }
  }

  async findOne(id: string) {
    try {
      const bill = await this.billRepository.findOne({
        where: { id },
        relations: [
          'branch_office',
          'branch_office.city',
          'branch_office.city.department',
          'branch_office.zone',

          'operator',
          'operator.role',

          'client',
          'client.occupation',
        ]
      });

      if (bill) {
        return ResponseUtil.success(
          200,
          'Factura encontrada',
          bill
        );
      } else {
        return ResponseUtil.error(
          404,
          'Factura no encontrada'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener la Factura'
      );
    }
  }

  async update(id, billData) {
    try {
      const existingBill = await this.billRepository.findOne({
        where: { id },
      });

      if (!existingBill) {
        throw new NotFoundException('Factura no encontrada');
      }

      const branch_office = await this.branchOfficeRepository.findByIds(
        billData.branch_office
      );

      const operator = await this.userRepository.findByIds(
        billData.operator
      );

      const client = await this.clientRepository.findByIds(
        billData.client
      );

      const updatedBill = await this.billRepository.save({
        ...existingBill,
        ...billData,
        branch_office: branch_office,
        operator: operator,
        client: client
      });

      return ResponseUtil.success(
        200,
        'Factura actualizada exitosamente',
        updatedBill
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseUtil.error(
          404,
          'Factura no encontrada'
        );
      }
      return ResponseUtil.error(
        500,
        'Error al actualizar la Factura'
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const existingBill = await this.billRepository.findOne({
        where: { id },
      });

      if (!existingBill) {
        return ResponseUtil.error(404, 'Factura no encontrada');
      }

      existingBill.status = 'INACTIVO';
      const updatedBill = await this.billRepository.save(existingBill);

      if (updatedBill) {
        return ResponseUtil.success(
          200,
          'Factura eliminada exitosamente',
          updatedBill
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al eliminar la Factura'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al eliminar la Factura'
      );
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////

  async createMultiple(billData: any): Promise<any> {
    for (let i = 0; i < billData.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Espera 1 segundo
      this.create(billData[i]);
    }

    return ResponseUtil.success(
      200,
      'Facturas creadas exitosamente'
    );
  }

  async findByDate(branchOfficeCode: number, billData: any): Promise<any> {
    try {
      const startDate = "01/" + billData.date;
      const endDate = "31/" + billData.date;

      const startDateFormat = transformDate(startDate);
      const endDateFormat = transformDate(endDate);

      const bills = await this.billRepository
        .createQueryBuilder('bill')
        .where('branch_office_code = :branchOfficeCode', { branchOfficeCode })
        .andWhere("fechaInicial >= :startDateFormat", { startDateFormat })
        .andWhere("fechaInicial <= :endDateFormat", { endDateFormat })
        .getMany();

      if (bills.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado facturas'
        );
      }

      return ResponseUtil.success(
        200,
        'Facturas encontradas',
        bills
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener facturas',
        error.message
      );
    }
  }

  async findBillsByBranchOffice(branchOfficeCode: number): Promise<any> {
    try {
      const bills = await this.billRepository
        .createQueryBuilder('bill')
        .where('branch_office_code = :branchOfficeCode', { branchOfficeCode })
        .getMany();

      bills.forEach(item => {
        const dateInBogota = moment.tz(item.fecha, 'America/Bogota').subtract(5, 'hours');
        const formattedDate = dateInBogota.format('YYYY-MM-DD HH:mm:ss');
        item.fecha = new Date(formattedDate);
      });

      if (bills.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado facturas'
        );
      }

      return ResponseUtil.success(
        200,
        'Facturas encontradas',
        bills
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener facturas',
        error.message
      );
    }
  }

  async findBillsByOperator(operatorId: string): Promise<any> {
    try {

      const bills = await this.billRepository
        .createQueryBuilder('bill')
        .where('operator.id = :operatorId', { operatorId })
        .getMany();

      if (bills.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado facturas'
        );
      }

      return ResponseUtil.success(
        200,
        'Facturas encontradas',
        bills
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener facturas'
      );
    }

  }

  async updateStatus(id: any): Promise<any> {
    try {
      const existingBranchOffice = await this.branchOfficeRepository.findOne({
        where: { id },
      });

      if (!existingBranchOffice) {
        return ResponseUtil.error(404, 'Sucursal no encontrada');
      }

      existingBranchOffice.status = 'EFECTIVO';
      const updatedBranchOffice = await this.branchOfficeRepository.save(existingBranchOffice);

      if (updatedBranchOffice) {
        return ResponseUtil.success(
          200,
          'Sucursal actualizada exitosamente',
          updatedBranchOffice
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al actualizar la Sucursal'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al actualizar la Sucursal'
      );
    }
  }

  private async findNextAvailableCode(): Promise<number> {
    const result = await this.billRepository
      .createQueryBuilder("bill")
      .select("MAX(bill.bill_code)", "max")
      .getRawOne();

    const nextCode = (result?.max || 0) + 1;
    if (nextCode > 999999) {
      throw new Error("No more unique codes can be generated.");
    }

    return nextCode;
  }

  async findByFolio(billData: any) {
    try {
      const { folio, fechaInicial } = billData;

      const bill = await this.billRepository.findOne({
        where: {
          folio: folio,
          fecha: fechaInicial
        },
        relations: [
          'branch_office',
          'branch_office.city',
          'branch_office.city.department',
          'branch_office.zone',

          'operator',
          'operator.role',

          'client',
          'client.occupation',
        ]
      });

      if (bill) {
        return ResponseUtil.success(
          200,
          'Factura encontrada',
          bill
        );
      } else {
        return ResponseUtil.error(
          404,
          'Factura no encontrada'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener la Factura'
      );
    }
  }

  async loadDataEmail() {
    try {
      const response = await this.configurationSheetService.getForEmail();
      if (response.statusCode === 200) {
        return response.data[0];
      } else {
        console.error('Error al cargar los datos del email:', response.message);
      }
    } catch (error) {
      console.error('Error al cargar los datos del email:', error.message);
    }
  }

  async getGlpByToday(): Promise<any> {
    try {
      const today = moment().format('YYYY-MM-DD');

      const bills = await this.billRepository
        .createQueryBuilder('bill')
        .select("JSON_EXTRACT(bill.charge, '$.masaTotal')", 'masaTotal')
        .addSelect("JSON_EXTRACT(bill.charge, '$.volumenTotal')", 'volumenTotal')
        .addSelect('bill.status')
        .where('DATE(bill.fecha) = :today', { today })
        .getRawMany();

      if (bills.length < 1) {
        const data = {
          today
        }
        return ResponseUtil.error(
          400,
          'No se han encontrado facturas',
          data
        );
      }

      const mass = bills.reduce((acc, item) => {
        const masaTotal = parseFloat(item.masaTotal.replace(/"/g, ''));
        return acc + (isNaN(masaTotal) ? 0 : masaTotal);
      }, 0);

      const volume = bills.reduce((acc, item) => {
        const volumenTotal = parseFloat(item.volumenTotal.replace(/"/g, ''));
        return acc + (isNaN(volumenTotal) ? 0 : volumenTotal);
      }, 0);

      const effectiveBill = bills.filter(item => item.bill_status === 'EFECTIVO').length;
      const percentageEffective = (effectiveBill / bills.length) * 100;

      const data = {
        mass,
        volume,
        today,
        percentageEffective
      }

      return ResponseUtil.success(
        200,
        'Facturas encontradas',
        data
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener facturas',
        error.message
      );
    }
  }

  async getPlatesByBillDay(data: any): Promise<any> {
    const day = moment(data.day, 'YYYY-MM-DD').format('YYYY-MM-DD');
    try {
      // Obtener facturas del día especificado
      const bills = await this.billRepository
        .createQueryBuilder('bill')
        .select(['bill.plate', 'bill.densidad', 'bill.volumenTotal', 'bill.masaTotal', 'bill.charge'])
        .where('DATE(bill.fecha) = :day', { day })
        .getMany();

      if (bills.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado vehículos en esta fecha'
        );
      }

      // Extraer placas únicas de las facturas
      const plates = [...new Set(bills.map(item => item.plate))];

      // Obtener camiones de propano relacionados con las placas
      const propaneTrucks = await this.propaneTruckRepository
        .createQueryBuilder('propane_truck')
        .select(['propane_truck.plate', 'propane_truck.capacity'])
        .where('propane_truck.plate IN (:...plates)', { plates })
        .getMany();

      // Calcular el promedio de densidad y la suma de volumen por placa
      const densityMap = bills.reduce((acc, bill) => {
        if (!acc[bill.plate]) {
          acc[bill.plate] = { totalDensity: 0, count: 0, totalVolume: 0, totalMass: 0 };
        }
        acc[bill.plate].totalDensity += parseFloat(bill.densidad);
        acc[bill.plate].count += 1;
        acc[bill.plate].totalVolume += parseFloat(bill.volumenTotal);
        acc[bill.plate].totalMass += parseFloat(bill.charge.masaTotal);
        return acc;
      }, {});

      // Enriquecer los datos de los camiones con cálculos
      const propaneTrucksWithDensity = propaneTrucks.map(truck => {
        const densityData = densityMap[truck.plate];
        const averageDensity = densityData ? (densityData.totalDensity / densityData.count) : 0;
        const capacityGl = truck.capacity * averageDensity;
        const capacityTGl = truck.capacity / 2.02;
        const totalVolume = densityData ? densityData.totalVolume : 0;
        const totalMass = densityData ? densityData.totalMass : 0;
        return {
          ...truck,
          density: parseFloat(averageDensity.toFixed(3)),
          capacityGl: parseFloat(capacityGl.toFixed(3)),
          capacityTGl: parseFloat(capacityTGl.toFixed(3)),
          totalVolume: parseFloat(totalVolume.toFixed(3)),
          totalMass: parseFloat(totalMass.toFixed(3)),
        };
      });

      // Resultado final
      const result = { day, propaneTrucks: propaneTrucksWithDensity };

      return ResponseUtil.success(
        200,
        `${result.propaneTrucks.length} Vehículos encontrados`,
        result
      );
    } catch (error) {
      console.error('Error al obtener los tanques:', error);
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener los tanques',
        error.message
      );
    }
  }
}

function formatFecha(fechaInicial: string, horaInicial: string): string {
  const [day, month, year] = fechaInicial.split("/");
  const [hour, minute, second] = horaInicial.split(":");
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  const paddedHour = hour.padStart(2, '0');
  const paddedMinute = minute.padStart(2, '0');
  const paddedSecond = second.padStart(2, '0');
  const fechaString = `20${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMinute}:${paddedSecond}`;

  // Parse the date string using the server's local time
  const fecha = moment(fechaString, 'YYYY-MM-DDTHH:mm:ss');

  // Format the date in the desired format
  const formattedFecha = fecha.format('YYYY-MM-DD HH:mm:ss');
  return formattedFecha;
}

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const hoursStr = (hours < 10) ? "0" + hours : hours;
  const minutesStr = (minutes < 10) ? "0" + minutes : minutes;
  const secondsStr = (seconds < 10) ? "0" + seconds : seconds;

  return hoursStr + ":" + minutesStr + ":" + secondsStr;
}

// Función para validar el formato de la fecha
function isValidDateFormat(date: string): boolean {
  // Expresión regular para día (1-31), mes (1-12), y año (2 o 4 dígitos)
  const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(\d{2}|\d{4})$/;

  return dateRegex.test(date);
}

// Función para obtener la fecha actual en formato D/M/YY
function getCurrentDateFormatted(): string {
  const now = new Date();

  const day = now.getDate(); // Día sin ceros iniciales
  const month = now.getMonth() + 1; // Mes sin ceros iniciales
  const year = now.getFullYear() % 100; // Últimos 2 dígitos del año

  return `${day}/${month}/${year}`; // Retorna en formato D/M/YY
}

// Función para validar el formato de la hora
function isValidTimeFormat(time: string): boolean {
  // Expresión regular para validar hora (1-23), minuto (0-59), y segundo (0-59)
  const timeRegex = /^([1-9]|1\d|2[0-3]):([0-5]?\d):([0-5]?\d)$/;

  // Verifica si la hora cumple con el formato esperado
  return timeRegex.test(time);
}

// Función para obtener la hora actual en el formato requerido (H:M:S)
function getCurrentTimeFormatted(): string {
  const now = new Date();
  const hours = now.getHours(); // Hora (0-23)
  const minutes = now.getMinutes(); // Minuto (0-59)
  const seconds = now.getSeconds(); // Segundo (0-59)
  return `${hours}:${minutes}:${seconds}`;
}
