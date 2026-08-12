import { Module } from '@nestjs/common';
import { DepensesGlobalesController } from './depenses-globales.controller';
import { DepensesGlobalesService } from './depenses-globales.service';

@Module({
  controllers: [DepensesGlobalesController],
  providers: [DepensesGlobalesService],
})
export class DepensesGlobalesModule {}
