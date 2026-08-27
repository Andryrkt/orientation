import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDemandeRoleDto } from './create-demande-role.dto';

export class ResubmitDemandeRoleDto extends PartialType(OmitType(CreateDemandeRoleDto, ['type'] as const)) {}
