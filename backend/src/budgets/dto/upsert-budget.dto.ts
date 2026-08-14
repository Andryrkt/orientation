import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class UpsertBudgetDto {
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

  @ApiProperty()
  @IsInt()
  @Min(0)
  montant: number;
}
