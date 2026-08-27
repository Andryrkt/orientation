import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryFormationDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Identifiant du centre de formation' })
  @IsOptional()
  @IsString()
  centreId?: string;
}
