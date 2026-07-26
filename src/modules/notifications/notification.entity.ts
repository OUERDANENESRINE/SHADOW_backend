import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User; // l'admin destinataire

  @ManyToOne(() => Order)
  order!: Order;

  @Column({ length: 255 })
  message!: string;

  @Column({ default: false })
  lue!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}