import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDepenseGlobaleDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  categorie: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  montant: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
