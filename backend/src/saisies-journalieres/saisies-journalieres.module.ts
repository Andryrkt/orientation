import { Module } from '@nestjs/common';
import { PointsDeVenteModule } from '../points-de-vente/points-de-vente.module';
import { AuthModule } from '../auth/auth.module';
import { SaisiesJournalieresController } from './saisies-journalieres.controller';
import { SaisiesJournalieresService } from './saisies-journalieres.service';
import { RappelSaisieService } from './rappel-saisie.service';

@Module({
  imports: [PointsDeVenteModule, AuthModule],
  controllers: [SaisiesJournalieresController],
  providers: [SaisiesJournalieresService, RappelSaisieService],
  exports: [SaisiesJournalieresService, RappelSaisieService],
})
export class SaisiesJournalieresModule {}
