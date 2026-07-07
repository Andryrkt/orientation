import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'];

export class CreateMetierDto {
  @ApiProperty()
  @IsUUID()
  domaineId: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  missions?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  competences?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  salaireMin?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  salaireMax?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauRequis?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  perspectivesEmploi?: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Codes RIASEC associes (R, I, A, S, E, C) pour les recommandations du questionnaire',
  })
  @IsOptional()
  @IsArray()
  @IsIn(RIASEC_CODES, { each: true })
  riasecCodes?: string[];

  // Section 1 - Identification
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  autresAppellations?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sousDomaine?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  secteursActivite?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codeRome?: string;

  // Section 2 - Environnement de travail
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  environnementTravail?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  environnementAutre?: string;

  // Section 3 - Competences
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  competencesComportementales?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  languesRequises?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauLangues?: string;

  // Section 4 - Formation et parcours d'acces
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialiteDiplome?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  formationsMadagascar?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  certifications?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  autoFormation?: string;

  // Section 5 - Conditions de travail et remuneration
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  salaireSource?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  typeContrat?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  volumeHoraire?: string[];

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  penibilitePhysique?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  penibiliteStress?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  penibiliteRisques?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avantages?: string;

  // Section 6 - Marche de l'emploi a Madagascar
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauDemande?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  regionsPresence?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postesEvolution?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mobiliteInternationale?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tendances?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  employeurs?: string[];

  // Section 7 - Profil type et personnalite
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  traitsPersonnalite?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  centresInteret?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  valeursProfessionnelles?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilIntroExtraverti?: string;

  // Section 8 - Temoignage professionnel
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temoignagePrenom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  temoignageAnneesExperience?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temoignageVille?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temoignageSecteurEmployeur?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temoignageCePlait?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temoignageDifficultes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temoignageConseil?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temoignageCitation?: string;

  @ApiProperty({
    required: false,
    description: 'OUI_PHOTO, OUI_PRENOM, OUI_ANONYME ou NON',
  })
  @IsOptional()
  @IsString()
  temoignageAccordPublication?: string;

  // Section 9 - Sources et validation
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  sources?: string[];

  @ApiProperty({
    required: false,
    description: 'TRES_FIABLE, FIABLE, A_VERIFIER ou PARTIELLE',
  })
  @IsOptional()
  @IsString()
  fiabilite?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  observations?: string;
}
