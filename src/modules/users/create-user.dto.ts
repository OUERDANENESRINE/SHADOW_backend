import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserRole } from './user.entity';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  nom!: string;

  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  motDePasse!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Rôle invalide' })
  role?: UserRole;
}