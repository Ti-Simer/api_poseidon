import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { ResponseUtil } from 'src/utils/response.util';
import { v4 as uuidv4 } from 'uuid';
import { BranchOffices } from 'src/branch-offices/entities/branch-office.entity';
import { CommonService } from 'src/common-services/common.service';
import { MailerService } from 'src/utils/mailer.service';
import { ConfigurationSheetService } from 'src/configuration-sheet/configuration-sheet.service';
import * as moment from 'moment-timezone';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(BranchOffices) private branchOfficeRepository: Repository<BranchOffices>,
    @InjectRepository(Request) private requestRepository: Repository<Request>,
    private commonService: CommonService,
    private configurationSheetService: ConfigurationSheetService,
  ) { }

  async create(orderData: Order): Promise<any> {
    try {
      let folio = 1;
      let token = '';

      if (orderData) {

        if (orderData.validate_token == true) {
          token = Math.random().toString(36).substr(2, 6);
        }

        const lastOrder = await this.orderRepository.find({
          order: {
            folio: 'DESC',
          },
          take: 1,
        });

        if (lastOrder && lastOrder.length > 0) {
          folio = lastOrder[0].folio + 1;
        }
      }

      const branch_office = await this.branchOfficeRepository.findOne({
        where: { branch_office_code: orderData.branch_office_code },
        relations: ['client'],
      });

      const newOrder = this.orderRepository.create({
        ...orderData,
        id: uuidv4(), // Generar un nuevo UUID
        state: 'ACTIVO',
        status: 'DISPONIBLE',
        folio: folio,
        token: token,
        branch_office: branch_office,
      });

      const createdOrder = await this.orderRepository.save(newOrder);

      if (createdOrder) {
        const status = 'PENDIENTE';
        await this.commonService.updateBranchOfficeStatus(branch_office.id, { status });
      }

      if (createdOrder.token != '') {
        const dataEmail = await this.loadDataEmail();
        MailerService.sendToken(createdOrder, branch_office.client[0].email, dataEmail);
      }

      if (createdOrder) {
        return ResponseUtil.success(
          200,
          'Pedido creado exitosamente',
          createdOrder
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al crear el Pedido'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al crear el Pedido',
        error.message
      );
    }
  }

  async findAll(pageData: any): Promise<any> {
    try {
      const [orders, total] = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.branch_office', 'branch_office')
        .select([
          'order.id',
          'order.folio',
          'order.create',
          'order.token',
          'order.status',
          'order.payment_type',
          'order.branch_office_code',
          'branch_office.id',
          'branch_office.name',
        ])
        .where('order.state = :state', { state: 'ACTIVO' })
        .skip((pageData.page - 1) * pageData.limit)
        .take(pageData.limit)
        .orderBy('order.create', 'DESC')
        .addOrderBy('order.folio', 'DESC')
        .getManyAndCount();

      if (orders.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Pedidos'
        );
      }

      return ResponseUtil.success(
        200,
        'Pedidos encontrados',
        {
          orders,
          total,
          page: pageData.page,
          limit: pageData.limit,
        }
      );
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los Pedidos'
      );
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['branch_office'],
      });

      if (order) {
        return ResponseUtil.success(
          200,
          'Pedido encontrado',
          order
        );
      } else {
        return ResponseUtil.error(
          404,
          'Pedido no encontrado'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener el Pedido'
      );
    }
  }

  async update(id, orderData) {
    try {
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
      });

      if (!existingOrder) {
        return ResponseUtil.error(
          400,
          'Pedido no encontrado'
        );
      }

      const updatedOrder = await this.orderRepository.save({
        ...existingOrder,
        ...orderData,
      });

      return ResponseUtil.success(
        200,
        'Pedido actualizada exitosamente',
        updatedOrder
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseUtil.error(
          404,
          'Pedido no encontrado'
        );
      }
      return ResponseUtil.error(
        500,
        'Error al actualizar el Pedido'
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
      });

      if (!existingOrder) {
        return ResponseUtil.error(404, 'Pedido no encontrado');
      }

      // Verifica si el estado del pedido es 'DISPONIBLE' o 'EN CURSO'
      if (existingOrder.status === 'EN CURSO') {
        return ResponseUtil.error(
          400,
          'No se puede eliminar un Pedido que esté EN CURSO'
        );
      }

      existingOrder.state = 'INACTIVO';
      const updatedOrder = await this.orderRepository.save(existingOrder);

      if (updatedOrder) {
        return ResponseUtil.success(
          200,
          'Pedido eliminada exitosamente',
          updatedOrder
        );
      } else {
        return ResponseUtil.error(
          500,
          'Ha ocurrido un problema al eliminar el Pedido'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al eliminar el Pedido'
      );
    }
  }

  async delete(id: string): Promise<any> {
    try {
      console.log('id', id);

      const existingOrder = await this.orderRepository.findOne({
        where: { id },
        relations: ['branch_office'] // Asegúrate de incluir todas las relaciones necesarias
      });

      if (!existingOrder) {
        return ResponseUtil.error(404, 'Pedido no encontrado');
      }

      // Verifica si el estado del pedido es 'DISPONIBLE' o 'EN CURSO'
      if (existingOrder.status === 'EN CURSO') {
        return ResponseUtil.error(
          400,
          'No se puede eliminar un Pedido que esté EN CURSO'
        );
      }

      // No elimines la sucursal relacionada, solo elimina el pedido
      await this.orderRepository.remove(existingOrder);

      return ResponseUtil.success(
        200,
        'Pedido eliminado exitosamente'
      );
    } catch (error) {
      console.log(error);

      return ResponseUtil.error(
        500,
        'Error al eliminar el Pedido'
      );
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////

  async findOrderByQuery(query: any): Promise<any> {
    try {
      // Validación de parámetro requerido
      if (!query.date) return ResponseUtil.error(400, 'El parámetro "fecha R1" es requerido');

      // Configurar rango de fechas
      const fechaInicial = moment(query.date).startOf('day').toISOString();
      const fechaFinal = query.date2
        ? moment(query.date2).add(1, 'days').startOf('day').toISOString()
        : moment(query.date).add(1, 'days').startOf('day').toISOString();

      // Construir consulta base
      const orderQuery = this.orderRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.branch_office', 'branch_office')
        .select([
          'order.id',
          'order.folio',
          'order.create',
          'order.token',
          'order.status',
          'order.payment_type',
          'order.branch_office_code',
          'branch_office.id',
          'branch_office.name',
        ])
        .where("order.create >= :fechaInicial", { fechaInicial })
        .andWhere("order.create < :fechaFinal", { fechaFinal });

      // Ejecutar consulta única
      const orders = await orderQuery.getMany();

      if (!orders.length) return ResponseUtil.error(404, 'No se encontraron pedidos');

      return ResponseUtil.success(200, `${orders.length} pedidos encontrados`, orders);

    } catch (error) {
      console.error('Error en findOrderByQuery:', error);
      return ResponseUtil.error(500, 'Error interno al buscar pedidos');
    }
  }

  async findOrdersByBranchOffice(query: any) {
    const branch_office = query.branch_office;

    try {
      const [orders, total] = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.branch_office', 'branch_office')
        .select([
          'order.id',
          'order.folio',
          'order.create',
          'order.token',
          'order.status',
          'order.payment_type',
          'order.branch_office_code',
          'branch_office.id',
          'branch_office.name',
        ])
        .where('branch_office.name LIKE :branch_office', { branch_office: `%${branch_office}%` })
        .andWhere('order.state = :state', { state: 'ACTIVO' })
        .andWhere('order.status = :status', { status: 'DISPONIBLE' })
        .orderBy('order.create', 'DESC')
        .addOrderBy('order.folio', 'DESC')
        .getManyAndCount();

      if (orders.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Pedidos'
        );
      }

      return ResponseUtil.success(
        200,
        'Pedidos encontrados',
        {
          orders,
          total
        }
      );
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los Pedidos'
      );
    }
  }

  async getAvailableOrders(pageData: any) {
    try {
      const [orders, total] = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.branch_office', 'branch_office')
        .select([
          'order.id',
          'order.folio',
          'order.create',
          'order.payment_type',
          'order.state',
          'order.status',
          'branch_office.id',
          'branch_office.name',
        ])
        .where('order.state = :state', { state: 'ACTIVO' })
        .andWhere('order.status = :status', { status: 'DISPONIBLE' })
        .skip((pageData.page - 1) * pageData.limit)
        .take(pageData.limit)
        .orderBy('order.create', 'DESC')
        .addOrderBy('order.folio', 'DESC')
        .getManyAndCount();

      if (orders.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Pedidos'
        );
      }

      return ResponseUtil.success(
        200,
        'Pedidos encontrados',
        {
          orders,
          total,
          page: pageData.page,
          limit: pageData.limit,
        }
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los Pedidos'
      );
    }
  }

  async createMultiple(data: any): Promise<any> {
    const chunkSize = 500;
    const createdOrders = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      for (const item of chunk) {
        const response = await this.create(item);

        if (response.statusCode === 200) {
          createdOrders.push(response.data.id);
        }
      }
    }

    return ResponseUtil.success(
      200,
      'Pedidos creados exitosamente',
      createdOrders
    );
  }

  async findAllOrders(pageData: any): Promise<any> {
    try {
      const [orders, total] = await this.orderRepository.findAndCount({
        where: {
          state: 'ACTIVO'
        },
        relations: [
          'branch_office'
        ],
        skip: (pageData.page - 1) * pageData.limit,
        take: pageData.limit,
        order: {
          create: 'DESC', // Ordenar por el campo 'created' en orden descendente
          folio: 'DESC' // Ordenar por el campo 'internal_folio' en orden descendente
        }
      });

      if (orders.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Pedidos'
        );
      }

      return ResponseUtil.success(
        200,
        'Pedidos encontrados',
        {
          orders,
          total,
          page: pageData.page,
          limit: pageData.limit,
        }
      );
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los Pedidos'
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

  async getOrdersByToday(): Promise<any> {
    try {
      const today = moment().format('YYYY-MM-DD');
      const dayAgo = moment().subtract(5, 'days').format('YYYY-MM-DD');

      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.folio')
        .addSelect('order.status')
        .where('order.status = :statusEnCurso', { statusEnCurso: 'EN CURSO' })
        .orWhere('order.status = :statusFinalizado', { statusFinalizado: 'FINALIZADO' })
        .andWhere("order.create >= :dayAgo", { dayAgo })
        .andWhere("order.create < :today", { today })
        .getMany();

      if (orders.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrado Pedidos'
        );
      }

      const ordersOnCourse = orders.filter(order => order.status === 'EN CURSO');
      const ordersSuccess = orders.filter(order => order.status === 'FINALIZADO');
      const percentageOnCourse = (ordersOnCourse.length * 100) / orders.length;
      const percentageSuccess = (ordersSuccess.length * 100) / orders.length;

      const orderData = {
        ordersOnCourse: ordersOnCourse.length,
        ordersSuccess: ordersSuccess.length,
        percentageOnCourse,
        percentageSuccess,
        today,
        dayAgo
      }

      return ResponseUtil.success(
        200,
        'Pedidos encontrados',
        orderData
      );

    } catch (error) {
      return ResponseUtil.error(
        500,
        'Ha ocurrido un error al obtener Pedidos',
        error.message
      );
    }
  }
}
