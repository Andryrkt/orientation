import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateSalleDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nom: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  capacite: number;
}
