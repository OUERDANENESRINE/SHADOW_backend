import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Order } from '../orders/order.entity';

export enum UserRole {
  ADMIN = 'admin',
  VISITEUR = 'visiteur',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nom!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column()
  motDePasse!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VISITEUR })
  role!: UserRole;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @CreateDateColumn()
  createdAt!: Date;

  @BeforeInsert()
  async hashPassword() {
    this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  }
}