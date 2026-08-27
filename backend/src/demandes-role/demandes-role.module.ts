import { Module } from '@nestjs/common';
import { DemandesRoleController } from './demandes-role.controller';
import { DemandesRoleService } from './demandes-role.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DemandesRoleController],
  providers: [DemandesRoleService],
  exports: [DemandesRoleService],
})
export class DemandesRoleModule {}
