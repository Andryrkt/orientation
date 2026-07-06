import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NiveauMention } from '@prisma/client';

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
}
