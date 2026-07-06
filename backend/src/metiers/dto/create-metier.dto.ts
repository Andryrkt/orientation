import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  missions?: string;

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
}
