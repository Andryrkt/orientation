import { PartialType } from '@nestjs/swagger';
import { CreateSeanceCoursDto } from './create-seance-cours.dto';

export class UpdateSeanceCoursDto extends PartialType(CreateSeanceCoursDto) {}
