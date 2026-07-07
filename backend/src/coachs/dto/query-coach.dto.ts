import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryCoachDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialite?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;
}
