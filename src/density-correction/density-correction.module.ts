import { Module } from '@nestjs/common';
import { DensityCorrectionService } from './density-correction.service';
import { DensityCorrectionController } from './density-correction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DensityCorrection } from './entities/density-correction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DensityCorrection
    ])
  ],
  controllers: [DensityCorrectionController],
  providers: [DensityCorrectionService],
})
export class DensityCorrectionModule {}
