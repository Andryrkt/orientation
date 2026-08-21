import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RendezVousStatut } from '@prisma/client';
import { CreateRendezVousDto } from './create-rendez-vous.dto';

export class UpdateRendezVousDto extends PartialType(CreateRendezVousDto) {
  @ApiProperty({ enum: RendezVousStatut, required: false })
  @IsOptional()
  @IsEnum(RendezVousStatut)
  statut?: RendezVousStatut;

  @ApiProperty({ required: false, description: 'Réponse du coach/enseignant (confirmation, motif de refus...)' })
  @IsOptional()
  @IsString()
  reponse?: string;
}
