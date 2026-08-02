import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  nom!: string;

  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  motDePasse!: string;
}