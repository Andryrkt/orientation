import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryEtudiantsDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  pointDeVenteId?: string;

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
}
