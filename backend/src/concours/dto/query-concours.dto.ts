import { ApiProperty } from '@nestjs/swagger';
import { TypeConcours } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryConcoursDto extends PaginationQueryDto {
  @ApiProperty({ required: false, enum: TypeConcours })
  @IsOptional()
  @IsEnum(TypeConcours)
  type?: TypeConcours;

  @ApiProperty({ required: false, description: 'Slug du domaine' })
  @IsOptional()
  @IsString()
  domaine?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauRequis?: string;

  @ApiProperty({ required: false, description: "Ne montrer que les concours dont la date limite d'inscription n'est pas dépassée" })
  @IsOptional()
  actifs?: string;
}
