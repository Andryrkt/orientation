import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketPriorite } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  sujet: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TicketPriorite, required: false, default: TicketPriorite.MOYENNE })
  @IsOptional()
  @IsEnum(TicketPriorite)
  priorite?: TicketPriorite;

  @ApiProperty({ required: false, default: 'AUTRE' })
  @IsOptional()
  @IsString()
  categorie?: string;
}
