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
}
