import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LpgProperty } from './entities/lpg-property.entity';
import { ResponseUtil } from 'src/utils/response.util';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';

@Injectable()
export class LpgPropertiesService {
  constructor(
    @InjectRepository(LpgProperty) private lpgPropertyRepository: Repository<LpgProperty>,
  ) { }

  async create(lpgpropertiesData: LpgProperty): Promise<any> {
    try {
      if (!lpgpropertiesData?.xls) {
        return ResponseUtil.error(400, 'Datos de entrada inválidos');
      }

      const parsedXlsData = parse(lpgpropertiesData.xls, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';'
      });

      const lpgProperties: any[] = [];
      const processingErrors: string[] = [];

      // Procesamiento inicial de datos
      for (const item of parsedXlsData) {
        try {
          const parsedItem = {
            volume_percent: this.parseNumber(item.volume_percent),
            pie3_gal: this.parseNumber(item.pie3_gal),
            volatility_factor: this.parseNumber(item.volatility_factor),
            molar_mass: this.parseNumber(item.molar_mass),
            critical_temperature: this.parseNumber(item.critical_temperature),
            critical_pressure: this.parseNumber(item.critical_pressure),
            acentric_factor: this.parseNumber(item.acentric_factor),
            compound: item.compound
          };

          lpgProperties.push({
            ...parsedItem,
            relative_volatility: parseFloat((parsedItem.volume_percent * parsedItem.pie3_gal * parsedItem.volatility_factor).toFixed(3))
          });
        } catch (error) {
          processingErrors.push(`Error procesando ${item.compound}: ${error.message}`);
        }
      }

      if (lpgProperties.length === 0) {
        return ResponseUtil.error(400, 'No se encontraron datos válidos en el archivo');
      }

      // Cálculos principales
      try {
        const sumVapor_fraction = lpgProperties.reduce((acc, item) => acc + item.relative_volatility, 0);

        let sumVolume = 0, sumSteam = 0, sumTemp = 0, sumPres = 0, sumFactor = 0;

        for (const item of lpgProperties) {
          item.vapor_fraction = parseFloat((item.relative_volatility / sumVapor_fraction).toFixed(4));

          item.steam_weight = parseFloat((item.vapor_fraction * item.molar_mass).toFixed(3));
          item.temp_vapor = parseFloat((item.vapor_fraction * item.critical_temperature).toFixed(1));
          item.pres_vapor = parseFloat((item.vapor_fraction * item.critical_pressure).toFixed(1));
          item.factor_vapor = parseFloat((item.vapor_fraction * item.acentric_factor).toFixed(4));

          sumVolume += item.volume_percent;
          sumSteam += item.steam_weight;
          sumTemp += item.temp_vapor;
          sumPres += item.pres_vapor;
          sumFactor += item.factor_vapor;
        }

        // Agregar totales
        lpgProperties.push({
          compound: 'TOTAL',
          volume_percent: sumVolume,
          relative_volatility: sumVapor_fraction,
          steam_weight: sumSteam,
          temp_vapor: sumTemp,
          pres_vapor: sumPres,
          factor_vapor: sumFactor,
          vapor_fraction: 0,
          pie3_gal: 0,
          volatility_factor: 0,
          molar_mass: 0,
          critical_temperature: 0,
          critical_pressure: 0,
          acentric_factor: 0
        });
      } catch (calcError) {
        return ResponseUtil.error(500, 'Error en cálculos', calcError.message);
      }

      // Guardar en base de datos
      try {
        await Promise.all(lpgProperties.map(async (item) => {
          const dbItem = this.lpgPropertyRepository.create({
            ...item,
            vapor_fraction: item.vapor_fraction.toFixed(4),
            relative_volatility: item.relative_volatility.toFixed(1),
            steam_weight: item.steam_weight.toFixed(1),
            temp_vapor: item.temp_vapor.toFixed(1),
            pres_vapor: item.pres_vapor.toFixed(1),
            xls: {},
            type_GLP: lpgpropertiesData.type_GLP
          });
          await this.lpgPropertyRepository.save(dbItem);
        }));
      } catch (dbError) {
        processingErrors.push(`Error guardando datos: ${dbError.message}`);
      }

      return ResponseUtil.success(
        200,
        `Propiedades ${lpgpropertiesData.type_GLP} procesadas${processingErrors.length ? ' con errores' : ''}`,
        processingErrors.length ? { errors: processingErrors } : null
      );

    } catch (error) {
      return ResponseUtil.error(500, 'Error general', error.message);
    }
  }

  async findAll(): Promise<any> {
    try {
      const properties = await this.lpgPropertyRepository
        .createQueryBuilder('lpg_property')
        .getMany();

      if (properties.length < 1) {
        return ResponseUtil.error(
          400,
          'No se han encontrada propiedades de glp'
        );
      }

      return ResponseUtil.success(
        200,
        'propiedad es encontradas',
        properties
      );
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener los propiedades de glp',
        error.message
      );
    }
  }

  async findOne(id: number) {
    try {
      const lpgProperties = await this.lpgPropertyRepository.findOneBy({
        id: id
      });

      if (lpgProperties) {
        return ResponseUtil.success(
          200,
          'propiedades encontrada',
          lpgProperties
        );
      } else {
        return ResponseUtil.error(
          404,
          'propiedades no encontrada'
        );
      }
    } catch (error) {
      return ResponseUtil.error(
        500,
        'Error al obtener el propiedades'
      );
    }
  }

  async update(id, lpgpropertiesData) {
    try {
      const existingLpgProperties = await this.lpgPropertyRepository.findOne({
        where: { id },
      });

      if (!existingLpgProperties) {
        throw new NotFoundException('Propiedad no encontrada');
      }

      const updatedLpgProperties = await this.lpgPropertyRepository.save({
        ...existingLpgProperties,
        ...lpgpropertiesData,
      });

      return ResponseUtil.success(
        200,
        'Propiedad actualizada exitosamente',
        updatedLpgProperties
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ResponseUtil.error(
          404,
          'Propiedad no encontrada'
        );
      }
      return ResponseUtil.error(
        500,
        'Error al actualizar la Propiedad'
      );
    }
  }


  ////////////////////////////////////////////////////////////////////////////////////////

  async clearTable(): Promise<any> {
    try {
      await this.lpgPropertyRepository.clear();
      return ResponseUtil.success(
        200,
        'Tabla de propiedades eliminada exitosamente'
      );
    } catch (error) {
      console.error('Error al vaciar la tabla lpg_property:', error.message);
      return ResponseUtil.error(
        500,
        'Error al vaciar la tabla lpg_property',
        error.message
      );
    }
  }

  async hasAny(): Promise<boolean> {
    try {
      const count = await this.lpgPropertyRepository
        .createQueryBuilder('lpg_property')
        .getCount();

      return ResponseUtil.success(
        200,
        'Consulta de comprobación',
        count > 0
      );

    } catch (error) {
      console.error('Error al verificar las propiedades de GLP:', error.message);
      return false;
    }
  }

  private parseNumber(value: string): number {
    const parsed = parseFloat((value || '0').replace(',', '.'));
    if (isNaN(parsed)) throw new Error(`Valor numérico inválido: ${value}`);
    return parsed;
  }
}
