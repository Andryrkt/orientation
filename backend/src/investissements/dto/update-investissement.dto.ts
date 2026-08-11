import { PartialType } from '@nestjs/swagger';
import { CreateInvestissementDto } from './create-investissement.dto';

export class UpdateInvestissementDto extends PartialType(CreateInvestissementDto) {}
