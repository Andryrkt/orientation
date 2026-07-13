import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RessourcesController } from './ressources.controller';
import { RessourcesService } from './ressources.service';

@Module({
  imports: [PrismaModule],
  controllers: [RessourcesController],
  providers: [RessourcesService],
  exports: [RessourcesService],
})
export class RessourcesModule {}
