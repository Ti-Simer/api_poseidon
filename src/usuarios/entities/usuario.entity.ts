import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Roles } from 'src/roles/entities/roles.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  state: string;

  @Column({ default: '' })
  status: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  idNumber: string;

  @Column()
  password: string;

  @CreateDateColumn()
  create: Date;

  @UpdateDateColumn()
  update: Date;

  @ManyToOne(() => Roles)
  @JoinColumn({ name: 'role' })
  role: Roles;
}
