import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email ou numero de telephone' })
  @IsString()
  identifiant: string;

  @ApiProperty()
  @IsString()
  password: string;
}
