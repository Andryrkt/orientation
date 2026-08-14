import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class DupliquerBudgetDto {
  @ApiProperty()
  @IsInt()
  @Min(2000)
  anneeSource: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  moisSource: number;

  @ApiProperty()
  @IsInt()
  @Min(2000)
  anneeCible: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  moisCible: number;
}
