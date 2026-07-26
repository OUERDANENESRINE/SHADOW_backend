import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // renvoie une erreur si des champs "en trop" sont envoyés
      transform: true,        // convertit automatiquement les types (string → number, etc.)
    }),
  );
  await app.listen(3000);
}
bootstrap();