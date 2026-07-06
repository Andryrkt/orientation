import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateParcoursDto {
  @ApiProperty()
  @IsUUID()
  mentionId: string;

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
  conditionsAcces?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  debouches?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  fraisAnnuels?: number;
}
