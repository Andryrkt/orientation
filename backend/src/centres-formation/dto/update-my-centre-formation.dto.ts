import { PartialType } from '@nestjs/swagger';
import { CreateCentreFormationDto } from './create-centre-formation.dto';

// Sans le champ `statutValidation` (contrairement à UpdateCentreFormationDto) : un gestionnaire ne
// peut pas s'auto-approuver, seul un admin en a le pouvoir via l'endpoint d'édition générique.
export class UpdateMyCentreFormationDto extends PartialType(CreateCentreFormationDto) {}
