import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private config: ConfigService) {}

  /**
   * Envoie un code OTP par WhatsApp
   */
  async sendOtp(telephone: string, code: string): Promise<boolean> {
    const messageText = `🔑 Votre code de vérification Avenir Assuré est : *${code}* (Valable 10 minutes). Ne le partagez avec personne.`;
    this.logger.log(`[WhatsApp OTP] -> Destinataire: ${telephone} | Code: ${code}`);
    return this.sendWhatsAppMessage(telephone, messageText, '[WhatsApp OTP]');
  }

  /**
   * Envoie un rappel de saisie journalière (recettes/dépenses) à une secrétaire
   */
  async sendRappelSaisie(telephone: string, nomPointDeVente: string, periode: 'MIDI' | 'APRES_MIDI'): Promise<boolean> {
    const libellePeriode = periode === 'MIDI' ? 'midi' : "l'après-midi";
    const messageText = `⏰ Rappel Avenir Assuré : merci de saisir les recettes et dépenses de ${libellePeriode} pour le point de vente *${nomPointDeVente}*.`;
    return this.sendWhatsAppMessage(telephone, messageText, '[WhatsApp Rappel]');
  }

  private async sendWhatsAppMessage(telephone: string, messageText: string, logTag: string): Promise<boolean> {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const fromWhatsApp = this.config.get<string>('TWILIO_WHATSAPP_NUMBER') || 'whatsapp:+14155238886';

    // Toujours journaliser dans la console pour faciliter le dev/test
    console.log(`\n==============================================`);
    console.log(`💬 ${logTag} Message pour ${telephone} :`);
    console.log(`   ${messageText}`);
    console.log(`==============================================\n`);

    // Si les identifiants Twilio sont configurés, effectuer l'envoi réel
    if (accountSid && authToken) {
      try {
        // Chargement dynamique de twilio si le package est installé
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const twilioModule = (require as any)('twilio');
        const client = twilioModule(accountSid, authToken);

        const formattedPhone = telephone.startsWith('whatsapp:')
          ? telephone
          : `whatsapp:${telephone.startsWith('+') ? telephone : `+${telephone}`}`;

        await client.messages.create({
          from: fromWhatsApp.startsWith('whatsapp:') ? fromWhatsApp : `whatsapp:${fromWhatsApp}`,
          to: formattedPhone,
          body: messageText,
        });

        this.logger.log(`${logTag} Message WhatsApp envoyé avec succès via Twilio à ${telephone}`);
        return true;
      } catch (error) {
        this.logger.error(`${logTag} Échec d'envoi Twilio WhatsApp à ${telephone}:`, error);
        // On ne fait pas planter l'application en dev si l'envoi échoue
        return false;
      }
    }

    return true;
  }
}
