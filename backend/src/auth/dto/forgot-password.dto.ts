import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email ou numero de telephone' })
  @IsString()
  identifiant: string;
}
