import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity('stationary-tank')
export class StationaryTank {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    state: string;

    @Column()
    status: string;

    @Column({ nullable: false })
    serial: string;

    @Column({ nullable: false })
    capacity: number;

    @CreateDateColumn()
    create: Date;

    @UpdateDateColumn()
    update: Date;
}
