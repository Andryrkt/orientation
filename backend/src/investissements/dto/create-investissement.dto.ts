import { ApiProperty } from '@nestjs/swagger';
import { StatutInvestissement, TypeInvestissement } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateInvestissementDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  bailleur: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  montant: number;

  @ApiProperty({ enum: TypeInvestissement })
  @IsEnum(TypeInvestissement)
  type: TypeInvestissement;

  @ApiProperty({ enum: StatutInvestissement, required: false })
  @IsOptional()
  @IsEnum(StatutInvestissement)
  statut?: StatutInvestissement;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
