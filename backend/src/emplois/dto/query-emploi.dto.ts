import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryEmploiDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Slug du domaine' })
  @IsOptional()
  @IsString()
  domaine?: string;

  @ApiProperty({ required: false, description: 'Slug du secteur' })
  @IsOptional()
  @IsString()
  secteur?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeContrat?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauEtude?: string;

  @ApiProperty({ required: false, description: "Ne montrer que les offres dont la date limite n'est pas dépassée" })
  @IsOptional()
  actifs?: string;
}
