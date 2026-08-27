import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { DemandeRoleType } from '@prisma/client';

export class CreateDemandeRoleDto {
  @ApiProperty({ enum: DemandeRoleType })
  @IsEnum(DemandeRoleType)
  type: DemandeRoleType;

  @ApiProperty({ required: false, description: 'Motivation, expérience, etc.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disponibilites?: string;

  @ApiProperty({ required: false, type: [String], description: 'Uniquement pour une demande de type COACH' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialites?: string[];

  @ApiProperty({ required: false, description: 'Uniquement pour une demande de type COACH' })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ required: false, type: [String], description: 'Uniquement pour une demande de type ENSEIGNANT' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matieres?: string[];

  @ApiProperty({ required: false, type: [String], description: 'Uniquement pour une demande de type ENSEIGNANT' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niveauxEtude?: string[];

  @ApiProperty({ required: false, description: 'Uniquement pour une demande de type ENSEIGNANT' })
  @IsOptional()
  @IsString()
  etablissement?: string;
}
