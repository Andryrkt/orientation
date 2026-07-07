import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { DomainesModule } from '../domaines/domaines.module';
import { MetiersModule } from '../metiers/metiers.module';
import { UniversitesModule } from '../universites/universites.module';
import { MentionsModule } from '../mentions/mentions.module';
import { ParcoursModule } from '../parcours/parcours.module';
import { StagesModule } from '../stages/stages.module';
import { BoursesModule } from '../bourses/bourses.module';
import { BlogsModule } from '../blogs/blogs.module';
import { QuestionnairesModule } from '../questionnaires/questionnaires.module';
import { CoachsModule } from '../coachs/coachs.module';

@Module({
  imports: [
    UsersModule,
    DomainesModule,
    MetiersModule,
    UniversitesModule,
    MentionsModule,
    ParcoursModule,
    StagesModule,
    BoursesModule,
    BlogsModule,
    QuestionnairesModule,
    CoachsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
