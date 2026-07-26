import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  taille?: string;

  @IsOptional()
  @IsString()
  couleur?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Le stock doit être un nombre' })
  @Min(0, { message: 'Le stock ne peut pas être négatif' })
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}