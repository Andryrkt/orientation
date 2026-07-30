import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ContactStatut } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateContactMessageDto } from './create-contact-message.dto';

export class UpdateContactMessageDto extends PartialType(CreateContactMessageDto) {
  @ApiProperty({ enum: ContactStatut, required: false })
  @IsOptional()
  @IsEnum(ContactStatut)
  statut?: ContactStatut;
}
