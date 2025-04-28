import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseLog } from './entities/course-log.entity';
import { ResponseUtil } from 'src/utils/response.util';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from 'src/orders/entities/order.entity';
import { PropaneTruck } from 'src/propane-truck/entities/propane-truck.entity';

@Injectable()
export class CourseLogService {

  constructor(
    @InjectRepository(CourseLog) private courseLogRepository: Repository<CourseLog>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(PropaneTruck) private propaneTruckRepository: Repository<PropaneTruck>
  ) { }

  async create(courseLogData: CourseLog): Promise<any> {

    if (!courseLogData) {
      return ResponseUtil.error(
        400,
        'Datos de Log de derrotero son requeridos'
      );
    }

    const existingCourseLog = await this.courseLogRepository
      .createQueryBuilder('courseLog')
      .where('courseLog.plate = :plate', { plate: courseLogData.plate })
      .andWhere('courseLog.scheduling_date = :scheduling_date', { scheduling_date: courseLogData.scheduling_date })
      .andWhere('courseLog.operator = :operator', { operator: courseLogData.operator })
      .andWhere('courseLog.orders = :orders', { orders: courseLogData.orders.join(',') })
      .getOne();

    if (existingCourseLog) {
      return ResponseUtil.error(
        409,
        'Log de derrotero ya existe'
      );
    }

    try {
      const newCourseLog = this.courseLogRepository.create({
        ...courseLogData,
        uuid: uuidv4(), // Generar un nuevo UUID
        completed_orders: []
      });

      const createdCourseLog = await this.courseLogRepository.save(newCourseLog);

      if (createdCourseLog) {
        return ResponseUtil.success(
          200,
          'Log de derrotero creado exitosamente',
          createdCourseLog
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al crear Log de derrotero'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al crear Log de derrotero',
        error.message
      );
    }
  }

  async update(courseLogData: any) {
    if (!courseLogData) {
      return ResponseUtil.error(
        400,
        'Datos de Log de derrotero son requeridos'
      );
    }

    if (courseLogData.order) {
      courseLogData.order = parseFloat(courseLogData.orders[0]);
    }

    const regex = /^\d{4}\-\d{2}\-\d{2}$/; // Expresión regular para verificar el formato YYYY-MM-DD
    const match = courseLogData.scheduling_date.match(regex);
    if (!match) {
      const [day, month, year] = courseLogData.scheduling_date.split('/');
      courseLogData.scheduling_date = `20${year}-${month}-${day}`;
    }

    const existingCourseLog = await this.courseLogRepository
      .createQueryBuilder('courseLog')
      .where('courseLog.plate = :plate', { plate: courseLogData.plate })
      .andWhere('courseLog.scheduling_date = :scheduling_date', { scheduling_date: courseLogData.scheduling_date })
      .andWhere('courseLog.operator = :operator', { operator: courseLogData.operator })
      .andWhere('FIND_IN_SET(:order, courseLog.orders)', { order: String(courseLogData.order) })
      .getOne();

    if (!existingCourseLog) {
      return ResponseUtil.error(
        404,
        'Log de derrotero no encontrado'
      );
    }

    try {
      existingCourseLog.delivered_mass = existingCourseLog.delivered_mass + parseFloat(courseLogData.delivered_mass);
      existingCourseLog.delivered_volume = existingCourseLog.delivered_volume + parseFloat(courseLogData.delivered_volume);
      existingCourseLog.charges += 1;
      if (courseLogData.order && !existingCourseLog.completed_orders.includes(String(courseLogData.order))) existingCourseLog.completed_orders.push(String(courseLogData.order));
      existingCourseLog.last_delivery = courseLogData.last_delivery;
      existingCourseLog.last_latitude = courseLogData.last_latitude;
      existingCourseLog.last_longitude = courseLogData.last_longitude;

      const updatedCourseLog = await this.courseLogRepository.save(existingCourseLog);

      return ResponseUtil.success(
        200,
        'Log de derrotero actualizado exitosamente',
        updatedCourseLog
      );

    } catch (error) {
      console.log('error:', error);
      return ResponseUtil.error(
        500,
        'Error al actualizar Log de derrotero',
        error.message
      );
    }
  }

  async updateByLogReport(courseLogData: any) {

    if (!courseLogData) {
      return ResponseUtil.error(
        400,
        'Datos de Log de derrotero son requeridos'
      );
    }

    const existingCourseLog = await this.courseLogRepository
      .createQueryBuilder('courseLog')
      .where('courseLog.plate = :plate', { plate: courseLogData.plate })
      .andWhere('courseLog.scheduling_date = :scheduling_date', { scheduling_date: courseLogData.scheduling_date })
      .andWhere('courseLog.operator = :operator', { operator: courseLogData.operator })
      .getOne();

    console.log('existingCourseLog:', existingCourseLog);

    if (!existingCourseLog) {
      return ResponseUtil.error(
        404,
        'Log de derrotero no encontrado'
      );
    }

    try {
      const newCourseLogData = this.courseLogRepository.create({
        ...existingCourseLog,
        last_event: courseLogData.last_event,
        last_criticality: courseLogData.last_criticality,
      });

      // existingCourseLog.last_latitude = courseLogData.last_latitude;
      // existingCourseLog.last_longitude = courseLogData.last_longitude;

      const updatedCourseLog = await this.courseLogRepository.save(newCourseLogData);

      return ResponseUtil.success(
        200,
        'Log de derrotero actualizado exitosamente',
        updatedCourseLog
      );

    } catch (error) {
      console.log('error:', error);
      return ResponseUtil.error(
        500,
        'Error al actualizar Log de derrotero',
        error.message
      );
    }
  }

  async findOne(uuid: string): Promise<CourseLog> {

    if (!uuid) {
      return ResponseUtil.error(
        400,
        'UUID es requerido'
      );
    }

    try {
      const courseLog = await this.courseLogRepository
        .createQueryBuilder('courseLog')
        .where('courseLog.uuid = :uuid', { uuid: uuid })
        .getOne();

      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.folio IN (:...orders)', { orders: courseLog.orders })
        .innerJoinAndSelect('order.branch_office', 'branch_office')
        .select([
          'order.folio',
          'order.token',
          'order.status',
          'order.payment_type',
          'order.create',
          'branch_office.id',
          'branch_office.name',
          'branch_office.nit',
          'branch_office.branch_office_code',
          'branch_office.address',
          'branch_office.phone',
          'branch_office.email',
          'branch_office.latitude',
          'branch_office.longitude',
        ])
        .getMany();

      const data = {
        courseLog,
        orders
      }

      if (!courseLog) {
        return ResponseUtil.error(
          404,
          'Log de derrotero no encontrado'
        );
      }

      return ResponseUtil.success(
        200,
        'Log de derrotero encontrado',
        data
      );

    } catch (error) {
      console.log('error:', error);
      return ResponseUtil.error(
        500,
        'Error al obtener Log de derrotero',
        error.message
      );
    }

  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////

  async findByDate(data: any): Promise<CourseLog> {
    if (!data) {
      return ResponseUtil.error(
        400,
        'Fecha es requerida'
      );
    }

    const date = data.date;

    try {
      const courseLogs = await this.courseLogRepository
        .createQueryBuilder('courseLog')
        .where('courseLog.scheduling_date = :scheduling_date', { scheduling_date: date })
        .select([
          'courseLog.uuid',
          'courseLog.plate',
          'courseLog.operator',
          'courseLog.creator',
          'courseLog.scheduling_date',
          'courseLog.charges',
          'courseLog.create',
          'courseLog.update'
        ])
        .orderBy('courseLog.create', 'DESC')
        .getMany();

      if (courseLogs.length === 0) {
        return ResponseUtil.error(
          404,
          'No se encontraron logs de derrotero para la fecha proporcionada'
        );
      }

      return ResponseUtil.success(
        200,
        `${courseLogs.length} Logs de derrotero encontrados`,
        courseLogs
      );
    } catch (error) {
      console.log('error:', error);
      return ResponseUtil.error(
        500,
        'Error al obtener logs de derrotero',
        error.message
      );
    }
  }

  async findTrucksOnCourseLog(): Promise<any> {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    try {
      const propaneTanks = await this.propaneTruckRepository
        .createQueryBuilder('propane_truck')
        .where('propane_truck.status = :status', { status: 'EN CURSO' })
        .select([
          'propane_truck.plate',
        ])
        .getMany();

      if (propaneTanks.length === 0) {
        return ResponseUtil.error(
          404,
          'No se encontraron auto tanques en curso'
        );
      }

      const courseLogs = await this.courseLogRepository
        .createQueryBuilder('courseLog')
        .where('courseLog.scheduling_date = :scheduling_date', { scheduling_date: formattedDate })
        .andWhere('courseLog.plate IN (:...plates)', { plates: propaneTanks.map(tank => tank.plate) })
        .getMany();

      if (courseLogs.length === 0) {
        return ResponseUtil.error(
          404,
          'No se encontraron logs de derrotero para los auto tanques en curso'
        );
      }

      return ResponseUtil.success(
        200,
        `${courseLogs.length}logs de derrotero con auto tanques en curso encontrados`,
        courseLogs
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener datos de Log de derrotero',
        error.message
      );
    }
  }

}
