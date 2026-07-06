import { Module } from '@nestjs/common';
import { UniversitesController } from './universites.controller';
import { UniversitesService } from './universites.service';

@Module({
  controllers: [UniversitesController],
  providers: [UniversitesService],
  exports: [UniversitesService],
})
export class UniversitesModule {}
