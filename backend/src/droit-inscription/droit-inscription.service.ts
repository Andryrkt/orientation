import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDroitInscriptionDto } from './dto/update-droit-inscription.dto';

@Injectable()
export class DroitInscriptionService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const existant = await this.prisma.droitInscription.findFirst();
    if (existant) return existant;
    return this.prisma.droitInscription.create({ data: { montant: 0 } });
  }

  async update(dto: UpdateDroitInscriptionDto) {
    const existant = await this.prisma.droitInscription.findFirst();
    if (existant) {
      return this.prisma.droitInscription.update({ where: { id: existant.id }, data: { montant: dto.montant } });
    }
    return this.prisma.droitInscription.create({ data: { montant: dto.montant } });
  }
}
