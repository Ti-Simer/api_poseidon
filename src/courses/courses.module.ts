import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { CommonModule } from 'src/common-services/common.module';
import { Order } from 'src/orders/entities/order.entity';
import { PropaneTruck } from 'src/propane-truck/entities/propane-truck.entity';
import { CourseLogModule } from 'src/course-log/course-log.module';
import { CourseLogService } from 'src/course-log/course-log.service';
import { CourseLog } from 'src/course-log/entities/course-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Usuario, Order, PropaneTruck, CourseLog]),
    CommonModule,
    CourseLogModule
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseLogService],
})
export class CoursesModule {}
