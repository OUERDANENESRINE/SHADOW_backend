import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 20 })
  taille!: string;

  @Column({ length: 50 })
  couleur!: string;

  @Column({ default: 0 })
  stock!: number;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  product!: Product;
}