import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DemandeRoleStatut } from '@prisma/client';

const RESOLUTION_STATUTS = [
  DemandeRoleStatut.EN_ATTENTE,
  DemandeRoleStatut.APPROUVEE,
  DemandeRoleStatut.REJETEE,
  DemandeRoleStatut.CLARIFICATION_DEMANDEE,
] as const;

export class UpdateDemandeRoleDto {
  @ApiProperty({ enum: RESOLUTION_STATUTS })
  @IsEnum(RESOLUTION_STATUTS)
  statut: (typeof RESOLUTION_STATUTS)[number];

  @ApiProperty({ required: false, description: "Réponse à l'utilisateur (motif de refus, question de clarification, etc.)" })
  @IsOptional()
  @IsString()
  reponse?: string;
}
