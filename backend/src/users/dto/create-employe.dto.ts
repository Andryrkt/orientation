import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateEmployeDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  prenom: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: [Role.SECRETAIRE, Role.MODERATEUR, Role.MODERATEUR_FINANCE] })
  @IsEnum([Role.SECRETAIRE, Role.MODERATEUR, Role.MODERATEUR_FINANCE])
  role: 'SECRETAIRE' | 'MODERATEUR' | 'MODERATEUR_FINANCE';
}
