import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { configureCloudinary } from '../../config/cloudinary.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

const cloudinary = configureCloudinary();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'shadow-boutique',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  }),
});

@Controller('uploads')
export class UploadsController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
          return callback(
            new BadRequestException('Seules les images sont autorisées (jpg, png, webp, gif)'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File & { path: string }>) {
    return {
      urls: files.map((file) => file.path), // Cloudinary retourne l'URL complète directement dans `path`
    };
  }
}