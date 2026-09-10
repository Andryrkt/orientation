import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DemandesRoleService } from './demandes-role.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('DemandesRoleService', () => {
  let service: DemandesRoleService;

  const mockPrisma = {
    demandeRole: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    utilisateur: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    profil: {
      upsert: jest.fn(),
    },
  };

  const mockNotifications = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DemandesRoleService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<DemandesRoleService>(DemandesRoleService);
    jest.clearAllMocks();
    mockPrisma.utilisateur.findMany.mockResolvedValue([]);
  });

  describe('create', () => {
    it('refuse si le compte a deja le statut demande (COACH)', async () => {
      mockPrisma.utilisateur.findUnique.mockResolvedValue({ estCoach: true });

      await expect(service.create('user-1', { type: 'COACH' } as any)).rejects.toThrow(ConflictException);
      expect(mockPrisma.demandeRole.create).not.toHaveBeenCalled();
    });

    it('refuse si une demande du meme type est deja en cours', async () => {
      mockPrisma.utilisateur.findUnique.mockResolvedValue({ estCoach: false });
      mockPrisma.demandeRole.findFirst.mockResolvedValue({ id: 'demande-en-cours' });

      await expect(service.create('user-1', { type: 'COACH' } as any)).rejects.toThrow(ConflictException);
      expect(mockPrisma.demandeRole.create).not.toHaveBeenCalled();
    });

    it('cree la demande et notifie les admins sinon', async () => {
      mockPrisma.utilisateur.findUnique
        .mockResolvedValueOnce({ estCoach: false }) // aDejaLeStatut
        .mockResolvedValueOnce({ id: 'user-1', nom: 'Rabe', prenom: 'Jean' }); // demandeur pour la notif
      mockPrisma.demandeRole.findFirst.mockResolvedValue(null);
      mockPrisma.demandeRole.create.mockResolvedValue({ id: 'nouvelle-demande', type: 'COACH' });
      mockPrisma.utilisateur.findMany.mockResolvedValue([{ id: 'admin-1' }]);

      const result = await service.create('user-1', { type: 'COACH', message: 'motivation' } as any);

      expect(mockPrisma.demandeRole.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ utilisateurId: 'user-1', type: 'COACH' }) }),
      );
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateurId: 'admin-1', type: 'DEMANDE_ROLE' }),
      );
      expect(result).toEqual({ id: 'nouvelle-demande', type: 'COACH' });
    });
  });

  describe('updateMine', () => {
    it('leve NotFoundException si la demande n existe pas', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue(null);
      await expect(service.updateMine('user-1', 'demande-1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('leve ForbiddenException si la demande appartient a un autre compte', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({ id: 'demande-1', utilisateurId: 'autre-user' });
      await expect(service.updateMine('user-1', 'demande-1', {} as any)).rejects.toThrow(ForbiddenException);
    });

    it('leve BadRequestException si la demande n est pas en CLARIFICATION_DEMANDEE', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        utilisateurId: 'user-1',
        statut: 'EN_ATTENTE',
      });
      await expect(service.updateMine('user-1', 'demande-1', {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resolve', () => {
    const utilisateur = { id: 'user-1', nom: 'Rabe', prenom: 'Jean' };

    it('leve NotFoundException si la demande n existe pas', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue(null);
      await expect(service.resolve('demande-1', { statut: 'APPROUVEE' } as any)).rejects.toThrow(NotFoundException);
    });

    it('refuse une transition non autorisee (ex: CLARIFICATION_DEMANDEE -> APPROUVEE)', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        statut: 'CLARIFICATION_DEMANDEE',
        type: 'COACH',
        utilisateurId: 'user-1',
      });
      await expect(service.resolve('demande-1', { statut: 'APPROUVEE' } as any)).rejects.toThrow(BadRequestException);
    });

    it('exige une reponse pour un complement demande', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        statut: 'EN_ATTENTE',
        type: 'COACH',
        utilisateurId: 'user-1',
      });
      mockPrisma.utilisateur.findUnique.mockResolvedValue(utilisateur);

      await expect(
        service.resolve('demande-1', { statut: 'CLARIFICATION_DEMANDEE', reponse: '  ' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('approuver une demande COACH active estCoach sans creer de profil Coach', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        statut: 'EN_ATTENTE',
        type: 'COACH',
        utilisateurId: 'user-1',
      });
      mockPrisma.utilisateur.findUnique.mockResolvedValue(utilisateur);
      mockPrisma.demandeRole.update.mockResolvedValue({ id: 'demande-1', statut: 'APPROUVEE' });

      await service.resolve('demande-1', { statut: 'APPROUVEE' } as any);

      expect(mockPrisma.utilisateur.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { estCoach: true },
      });
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ utilisateurId: 'user-1', type: 'DEMANDE_ROLE_REPONSE' }),
      );
    });

    it('approuver une demande ENSEIGNANT active estEnseignant', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        statut: 'EN_ATTENTE',
        type: 'ENSEIGNANT',
        utilisateurId: 'user-1',
      });
      mockPrisma.utilisateur.findUnique.mockResolvedValue(utilisateur);
      mockPrisma.demandeRole.update.mockResolvedValue({ id: 'demande-1', statut: 'APPROUVEE' });

      await service.resolve('demande-1', { statut: 'APPROUVEE' } as any);

      expect(mockPrisma.utilisateur.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { estEnseignant: true },
      });
    });

    it('approuver une demande GESTIONNAIRE_ETABLISSEMENT active le flag correspondant', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        statut: 'EN_ATTENTE',
        type: 'GESTIONNAIRE_ETABLISSEMENT',
        utilisateurId: 'user-1',
      });
      mockPrisma.utilisateur.findUnique.mockResolvedValue(utilisateur);
      mockPrisma.demandeRole.update.mockResolvedValue({ id: 'demande-1', statut: 'APPROUVEE' });

      await service.resolve('demande-1', { statut: 'APPROUVEE' } as any);

      expect(mockPrisma.utilisateur.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { estGestionnaireEtablissement: true },
      });
    });

    it('approuver une demande ETUDIANT active estEtudiantValide et met a jour le profil', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        statut: 'EN_ATTENTE',
        type: 'ETUDIANT',
        utilisateurId: 'user-1',
        niveauEtude: 'LYCEE',
      });
      mockPrisma.utilisateur.findUnique.mockResolvedValue(utilisateur);
      mockPrisma.demandeRole.update.mockResolvedValue({ id: 'demande-1', statut: 'APPROUVEE' });

      await service.resolve('demande-1', { statut: 'APPROUVEE' } as any);

      expect(mockPrisma.utilisateur.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { estEtudiantValide: true },
      });
      expect(mockPrisma.profil.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { utilisateurId: 'user-1' } }),
      );
    });

    it('remettre en attente une demande COACH approuvee desactive estCoach sans toucher aux profils', async () => {
      mockPrisma.demandeRole.findUnique.mockResolvedValue({
        id: 'demande-1',
        statut: 'APPROUVEE',
        type: 'COACH',
        utilisateurId: 'user-1',
      });
      mockPrisma.utilisateur.findUnique.mockResolvedValue(utilisateur);
      mockPrisma.demandeRole.update.mockResolvedValue({ id: 'demande-1', statut: 'EN_ATTENTE' });

      await service.resolve('demande-1', { statut: 'EN_ATTENTE' } as any);

      expect(mockPrisma.utilisateur.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { estCoach: false },
      });
    });
  });
});
