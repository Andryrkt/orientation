import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateFaqItemDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsString()
  reponse: string;

  @ApiProperty()
  @IsString()
  categorie: string;

  @ApiProperty({ required: false, default: '❓' })
  @IsOptional()
  @IsString()
  icone?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  ordre?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  publie?: boolean;
}
