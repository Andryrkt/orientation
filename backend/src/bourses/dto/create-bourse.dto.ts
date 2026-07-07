import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBourseDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  organisme: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  domaineId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauEtude?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  montant?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateLimite?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lien?: string;
}
