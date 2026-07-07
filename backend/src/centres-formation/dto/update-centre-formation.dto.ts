import { PartialType } from '@nestjs/swagger';
import { CreateCentreFormationDto } from './create-centre-formation.dto';

export class UpdateCentreFormationDto extends PartialType(CreateCentreFormationDto) {}
