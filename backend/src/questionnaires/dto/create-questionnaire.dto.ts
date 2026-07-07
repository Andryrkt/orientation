import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateQuestionnaireDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: 'RIASEC' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
