import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCoachDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  prenom: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialites?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disponibilites?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
