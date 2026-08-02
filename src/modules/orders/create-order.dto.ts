import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @IsNumber({}, { message: "L'ID de la variante est requis" })
  variantId!: number;

  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantite!: number;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Le nom et prénom sont requis' })
  @IsString()
  clientNom!: string;

  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  @IsString()
  telephone!: string;

  @IsNotEmpty({ message: "L'adresse de livraison est requise" })
  @IsString()
  adresse!: string;

  @IsArray({ message: 'Les items doivent être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

export class CreateWalkInOrderDto {
  @IsNotEmpty({ message: 'Le nom du client est requis' })
  @IsString()
  clientNom!: string;

  @IsArray({ message: 'Les items doivent être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}