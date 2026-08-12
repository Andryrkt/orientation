import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateFiliereDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  prix: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
