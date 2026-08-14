import { Module } from '@nestjs/common';
import { EmploiDuTempsController } from './emploi-du-temps.controller';
import { EmploiDuTempsService } from './emploi-du-temps.service';

@Module({
  controllers: [EmploiDuTempsController],
  providers: [EmploiDuTempsService],
})
export class EmploiDuTempsModule {}
