import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseUtil } from 'src/utils/response.util';
import { v4 as uuidv4 } from 'uuid';
import { LogReport } from './entities/log-report.entity';
import { RouteEvent } from 'src/route-events/entities/route-event.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { PropaneTruckService } from 'src/propane-truck/propane-truck.service';
import { CourseLogService } from 'src/course-log/course-log.service';
import * as moment from 'moment';
import { Between } from 'typeorm'; // Asegúrate de importar Between
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogReportService {
  constructor(
    @InjectRepository(LogReport) private logReportRepository: Repository<LogReport>,
    @InjectRepository(RouteEvent) private routeEventRepository: Repository<RouteEvent>,
    @InjectRepository(Usuario) private usuariosRepository: Repository<Usuario>,
    private propaneTruckService: PropaneTruckService,
    private courseLogService: CourseLogService,
  ) { }

  async create(logReportData: LogReport): Promise<any> {
    try {
      if (logReportData) {
        const route_event = await this.routeEventRepository.findOne({
          where: { code_event: logReportData.code_event },
        });

        const user = await this.usuariosRepository.findOne({
          where: { id: logReportData.userId },
          relations: ['role'],
        });

        let propaneTruck = {
          data: [
            { plate: "none" }
          ]
        };

        if (user.role.name === 'Operario') {
          propaneTruck = await this.propaneTruckService.getByOperatorId(parseInt(user.idNumber));
        }

        // Contar el número de registros existentes
        const totalLogReports = await this.logReportRepository.count();

        // Si hay 1000 o más registros, eliminar el más antiguo
        if (totalLogReports >= 1000) {
          const oldestLogReport = await this.logReportRepository.find({
            order: { create: 'ASC' },
            take: 1,
          });

          if (oldestLogReport.length > 0) {
            await this.logReportRepository.remove(oldestLogReport[0]);
          }
        }

        const newLogReport = this.logReportRepository.create({
          ...logReportData,
          id: uuidv4(), // Generar un nuevo UUID
          state: 'ACTIVO',
          route_event: route_event,
          user: user,
          propane_truck: propaneTruck.data[0]
        });

        const createdLogReport = await this.logReportRepository.save(newLogReport);

        if (createdLogReport) {
          const today = new Date();
          const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          const data = {
            last_event: route_event.code_event,
            last_criticality: route_event.criticality,
            plate: createdLogReport.propane_truck.plate,
            scheduling_date: formattedDate,
            operator: user.firstName + ' ' + user.lastName,
          }

          this.courseLogService.updateByLogReport(data);

          return ResponseUtil.success(
            200,
            'Informe de registro creado exitosamente',
            createdLogReport
          );
        } else {
          return ResponseUtil.error(
            500,
            'Ha ocurrido un problema al crear el Informe de registro'
          );
        }
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al crear el Informe de registro',
        error.message
      );
    }
  }

  async findAll(pageData: any): Promise<any> {

    try {
      const [logReports, total] = await this.logReportRepository
        .createQueryBuilder('log_report')
        .leftJoinAndSelect('log_report.route_event', 'route_event')
        .leftJoinAndSelect('log_report.user', 'user')
        .select([
          'log_report.id',
          'log_report.create',
          'log_report.propane_truck',
          'route_event.id',
          'route_event.name',
          'route_event.description',
          'route_event.criticality',
          'route_event.code_event',
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.idNumber',
        ])
        .skip((pageData.page - 1) * pageData.limit)
        .take(pageData.limit)
        .orderBy('log_report.create', 'DESC')
        .getManyAndCount(); // Devuelve los datos y el total de registros

      if (logReports.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Informes de registro'
        );
      }

      return ResponseUtil.success(
        200,
        'Informes de registro encontrados',
        {
          logReports,
          total,
          page: pageData.page,
          limit: pageData.limit,
        }
      );
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los Informes de registro',
        error.message
      );
    }
  }

  async findOne(id: string) {
    try {
      const logReport = await this.logReportRepository.findOneBy({
        id: id
      });

      if (logReport) {
        return ResponseUtil.success(
          200,
          'Informe de registro encontrado',
          logReport
        );
      } else {
        return ResponseUtil.error(
          404,
          'Informe de registro no encontrado'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener el Informe de registro'
      );
    }
  }

  async update(id, logReportData) {
    try {
      const existingLogReport = await this.logReportRepository.findOne({
        where: { id },
      });

      if (!existingLogReport) {
        throw new NotFoundException('Informe de registro no encontrado');
      }

      const updatedLogReport = await this.logReportRepository.save({
        ...existingLogReport,
        ...logReportData,
      });

      return ResponseUtil.success(
        200,
        'Informe de registro actualizado exitosamente',
        updatedLogReport
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseUtil.error(
          404,
          'Informe de registro no encontrado'
        );
      }
      return ResponseUtil.error(
        500,
        'Error al actualizar el Informe de registro'
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const existingLogReport = await this.logReportRepository.findOne({
        where: { id },
      });

      if (!existingLogReport) {
        return ResponseUtil.error(404, 'Informe de registro no encontrado');
      }

      existingLogReport.state = 'INACTIVO';
      const updatedZone = await this.logReportRepository.save(existingLogReport);

      if (updatedZone) {
        return ResponseUtil.success(
          200,
          'Informe de registro eliminado exitosamente',
          updatedZone
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al eliminar el Informe de registro'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al eliminar el Informe de registro'
      );
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async findByDay(pageData: any): Promise<any> {
    try {
      const today = moment().startOf('day').toDate();
      const tomorrow = moment(today).add(1, 'days').toDate();

      const [logReports, total] = await this.logReportRepository
        .createQueryBuilder('log_report')
        .where('log_report.create BETWEEN :start AND :end', {
          start: today, end: tomorrow,
        })
        .leftJoinAndSelect('log_report.route_event', 'route_event')
        .leftJoinAndSelect('log_report.user', 'user')
        .select([
          'log_report.id',
          'log_report.create',
          'log_report.propane_truck',
          'route_event.id',
          'route_event.name',
          'route_event.description',
          'route_event.criticality',
          'route_event.code_event',
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.idNumber',
        ])
        .skip((pageData.page - 1) * pageData.limit)
        .take(pageData.limit)
        .orderBy('log_report.create', 'DESC')
        .getManyAndCount(); // Devuelve los datos y el total de registros

      if (logReports.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Informes de registro'
        );
      }

      // Consulta para contar eventos por criticality
      const criticalityCounts = await this.logReportRepository
        .createQueryBuilder('log_report')
        .leftJoin('log_report.route_event', 'route_event')
        .select('route_event.criticality', 'criticality')
        .addSelect('COUNT(*)', 'count')
        .where('log_report.create BETWEEN :start AND :end', {
          start: today,
          end: tomorrow,
        })
        .groupBy('route_event.criticality')
        .getRawMany();

      return ResponseUtil.success(
        200,
        'Informes de registro encontrados',
        {
          logReports,
          total,
          criticalityCounts, // Incluye los conteos por criticality
          page: pageData.page,
          limit: pageData.limit,
        }
      );
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los Informes de registro'
      );
    }
  }

  async createLog(logReportData: any): Promise<any> {
    try {
      // Obtiene la clave y la fecha del objeto JSON
      const keys = Object.keys(logReportData);
      if (keys.length === 0) {
        throw new Error('La estructura JSON está vacía');
      }
      const filenameKey = keys[0];

      // Genera el nombre del archivo con extensión .json
      const fileName = `${filenameKey}.json`;

      // Define la ruta de la carpeta logs dentro de src
      const logsFolderPath = path.join(__dirname, '..', 'logs');

      // Crea la carpeta logs si no existe
      if (!fs.existsSync(logsFolderPath)) {
        fs.mkdirSync(logsFolderPath);
      }

      // Define la ruta completa del archivo
      const filePath = path.join(logsFolderPath, fileName);

      // Escribe el archivo JSON en la carpeta logs
      fs.writeFileSync(filePath, JSON.stringify(logReportData, null, 2));

      return { message: 'Archivo JSON guardado correctamente' };
    } catch (error) {
      return { message: 'Error al crear el informe de registro', error: error.message };
    }
  }
}
