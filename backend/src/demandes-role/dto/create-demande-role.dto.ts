import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { DemandeRoleType } from '@prisma/client';

const NIVEAUX_ETUDE = ['LYCEE', 'NOUVEAU_BACHELIER', 'UNIVERSITE'] as const;

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

  @ApiProperty({
    required: false,
    enum: NIVEAUX_ETUDE,
    description: 'Requis pour une demande de type ETUDIANT',
  })
  @ValidateIf((o) => o.type === DemandeRoleType.ETUDIANT)
  @IsNotEmpty({ message: "Le niveau d'étude est requis pour une demande étudiant" })
  @IsIn(NIVEAUX_ETUDE, { message: "Niveau d'étude invalide" })
  niveauEtude?: string;
}
