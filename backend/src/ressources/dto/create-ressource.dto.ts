import { ApiProperty } from '@nestjs/swagger';
import { TypeRessource } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRessourceDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  contenu: string;

  @ApiProperty({ enum: TypeRessource })
  @IsEnum(TypeRessource)
  type: TypeRessource;

  @ApiProperty()
  @IsString()
  niveauEtude: string;

  @ApiProperty()
  @IsString()
  categorie: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fichierUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dureeLecture?: string;
}
