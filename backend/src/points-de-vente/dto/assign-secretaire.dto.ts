import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignSecretaireDto {
  @ApiProperty()
  @IsUUID()
  utilisateurId: string;
}
