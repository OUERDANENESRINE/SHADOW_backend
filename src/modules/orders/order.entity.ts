import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { OrderItem } from '../order-items/order-item.entity';

export enum OrderStatus {
  EN_ATTENTE = 'en_attente',
  VALIDEE = 'validee',
  EXPEDIEE = 'expediee',
  ANNULEE = 'annulee',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.orders)
  user!: User;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.EN_ATTENTE })
  statut!: OrderStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total!: number;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}