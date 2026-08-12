import { Module } from '@nestjs/common';
import { DroitInscriptionController } from './droit-inscription.controller';
import { DroitInscriptionService } from './droit-inscription.service';

@Module({
  controllers: [DroitInscriptionController],
  providers: [DroitInscriptionService],
  exports: [DroitInscriptionService],
})
export class DroitInscriptionModule {}
