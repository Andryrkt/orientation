import { ApiProperty } from '@nestjs/swagger';
import { TypeConcours } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConcoursDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty({ enum: TypeConcours, description: 'UNIVERSITAIRE ou ADMINISTRATIF' })
  @IsEnum(TypeConcours)
  type: TypeConcours;

  @ApiProperty({ description: "Université, ministère ou institution organisatrice" })
  @IsString()
  organisateur: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  domaineId?: string;

  @ApiProperty({ required: false, description: 'Bac, Licence, Master...' })
  @IsOptional()
  @IsString()
  niveauRequis?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  nombrePlaces?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fraisInscription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateConcours?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateLimiteInscription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiProperty({ required: false, description: "Lien externe pour plus d'informations ou s'inscrire" })
  @IsOptional()
  @IsString()
  lien?: string;
}
