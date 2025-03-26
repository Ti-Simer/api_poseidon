import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('lpg_properties')
export class LpgProperty {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('json')
    xls?: any;

    @Column()
    type_GLP: string;

    @Column()
    compound: string;

    @Column({ type: 'float', default: 0 })
    volume_percent: number;

    @Column({ type: 'float', default: 0 })
    pie3_gal: number;

    @Column({ type: 'float', default: 0 })
    volatility_factor: number;

    @Column({ type: 'float', default: 0 })
    molar_mass: number;

    @Column({ type: 'float', default: 0 })
    critical_temperature: number;

    @Column({ type: 'float', default: 0 })
    critical_pressure: number;

    @Column({ type: 'float', default: 0 })
    acentric_factor: number;

    @Column({ type: 'float', default: 0 })
    relative_volatility: number;

    @Column({ type: 'float', default: 0 })
    vapor_fraction: number;

    @Column({ type: 'float', default: 0 })
    steam_weight: number;

    @Column({ type: 'float', default: 0 })
    temp_vapor: number;

    @Column({ type: 'float', default: 0 })
    pres_vapor: number;

    @Column({ type: 'float', default: 0 })
    factor_vapor: number;
}
