import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty()
  @IsString()
  contenu: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiProperty({ required: false, description: 'Laisser vide pour enregistrer en brouillon' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
