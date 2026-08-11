import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateDroitInscriptionDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  montant: number;
}
