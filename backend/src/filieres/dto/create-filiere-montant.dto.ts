import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateFiliereMontantDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  montant: number;

  @ApiProperty({ required: false, description: 'Activer immédiatement ce montant' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
