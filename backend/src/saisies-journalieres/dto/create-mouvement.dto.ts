import { ApiProperty } from '@nestjs/swagger';
import { Periode, TypeMouvement } from '@prisma/client';
import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateMouvementDto {
  @ApiProperty({ enum: Periode })
  @IsEnum(Periode)
  periode: Periode;

  @ApiProperty({ enum: TypeMouvement })
  @IsEnum(TypeMouvement)
  type: TypeMouvement;

  @ApiProperty()
  @IsInt()
  @Min(0)
  montant: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  note: string;
}
