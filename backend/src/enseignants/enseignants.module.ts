import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { EnseignantsController } from './enseignants.controller';
import { EnseignantsService } from './enseignants.service';

@Module({
  imports: [NotificationsModule],
  controllers: [EnseignantsController],
  providers: [EnseignantsService],
  exports: [EnseignantsService],
})
export class EnseignantsModule {}
