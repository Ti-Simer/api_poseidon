import { Controller, Get, Post, Body, Put, Param, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogReportService } from './log-report.service';
import { LogReport } from './entities/log-report.entity';
import { Express } from 'express';
import { ApiKeyGuard } from 'src/auth/api-key.middleware';

@UseGuards(ApiKeyGuard)
@Controller('log-report')
export class LogReportController {
  constructor(private readonly logReportService: LogReportService) {}

  @Post('create')
  async create(@Body() logReportData: LogReport): Promise<LogReport> {
    return this.logReportService.create(logReportData);
  }
  
  @Post('all')
  async findAll(@Body('pageData') pageData: any): Promise<LogReport[]> {
    return this.logReportService.findAll(pageData);
  }

  @Get('getById/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.logReportService.findOne(id);
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() logReportData: LogReport): Promise<any> {
    return this.logReportService.update(id, logReportData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    return this.logReportService.remove(id);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////

  @Post('findByDay')
  async findByDay(@Body('pageData') pageData: any): Promise<LogReport[]> {
    return this.logReportService.findByDay(pageData);
  }

  // @Post('create-log')
  // async createLog(@Body() logReportData: LogReport): Promise<LogReport> {
  //   return this.logReportService.createLog(logReportData);
  // }

  @Post('create-log')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJsonFile(@UploadedFile() file: Express.Multer.File) {
    if (file.mimetype !== 'application/json' && file.mimetype !== 'application/octet-stream') {
      throw new Error('Only JSON files are allowed!');
    }

    // Convierte el buffer del archivo a JSON
    const jsonData = JSON.parse(file.buffer.toString());

    // Llama al servicio para crear el archivo de log
    return await this.logReportService.createLog(jsonData);
  }
}
