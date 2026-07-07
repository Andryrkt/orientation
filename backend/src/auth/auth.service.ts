import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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
    const user = await this.prisma.utilisateur.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
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
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Identifiants invalides');
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

  async forgotPassword(email: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (!user) {
      // On ne revele pas si l'email existe ou non.
      return { message: 'Si ce compte existe, un email a ete envoye.' };
    }
    const resetToken = this.signPurposeToken(user.id, 'reset-password', '1h');
    console.log(`[dev] Lien de reinitialisation pour ${user.email} : token=${resetToken}`);
    return { message: 'Si ce compte existe, un email a ete envoye.' };
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
    email: string;
    telephone: string | null;
    role: string;
    emailVerifiedAt: Date | null;
  }) {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    };
  }
}
