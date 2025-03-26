import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUtil } from 'src/utils/response.util';
import { Repository } from 'typeorm';
import { DensityCorrection } from './entities/density-correction.entity';

@Injectable()
export class DensityCorrectionService {
  constructor(
    @InjectRepository(DensityCorrection) private densityCorrectionRepository: Repository<DensityCorrection>,
  ) { }

  async create(densityCorrectionData: DensityCorrection): Promise<any> {
    try {
      if (densityCorrectionData) {
        const densityCorrectionCorrection = await this.densityCorrectionRepository.findOne({
          where: [
            { Temp_Farenheit: densityCorrectionData.Temp_Farenheit },
          ]
        });

        if (densityCorrectionCorrection) {
          return ResponseUtil.error(400, 'La corrección ya existe');
        }

        const newdensityCorrection = this.densityCorrectionRepository.create({
          ...densityCorrectionData,
        });

        const createddensityCorrection = await this.densityCorrectionRepository.save(newdensityCorrection);

        if (createddensityCorrection) {
          return ResponseUtil.success(
            200,
            'Corrección creado exitosamente',
            createddensityCorrection
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
