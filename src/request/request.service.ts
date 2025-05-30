import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Repository } from 'typeorm';
import { ResponseUtil } from 'src/utils/response.util';
import { v4 as uuidv4 } from 'uuid';
import { Order } from 'src/orders/entities/order.entity';
import { PropaneTruck } from 'src/propane-truck/entities/propane-truck.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { BranchOffices } from 'src/branch-offices/entities/branch-office.entity';
import * as moment from 'moment-timezone';

@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(Request) private requestRepository: Repository<Request>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(PropaneTruck) private propaneTruckRepository: Repository<PropaneTruck>,
    @InjectRepository(Usuario) private userRepository: Repository<Usuario>,
    @InjectRepository(BranchOffices) private branchOfficesRepository: Repository<BranchOffices>,
  ) { }

  async create(requestData: Request): Promise<any> {
    try {
      let internal_folio = 1;

      if (requestData) {

        const lastRequest = await this.requestRepository.find({
          order: {
            internal_folio: 'DESC',
          },
          take: 1,
        });

        if (lastRequest && lastRequest.length > 0) {
          internal_folio = lastRequest[0].internal_folio + 1;
        }
      }

      const order = await this.orderRepository.findOne({
        where: { folio: requestData.folio },
      });

      const propane_truck = await this.propaneTruckRepository.findOne({
        where: { plate: requestData.plate },
      });

      const operator = await this.userRepository.findOne({
        where: { idNumber: requestData.idNumber },
      });

      const branch_office = await this.branchOfficesRepository.findOne({
        where: { branch_office_code: requestData.branch_office_code },
        relations: ['stationary_tanks']
      });

      if (requestData) {
        const newRequest = this.requestRepository.create({
          ...requestData,
          id: uuidv4(), // Generar un nuevo UUID
          state: 'ACTIVO',
          internal_folio: internal_folio,
          order: order,
          propane_truck: propane_truck,
          operator: operator,
          branch_office: branch_office
        });

        const createdRequest = await this.requestRepository.save(newRequest);

        if (createdRequest) {
          console.log("=====================Servicio creado exitosamente==========");
          console.log(`Folio: ${createdRequest.folio}`);
          console.log(`Servicio: ${createdRequest.internal_folio}`);
          console.log("===========================================================");

          return ResponseUtil.success(
            200,
            'Servicio creado exitosamente',
            createdRequest
          );
        } else {
          return ResponseUtil.error(
            500,
            'Ha ocurrido un problema al crear el Servicio'
          );
        }
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al crear el Servicio',
        error.message
      );
    }
  }

  async findAll(pageData: any): Promise<any> {
    try {
      const [requests, total] = await this.requestRepository
        .createQueryBuilder('request')
        .leftJoinAndSelect('request.propane_truck', 'propane_truck')
        .leftJoinAndSelect('request.operator', 'operator')
        .leftJoinAndSelect('request.branch_office', 'branch_office')
        .select([
          'request.id',
          'request.folio',
          'request.internal_folio',
          'request.data_series',
          'request.plate',
          'request.create',
          'operator.id',
          'operator.firstName',
          'operator.lastName',
          'branch_office.id',
          'branch_office.name',
        ])
        .where('request.state = :state', { state: 'ACTIVO' })
        .skip((pageData.page - 1) * pageData.limit)
        .take(pageData.limit)
        .orderBy('request.create', 'DESC')
        .addOrderBy('request.internal_folio', 'DESC')
        .getManyAndCount();

      if (requests.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Servicios'
        );
      }

      return ResponseUtil.success(
        200,
        'Servicios encontrados',
        {
          requests,
          total,
          page: pageData.page,
          limit: pageData.limit,
        }
      );
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los Servicios'
      );
    }
  }

  async findOne(id: string) {
    try {
      const request = await this.requestRepository.findOne({
        where: { id },
        relations: [
          'propane_truck',
          'order',
          'operator',
          'branch_office',
          'branch_office.stationary_tanks'
        ]
      });

      if (request) {
        return ResponseUtil.success(
          200,
          'Servicio encontrado',
          request
        );
      } else {
        return ResponseUtil.error(
          404,
          'Servicio no encontrado'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener el Servicio',
        error.message
      );
    }
  }

  async update(id, requestData) {
    try {
      const existingRequest = await this.requestRepository.findOne({
        where: { id },
      });

      if (!existingRequest) {
        throw new NotFoundException('Servicio no encontrado');
      }

      const updatedRequest = await this.requestRepository.save({
        ...existingRequest,
        ...requestData,
      });

      return ResponseUtil.success(
        200,
        'Servicio actualizado exitosamente',
        updatedRequest
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseUtil.error(
          404,
          'Servicio no encontrado'
        );
      }
      return ResponseUtil.error(
        500,
        'Error al actualizar el Servicio'
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const existingRequest = await this.requestRepository.findOne({
        where: { id },
      });

      if (!existingRequest) {
        return ResponseUtil.error(404, 'Servicio no encontrado');
      }

      existingRequest.state = 'INACTIVO';
      const updatedRequest = await this.requestRepository.save(existingRequest);

      if (updatedRequest) {
        return ResponseUtil.success(
          200,
          'Servicio eliminada exitosamente',
          updatedRequest
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al eliminar el Servicio'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al eliminar el Servicio'
      );
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  async findRequestByPlate(plate: string): Promise<any> {
    try {
      const request = await this.requestRepository
        .createQueryBuilder('request')
        .innerJoinAndSelect('request.propane_truck', 'propane_truck')
        .innerJoinAndSelect('request.order', 'order')
        .innerJoinAndSelect('request.operator', 'operator')
        .innerJoinAndSelect('request.branch_office', 'branch_office')
        .innerJoinAndSelect('branch_office.stationary_tanks', 'stationary_tanks')
        .where('propane_truck.plate = :plate', { plate })
        .getMany();

      if (request.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado servicios'
        );
      }

      return ResponseUtil.success(
        200,
        'servicios encontrados',
        request
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener servicios',
        error.message
      );
    }
  }

  async findRequestByQuery(query: any): Promise<any> {
    try {
      // Validar que al menos uno de los parámetros "date" o "propane_truck" esté presente
      if (!query.date && !query.propane_truck) {
        return ResponseUtil.error(400, 'Al menos uno de los parámetros "date" o "propane_truck" es requerido');
      }

      // Validar que "date2" no esté presente sin "date"
      if (query.date2 && !query.date) {
        return ResponseUtil.error(400, 'El parámetro "date2" requiere que "date" también esté presente');
      }

      // Configurar fechas
      const fechaInicial = query.date;
      const fechaFinal = query.date2
        ? moment(query.date2).add(1, 'days').format('YYYY-MM-DD')
        : moment(fechaInicial).add(1, 'days').format('YYYY-MM-DD');

      // Construir consulta base
      const requestQuery = this.requestRepository
        .createQueryBuilder('request')
        .leftJoinAndSelect('request.propane_truck', 'propane_truck')
        .leftJoinAndSelect('request.operator', 'operator')
        .leftJoinAndSelect('request.branch_office', 'branch_office')
        .select([
          'request.id',
          'request.folio',
          'request.internal_folio',
          'request.data_series',
          'request.create',
          'request.plate',
          'operator.id',
          'operator.firstName',
          'operator.lastName',
          'branch_office.id',
          'branch_office.name',
        ])

      // Filtrar por fecha si existe
      if (query.date && query.date2) {
        requestQuery.where("JSON_EXTRACT(request.data_series, '$.fechaInicial') >= :fechaInicial", { fechaInicial })
          .andWhere("JSON_EXTRACT(request.data_series, '$.fechaInicial') < :fechaFinal", { fechaFinal });
      } else if (query.date) {
        requestQuery.andWhere("JSON_EXTRACT(request.data_series, '$.fechaInicial') LIKE :fechaInicial", { fechaInicial: `%${fechaInicial}%` });
      }

      // Filtrar por placa de camión si existe
      if (query.propane_truck) {
        requestQuery.andWhere('propane_truck.plate LIKE :plate', {
          plate: `%${query.propane_truck}%`
        });
      }

      // Ejecutar consulta unificada
      const results = await requestQuery.getMany();

      if (!results.length) {
        return ResponseUtil.error(404, 'No se encontraron servicios');
      }

      return ResponseUtil.success(200, `${results.length} servicios encontrados`, results);

    } catch (error) {
      console.error('Error en findRequestByQuery:', error);
      return ResponseUtil.error(500, 'Error interno al buscar servicios');
    }
  }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////

function formatFecha(fechaInicial: string, horaInicial: string): string {
  const [day, month, year] = fechaInicial.split("/");
  const [hour, minute, second] = horaInicial.split(":");
  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');
  const paddedHour = hour.padStart(2, '0');
  const paddedMinute = minute.padStart(2, '0');
  const paddedSecond = second.padStart(2, '0');
  const fechaString = `20${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMinute}:${paddedSecond}`;
  const fecha = moment.tz(fechaString, 'America/Bogota');

  const formattedFecha = fecha.format('YYYY-MM-DD HH:mm:ss');
  return formattedFecha;
}
