import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordAdminDto {
  @ApiProperty({ description: 'Nouveau mot de passe temporaire à communiquer à la personne concernée' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
