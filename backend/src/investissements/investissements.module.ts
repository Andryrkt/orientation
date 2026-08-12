import { Module } from '@nestjs/common';
import { InvestissementsController } from './investissements.controller';
import { InvestissementsService } from './investissements.service';

@Module({
  controllers: [InvestissementsController],
  providers: [InvestissementsService],
})
export class InvestissementsModule {}
