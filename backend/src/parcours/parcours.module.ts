import { Module } from '@nestjs/common';
import { ParcoursController } from './parcours.controller';
import { ParcoursService } from './parcours.service';

@Module({
  controllers: [ParcoursController],
  providers: [ParcoursService],
  exports: [ParcoursService],
})
export class ParcoursModule {}
