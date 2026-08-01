import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from '../orders/order.entity';
import { ProductVariant } from '../products/product-variant.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;

  @ManyToOne(() => ProductVariant)
  variant!: ProductVariant;

  @Column()
  quantite!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  prixUnitaire!: number;
}