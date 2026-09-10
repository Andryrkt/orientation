import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CoachsService } from './coachs.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('CoachsService', () => {
  let service: CoachsService;

  const mockPrisma = {
    coach: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    utilisateur: {
      findUnique: jest.fn(),
    },
  };

  const mockNotificationsService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CoachsService>(CoachsService);
    jest.clearAllMocks();
  });

  describe('findAllVisible', () => {
    it('ne filtre que les profils visibles et valides (statutValidation APPROUVE)', async () => {
      mockPrisma.coach.findMany.mockResolvedValue([]);
      mockPrisma.coach.count.mockResolvedValue(0);

      await service.findAllVisible({} as any);

      expect(mockPrisma.coach.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ visible: true, statutValidation: 'APPROUVE' }),
        }),
      );
    });
  });

  describe('findOneVisible', () => {
    it('leve NotFoundException si le profil est en attente de validation', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-1',
        visible: true,
        statutValidation: 'EN_ATTENTE',
        avis: [],
      });

      await expect(service.findOneVisible('coach-1')).rejects.toThrow(NotFoundException);
    });

    it('leve NotFoundException si le profil est masque', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-1',
        visible: false,
        statutValidation: 'APPROUVE',
        avis: [],
      });

      await expect(service.findOneVisible('coach-1')).rejects.toThrow(NotFoundException);
    });

    it('retourne le profil avec sa note moyenne s il est publie', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-1',
        visible: true,
        statutValidation: 'APPROUVE',
        avis: [{ note: 4 }, { note: 5 }],
      });

      const result = await service.findOneVisible('coach-1');

      expect(result.noteMoyenne).toBe(4.5);
      expect(result.avisCount).toBe(2);
    });
  });

  describe('create', () => {
    it('un admin peut creer directement, meme sans etre coach', async () => {
      mockPrisma.coach.create.mockResolvedValue({ id: 'coach-1' });

      await service.create('admin-1', true, false, { nom: 'X', prenom: 'Y', specialites: ['Sport'] } as any);

      expect(mockPrisma.coach.create).toHaveBeenCalledWith({
        data: { nom: 'X', prenom: 'Y', specialites: ['Sport'] },
      });
      expect(mockPrisma.utilisateur.findUnique).not.toHaveBeenCalled();
    });

    it('refuse la creation si le compte n est ni admin ni coach', async () => {
      await expect(
        service.create('user-1', false, false, { specialites: ['Sport'] } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.coach.create).not.toHaveBeenCalled();
    });

    it('un coach cree son profil avec l identite de son compte, jamais celle du corps de la requete', async () => {
      mockPrisma.utilisateur.findUnique.mockResolvedValue({
        id: 'user-1',
        nom: 'VraiNom',
        prenom: 'VraiPrenom',
        email: 'vrai@example.com',
      });
      mockPrisma.coach.create.mockResolvedValue({ id: 'coach-1' });

      await service.create('user-1', false, true, {
        nom: 'FauxNom',
        prenom: 'FauxPrenom',
        email: 'usurpe@example.com',
        utilisateurId: 'autre-compte',
        visible: false,
        specialites: ['Orientation'],
      } as any);

      expect(mockPrisma.coach.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          utilisateurId: 'user-1',
          nom: 'VraiNom',
          prenom: 'VraiPrenom',
          email: 'vrai@example.com',
          visible: true,
          statutValidation: 'EN_ATTENTE',
          specialites: ['Orientation'],
        }),
      });
    });
  });

  describe('update (admin)', () => {
    it('notifie le coach quand son profil est approuve', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-1',
        utilisateurId: 'user-1',
        nom: 'X',
        prenom: 'Y',
        statutValidation: 'EN_ATTENTE',
      });
      mockPrisma.coach.update.mockResolvedValue({ id: 'coach-1', statutValidation: 'APPROUVE' });

      await service.update('coach-1', { statutValidation: 'APPROUVE' } as any);

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateurId: 'user-1', type: 'VALIDATION_COACH' }),
      );
    });

    it('ne notifie personne pour un profil cree par un admin (sans utilisateur lie)', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-1',
        utilisateurId: null,
        nom: 'X',
        prenom: 'Y',
        statutValidation: 'EN_ATTENTE',
      });
      mockPrisma.coach.update.mockResolvedValue({ id: 'coach-1', statutValidation: 'APPROUVE' });

      await service.update('coach-1', { statutValidation: 'APPROUVE' } as any);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('ne notifie pas si le statut de validation ne change pas', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-1',
        utilisateurId: 'user-1',
        nom: 'X',
        prenom: 'Y',
        statutValidation: 'APPROUVE',
      });
      mockPrisma.coach.update.mockResolvedValue({ id: 'coach-1', statutValidation: 'APPROUVE' });

      await service.update('coach-1', { visible: true } as any);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });
  });

  describe('updateMine', () => {
    it('leve NotFoundException si le profil n existe pas', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue(null);
      await expect(service.updateMine('user-1', 'coach-1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('leve ForbiddenException si le profil appartient a un autre compte', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({ id: 'coach-1', utilisateurId: 'autre-compte' });
      await expect(service.updateMine('user-1', 'coach-1', {} as any)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.coach.update).not.toHaveBeenCalled();
    });

    it('remet le profil en attente de validation apres modification, sans permettre l auto-approbation', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({ id: 'coach-1', utilisateurId: 'user-1' });
      mockPrisma.coach.update.mockResolvedValue({ id: 'coach-1' });

      await service.updateMine('user-1', 'coach-1', {
        bio: 'Nouvelle bio',
        statutValidation: 'APPROUVE',
      } as any);

      expect(mockPrisma.coach.update).toHaveBeenCalledWith({
        where: { id: 'coach-1' },
        data: expect.objectContaining({ bio: 'Nouvelle bio', statutValidation: 'EN_ATTENTE' }),
      });
    });

    it('conserve le statut de validation si seuls des champs mineurs changent (ex: telephone)', async () => {
      mockPrisma.coach.findUnique.mockResolvedValue({
        id: 'coach-1',
        utilisateurId: 'user-1',
        bio: 'Meme bio',
        specialites: ['Sport'],
        experience: 'Meme experience',
        statutValidation: 'APPROUVE',
      });
      mockPrisma.coach.update.mockResolvedValue({ id: 'coach-1' });

      await service.updateMine('user-1', 'coach-1', {
        bio: 'Meme bio',
        specialites: ['Sport'],
        experience: 'Meme experience',
        telephone: '034 00 000 00',
      } as any);

      expect(mockPrisma.coach.update).toHaveBeenCalledWith({
        where: { id: 'coach-1' },
        data: expect.objectContaining({ telephone: '034 00 000 00', statutValidation: 'APPROUVE' }),
      });
    });
  });
});
