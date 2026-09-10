import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEnseignantDto {
  @ApiProperty({ required: false, description: "Compte utilisateur lié (rôle Enseignant), pour l'accès à l'espace self-service" })
  @IsOptional()
  @IsUUID()
  utilisateurId?: string;

  @ApiProperty({
    required: false,
    description: "Requis pour une création admin ; ignoré et repris du compte connecté pour une auto-création",
  })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    type: [String],
    description: 'Au moins une matière — distingue ce profil des autres profils enseignant du même compte',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Indiquez au moins une matière' })
  @IsString({ each: true })
  matieres: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niveauxEtude?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  etablissement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disponibilites?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
