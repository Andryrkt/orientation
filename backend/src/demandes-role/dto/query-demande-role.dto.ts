import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DemandeRoleStatut } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryDemandeRoleDto extends PaginationQueryDto {
  @ApiProperty({ enum: DemandeRoleStatut, required: false })
  @IsOptional()
  @IsEnum(DemandeRoleStatut)
  statut?: DemandeRoleStatut;
}
