import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryMetierDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Slug du domaine' })
  @IsOptional()
  @IsString()
  domaine?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaireMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salaireMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauRequis?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;
}
