import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('density_correction')
export class DensityCorrection {

    @PrimaryColumn()
    Temp_Farenheit: number;
    
    @Column({type: 'float'})
    "0.490": number;

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

    @Column({ type: 'float' })
    "0.600": number;

    @Column({ type: 'float' })
    "0.610": number;

    @Column({ type: 'float' })
    "0.620": number;

    @Column({ type: 'float' })
    "0.630": number;

    @Column({ type: 'float' })
    "0.640": number;
    
    @Column({ type: 'float' })
    "0.650": number;
}
