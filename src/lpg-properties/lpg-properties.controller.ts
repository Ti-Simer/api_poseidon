import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { LpgPropertiesService } from './lpg-properties.service';
import { LpgProperty } from './entities/lpg-property.entity';
import { ApiKeyGuard } from 'src/auth/api-key.middleware';

@Controller('lpg-properties')
@UseGuards(ApiKeyGuard)
export class LpgPropertiesController {
  constructor(private readonly lpgPropertiesService: LpgPropertiesService) {}

  @Post('create')
  async create(@Body() lpgpropertiesData: LpgProperty): Promise<LpgProperty> {
    return this.lpgPropertiesService.create(lpgpropertiesData);
  }
  
  @Get('all')
  async findAll(): Promise<LpgProperty[]> {
    return this.lpgPropertiesService.findAll();
  }

  @Get('getById/:id')
  async findOne(@Param('id') id: number): Promise<any> {
    return this.lpgPropertiesService.findOne(id);
  }


  @Put('update/:id')
  async update(@Param('id') id: string, @Body() lpgpropertiesData: LpgProperty): Promise<any> {
    return this.lpgPropertiesService.update(id, lpgpropertiesData);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////

  @Get('hasAny')
  async hasAny(): Promise<any> {
    return this.lpgPropertiesService.hasAny();
  }

  @Delete('clearTable')
  async clearTable(): Promise<any> {
    return this.lpgPropertiesService.clearTable();
  }
}
