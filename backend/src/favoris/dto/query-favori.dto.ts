import { ApiProperty } from '@nestjs/swagger';
import { FavorisableType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class QueryFavoriDto {
  @ApiProperty({ enum: FavorisableType, required: false })
  @IsOptional()
  @IsEnum(FavorisableType)
  type?: FavorisableType;
}
