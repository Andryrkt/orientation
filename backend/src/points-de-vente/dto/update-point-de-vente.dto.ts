import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePointDeVenteDto } from './create-point-de-vente.dto';

export class UpdatePointDeVenteDto extends PartialType(CreatePointDeVenteDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
