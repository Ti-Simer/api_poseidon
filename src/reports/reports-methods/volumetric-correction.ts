import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LpgProperty } from "src/lpg-properties/entities/lpg-property.entity";
import { SpecificGravityCorrection } from "src/specific-gravity-correction/entities/specific-gravity-correction.entity";
import { ResponseUtil } from "src/utils/response.util";
import { Repository } from "typeorm";

@Injectable()
export class VolumetricCorrection {
    constructor(
        @InjectRepository(SpecificGravityCorrection)
        private specificGravityCorrectionRepository: Repository<SpecificGravityCorrection>,
        @InjectRepository(LpgProperty)
        private lpgPropertyRepository: Repository<LpgProperty>,
    ) { }

    async VOLUMETRIC_CORRECTION(data: any) {
        const absolut_density = ((data.density * 999.05 * 3.785412) / 1000).toFixed(3);
        const rounded_density = (Math.round(data.density * 100) / 100).toFixed(3);
        const observed_pressure = data.observed_pressure
        const temperature = data.temperature
        const pressure_exerted = data.observed_pressure + 14.69;
        const gross_volume = data.gross_volume;
        const tank_capacity = data.capacityGl;
        const vapor_space_volume = data.capacityGl - gross_volume;

        const specific_gravity_query = await this.specificGravityCorrectionRepository
            .createQueryBuilder('specific_gravity_correction')
            .where('specific_gravity_correction.Temp_Farenheit >= :temperature', { temperature: temperature })
            .getOne();

        if (!specific_gravity_query) {
            return ResponseUtil.error(400, 'No se encontró la corrección de gravedad específica');
        }

        const absolut_density_key = rounded_density.toString();
        const temperature_correction_factor = specific_gravity_query[absolut_density_key];

        const lpg_properties_query = await this.lpgPropertyRepository
            .createQueryBuilder('lpg_properties')
            .where('lpg_properties.compound = :compound', { compound: 'TOTAL' })
            .getOne();

        if (!lpg_properties_query) {
            return ResponseUtil.error(400, 'No se encontraron las propiedades del LPG');
        }

        // Variables calculation factor conversion vapor to equivalent liquid

        const reduced_temperature = ((temperature + 459.67) / (lpg_properties_query.temp_vapor + 459.67)).toFixed(4);
        const reduced_pressure = (pressure_exerted / lpg_properties_query.pres_vapor).toFixed(4);
        const B0 = (0.1445
            - 0.33 / parseFloat(reduced_temperature)
            - 0.1385 / (parseFloat(reduced_temperature) ** 2)
            - 0.0121 / (parseFloat(reduced_temperature) ** 3)).toFixed(4);
        const B1 = (0.073
            + 0.46 / parseFloat(reduced_temperature)
            - 0.5 / (parseFloat(reduced_temperature) ** 2)
            - 0.097 / (parseFloat(reduced_temperature) ** 3)
            - 0.0073 / (parseFloat(reduced_temperature) ** 8)).toFixed(4);
        const compressibility_factor = (1 + (parseFloat(B0) + parseFloat(B1) * lpg_properties_query.factor_vapor) * parseFloat(reduced_pressure) / parseFloat(reduced_temperature)).toFixed(4);
        const vapor_density = (pressure_exerted * lpg_properties_query.steam_weight / (80.27 * (temperature + 459.67) * parseFloat(compressibility_factor))).toFixed(4);
        const pressure_correction_factor = (parseFloat(vapor_density) / (data.density * 8.3372));

        // Total Volume

        let liquid_volume_at_60F = 0;
        let liquid_equivalent_vapor_volume_at_60F = 0;

        if (gross_volume != 0) {
            liquid_volume_at_60F = Math.floor(gross_volume * temperature_correction_factor)
        }

        if (vapor_space_volume != 0) {
            liquid_equivalent_vapor_volume_at_60F = Math.floor(vapor_space_volume * pressure_correction_factor);
        }

        const total_volume_at_60F = Math.floor(liquid_volume_at_60F + liquid_equivalent_vapor_volume_at_60F);
        const total_mass = parseFloat(absolut_density) * total_volume_at_60F;

        const calculations = {
            absolut_density: absolut_density,
            rounded_density: rounded_density,
            observed_pressure: observed_pressure,
            temperature: temperature,
            pressure_exerted: pressure_exerted,
            gross_volume: gross_volume.toFixed(2),
            tank_capacity: tank_capacity,
            vapor_space_volume: vapor_space_volume,
            temperature_correction_factor: temperature_correction_factor,
            reduced_temperature: reduced_temperature,
            reduced_pressure: reduced_pressure,
            B0: B0,
            B1: B1,
            compressibility_factor: compressibility_factor,
            vapor_density: vapor_density,
            pressure_correction_factor: pressure_correction_factor,
            liquid_volume_at_60F: liquid_volume_at_60F,
            liquid_equivalent_vapor_volume_at_60F: liquid_equivalent_vapor_volume_at_60F,
            total_volume_at_60F: total_volume_at_60F,
            total_mass: total_mass.toFixed(3),
        }

        return calculations;
    }
}