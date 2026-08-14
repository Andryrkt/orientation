import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Max, Min, MinLength } from 'class-validator';

export class UpsertBudgetDetailDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  categorie: string;

  @ApiProperty()
  @IsInt()
  @Min(2000)
  annee: number;

  @ApiProperty({ description: '1 = janvier, 12 = décembre' })
  @IsInt()
  @Min(1)
  @Max(12)
  mois: number;

  @ApiProperty({ description: 'Ex: "Prof Histoire", "Secrétaire Hanta"' })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ description: 'Taux unitaire en Ar (ex: 10000)' })
  @IsInt()
  @Min(0)
  tauxUnitaire: number;

  @ApiProperty({ description: 'Quantité par période (ex: 13 pour 13h/semaine, 5 pour 5 jours/semaine)' })
  @IsNumber()
  @IsPositive()
  quantite: number;

  @ApiProperty({ required: false, description: 'Libellé libre affiché à côté de la quantité, ex "h/semaine"' })
  @IsOptional()
  @IsString()
  unite?: string;

  @ApiProperty({ description: 'Nombre de périodes (ex: 4 pour 4 semaines)' })
  @IsNumber()
  @IsPositive()
  nombrePeriodes: number;

  @ApiProperty({ required: false, description: 'Ajustement +/- en Ar (ex: pour une demi-journée en plus)' })
  @IsOptional()
  @IsInt()
  ajustementMontant?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ajustementNote?: string;
}
