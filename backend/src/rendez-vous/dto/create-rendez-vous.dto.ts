import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RendezVousCible } from '@prisma/client';

export class CreateRendezVousDto {
  @ApiProperty({ enum: RendezVousCible })
  @IsEnum(RendezVousCible)
  cible: RendezVousCible;

  @ApiProperty({ required: false, description: 'Requis si cible = COACH' })
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @ApiProperty({ required: false, description: 'Requis si cible = ENSEIGNANT' })
  @IsOptional()
  @IsUUID()
  enseignantId?: string;

  @ApiProperty({ description: 'Date et heure souhaitées (ISO 8601)' })
  @IsDateString()
  dateSouhaitee: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
