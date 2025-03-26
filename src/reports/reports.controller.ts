import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  ///////////////////////////////////////////////////////////////////

  @Post('control_inventory')
  async control_inventory(@Body() data: any): Promise<any> {
    return this.reportsService.control_inventory(data);
  }
}
