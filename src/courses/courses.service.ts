import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseUtil } from 'src/utils/response.util';
import { v4 as uuidv4 } from 'uuid';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CommonService } from 'src/common-services/common.service';
import { Order } from 'src/orders/entities/order.entity';
import { PropaneTruck } from 'src/propane-truck/entities/propane-truck.entity';
import * as moment from 'moment-timezone';
import { CourseLogService } from 'src/course-log/course-log.service';
import { CourseLog } from 'src/course-log/entities/course-log.entity';
import { on } from 'events';

@Injectable()
export class CoursesService {

  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Usuario) private userRepository: Repository<Usuario>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(PropaneTruck) private propaneTruckRepository: Repository<PropaneTruck>,
    @InjectRepository(CourseLog) private courseLogRepository: Repository<CourseLog>,
    @Inject(CourseLogService) private courseLogService: CourseLogService,
    private commonService: CommonService,
  ) { }

  async create(courseData: Course): Promise<any> {
    // Validación básica
    if (!courseData || Object.keys(courseData).length === 0) {
      return ResponseUtil.error(400, 'Datos de Derrotero son requeridos');
    }

    // Validar campos obligatorios
    const requiredFields = ['operator_id', 'creator', 'propane_truck', 'orders', 'fecha'];
    const missingFields = requiredFields.filter(field => !courseData[field]);
    if (missingFields.length > 0) {
      return ResponseUtil.error(400, `Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }

    try {
      // Buscar entidades relacionadas
      const [operator, creator, propaneTruck, orders] = await Promise.all([
        this.userRepository.findOne({ where: { idNumber: courseData.operator_id } }),
        this.userRepository.findOne({ where: { id: courseData.creator } }),
        this.propaneTruckRepository.findOne({ where: { plate: courseData.propane_truck.toString() } }),
        this.orderRepository.findByIds(courseData.orders)
      ]);

      // Validar existencia de entidades
      if (!operator) return ResponseUtil.error(404, 'Operador no encontrado');
      if (!creator) return ResponseUtil.error(404, 'Creador no encontrado');
      if (!propaneTruck) return ResponseUtil.error(404, 'Camión de propano no encontrado');
      if (orders.length === 0) return ResponseUtil.error(404, 'Pedidos no encontrados');

      // Crear nuevo curso
      const newCourse = this.courseRepository.create({
        ...courseData,
        id: uuidv4(),
        state: 'ACTIVO',
        operator,
        orders,
        propane_truck: propaneTruck,
        creator: `${creator.firstName} ${creator.lastName}`
      });

      const createdCourse = await this.courseRepository.save(newCourse);

      // Crear courseLog
      const courseLog = this.courseLogRepository.create({
        plate: propaneTruck.plate,
        operator: `${operator.firstName} ${operator.lastName}`,
        creator: `${creator.firstName} ${creator.lastName}`,
        id_number: creator.idNumber,
        scheduling_date: newCourse.fecha,
        orders: orders.map(order => String(order.folio)),
        delivered_volume: 0,
        delivered_mass: 0,
        charges: 0,
        completed_orders: [],
        create: new Date(),
        update: new Date(),
      });

      await this.courseLogService.create(courseLog);

      // Actualizar estados
      await Promise.all([
        ...orders.map(order => this.commonService.updateOrder(order.id, { status: 'EN CURSO' })),
        this.commonService.updatePropaneTruckStatus(propaneTruck.id, { status: 'EN CURSO' })
      ]);

      // Log básico
      console.log('Derrotero creado:', {
        id: createdCourse.id,
        propaneTruck: propaneTruck.plate,
        operator: operator.id,
        orders: orders.length,
        by: `${creator.firstName} ${creator.lastName}`
      });

      return ResponseUtil.success(201, 'Derrotero creado exitosamente', createdCourse);

    } catch (error) {
      console.error('Error en create:', error);
      return ResponseUtil.error(500, 'Error al crear el Derrotero');
    }
  }

  async findAll(): Promise<any> {
    try {
      const courses = await this.courseRepository
        .createQueryBuilder('courses')
        .leftJoinAndSelect('courses.operator', 'operator')
        .leftJoinAndSelect('courses.propane_truck', 'propane_truck')
        .leftJoinAndSelect('courses.orders', 'orders')
        .leftJoinAndSelect('orders.branch_office', 'branch_office')
        .select([
          'courses.id', // Asegúrate de seleccionar el campo principal de la entidad
          'courses.fecha',
          'courses.create',
          'courses.update',
          'courses.creator',
          'operator.id',
          'operator.firstName',
          'operator.lastName',
          'operator.idNumber',
          'propane_truck.id',
          'propane_truck.plate',
          'orders.id',
          'orders.folio',
          'orders.token',
          'orders.status',
          'orders.create',
          'branch_office.name'
        ])
        .getMany();

      if (courses.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado derroteros'
        );
      }

      return ResponseUtil.success(
        200,
        'derroteros encontrados',
        courses
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los derroteros'
      );
    }
  }

  async findOne(id: string) {
    try {
      const course = await this.courseRepository
        .createQueryBuilder('courses')
        .leftJoinAndSelect('courses.operator', 'operator')
        .leftJoinAndSelect('courses.orders', 'orders')
        .leftJoinAndSelect('courses.propane_truck', 'propane_truck')
        .leftJoinAndSelect('orders.branch_office', 'branch_office')
        .leftJoinAndSelect('branch_office.city', 'city')
        .leftJoinAndSelect('city.department', 'department')
        .leftJoinAndSelect('branch_office.client', 'client')
        .leftJoinAndSelect('client.occupation', 'occupation')
        .leftJoinAndSelect('branch_office.factor', 'factor')
        .leftJoinAndSelect('branch_office.zone', 'zone')
        .leftJoinAndSelect('branch_office.stationary_tanks', 'stationary_tanks')
        .where('courses.id = :id', { id })
        .getOne();

      if (course) {
        this.commonService.findCoursesByOperatorNameAndLastName(course.operator.firstName, course.operator.lastName);

        return ResponseUtil.success(
          200,
          'Derrotero encontrado',
          course
        );
      } else {
        return ResponseUtil.error(
          404,
          'Derrotero no encontrado'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener la Derrotero'
      );
    }
  }

  async findCourseByOperatorId(operatorId: string) {
    try {
      const today = moment().format('YYYY-MM-DD');

      const courses = await this.courseRepository
        .createQueryBuilder('courses')
        .leftJoinAndSelect('courses.operator', 'operator')
        .leftJoinAndSelect('courses.orders', 'orders')
        .leftJoinAndSelect('courses.propane_truck', 'propane_truck')
        .leftJoinAndSelect('orders.branch_office', 'branch_office')
        .leftJoinAndSelect('branch_office.city', 'city')
        .leftJoinAndSelect('city.department', 'department')
        .leftJoinAndSelect('branch_office.client', 'client')
        .leftJoinAndSelect('client.occupation', 'occupation')
        .leftJoinAndSelect('branch_office.factor', 'factor')
        .leftJoinAndSelect('branch_office.zone', 'zone')
        .leftJoinAndSelect('branch_office.stationary_tanks', 'stationary_tanks')
        .where('operator.id = :operatorId', { operatorId })
        .andWhere('DATE(courses.fecha) = :today', { today })
        .orderBy('courses.id', 'DESC') // Ordena los resultados por el campo 'id' en orden descendente
        .getOne(); // Obtiene el primer resultado

      if (!courses) {
        return ResponseUtil.error(
          400,
          'No se han encontrado derrotero'
        );
      }

      this.commonService.findCoursesByOperatorNameAndLastName(courses.operator.firstName, courses.operator.lastName);

      return ResponseUtil.success(
        200,
        'derrotero encontrado',
        courses
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener el derrotero'
      );
    }
  }

  async update(id, courseData) {
    try {
      const existingCourse = await this.courseRepository.findOne({
        where: { id },
      });

      if (!existingCourse) {
        return ResponseUtil.error(
          400,
          'Derrotero no encontrado'
        );
      }

      const orders = await this.orderRepository.findByIds(courseData.orders);
      const [operator, creator, propaneTruck] = await Promise.all([
        this.userRepository.findOne({ where: { idNumber: courseData.operator_id } }),
        this.userRepository.findOne({ where: { id: courseData.creator } }),
        this.propaneTruckRepository.findOne({ where: { plate: courseData.propane_truck.toString() } }),
        this.orderRepository.findByIds(courseData.orders)
      ]);

      const existingCourseLog = await this.courseLogRepository
        .createQueryBuilder('courseLog')
        .where('courseLog.plate = :plate', { plate: courseData.propane_truck })
        .andWhere('courseLog.scheduling_date = :scheduling_date', { scheduling_date: courseData.fecha })
        .andWhere('courseLog.operator = :operator', { operator: `${operator.firstName} ${operator.lastName}` })
        .andWhere('courseLog.orders = :orders', { orders: courseData.last_orders.join(',') })
        .getOne();

      const updatedCourse = await this.courseRepository.save({
        ...existingCourse,
        orders: orders,
        fecha: courseData.fecha
      });

      if (updatedCourse) {
        const status = {
          'status': 'EN CURSO'
        };

        // Utiliza Promise.all para actualizar todas las órdenes en paralelo
        await Promise.all(orders.map(order => this.commonService.updateOrder(order.id, status)));

        if (existingCourseLog) {
          const courseLog = {
            ...existingCourseLog,
            orders: orders.map(order => String(order.folio)),
          }

          this.courseLogRepository.save(courseLog);

          return ResponseUtil.success(
            200,
            'Derrotero actualizado exitosamente',
            updatedCourse
          );
        }

        const today = new Date();
        const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (updatedCourse.fecha >= formattedToday) {
          try {
            // Crear courseLog
            const courseLog = this.courseLogRepository.create({
              plate: propaneTruck.plate,
              operator: `${operator.firstName} ${operator.lastName}`,
              creator: `${creator.firstName} ${creator.lastName}`,
              id_number: creator.idNumber,
              scheduling_date: updatedCourse.fecha,
              orders: orders.map(order => String(order.folio)),
              delivered_volume: 0,
              delivered_mass: 0,
              charges: 0,
              completed_orders: [],
              create: new Date(),
              update: new Date(),
            });

            await this.courseLogService.create(courseLog);

          } catch (error) {
            console.error('Error al crear el Reporte de derrotero:', error);
          }
        }

        return ResponseUtil.success(
          200,
          'Derrotero actualizado exitosamente',
          updatedCourse
        );
      }

    } catch (error) {
      console.error('Error en update:', error);
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al actualizar el Derrotero',
        error.message
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const existingCourse = await this.courseRepository.findOne({
        where: { id },
      });

      if (!existingCourse) {
        return ResponseUtil.error(404, 'Derrotero no encontrado');
      }

      existingCourse.state = 'INACTIVO';

      const updatedCity = await this.courseRepository.save(existingCourse);

      if (updatedCity) {
        return ResponseUtil.success(
          200,
          'Derrotero eliminado exitosamente',
          updatedCity
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al eliminar el Derrotero'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al eliminar el Derrotero'
      );
    }
  }

  async delete(id: string): Promise<any> {
    try {
      const existingCourse = await this.courseRepository.findOne({
        where: { id },
        relations: ['operator', 'propane_truck', 'orders', 'orders.branch_office']
      });

      if (!existingCourse) {
        return ResponseUtil.error(404, 'Derrotero no encontrado');
      }

      const onCourseOrders = existingCourse.orders.filter(order => order.status === 'EN CURSO');

      const status = {
        'status': 'DISPONIBLE'
      }
      const statusBranchOffice = {
        'status': 'PENDIENTE'
      }

      // Actualizar los pedidos
      await Promise.all(
        existingCourse.orders
          .filter(order => order.status != 'FINALIZADO')
          .map(async order => {
            await this.commonService.updateOrder(order.id, status);

            if (order.branch_office.status === 'CARGADO') {
              await this.commonService.updateBranchOfficeStatus(order.branch_office_code, statusBranchOffice);
            }
          })
      );

      // Actualizar el estado del operador, del camión de propano y eliminar el curso
      await Promise.all([
        this.commonService.updateUserStatus(existingCourse.operator.id, status),
        this.commonService.updatePropaneTruckStatus(existingCourse.propane_truck.id, status),
        this.courseRepository.remove(existingCourse)
      ]);

      console.log(`Derrotero eliminado: ${id}`);

      return ResponseUtil.success(
        200,
        'Derrotero eliminado exitosamente',
        onCourseOrders
      );
    } catch (error) {
      console.log(error);

      return ResponseUtil.error(
        500,
        'Error al eliminar el Derrotero'
      );
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////

  async deleteOnReasign(id: string): Promise<any> {
    try {
      const existingCourse = await this.courseRepository.findOne({
        where: { id },
        relations: ['operator', 'propane_truck', 'orders']
      });

      if (!existingCourse) {
        return ResponseUtil.error(404, 'Derrotero no encontrado');
      }


      await this.courseRepository.remove(existingCourse);

      const status = {
        'status': 'DISPONIBLE'
      }

      await this.commonService.updateUserStatus(existingCourse.operator.id, status);
      await this.commonService.updatePropaneTruckStatus(existingCourse.propane_truck.id, status);

      console.log(`==============DERROTERO ${id} ELIMINADO=============`);

      return ResponseUtil.success(
        200,
        'Derrotero eliminado exitosamente'
      );
    } catch (error) {
      console.log(error);

      return ResponseUtil.error(
        500,
        'Error al eliminar el Derrotero'
      );
    }
  }

  async findForHome(): Promise<any> {
    const today = moment().format('YYYY-MM-DD');

    const courses = await this.courseRepository
      .createQueryBuilder('courses')
      .leftJoinAndSelect('courses.operator', 'operator')
      .leftJoinAndSelect('courses.orders', 'orders')
      .leftJoinAndSelect('courses.propane_truck', 'propane_truck')
      .select([
        'courses.id', // Asegúrate de seleccionar el campo principal de la entidad
        'operator.firstName',
        'operator.lastName',
        'orders.id', // Selecciona los campos necesarios de orders
        'orders.status', // 
        'propane_truck.plate' // Selecciona los campos necesarios de propane_truck
      ])
      .where("courses.fecha = :today", { today })
      .getMany();

    if (courses.length < 1) {
      const data = 'No hay datos para mostrar';
      return ResponseUtil.error(
        400,
        `No hay datos registrados para el día ${today}`,
        data
      );
    }

    const data = courses.map(course => {
      const totalOrders = course.orders.length;
      const finalizedOrders = course.orders.filter(order => order.status === 'FINALIZADO').length;
      const efficiency = totalOrders > 0 ? (finalizedOrders / totalOrders) * 100 : 0;

      return {
        operator: `${course.operator.firstName} ${course.operator.lastName}`,
        propane_truck: course.propane_truck.plate,
        efficiency: efficiency,
        courses: courses.length,
        today: today
      };
    });

    const fullEfficiencyCount = data.filter(course => course.efficiency === 100).length;
    const percentageSuccess = (fullEfficiencyCount / courses.length) * 100;

    const result = data.map(course => ({
      ...course,
      fullEfficiencyCount,
      percentageSuccess
    }));

    return ResponseUtil.success(
      200,
      'derroteros encontrados',
      result
    );
  }

}
