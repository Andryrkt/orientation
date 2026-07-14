import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DomainesModule } from './domaines/domaines.module';
import { MetiersModule } from './metiers/metiers.module';
import { UniversitesModule } from './universites/universites.module';
import { MentionsModule } from './mentions/mentions.module';
import { ParcoursModule } from './parcours/parcours.module';
import { AdminModule } from './admin/admin.module';
import { FavorisModule } from './favoris/favoris.module';
import { StagesModule } from './stages/stages.module';
import { BoursesModule } from './bourses/bourses.module';
import { BlogsModule } from './blogs/blogs.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { CoachsModule } from './coachs/coachs.module';
import { CentresFormationModule } from './centres-formation/centres-formation.module';
import { TicketsModule } from './tickets/tickets.module';
import { RessourcesModule } from './ressources/ressources.module';
import { EnseignantsModule } from './enseignants/enseignants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    DomainesModule,
    MetiersModule,
    UniversitesModule,
    MentionsModule,
    ParcoursModule,
    AdminModule,
    FavorisModule,
    StagesModule,
    BoursesModule,
    BlogsModule,
    QuestionnairesModule,
    CoachsModule,
    CentresFormationModule,
    TicketsModule,
    RessourcesModule,
    EnseignantsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
