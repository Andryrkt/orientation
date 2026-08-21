import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { RendezVousStatut } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryRendezVousDto extends PaginationQueryDto {
  @ApiProperty({ enum: RendezVousStatut, required: false })
  @IsOptional()
  @IsEnum(RendezVousStatut)
  statut?: RendezVousStatut;

  @ApiProperty({
    required: false,
    description: "'mes-demandes' (par défaut) = mes propres demandes ; 'a-traiter' = demandes reçues en tant que coach/enseignant",
    enum: ['mes-demandes', 'a-traiter'],
  })
  @IsOptional()
  @IsIn(['mes-demandes', 'a-traiter'])
  vue?: 'mes-demandes' | 'a-traiter';
}
