import { PartialType } from '@nestjs/swagger';
import { CreateDepenseGlobaleDto } from './create-depense-globale.dto';

export class UpdateDepenseGlobaleDto extends PartialType(CreateDepenseGlobaleDto) {}
