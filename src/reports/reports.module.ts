import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecificGravityCorrection } from 'src/specific-gravity-correction/entities/specific-gravity-correction.entity';
import { LpgProperty } from 'src/lpg-properties/entities/lpg-property.entity';
import { VolumetricCorrection } from './reports-methods/volumetric-correction';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecificGravityCorrection,
      LpgProperty
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, VolumetricCorrection],
})
export class ReportsModule {}
