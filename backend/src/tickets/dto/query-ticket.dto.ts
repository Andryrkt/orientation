import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketPriorite, TicketStatut } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryTicketDto extends PaginationQueryDto {
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
  q?: string;
}
