import { PartialType } from '@nestjs/swagger';
import { CreateConcoursDto } from './create-concours.dto';

export class UpdateConcoursDto extends PartialType(CreateConcoursDto) {}
