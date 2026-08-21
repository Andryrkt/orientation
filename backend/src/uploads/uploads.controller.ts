import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { UPLOADS_IMAGES_DIR } from './upload-paths';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  // Réservé aux utilisateurs connectés (via le JwtAuthGuard global) — pas de restriction de rôle,
  // car cet endpoint sert autant l'admin (images des fiches métiers/blog) que les utilisateurs
  // classiques (photo de profil).
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_IMAGES_DIR,
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: MAX_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(new BadRequestException('Seules les images JPEG, PNG, WEBP ou GIF sont autorisées'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Fichier image requis (5 Mo maximum)');
    return { url: `/uploads/images/${file.filename}` };
  }
}
