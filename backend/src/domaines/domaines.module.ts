import { Module } from '@nestjs/common';
import { DomainesController } from './domaines.controller';
import { DomainesService } from './domaines.service';

@Module({
  controllers: [DomainesController],
  providers: [DomainesService],
  exports: [DomainesService],
})
export class DomainesModule {}
