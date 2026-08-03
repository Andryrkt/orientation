import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Jeton ID Google (JWT) fourni par Google Identity Services',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone requis lors de la première connexion Google',
    example: '+261340000000',
  })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Code OTP reçu par WhatsApp pour valider le téléphone (6 chiffres)',
    example: '849201',
  })
  @IsOptional()
  @IsString()
  otpCode?: string;
}
