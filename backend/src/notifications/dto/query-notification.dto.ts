import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryNotificationDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Ne renvoyer que les notifications non lues' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  nonLuesSeulement?: boolean;
}
