import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateReponseDto } from './create-reponse.dto';

export class UpdateReponseDto extends PartialType(OmitType(CreateReponseDto, ['questionId'] as const)) {}
