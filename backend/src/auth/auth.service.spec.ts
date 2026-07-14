import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    utilisateur: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      if (key === 'JWT_ACCESS_EXPIRES') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES') return '7d';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@test.com',
      password: 'Password123!',
      telephone: '0341234567',
    };

    it('devrait creer un utilisateur et retourner des tokens', async () => {
      mockPrisma.utilisateur.findFirst.mockResolvedValue(null);
      
      const createdUser = {
        id: 'user-123',
        nom: registerDto.nom,
        prenom: registerDto.prenom,
        email: registerDto.email,
        telephone: registerDto.telephone,
        role: 'STUDENT',
        emailVerifiedAt: null,
      };
      mockPrisma.utilisateur.create.mockResolvedValue(createdUser);
      mockPrisma.utilisateur.update.mockResolvedValue(createdUser);

      mockJwt.sign.mockImplementation((payload, options) => {
        if (options.secret === 'access-secret') return 'access-token-123';
        if (options.secret === 'refresh-secret') return 'refresh-token-123';
        return 'token-123';
      });

      const result = await service.register(registerDto);

      expect(prisma.utilisateur.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: registerDto.email },
            { telephone: registerDto.telephone },
          ],
        },
      });
      expect(prisma.utilisateur.create).toHaveBeenCalled();
      expect(prisma.utilisateur.update).toHaveBeenCalled();
      expect(result.accessToken).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('devrait lever une ConflictException si l email ou telephone existe deja', async () => {
      mockPrisma.utilisateur.findFirst.mockResolvedValue({ id: 'existing-123' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(prisma.utilisateur.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      identifiant: 'jean.dupont@test.com',
      password: 'Password123!',
    };

    it('devrait connecter l utilisateur et retourner des tokens', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user = {
        id: 'user-123',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@test.com',
        telephone: '0341234567',
        password: hashedPassword,
        role: 'STUDENT',
        emailVerifiedAt: null,
      };

      mockPrisma.utilisateur.findFirst.mockResolvedValue(user);
      mockPrisma.utilisateur.update.mockResolvedValue(user);
      mockJwt.sign.mockImplementation((payload, options) => {
        if (options.secret === 'access-secret') return 'access-token-123';
        if (options.secret === 'refresh-secret') return 'refresh-token-123';
        return 'token-123';
      });

      const result = await service.login(loginDto);

      expect(prisma.utilisateur.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: loginDto.identifiant },
            { telephone: loginDto.identifiant },
          ],
        },
      });
      expect(result.accessToken).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
    });

    it('devrait lever une UnauthorizedException si l utilisateur n existe pas', async () => {
      mockPrisma.utilisateur.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever une UnauthorizedException si le mot de passe est faux', async () => {
      const hashedPassword = await bcrypt.hash('AutreMdp123!', 10);
      const user = {
        id: 'user-123',
        password: hashedPassword,
      };

      mockPrisma.utilisateur.findFirst.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('devrait regenerer des tokens si le refresh token est valide', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-123' };
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      const user = {
        id: 'user-123',
        role: 'STUDENT',
        refreshTokenHash,
      };

      mockJwt.verify.mockReturnValue(payload);
      mockPrisma.utilisateur.findUnique.mockResolvedValue(user);
      mockPrisma.utilisateur.update.mockResolvedValue(user);
      mockJwt.sign.mockImplementation((payload, options) => {
        if (options.secret === 'access-secret') return 'access-token-new';
        if (options.secret === 'refresh-secret') return 'refresh-token-new';
        return 'token';
      });

      const result = await service.refresh(refreshToken);

      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, { secret: 'refresh-secret' });
      expect(prisma.utilisateur.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' } });
      expect(result.accessToken).toBe('access-token-new');
      expect(result.refreshToken).toBe('refresh-token-new');
    });

    it('devrait lever une UnauthorizedException si le token est invalide', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('invalide');
      });

      await expect(service.refresh('invalide-token')).rejects.toThrow(UnauthorizedException);
    });

    it('devrait lever une UnauthorizedException si le token ne correspond pas au hash stocke', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'user-123' };
      const anotherTokenHash = await bcrypt.hash('other-token', 10);
      const user = {
        id: 'user-123',
        role: 'STUDENT',
        refreshTokenHash: anotherTokenHash,
      };

      mockJwt.verify.mockReturnValue(payload);
      mockPrisma.utilisateur.findUnique.mockResolvedValue(user);

      await expect(service.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('devrait retourner un message de succes meme si l utilisateur n existe pas', async () => {
      mockPrisma.utilisateur.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('inconnu@test.com');
      expect(result.message).toBe('Si ce compte existe, un email a ete envoye.');
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('devrait generer un token si l utilisateur existe', async () => {
      const user = { id: 'user-123', email: 'jean@test.com' };
      mockPrisma.utilisateur.findUnique.mockResolvedValue(user);
      mockJwt.sign.mockReturnValue('reset-token-123');

      const result = await service.forgotPassword('jean@test.com');
      expect(result.message).toBe('Si ce compte existe, un email a ete envoye.');
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 'user-123', purpose: 'reset-password' },
        { secret: 'access-secret', expiresIn: '1h' },
      );
    });
  });

  describe('resetPassword', () => {
    it('devrait modifier le mot de passe si le token est valide', async () => {
      const token = 'valid-reset-token';
      const payload = { sub: 'user-123', purpose: 'reset-password' };
      mockJwt.verify.mockReturnValue(payload);
      mockPrisma.utilisateur.update.mockResolvedValue({});

      const result = await service.resetPassword(token, 'NouveauMdp123!');

      expect(jwt.verify).toHaveBeenCalledWith(token, { secret: 'access-secret' });
      expect(prisma.utilisateur.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          password: expect.any(String),
          refreshTokenHash: null,
        },
      });
      expect(result.message).toBe('Mot de passe mis a jour.');
    });

    it('devrait lever une BadRequestException si le token est invalide', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.resetPassword('bad-token', 'Mdp123!')).rejects.toThrow(BadRequestException);
    });

    it('devrait lever une BadRequestException si le purpose est incorrect', async () => {
      const payload = { sub: 'user-123', purpose: 'verify-email' };
      mockJwt.verify.mockReturnValue(payload);

      await expect(service.resetPassword('verify-token', 'Mdp123!')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyEmail', () => {
    it('devrait valider l email si le token est valide', async () => {
      const token = 'valid-verify-token';
      const payload = { sub: 'user-123', purpose: 'verify-email' };
      mockJwt.verify.mockReturnValue(payload);
      mockPrisma.utilisateur.update.mockResolvedValue({});

      const result = await service.verifyEmail(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, { secret: 'access-secret' });
      expect(prisma.utilisateur.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          emailVerifiedAt: expect.any(Date),
        },
      });
      expect(result.message).toBe('Email verifie.');
    });
  });
});
