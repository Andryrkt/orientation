import { ApiProperty } from '@nestjs/swagger';
import { TypeQuestion } from '@prisma/client';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty()
  @IsUUID()
  questionnaireId: string;

  @ApiProperty()
  @IsString()
  texte: string;

  @ApiProperty({ enum: TypeQuestion, default: TypeQuestion.CHOIX_MULTIPLE })
  @IsOptional()
  @IsEnum(TypeQuestion)
  type?: TypeQuestion;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ordre?: number;

  @ApiProperty({
    required: false,
    description: 'Poids par dimension RIASEC pour les questions de type ECHELLE, ex: {"R": 1, "I": 0.5}',
  })
  @IsOptional()
  @IsObject()
  scoreDimensions?: Record<string, number>;
}
