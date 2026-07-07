import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReponseDto {
  @ApiProperty()
  @IsUUID()
  questionId: string;

  @ApiProperty()
  @IsString()
  texte: string;

  @ApiProperty({
    required: false,
    description: 'Score par dimension RIASEC attribue si cette reponse est choisie, ex: {"R": 2, "I": 1}',
  })
  @IsOptional()
  @IsObject()
  score?: Record<string, number>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ordre?: number;
}
