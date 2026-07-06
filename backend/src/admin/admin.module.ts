import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { DomainesModule } from '../domaines/domaines.module';
import { MetiersModule } from '../metiers/metiers.module';
import { UniversitesModule } from '../universites/universites.module';
import { MentionsModule } from '../mentions/mentions.module';
import { ParcoursModule } from '../parcours/parcours.module';

@Module({
  imports: [
    UsersModule,
    DomainesModule,
    MetiersModule,
    UniversitesModule,
    MentionsModule,
    ParcoursModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
