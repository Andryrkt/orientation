import { ApiProperty } from '@nestjs/swagger';
import { FavorisableType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateFavoriDto {
  @ApiProperty({ enum: FavorisableType })
  @IsEnum(FavorisableType)
  type: FavorisableType;

  @ApiProperty()
  @IsString()
  entityId: string;
}
