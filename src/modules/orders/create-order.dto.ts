import { Type } from 'class-transformer';
import { IsArray, IsNumber, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @IsNumber({}, { message: "L'ID produit doit être un nombre" })
  productId!: number;

  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantite!: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'Les items doivent être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}