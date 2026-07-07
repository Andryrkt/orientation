import { ApiProperty } from '@nestjs/swagger';
import { CommentaireStatut } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryCommentaireDto extends PaginationQueryDto {
  @ApiProperty({ enum: CommentaireStatut, required: false })
  @IsOptional()
  @IsEnum(CommentaireStatut)
  statut?: CommentaireStatut;
}
