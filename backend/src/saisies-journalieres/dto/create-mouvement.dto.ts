import { ApiProperty } from '@nestjs/swagger';
import { Periode, TypeMouvement } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

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
}
