import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'];

export class CreateDomaineDto {
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
  icone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ordre?: number;

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
