import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpecificGravityCorrectionService } from './specific-gravity-correction.service';
import { SpecificGravityCorrection } from './entities/specific-gravity-correction.entity';

@Controller('specific-gravity-correction')
export class SpecificGravityCorrectionController {
  constructor(private readonly specificGravityCorrectionService: SpecificGravityCorrectionService) { }

  @Post('create')
  async create(@Body() SpecificGravityCorrectionData: SpecificGravityCorrection): Promise<SpecificGravityCorrection> {
    return this.specificGravityCorrectionService.create(SpecificGravityCorrectionData);
  }
}
