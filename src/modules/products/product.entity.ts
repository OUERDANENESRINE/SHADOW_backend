import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 150 })
  nom!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  prix!: number;

  @Column({ length: 20, nullable: true })
  taille!: string;

  @Column({ length: 50, nullable: true })
  couleur!: string;

  @Column({ default: 0 })
  stock!: number;

  @Column({ nullable: true })
  imageUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}