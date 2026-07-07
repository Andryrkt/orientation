import { Module } from '@nestjs/common';
import { BoursesController } from './bourses.controller';
import { BoursesService } from './bourses.service';

@Module({
  controllers: [BoursesController],
  providers: [BoursesService],
  exports: [BoursesService],
})
export class BoursesModule {}
