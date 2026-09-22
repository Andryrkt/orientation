import { Module } from '@nestjs/common';
import { ConcoursController } from './concours.controller';
import { ConcoursService } from './concours.service';

@Module({
  controllers: [ConcoursController],
  providers: [ConcoursService],
  exports: [ConcoursService],
})
export class ConcoursModule {}
