import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { CoachsController } from './coachs.controller';
import { CoachsService } from './coachs.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CoachsController],
  providers: [CoachsService],
  exports: [CoachsService],
})
export class CoachsModule {}
