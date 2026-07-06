import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryMentionDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Slug de l\'universite' })
  @IsOptional()
  @IsString()
  universite?: string;

  @ApiProperty({ required: false, description: 'Slug du domaine' })
  @IsOptional()
  @IsString()
  domaine?: string;
}
