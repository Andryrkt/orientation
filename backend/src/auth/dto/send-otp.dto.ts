import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    description: 'Numéro de téléphone destinataire de l\'OTP WhatsApp',
    example: '+261340000000',
  })
  @IsString()
  @IsNotEmpty()
  telephone: string;
}
