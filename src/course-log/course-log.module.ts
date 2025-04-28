import { Module } from '@nestjs/common';
import { CourseLogService } from './course-log.service';
import { CourseLogController } from './course-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseLog } from './entities/course-log.entity';
import { Order } from 'src/orders/entities/order.entity';
import { PropaneTruck } from 'src/propane-truck/entities/propane-truck.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseLog, Order, PropaneTruck]),
  ],
  controllers: [CourseLogController],
  providers: [CourseLogService],
  exports: [CourseLogService],
})
export class CourseLogModule { }
