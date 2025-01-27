import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Bill } from 'src/bill/entities/bill.entity'
import { Repository } from 'typeorm'
import { spawn } from 'child_process'
import { join } from 'path'
import { createObjectCsvWriter } from 'csv-writer'
import { ResponseUtil } from 'src/utils/response.util'
import { enviroment } from 'src/utils/environment.prod'
import * as fs from 'fs'
import { parse } from 'date-fns'
import * as moment from 'moment-timezone';

const tempDir = enviroment.srcDir + '/temp';
const pythonScriptPath = enviroment.pythonScriptPath;

function transformDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${'20' + year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

@Injectable()
export class GraphsService {
  constructor(
    @InjectRepository(Bill) private billRepository: Repository<Bill>,
  ) { }

  async generateCsv(branchOfficeCode: number): Promise<any> {
    try {
      const bills = await this.billRepository
        .createQueryBuilder('bill')
        .where('branch_office_code = :branchOfficeCode', { branchOfficeCode })
        .getMany();

      const records = bills.map(bill => ({
        id: bill.id,
        status: bill.status,
        densidad: bill.charge.densidad,
        temperatura: bill.charge.temperatura,
        masaTotal: bill.charge.masaTotal,
        volumenTotal: bill.charge.volumenTotal,
        horaInicial: bill.charge.horaInicial,
        fechaInicial: bill.charge.fechaInicial,
        horaFinal: bill.charge.horaFinal,
        fechaFinal: bill.charge.fechaFinal,
        total: bill.total,
        create: bill.create,
        update: bill.update,
      }))

      const headers = [
        'id',
        'status',
        'densidad',
        'temperatura',
        'masaTotal',
        'volumenTotal',
        'horaInicial',
        'fechaInicial',
        'horaFinal',
        'fechaFinal',
        'total',
        'create',
        'update'
      ];

      return ResponseUtil.success(200, 'Datos csv generados correctamente', { headers, records })

    } catch (error) {
      return ResponseUtil.error(400, 'Error al generar el csv', error)
    }
  }

  async generateCsvbyBranchOffice(branchOfficeCode: number, billData: any) {
    try {
      const startDateTime = new Date(billData.start + ' ' + billData.time_start)
      const endDateTime = new Date(billData.end + ' ' + billData.time_end)

      const data = await this.billRepository
        .createQueryBuilder('bill')
        .where('branch_office_code = :branchOfficeCode', { branchOfficeCode })
        .andWhere("fecha >= :startDateTime", { startDateTime })
        .andWhere("fecha <= :endDateTime", { endDateTime })
        .getMany();

      const formattedData = data.map(item => ({
        ...item,
        fecha: moment.tz(item.fecha, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss')
      }));

      const records = formattedData.map(data => ({
        id: data.id,
        status: data.status,
        bill_code: data.bill_code,
        densidad: parseFloat(data.charge.densidad),
        temperatura: parseFloat(data.charge.temperatura),
        masaTotal: parseFloat(data.charge.masaTotal),
        volumenTotal: parseFloat(data.charge.volumenTotal),
        horaInicial: data.charge.horaInicial,
        fechaInicial: data.charge.fechaInicial,
        horaFinal: data.charge.horaFinal,
        fechaFinal: data.charge.fechaFinal,
        fecha: data.fecha,
        total: data.total,
        operator: data.operator_firstName + ' ' + data.operator_lastName,
        branch_office_name: data.branch_office_name,
        plate: data.plate,
        create: data.create,
        update: data.update,
      }))

      const headers = [
        'id',
        'status',
        'remision',
        'densidad',
        'temperatura',
        'masaTotal',
        'volumenTotal',
        'horaInicial',
        'fechaInicial',
        'horaFinal',
        'fechaFinal',
        'fecha',
        'total',
        'operator',
        'plate',
        'create',
        'update'
      ];

      if (records.length < 1) {
        return ResponseUtil.error(400, 'No hay datos para generar el csv')
      }

      console.log(`Datos csv generados correctamente con código de establecimiento ${branchOfficeCode}` + ' ' + records.length + ' ' + 'registros');
      return ResponseUtil.success(200, `Datos csv generados correctamente con código de establecimiento ${branchOfficeCode}`, { headers, records })

    } catch (error) {
      console.error(error);
      return ResponseUtil.error(400, 'Error al generar el csv', error)
    }
  }

  async generateCsvbyPropaneTruck(plate: number, billData: any) {
    try {
      const startDateTime = new Date(billData.start + ' ' + billData.time_start)
      const endDateTime = new Date(billData.end + ' ' + billData.time_end)

      const data = await this.billRepository
        .createQueryBuilder('bill')
        .where('plate = :plate', { plate })
        .andWhere("fecha >= :startDateTime", { startDateTime })
        .andWhere("fecha <= :endDateTime", { endDateTime })
        .getMany();

      const formattedData = data.map(item => ({
        ...item,
        fecha: moment.tz(item.fecha, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss')
      }));

      const records = formattedData.map(data => ({
        id: data.id,
        status: data.status,
        bill_code: data.bill_code,
        densidad: parseFloat(data.charge.densidad),
        temperatura: parseFloat(data.charge.temperatura),
        masaTotal: parseFloat(data.charge.masaTotal),
        volumenTotal: parseFloat(data.charge.volumenTotal),
        horaInicial: data.charge.horaInicial,
        fechaInicial: data.charge.fechaInicial,
        horaFinal: data.charge.horaFinal,
        fechaFinal: data.charge.fechaFinal,
        fecha: data.fecha,
        service_time: data.service_time,
        total: data.total,
        operator: data.operator_firstName + ' ' + data.operator_lastName,
        branch_office_name: data.branch_office_name,
        plate: data.plate,
        create: data.create,
        update: data.update,
      }))

      const headers = [
        'id',
        'status',
        'remision',
        'densidad',
        'temperatura',
        'masaTotal',
        'volumenTotal',
        'horaInicial',
        'fechaInicial',
        'horaFinal',
        'fechaFinal',
        'fecha',
        'tiempo de servicio',
        'total',
        'operator',
        'plate',
        'create',
        'update'
      ];

      if (records.length < 1) {
        return ResponseUtil.error(400, 'No hay datos para generar el csv')
      }

      console.log(`Datos csv generados correctamente con placa de auto-tanque ${plate}` + ' ' + records.length + ' ' + 'registros');
      return ResponseUtil.success(200, `Datos csv generados correctamente con placa de auto-tanque ${plate}`, { headers, records })

    } catch (error) {
      console.error(error);
      return ResponseUtil.error(400, 'Error al generar el csv', error)
    }
  }

  async dailyPurchase(dailyPurchaseData: any) {
    const branchOfficeCode = dailyPurchaseData.branchOfficeCode
    const start = dailyPurchaseData.start
    const end = dailyPurchaseData.end

    const bills = await this.billRepository
      .createQueryBuilder('bill')
      .where('branch_office_code = :branchOfficeCode', { branchOfficeCode })
      .getMany();

    const parsedStart = parse(start, 'dd/MM/yyyy', new Date()) // Convierte la fecha del frontend a objeto Date
    const parsedEnd = parse(end, 'dd/MM/yyyy', new Date()) // Convierte la fecha del frontend a objeto Date

    const filteredBills = bills.filter(bill => {
      const billDate = parse(bill.charge.fechaInicial, 'dd/MM/yy', new Date())

      return billDate >= parsedStart && billDate <= parsedEnd
    })

    console.log(filteredBills);

    const csvWriter = createObjectCsvWriter({
      path: join(tempDir, `filteredBills-${branchOfficeCode}.csv`), // Ruta del archivo CSV
      header: [
        { id: 'id', title: 'ID' },
        { id: 'status', title: 'Status' },
        { id: 'densidad', title: 'Densidad' },
        { id: 'temperatura', title: 'Temperatura' },
        { id: 'masaTotal', title: 'Masa Total' },
        { id: 'volumenTotal', title: 'Volumen Total' },
        { id: 'horaInicial', title: 'Hora Inicial' },
        { id: 'fechaInicial', title: 'Fecha Inicial' },
        { id: 'horaFinal', title: 'Hora Final' },
        { id: 'fechaFinal', title: 'Fecha Final' },
        { id: 'total', title: 'Total' },
        { id: 'create', title: 'Create' },
        { id: 'update', title: 'Update' },
      ],
    })

    const records = filteredBills.map(filteredBill => ({
      id: filteredBill.id,
      status: filteredBill.status,
      densidad: filteredBill.charge.densidad,
      temperatura: filteredBill.charge.temperatura,
      masaTotal: filteredBill.charge.masaTotal,
      volumenTotal: filteredBill.charge.volumenTotal,
      horaInicial: filteredBill.charge.horaInicial,
      fechaInicial: filteredBill.charge.fechaInicial,
      horaFinal: filteredBill.charge.horaFinal,
      fechaFinal: filteredBill.charge.fechaFinal,
      total: filteredBill.total,
      create: filteredBill.create,
      update: filteredBill.update,
    }))

    await csvWriter.writeRecords(records)

    const csvFilePath = join(tempDir, `filteredBills-${branchOfficeCode}.csv`)

    // Ejecutar el script de Python y pasar la ruta del archivo CSV como argumento
    const pythonProcess = spawn(enviroment.pythonPath, [
      pythonScriptPath,
      csvFilePath,
    ])

    const responseData = await new Promise((resolve, reject) => {
      let data = ''
      pythonProcess.stdout.on('data', chunk => {
        data += chunk
      })
      pythonProcess.stdout.on('end', () => {
        resolve(data)
      })
      pythonProcess.stderr.on('data', err => {
        reject(err)
      })
    })

    return ResponseUtil.success(200, 'Respuesta de Python', responseData)
  }

  async remove(id: string) {
    const filename = `${id}.png`
    const filepath = join(tempDir, filename)

    try {
      await fs.promises.unlink(filepath)
    } catch (err) {
      throw new Error(
        `Error al eliminar el archivo ${filename}: ${err.message}`,
      )
    }

    return ResponseUtil.success(200, `se ha borrado la imagen ${id}`, id)
  }

  removeAll() {
    fs.readdir(tempDir, (err, files) => {
      if (err) throw err

      for (const file of files) {
        fs.unlink(join(tempDir, file), err => {
          if (err) throw err
        })
      }
    })

    return ResponseUtil.success(200, `se han borrado los archivos temporales`)
  }
}
