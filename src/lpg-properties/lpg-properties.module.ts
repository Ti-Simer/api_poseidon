import { Module } from '@nestjs/common';
import { LpgPropertiesService } from './lpg-properties.service';
import { LpgPropertiesController } from './lpg-properties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LpgProperty } from './entities/lpg-property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LpgProperty])
  ],
  controllers: [LpgPropertiesController],
  providers: [LpgPropertiesService],
})
export class LpgPropertiesModule {}

