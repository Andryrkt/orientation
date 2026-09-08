import { PartialType } from '@nestjs/swagger';
import { CreateUniversiteDto } from './create-universite.dto';

// Sans le champ `statutValidation` (contrairement à UpdateUniversiteDto) : un gestionnaire ne peut
// pas s'auto-approuver, seul un admin en a le pouvoir via l'endpoint d'édition générique.
export class UpdateMyUniversiteDto extends PartialType(CreateUniversiteDto) {}
