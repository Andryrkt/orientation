import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BlogStatut } from '@prisma/client';
import { CreateEnseignantDto } from './create-enseignant.dto';

export class UpdateEnseignantDto extends PartialType(CreateEnseignantDto) {
  @ApiProperty({
    required: false,
    enum: BlogStatut,
    description: "Réservé à l'admin : validation de la fiche soumise par l'enseignant lui-même.",
  })
  @IsOptional()
  @IsEnum(BlogStatut)
  statutValidation?: BlogStatut;
}
