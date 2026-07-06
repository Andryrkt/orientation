import { PartialType } from '@nestjs/swagger';
import { CreateParcoursDto } from './create-parcours.dto';

export class UpdateParcoursDto extends PartialType(CreateParcoursDto) {}
