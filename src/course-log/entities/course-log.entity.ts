import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('course-log')
export class CourseLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    uuid: string;

    @Column()
    plate: string;

    @Column()
    operator: string;

    @Column()
    creator: string;

    @Column()
    id_number: string;

    @Column()
    scheduling_date: string;

    @Column({default: ""})
    last_delivery: string;

    @Column({default: ""})
    last_latitude: string;

    @Column({default: ""})
    last_longitude: string;

    @Column({default: 0})
    last_event: number;

    @Column({default: 0})
    last_criticality: number;

    @Column({type: 'float', default: 0})
    delivered_volume: number;
    
    @Column({type: 'float', default: 0})
    delivered_mass: number;
    
    @Column({type: 'float', default: 0})
    charges: number;

    @Column({type: 'simple-array'})
    orders: string[];

    @Column({type: 'simple-array'})
    completed_orders: string[];

    @CreateDateColumn()
    create: Date;

    @UpdateDateColumn()
    update: Date;
}