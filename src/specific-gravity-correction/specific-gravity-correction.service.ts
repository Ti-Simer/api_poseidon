import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUtil } from 'src/utils/response.util';
import { SpecificGravityCorrection } from './entities/specific-gravity-correction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecificGravityCorrectionService {

  constructor(
    @InjectRepository(SpecificGravityCorrection) private specificGravityCorrectionRepository: Repository<SpecificGravityCorrection>,
  ) { }

  async create(specificGravityCorrectionData: SpecificGravityCorrection): Promise<any> {
    try {
      if (specificGravityCorrectionData) {
        const existingspecificGravityCorrection = await this.specificGravityCorrectionRepository.findOne({
          where: [
            { Temp_Farenheit: specificGravityCorrectionData.Temp_Farenheit },
          ]
        });

        if (existingspecificGravityCorrection) {
          return ResponseUtil.error(400, 'La corrección ya existe');
        }

        const newspecificGravityCorrection = this.specificGravityCorrectionRepository.create({
          ...specificGravityCorrectionData,
        });

        const createdspecificGravityCorrection = await this.specificGravityCorrectionRepository.save(newspecificGravityCorrection);

        if (createdspecificGravityCorrection) {
          return ResponseUtil.success(
            200,
            'Corrección creado exitosamente',
            createdspecificGravityCorrection
          );
        } else {
          return ResponseUtil.error(
            500,
            'Ha ocurrido un problema al crear La corrección'
          );
        }
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al crear La corrección'
      );
    }
  }
}
