import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUtil } from 'src/utils/response.util';
import { SpecificGravityCorrection } from 'src/specific-gravity-correction/entities/specific-gravity-correction.entity';
import { LpgProperty } from 'src/lpg-properties/entities/lpg-property.entity';
import { VolumetricCorrection } from './reports-methods/volumetric-correction';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(SpecificGravityCorrection)
    private specificGravityCorrectionRepository: Repository<SpecificGravityCorrection>,
    @InjectRepository(LpgProperty)
    private lpgPropertyRepository: Repository<LpgProperty>,
    private volumetricCorrection: VolumetricCorrection, // Asegúrate de que esté inyectado correctamente
  ) {}

  async control_inventory(data: any) {
    if (!data) {
      return ResponseUtil.error(400, 'No se recibieron datos para generar el reporte');
    }

    try {
      const entry = {
        density: data.density,
        observed_pressure: data.observed_pressure_in,
        temperature: data.temperature_in,
        capacityGl: data.capacityGl,
        gross_volume: (data.entry / 100) * data.capacityGl,
      };

      const exit = {
        density: data.density,
        observed_pressure: data.observed_pressure_out,
        temperature: data.temperature_out,
        capacityGl: data.capacityGl,
        gross_volume: (data.exit / 100) * data.capacityGl,
      };

      const entry_calculations = await this.volumetricCorrection.VOLUMETRIC_CORRECTION(entry);
      const exit_calculations = await this.volumetricCorrection.VOLUMETRIC_CORRECTION(exit);

      const teoric_sale_gl = exit_calculations.total_volume_at_60F - entry_calculations.total_volume_at_60F;
      const teoric_sale_kg = exit_calculations.total_mass - entry_calculations.total_mass;

      const response = {
        entry_calculations: entry_calculations,
        exit_calculations: exit_calculations,
        teoric_sale_gl: teoric_sale_gl,
        teoric_sale_kg: (teoric_sale_kg).toFixed(2),
      };

      return ResponseUtil.success(200, 'Reporte de control de inventario', response);
    } catch (error) {
      console.log(error);
      return ResponseUtil.error(500, 'Error al generar el reporte de control de inventario');
    }
  }
}