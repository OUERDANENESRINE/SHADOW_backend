import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductVariantDto {
  @IsString()
  @IsNotEmpty({ message: 'La taille est requise' })
  taille!: string;

  @IsString()
  @IsNotEmpty({ message: 'La couleur est requise' })
  couleur!: string;

  @IsNumber({}, { message: 'Le stock doit être un nombre' })
  @Min(0)
  stock!: number;
}

export class CreateProductDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'Le prix doit être un nombre' })
  @Min(0, { message: 'Le prix ne peut pas être négatif' })
  prix!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsArray({ message: 'Les variantes doivent être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];
}