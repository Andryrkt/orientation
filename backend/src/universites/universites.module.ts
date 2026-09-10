import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { UniversitesController } from './universites.controller';
import { UniversitesService } from './universites.service';

@Module({
  imports: [NotificationsModule],
  controllers: [UniversitesController],
  providers: [UniversitesService],
  exports: [UniversitesService],
})
export class UniversitesModule {}
