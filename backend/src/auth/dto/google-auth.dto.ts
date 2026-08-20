import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Jeton ID Google (JWT) fourni par Google Identity Services',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
