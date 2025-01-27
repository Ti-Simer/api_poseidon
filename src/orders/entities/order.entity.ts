import { BranchOffices } from "src/branch-offices/entities/branch-office.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('order')
export class Order {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'int', width: 7 })
    folio: number;

    @Column()
    validate_geofence: boolean;

    @Column()
    validate_token: boolean;

    @Column()
    token: string;

    @Column()
    state: string;

    @Column()
    status: string;

    @Column()
    payment_type: string;

    @Column()
    branch_office_code: number;

    @ManyToOne(() => BranchOffices, { cascade: true })
    branch_office: BranchOffices;

    @CreateDateColumn()
    create: Date;

    @UpdateDateColumn()
    update: Date;
}
