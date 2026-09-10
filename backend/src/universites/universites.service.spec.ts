import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UniversitesService } from './universites.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('UniversitesService', () => {
  let service: UniversitesService;

  const mockPrisma = {
    universite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockNotificationsService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversitesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<UniversitesService>(UniversitesService);
    jest.clearAllMocks();
    mockPrisma.universite.findFirst.mockResolvedValue(null); // slug toujours libre par defaut
  });

  describe('findAll', () => {
    it('ne retourne que les fiches validees (statutValidation APPROUVE)', async () => {
      mockPrisma.universite.findMany.mockResolvedValue([]);
      mockPrisma.universite.count.mockResolvedValue(0);

      await service.findAll({} as any);

      expect(mockPrisma.universite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ statutValidation: 'APPROUVE' }) }),
      );
    });
  });

  describe('findOne', () => {
    it('leve NotFoundException si la fiche est en attente de validation', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({ slug: 'univ-x', statutValidation: 'EN_ATTENTE' });
      await expect(service.findOne('univ-x')).rejects.toThrow(NotFoundException);
    });

    it('retourne la fiche si elle est approuvee', async () => {
      const universite = { slug: 'univ-x', statutValidation: 'APPROUVE' };
      mockPrisma.universite.findUnique.mockResolvedValue(universite);
      const result = await service.findOne('univ-x');
      expect(result).toBe(universite);
    });
  });

  describe('create', () => {
    it('refuse la creation si le compte n est ni admin ni gestionnaire', async () => {
      await expect(
        service.create('user-1', false, false, { nom: 'Universite Test' } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.universite.create).not.toHaveBeenCalled();
    });

    it('une creation admin est publiee immediatement (APPROUVE)', async () => {
      mockPrisma.universite.create.mockResolvedValue({ id: 'univ-1' });

      await service.create('admin-1', true, false, { nom: 'Universite Test' } as any);

      expect(mockPrisma.universite.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ statutValidation: 'APPROUVE', auteurId: 'admin-1' }) }),
      );
    });

    it('une creation par un gestionnaire part en attente de validation (EN_ATTENTE)', async () => {
      mockPrisma.universite.create.mockResolvedValue({ id: 'univ-1' });

      await service.create('gestionnaire-1', false, true, { nom: 'Universite Test' } as any);

      expect(mockPrisma.universite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ statutValidation: 'EN_ATTENTE', auteurId: 'gestionnaire-1' }),
        }),
      );
    });
  });

  describe('update (admin)', () => {
    it('notifie le gestionnaire quand sa fiche est approuvee', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({
        id: 'univ-1',
        auteurId: 'gestionnaire-1',
        nom: 'Universite X',
        statutValidation: 'EN_ATTENTE',
      });
      mockPrisma.universite.update.mockResolvedValue({ id: 'univ-1', statutValidation: 'APPROUVE' });

      await service.update('univ-1', { statutValidation: 'APPROUVE' } as any);

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateurId: 'gestionnaire-1', type: 'VALIDATION_UNIVERSITE' }),
      );
    });

    it('notifie le gestionnaire quand sa fiche est refusee', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({
        id: 'univ-1',
        auteurId: 'gestionnaire-1',
        nom: 'Universite X',
        statutValidation: 'EN_ATTENTE',
      });
      mockPrisma.universite.update.mockResolvedValue({ id: 'univ-1', statutValidation: 'REJETE' });

      await service.update('univ-1', { statutValidation: 'REJETE' } as any);

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateurId: 'gestionnaire-1', type: 'VALIDATION_UNIVERSITE' }),
      );
    });

    it('ne notifie personne pour une fiche creee par un admin (sans auteur)', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({
        id: 'univ-1',
        auteurId: null,
        nom: 'Universite X',
        statutValidation: 'EN_ATTENTE',
      });
      mockPrisma.universite.update.mockResolvedValue({ id: 'univ-1', statutValidation: 'APPROUVE' });

      await service.update('univ-1', { statutValidation: 'APPROUVE' } as any);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('ne notifie pas si le statut de validation ne change pas', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({
        id: 'univ-1',
        auteurId: 'gestionnaire-1',
        nom: 'Universite X',
        statutValidation: 'APPROUVE',
      });
      mockPrisma.universite.update.mockResolvedValue({ id: 'univ-1', statutValidation: 'APPROUVE' });

      await service.update('univ-1', { telephone: '020 22 000 00' } as any);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });
  });

  describe('updateMine', () => {
    it('leve NotFoundException si la fiche n existe pas', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue(null);
      await expect(service.updateMine('gestionnaire-1', 'univ-1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('leve ForbiddenException si la fiche appartient a un autre gestionnaire', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({ id: 'univ-1', auteurId: 'autre-gestionnaire' });
      await expect(service.updateMine('gestionnaire-1', 'univ-1', {} as any)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.universite.update).not.toHaveBeenCalled();
    });

    it('remet la fiche en attente de validation apres modification, meme si elle etait deja publiee', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({ id: 'univ-1', auteurId: 'gestionnaire-1', nom: 'Ancien nom' });
      mockPrisma.universite.update.mockResolvedValue({ id: 'univ-1' });

      await service.updateMine('gestionnaire-1', 'univ-1', { description: 'Nouvelle description' } as any);

      expect(mockPrisma.universite.update).toHaveBeenCalledWith({
        where: { id: 'univ-1' },
        data: expect.objectContaining({ description: 'Nouvelle description', statutValidation: 'EN_ATTENTE' }),
      });
    });

    it('conserve le statut de validation si seuls des champs mineurs changent (ex: telephone)', async () => {
      mockPrisma.universite.findUnique.mockResolvedValue({
        id: 'univ-1',
        auteurId: 'gestionnaire-1',
        nom: 'Universite X',
        description: 'Meme description',
        ville: 'Antananarivo',
        region: 'Analamanga',
        statutValidation: 'APPROUVE',
      });
      mockPrisma.universite.update.mockResolvedValue({ id: 'univ-1' });

      await service.updateMine('gestionnaire-1', 'univ-1', {
        nom: 'Universite X',
        description: 'Meme description',
        ville: 'Antananarivo',
        region: 'Analamanga',
        telephone: '020 22 000 00',
      } as any);

      expect(mockPrisma.universite.update).toHaveBeenCalledWith({
        where: { id: 'univ-1' },
        data: expect.objectContaining({ telephone: '020 22 000 00', statutValidation: 'APPROUVE' }),
      });
    });
  });
});
