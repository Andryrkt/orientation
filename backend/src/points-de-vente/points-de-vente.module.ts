import { Module } from '@nestjs/common';
import { PointsDeVenteController } from './points-de-vente.controller';
import { PointsDeVenteService } from './points-de-vente.service';

@Module({
  controllers: [PointsDeVenteController],
  providers: [PointsDeVenteService],
  exports: [PointsDeVenteService],
})
export class PointsDeVenteModule {}
