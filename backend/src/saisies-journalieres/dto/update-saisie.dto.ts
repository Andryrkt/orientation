import { PartialType } from '@nestjs/swagger';
import { SubmitSaisieDto } from './submit-saisie.dto';

export class UpdateSaisieDto extends PartialType(SubmitSaisieDto) {}
