import { ApiProperty } from '@nestjs/swagger';
import { Periode } from '@prisma/client';
import { IsEnum, IsInt, Min } from 'class-validator';

export class SubmitSaisieDto {
  @ApiProperty({ enum: Periode })
  @IsEnum(Periode)
  periode: Periode;

  @ApiProperty()
  @IsInt()
  @Min(0)
  montantGagne: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  montantDepense: number;
}
