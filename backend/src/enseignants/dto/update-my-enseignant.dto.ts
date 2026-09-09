import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

// Champs éditables par l'enseignant lui-même (espace self-service) — pas nom/prenom/email/visible,
// réservés à l'admin.
export class UpdateMyEnseignantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matieres?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niveauxEtude?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  etablissement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disponibilites?: string;
}
