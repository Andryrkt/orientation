import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryEtudiantsDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Recherche par nom, prénom ou numéro de reçu' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  pointDeVenteId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  filiereId?: string;

  @ApiProperty({ required: false, description: 'Filtrer par la secrétaire ayant saisi l\'inscription' })
  @IsOptional()
  @IsUUID()
  saisiParId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ required: false, enum: ['PAYE', 'RESTE'], description: 'Filtrer par statut de paiement actuel' })
  @IsOptional()
  @IsIn(['PAYE', 'RESTE'])
  statut?: 'PAYE' | 'RESTE';

  @ApiProperty({ required: false, description: "Ne garder que les étudiants ayant d'autres inscriptions (renouvellement)" })
  @IsOptional()
  @IsIn(['true'])
  renouvellement?: string;
}
