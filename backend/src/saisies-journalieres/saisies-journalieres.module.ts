import { Module } from '@nestjs/common';
import { PointsDeVenteModule } from '../points-de-vente/points-de-vente.module';
import { AuthModule } from '../auth/auth.module';
import { DroitInscriptionModule } from '../droit-inscription/droit-inscription.module';
import { SaisiesJournalieresController } from './saisies-journalieres.controller';
import { SaisiesJournalieresService } from './saisies-journalieres.service';
import { RappelSaisieService } from './rappel-saisie.service';

@Module({
  imports: [PointsDeVenteModule, AuthModule, DroitInscriptionModule],
  controllers: [SaisiesJournalieresController],
  providers: [SaisiesJournalieresService, RappelSaisieService],
  exports: [SaisiesJournalieresService, RappelSaisieService],
})
export class SaisiesJournalieresModule {}
