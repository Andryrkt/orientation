import { Module } from '@nestjs/common';
import { EmploisController } from './emplois.controller';
import { EmploisService } from './emplois.service';

@Module({
  controllers: [EmploisController],
  providers: [EmploisService],
  exports: [EmploisService],
})
export class EmploisModule {}
