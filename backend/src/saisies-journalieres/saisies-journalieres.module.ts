import { Module } from '@nestjs/common';
import { PointsDeVenteModule } from '../points-de-vente/points-de-vente.module';
import { DroitInscriptionModule } from '../droit-inscription/droit-inscription.module';
import { SaisiesJournalieresController } from './saisies-journalieres.controller';
import { SaisiesJournalieresService } from './saisies-journalieres.service';

@Module({
  imports: [PointsDeVenteModule, DroitInscriptionModule],
  controllers: [SaisiesJournalieresController],
  providers: [SaisiesJournalieresService],
  exports: [SaisiesJournalieresService],
})
export class SaisiesJournalieresModule {}
