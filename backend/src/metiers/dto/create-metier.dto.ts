import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'];

export class CreateMetierDto {
  @ApiProperty()
  @IsUUID()
  domaineId: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  missions?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  competences?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  salaireMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  salaireMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauRequis?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  perspectivesEmploi?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Codes RIASEC associes (R, I, A, S, E, C) pour les recommandations du questionnaire',
  })
  @IsOptional()
  @IsArray()
  @IsIn(RIASEC_CODES, { each: true })
  riasecCodes?: string[];
}
