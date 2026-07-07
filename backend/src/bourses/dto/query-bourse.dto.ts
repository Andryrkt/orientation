import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryBourseDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Slug du domaine' })
  @IsOptional()
  @IsString()
  domaine?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauEtude?: string;

  @ApiProperty({ required: false, description: 'Ne montrer que les bourses dont la date limite n\'est pas dépassée' })
  @IsOptional()
  actifs?: string;
}
