import { Module } from '@nestjs/common';
import { CoachsController } from './coachs.controller';
import { CoachsService } from './coachs.service';

@Module({
  controllers: [CoachsController],
  providers: [CoachsService],
  exports: [CoachsService],
})
export class CoachsModule {}
