import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryParcoursDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Slug de la mention' })
  @IsOptional()
  @IsString()
  mention?: string;
}
