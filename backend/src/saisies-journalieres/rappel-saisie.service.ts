import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Periode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PointsDeVenteService } from '../points-de-vente/points-de-vente.service';
import { WhatsAppService } from '../auth/whatsapp.service';
import { dateDuJourMadagascar } from '../common/utils/date.util';

const MADAGASCAR_TIMEZONE = 'Indian/Antananarivo';

@Injectable()
export class RappelSaisieService {
  private readonly logger = new Logger(RappelSaisieService.name);

  constructor(
    private prisma: PrismaService,
    private pointsDeVenteService: PointsDeVenteService,
    private whatsAppService: WhatsAppService,
  ) {}

  @Cron(process.env.RAPPEL_MIDI_CRON ?? '0 12 * * *', { timeZone: MADAGASCAR_TIMEZONE })
  async rappelMidi() {
    await this.envoyerRappels(Periode.MIDI);
  }

  @Cron(process.env.RAPPEL_APRES_MIDI_CRON ?? '0 17 * * *', { timeZone: MADAGASCAR_TIMEZONE })
  async rappelApresMidi() {
    await this.envoyerRappels(Periode.APRES_MIDI);
  }

  async envoyerRappels(periode: Periode) {
    const date = dateDuJourMadagascar();
    const pointsDeVente = await this.pointsDeVenteService.findAllActifsAvecSecretaires();
    const saisiesDuJour = await this.prisma.saisieJournaliere.findMany({
      where: { date, periode, pointDeVenteId: { in: pointsDeVente.map((p) => p.id) } },
    });
    const idsAvecSaisie = new Set(saisiesDuJour.map((s) => s.pointDeVenteId));

    let nbRappelsEnvoyes = 0;
    for (const pointDeVente of pointsDeVente) {
      if (idsAvecSaisie.has(pointDeVente.id)) continue;
      for (const secretaire of pointDeVente.secretaires) {
        if (!secretaire.telephone) continue;
        await this.whatsAppService.sendRappelSaisie(secretaire.telephone, pointDeVente.nom, periode);
        nbRappelsEnvoyes += 1;
      }
    }

    this.logger.log(`Rappels ${periode} envoyés : ${nbRappelsEnvoyes}`);
    return nbRappelsEnvoyes;
  }
}
