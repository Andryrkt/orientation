import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<string>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASSWORD');
    this.from = this.config.get<string>('SMTP_FROM') ?? user ?? 'no-reply@avenirassure.mg';

    // Sans configuration, on journalise seulement (dev/test) plutôt que de faire planter
    // l'application — SMTP est une infrastructure optionnelle à brancher en prod.
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port ? Number(port) : 587,
        secure: Number(port) === 465,
        auth: { user, pass },
      });
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    const subject = 'Réinitialisation de votre mot de passe — Avenir assuré';
    const text = `Vous avez demandé la réinitialisation de votre mot de passe.\n\nCliquez sur ce lien (valable 1 heure) : ${resetLink}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`;
    const html = `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p><p><a href="${resetLink}">Cliquez ici pour réinitialiser votre mot de passe</a> (valable 1 heure).</p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`;

    console.log(`\n==============================================`);
    console.log(`📧 [Email reset mot de passe] Destinataire : ${to}`);
    console.log(`   Lien : ${resetLink}`);
    console.log(`==============================================\n`);

    if (!this.transporter) {
      this.logger.warn(
        'SMTP non configuré (SMTP_HOST/SMTP_USER/SMTP_PASSWORD manquants) — email non envoyé, voir le lien ci-dessus dans les logs.',
      );
      return false;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text, html });
      this.logger.log(`Email de réinitialisation envoyé à ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Échec d'envoi de l'email de réinitialisation à ${to} :`, error);
      return false;
    }
  }

  private async sendMail(to: string, subject: string, text: string, html: string): Promise<boolean> {
    console.log(`\n==============================================`);
    console.log(`📧 [${subject}] Destinataire : ${to}`);
    console.log(text);
    console.log(`==============================================\n`);

    if (!this.transporter) {
      this.logger.warn(
        'SMTP non configuré (SMTP_HOST/SMTP_USER/SMTP_PASSWORD manquants) — email non envoyé, voir le contenu ci-dessus dans les logs.',
      );
      return false;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text, html });
      this.logger.log(`Email "${subject}" envoyé à ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Échec d'envoi de l'email "${subject}" à ${to} :`, error);
      return false;
    }
  }

  async sendRendezVousDemande(
    to: string,
    params: { destinataireNom: string; demandeurNom: string; dateSouhaitee: string; message?: string | null; lienEspace: string },
  ): Promise<boolean> {
    const subject = 'Nouvelle demande de rendez-vous — Avenir assuré';
    const text = `Bonjour ${params.destinataireNom},\n\n${params.demandeurNom} souhaite prendre rendez-vous avec vous le ${params.dateSouhaitee}.\n${params.message ? `\nMessage : ${params.message}\n` : ''}\nRendez-vous sur ${params.lienEspace} pour confirmer ou décliner cette demande.`;
    const html = `<p>Bonjour ${params.destinataireNom},</p><p><strong>${params.demandeurNom}</strong> souhaite prendre rendez-vous avec vous le <strong>${params.dateSouhaitee}</strong>.</p>${params.message ? `<p>Message : ${params.message}</p>` : ''}<p><a href="${params.lienEspace}">Rendez-vous sur votre espace</a> pour confirmer ou décliner cette demande.</p>`;
    return this.sendMail(to, subject, text, html);
  }

  async sendRendezVousReponse(
    to: string,
    params: { demandeurNom: string; destinataireNom: string; statut: string; reponse?: string | null; lienEspace: string },
  ): Promise<boolean> {
    const subject = 'Réponse à votre demande de rendez-vous — Avenir assuré';
    const text = `Bonjour ${params.demandeurNom},\n\n${params.destinataireNom} a répondu à votre demande de rendez-vous : ${params.statut}.\n${params.reponse ? `\nMessage : ${params.reponse}\n` : ''}\nRendez-vous sur ${params.lienEspace} pour plus de détails.`;
    const html = `<p>Bonjour ${params.demandeurNom},</p><p><strong>${params.destinataireNom}</strong> a répondu à votre demande de rendez-vous : <strong>${params.statut}</strong>.</p>${params.reponse ? `<p>Message : ${params.reponse}</p>` : ''}<p><a href="${params.lienEspace}">Voir le détail sur votre espace</a>.</p>`;
    return this.sendMail(to, subject, text, html);
  }
}
