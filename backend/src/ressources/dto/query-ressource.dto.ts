import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TypeRessource } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryRessourceDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauEtude?: string;

  @ApiProperty({ required: false, enum: TypeRessource })
  @IsOptional()
  @IsEnum(TypeRessource)
  type?: TypeRessource;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categorie?: string;
}
