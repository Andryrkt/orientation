import { ApiProperty } from '@nestjs/swagger';
import { JourSemaine } from '@prisma/client';
import { ArrayMinSize, IsArray, IsEnum, IsString, IsUUID, Matches, MinLength } from 'class-validator';

const HEURE_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateSeanceCoursDto {
  @ApiProperty({ description: 'Ex: "Mathématiques", "Anglais général"' })
  @IsString()
  @MinLength(1)
  matiere: string;

  @ApiProperty({
    type: [String],
    description: 'Filières auxquelles cette séance est dispensée (une matière commune peut être enseignée à plusieurs filières en même temps)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  filiereIds: string[];

  @ApiProperty()
  @IsUUID()
  enseignantId: string;

  @ApiProperty({ enum: JourSemaine })
  @IsEnum(JourSemaine)
  jour: JourSemaine;

  @ApiProperty({ description: 'Format HH:mm, ex "08:00"' })
  @Matches(HEURE_REGEX, { message: 'heureDebut doit être au format HH:mm' })
  heureDebut: string;

  @ApiProperty({ description: 'Format HH:mm, ex "10:00"' })
  @Matches(HEURE_REGEX, { message: 'heureFin doit être au format HH:mm' })
  heureFin: string;

  @ApiProperty()
  @IsUUID()
  salleId: string;
}
