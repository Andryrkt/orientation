import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFormationDto {
  @ApiProperty()
  @IsUUID()
  centreId: string;

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
  duree?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niveauRequis?: string;
}
