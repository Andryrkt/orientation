import { Module } from '@nestjs/common';
import { RendezVousController } from './rendez-vous.controller';
import { RendezVousService } from './rendez-vous.service';

@Module({
  controllers: [RendezVousController],
  providers: [RendezVousService],
  exports: [RendezVousService],
})
export class RendezVousModule {}
