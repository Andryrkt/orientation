import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEmploiDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty()
  @IsString()
  entreprise: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  domaineId?: string;

  @ApiProperty({ required: false, description: "Secteur professionnel/stratégique de l'offre" })
  @IsOptional()
  @IsUUID()
  secteurId?: string;

  @ApiProperty({ required: false, description: 'CDI, CDD, Stage, Freelance, Temps partiel...' })
  @IsOptional()
  @IsString()
  typeContrat?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauEtude?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  salaire?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateLimiteCandidature?: string;

  @ApiProperty({ required: false, description: "Lien externe pour postuler" })
  @IsOptional()
  @IsString()
  lien?: string;
}
