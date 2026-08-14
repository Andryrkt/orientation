import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Periode } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Montant remis au stand en début de période pour rendre la monnaie' })
  @IsOptional()
  @IsInt()
  @Min(0)
  fondDeCaisse?: number;

  @ApiPropertyOptional({ description: 'Comptage réel de la caisse en fin de période' })
  @IsOptional()
  @IsInt()
  @Min(0)
  montantCompte?: number;
}
