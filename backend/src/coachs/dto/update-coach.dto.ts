import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BlogStatut } from '@prisma/client';
import { CreateCoachDto } from './create-coach.dto';

export class UpdateCoachDto extends PartialType(CreateCoachDto) {
  @ApiProperty({
    required: false,
    enum: BlogStatut,
    description: "Réservé à l'admin : validation de la fiche soumise par le coach lui-même.",
  })
  @IsOptional()
  @IsEnum(BlogStatut)
  statutValidation?: BlogStatut;
}
