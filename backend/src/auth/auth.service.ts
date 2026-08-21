import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { generateUniqueUsername } from '../common/utils/unique-username';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private signAccessToken(userId: string, role: string) {
    return this.jwt.sign(
      { sub: userId, role },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m',
      },
    );
  }

  private signRefreshToken(userId: string) {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d',
      },
    );
  }

  private signPurposeToken(userId: string, purpose: string, expiresIn: string) {
    return this.jwt.sign(
      { sub: userId, purpose },
      { secret: this.config.get<string>('JWT_ACCESS_SECRET'), expiresIn },
    );
  }

  private async issueTokens(userId: string, role: string) {
    const accessToken = this.signAccessToken(userId, role);
    const refreshToken = this.signRefreshToken(userId);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.telephone ? [{ telephone: dto.telephone }] : [])] },
    });
    if (existing) {
      throw new ConflictException('Un compte existe deja avec cet email ou ce telephone');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const username = await generateUniqueUsername(this.prisma, dto.nom);
    const user = await this.prisma.utilisateur.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        username,
        email: dto.email,
        telephone: dto.telephone,
        password,
        profil: { create: {} },
      },
    });

    const verificationToken = this.signPurposeToken(user.id, 'verify-email', '1d');
    // MVP : pas d'envoi d'email reel, le lien est journalise pour la demo/dev.
    console.log(`[dev] Lien de verification email pour ${user.email} : token=${verificationToken}`);

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ email: dto.identifiant }, { telephone: dto.identifiant }] },
    });
    if (!user || !user.password || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async googleLogin(idToken: string) {
    const googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    let payload;

    try {
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId || undefined,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error('[GoogleAuth] Erreur de verification du token Google:', err);
      throw new UnauthorizedException('Jeton Google invalide ou expire');
    }

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Impossible d\'extraire l\'adresse email du jeton Google');
    }

    const { email, sub: googleId, given_name, family_name, name, picture } = payload;
    const prenom = given_name || name || 'Utilisateur';
    const nom = family_name || '';

    let user = await this.prisma.utilisateur.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    const now = new Date();

    if (user) {
      user = await this.prisma.utilisateur.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? googleId,
          emailVerifiedAt: user.emailVerifiedAt ?? now,
        },
      });
    } else {
      const username = await generateUniqueUsername(this.prisma, nom || prenom);
      user = await this.prisma.utilisateur.create({
        data: {
          email,
          nom,
          prenom,
          username,
          googleId,
          emailVerifiedAt: now,
          profil: {
            create: {
              photo: picture || null,
            },
          },
        },
      });
    }

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const user = await this.prisma.utilisateur.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async logout(userId: string) {
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async forgotPassword(identifiant: string) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
    });
    const messageGenerique = { message: 'Si ce compte existe, un lien de reinitialisation a ete envoye.' };
    if (!user) {
      // On ne revele pas si le compte existe ou non.
      return messageGenerique;
    }
    const resetToken = this.signPurposeToken(user.id, 'reset-password', '1h');
    const frontendOrigin = this.config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173';
    const resetLink = `${frontendOrigin}/reinitialiser-mot-de-passe?token=${resetToken}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetLink);
    return messageGenerique;
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = this.verifyPurposeToken(token, 'reset-password');
    const password = await bcrypt.hash(newPassword, 10);
    await this.prisma.utilisateur.update({
      where: { id: payload.sub },
      data: { password, refreshTokenHash: null },
    });
    return { message: 'Mot de passe mis a jour.' };
  }

  async verifyEmail(token: string) {
    const payload = this.verifyPurposeToken(token, 'verify-email');
    await this.prisma.utilisateur.update({
      where: { id: payload.sub },
      data: { emailVerifiedAt: new Date() },
    });
    return { message: 'Email verifie.' };
  }

  private verifyPurposeToken(token: string, purpose: string) {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwt.verify(token, { secret: this.config.get<string>('JWT_ACCESS_SECRET') });
    } catch {
      throw new BadRequestException('Token invalide ou expire');
    }
    if (payload.purpose !== purpose) {
      throw new BadRequestException('Token invalide');
    }
    return payload;
  }

  private toPublicUser(user: {
    id: string;
    nom: string;
    prenom: string;
    username: string | null;
    email: string;
    telephone: string | null;
    role: string;
    emailVerifiedAt: Date | null;
  }) {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      username: user.username,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }
}
