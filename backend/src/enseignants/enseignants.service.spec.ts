import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EnseignantsService } from './enseignants.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('EnseignantsService', () => {
  let service: EnseignantsService;

  const mockPrisma = {
    enseignant: {
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
        EnseignantsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<EnseignantsService>(EnseignantsService);
    jest.clearAllMocks();
  });

  describe('findAllVisible', () => {
    it('ne filtre que les profils visibles et valides (statutValidation APPROUVE)', async () => {
      mockPrisma.enseignant.findMany.mockResolvedValue([]);
      mockPrisma.enseignant.count.mockResolvedValue(0);

      await service.findAllVisible({} as any);

      expect(mockPrisma.enseignant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: expect.arrayContaining([{ visible: true }, { statutValidation: 'APPROUVE' }]) },
        }),
      );
    });
  });

  describe('findOneVisible', () => {
    it('leve NotFoundException si le profil est en attente de validation', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({
        id: 'ens-1',
        visible: true,
        statutValidation: 'EN_ATTENTE',
        avis: [],
      });

      await expect(service.findOneVisible('ens-1')).rejects.toThrow(NotFoundException);
    });

    it('retourne le profil avec sa note moyenne s il est publie', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({
        id: 'ens-1',
        visible: true,
        statutValidation: 'APPROUVE',
        avis: [{ note: 3 }],
      });

      const result = await service.findOneVisible('ens-1');

      expect(result.noteMoyenne).toBe(3);
      expect(result.avisCount).toBe(1);
    });
  });

  describe('create', () => {
    it('refuse la creation si le compte n est ni admin ni enseignant', async () => {
      await expect(
        service.create('user-1', false, false, { matieres: ['Maths'] } as any),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.enseignant.create).not.toHaveBeenCalled();
    });

    it('un enseignant cree son profil avec l identite de son compte, jamais celle du corps de la requete', async () => {
      mockPrisma.utilisateur.findUnique.mockResolvedValue({
        id: 'user-1',
        nom: 'VraiNom',
        prenom: 'VraiPrenom',
        email: 'vrai@example.com',
      });
      mockPrisma.enseignant.create.mockResolvedValue({ id: 'ens-1' });

      await service.create('user-1', false, true, {
        nom: 'FauxNom',
        utilisateurId: 'autre-compte',
        visible: false,
        matieres: ['Algebre'],
        etablissement: 'Universite X',
      } as any);

      expect(mockPrisma.enseignant.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          utilisateurId: 'user-1',
          nom: 'VraiNom',
          prenom: 'VraiPrenom',
          email: 'vrai@example.com',
          visible: true,
          statutValidation: 'EN_ATTENTE',
          matieres: ['Algebre'],
          etablissement: 'Universite X',
        }),
      });
    });
  });

  describe('update (admin)', () => {
    it('notifie l enseignant quand son profil est refuse', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({
        id: 'ens-1',
        utilisateurId: 'user-1',
        nom: 'X',
        prenom: 'Y',
        statutValidation: 'EN_ATTENTE',
      });
      mockPrisma.enseignant.update.mockResolvedValue({ id: 'ens-1', statutValidation: 'REJETE' });

      await service.update('ens-1', { statutValidation: 'REJETE' } as any);

      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateurId: 'user-1', type: 'VALIDATION_ENSEIGNANT' }),
      );
    });

    it('ne notifie personne pour un profil cree par un admin (sans utilisateur lie)', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({
        id: 'ens-1',
        utilisateurId: null,
        nom: 'X',
        prenom: 'Y',
        statutValidation: 'EN_ATTENTE',
      });
      mockPrisma.enseignant.update.mockResolvedValue({ id: 'ens-1', statutValidation: 'APPROUVE' });

      await service.update('ens-1', { statutValidation: 'APPROUVE' } as any);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('ne notifie pas si le statut de validation ne change pas', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({
        id: 'ens-1',
        utilisateurId: 'user-1',
        nom: 'X',
        prenom: 'Y',
        statutValidation: 'APPROUVE',
      });
      mockPrisma.enseignant.update.mockResolvedValue({ id: 'ens-1', statutValidation: 'APPROUVE' });

      await service.update('ens-1', { visible: true } as any);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });
  });

  describe('updateMine', () => {
    it('leve ForbiddenException si le profil appartient a un autre compte', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({ id: 'ens-1', utilisateurId: 'autre-compte' });
      await expect(service.updateMine('user-1', 'ens-1', {} as any)).rejects.toThrow(ForbiddenException);
      expect(mockPrisma.enseignant.update).not.toHaveBeenCalled();
    });

    it('remet le profil en attente de validation apres modification, sans permettre l auto-approbation', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({ id: 'ens-1', utilisateurId: 'user-1' });
      mockPrisma.enseignant.update.mockResolvedValue({ id: 'ens-1' });

      await service.updateMine('user-1', 'ens-1', {
        bio: 'Nouvelle bio',
        statutValidation: 'APPROUVE',
      } as any);

      expect(mockPrisma.enseignant.update).toHaveBeenCalledWith({
        where: { id: 'ens-1' },
        data: expect.objectContaining({ bio: 'Nouvelle bio', statutValidation: 'EN_ATTENTE' }),
      });
    });

    it('conserve le statut de validation si seuls des champs mineurs changent (ex: disponibilites)', async () => {
      mockPrisma.enseignant.findUnique.mockResolvedValue({
        id: 'ens-1',
        utilisateurId: 'user-1',
        bio: 'Meme bio',
        matieres: ['Maths'],
        niveauxEtude: ['LYCEE'],
        etablissement: 'Meme etablissement',
        statutValidation: 'APPROUVE',
      });
      mockPrisma.enseignant.update.mockResolvedValue({ id: 'ens-1' });

      await service.updateMine('user-1', 'ens-1', {
        bio: 'Meme bio',
        matieres: ['Maths'],
        niveauxEtude: ['LYCEE'],
        etablissement: 'Meme etablissement',
        disponibilites: 'Le week-end',
      } as any);

      expect(mockPrisma.enseignant.update).toHaveBeenCalledWith({
        where: { id: 'ens-1' },
        data: expect.objectContaining({ disponibilites: 'Le week-end', statutValidation: 'APPROUVE' }),
      });
    });
  });
});
