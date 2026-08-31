import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ConditionAdmission, NiveauMention } from '@prisma/client';

export class CreateMentionDto {
  @ApiProperty()
  @IsUUID()
  universiteId: string;

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

  @ApiProperty({ enum: NiveauMention, required: false })
  @IsOptional()
  @IsEnum(NiveauMention)
  niveau?: NiveauMention;

  @ApiProperty({ enum: ConditionAdmission, required: false, description: "Condition d'admission" })
  @IsOptional()
  @IsEnum(ConditionAdmission)
  conditionAdmission?: ConditionAdmission;

  @ApiProperty({ required: false, description: "Droit d'inscription" })
  @IsOptional()
  @IsInt()
  droitInscription?: number;

  @ApiProperty({ required: false, description: 'Frais annuel' })
  @IsOptional()
  @IsInt()
  fraisAnnuel?: number;

  @ApiProperty({ required: false, description: 'Frais annexe' })
  @IsOptional()
  @IsInt()
  fraisAnnexe?: number;
}
