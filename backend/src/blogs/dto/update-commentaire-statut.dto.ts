import { ApiProperty } from '@nestjs/swagger';
import { CommentaireStatut } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCommentaireStatutDto {
  @ApiProperty({ enum: CommentaireStatut })
  @IsEnum(CommentaireStatut)
  statut: CommentaireStatut;
}
