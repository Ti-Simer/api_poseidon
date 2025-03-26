import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('specific_gravity_correction')
export class SpecificGravityCorrection {
    @PrimaryColumn()
    Temp_Farenheit: number;
    
    @Column({ type: 'float' })
    "0.500": number;

    @Column({ type: 'float' })
    "0.510": number;

    @Column({ type: 'float' })
    "0.520": number;

    @Column({ type: 'float' })
    "0.530": number;

    @Column({ type: 'float' })
    "0.540": number;

    @Column({ type: 'float' })
    "0.550": number;

    @Column({ type: 'float' })
    "0.560": number;

    @Column({ type: 'float' })
    "0.570": number;

    @Column({ type: 'float' })
    "0.580": number;

    @Column({ type: 'float' })
    "0.590": number;
}
