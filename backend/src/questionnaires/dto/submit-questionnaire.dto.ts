import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty()
  @IsUUID()
  questionId: string;

  @ApiProperty({ required: false, description: 'Pour les questions a choix multiple' })
  @IsOptional()
  @IsUUID()
  reponseId?: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 5, description: 'Pour les questions a echelle' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valeurEchelle?: number;

  @ApiProperty({ required: false, description: 'Pour les questions a texte libre' })
  @IsOptional()
  @IsString()
  texte?: string;
}

export class SubmitQuestionnaireDto {
  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  reponses: SubmitAnswerDto[];
}
