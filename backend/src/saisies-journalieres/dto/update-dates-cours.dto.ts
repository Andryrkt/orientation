import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateDatesCoursDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateDebutCours?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateFinCours?: string;
}
