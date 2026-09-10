import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { CentresFormationController } from './centres-formation.controller';
import { CentresFormationService } from './centres-formation.service';

@Module({
  imports: [NotificationsModule],
  controllers: [CentresFormationController],
  providers: [CentresFormationService],
  exports: [CentresFormationService],
})
export class CentresFormationModule {}
