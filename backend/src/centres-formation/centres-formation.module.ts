import { Module } from '@nestjs/common';
import { CentresFormationController } from './centres-formation.controller';
import { CentresFormationService } from './centres-formation.service';

@Module({
  controllers: [CentresFormationController],
  providers: [CentresFormationService],
  exports: [CentresFormationService],
})
export class CentresFormationModule {}
