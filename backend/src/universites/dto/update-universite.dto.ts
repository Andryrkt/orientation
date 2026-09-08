import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BlogStatut } from '@prisma/client';
import { CreateUniversiteDto } from './create-universite.dto';

export class UpdateUniversiteDto extends PartialType(CreateUniversiteDto) {
  @ApiProperty({
    required: false,
    enum: BlogStatut,
    description: "Réservé à l'admin : validation de la fiche soumise par un gestionnaire.",
  })
  @IsOptional()
  @IsEnum(BlogStatut)
  statutValidation?: BlogStatut;
}
