import { Module } from '@nestjs/common';
import { SpecificGravityCorrectionService } from './specific-gravity-correction.service';
import { SpecificGravityCorrectionController } from './specific-gravity-correction.controller';
import { SpecificGravityCorrection } from './entities/specific-gravity-correction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecificGravityCorrection,
    ]),
  ],
  controllers: [SpecificGravityCorrectionController],
  providers: [SpecificGravityCorrectionService],
})
export class SpecificGravityCorrectionModule { }
