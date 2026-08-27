import { ApiProperty } from '@nestjs/swagger';
import { BlogStatut } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryBlogDto extends PaginationQueryDto {
  @ApiProperty({ enum: BlogStatut, required: false })
  @IsOptional()
  @IsEnum(BlogStatut)
  statut?: BlogStatut;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;
}
