import { ApiProperty } from '@nestjs/swagger';
import { Periode, TypeMouvement } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateMouvementDto {
  @ApiProperty({ enum: Periode })
  @IsEnum(Periode)
  periode: Periode;

  @ApiProperty({ enum: TypeMouvement })
  @IsEnum(TypeMouvement)
  type: TypeMouvement;

  @ApiProperty()
  @IsInt()
  @Min(0)
  montant: number;

  // Obligatoire sauf si le détail d'inscription est renseigné (voir SaisiesJournalieresService.ajouterMouvement)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  note?: string;

  // Détails d'inscription (optionnels, pertinents uniquement pour un mouvement de type GAGNE)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  numeroRecu?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  filiereIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  montantRestant?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  montantTotal?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  reduction?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  noteReduction?: string;

  // Présent lorsque ce mouvement est un paiement complémentaire sur une inscription déjà
  // existante (l'étudiant revient payer son reste à payer) plutôt qu'une nouvelle inscription.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  inscriptionParentId?: string;

  // Renouvellement (via "Dupliquer") d'un étudiant déjà inscrit : le droit d'inscription n'est
  // facturé qu'une seule fois par étudiant, pas à chaque nouvelle inscription/filière.
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  sansDroitInscription?: boolean;
}
