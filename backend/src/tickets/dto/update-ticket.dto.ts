import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketPriorite, TicketStatut } from '@prisma/client';

export class UpdateTicketDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sujet?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TicketStatut, required: false })
  @IsOptional()
  @IsEnum(TicketStatut)
  statut?: TicketStatut;

  @ApiProperty({ enum: TicketPriorite, required: false })
  @IsOptional()
  @IsEnum(TicketPriorite)
  priorite?: TicketPriorite;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categorie?: string;
}
