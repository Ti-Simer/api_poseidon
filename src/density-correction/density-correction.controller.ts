import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DensityCorrectionService } from './density-correction.service';
import { DensityCorrection } from './entities/density-correction.entity';

@Controller('density-correction')
export class DensityCorrectionController {
  constructor(private readonly densityCorrectionService: DensityCorrectionService) {}

  @Post('create')
  async create(@Body() densityCorrectionData: DensityCorrection): Promise<DensityCorrection> {
    return this.densityCorrectionService.create(densityCorrectionData);
  }
}
