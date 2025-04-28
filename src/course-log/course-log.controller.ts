import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CourseLogService } from './course-log.service';
import { CourseLog } from './entities/course-log.entity';

@Controller('course-log')
export class CourseLogController {
  constructor(private readonly courseLogService: CourseLogService) { }

  @Post('create')
  async create(@Body() courseLogData: CourseLog): Promise<CourseLog> {
    return this.courseLogService.create(courseLogData);
  }

  @Put('update')
  async update(@Body() courseLogData: any): Promise<any> {
    return this.courseLogService.update(courseLogData);
  }

  @Get('getById/:id')
  async findOne(@Param('id') id: string): Promise<CourseLog> {
    return this.courseLogService.findOne(id);
  }

  @Post('findByDate')
  async findByDate(@Body() data: any): Promise<CourseLog> {
    return this.courseLogService.findByDate(data);
  }

  /////////////////////////////////////////////////////////////

  @Get('findTrucksOnCourseLog')
  async findTrucksOnCourseLog(): Promise<CourseLog> {
    return this.courseLogService.findTrucksOnCourseLog();
  }

}
