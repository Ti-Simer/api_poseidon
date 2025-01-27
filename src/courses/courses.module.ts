import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Location } from 'src/locations/entities/location.entity';
import { CommonModule } from 'src/common-services/common.module';
import { Order } from 'src/orders/entities/order.entity';
import { PropaneTruck } from 'src/propane-truck/entities/propane-truck.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Usuario, Location, Order, PropaneTruck]),
    CommonModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
