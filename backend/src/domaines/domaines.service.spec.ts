import { Test, TestingModule } from '@nestjs/testing';
import { DomainesService } from './domaines.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DomainesService', () => {
  let service: DomainesService;
  let prisma: PrismaService;

  const mockPrisma = {
    domaine: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    metier: {
      count: jest.fn(),
    },
    mention: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DomainesService>(DomainesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('devrait retourner les domaines pagines et le total', async () => {
      const items = [{ id: '1', nom: 'Sante', slug: 'sante', ordre: 1 }];
      mockPrisma.domaine.findMany.mockResolvedValue(items);
      mockPrisma.domaine.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prisma.domaine.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { ordre: 'asc' },
      });
      expect(prisma.domaine.count).toHaveBeenCalled();
      expect(result).toEqual({ items, total: 1, page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('devrait retourner un domaine s il existe', async () => {
      const domaine = { id: '1', nom: 'Sante', slug: 'sante', metiers: [], mentions: [] };
      mockPrisma.domaine.findUnique.mockResolvedValue(domaine);

      const result = await service.findOne('sante');

      expect(prisma.domaine.findUnique).toHaveBeenCalledWith({
        where: { slug: 'sante' },
        include: { metiers: true, mentions: true },
      });
      expect(result).toBe(domaine);
    });

    it('devrait lever une NotFoundException si le domaine n existe pas', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(null);

      await expect(service.findOne('sante-inconnu')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('devrait generer un slug unique et creer le domaine', async () => {
      const dto = { nom: 'Sante & Social', ordre: 2 };
      
      // Premier appel findFirst pour le slug 'sante-social' (deja utilise)
      // Deuxieme appel pour 'sante-social-1' (libre)
      mockPrisma.domaine.findFirst
        .mockResolvedValueOnce({ id: 'existing' })
        .mockResolvedValueOnce(null);

      mockPrisma.domaine.create.mockImplementation((args) => ({
        id: 'new-id',
        ...args.data,
      }));

      const result = await service.create(dto);

      expect(prisma.domaine.findFirst).toHaveBeenNthCalledWith(1, { where: { slug: 'sante-social', NOT: undefined } });
      expect(prisma.domaine.findFirst).toHaveBeenNthCalledWith(2, { where: { slug: 'sante-social-1', NOT: undefined } });
      expect(prisma.domaine.create).toHaveBeenCalledWith({
        data: {
          nom: dto.nom,
          ordre: dto.ordre,
          slug: 'sante-social-1',
        },
      });
      expect(result.slug).toBe('sante-social-1');
    });
  });

  describe('update', () => {
    const id = 'domaine-123';
    const existingDomaine = { id, nom: 'Sante', slug: 'sante' };

    it('devrait lever une NotFoundException si le domaine n existe pas', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(null);

      await expect(service.update(id, { nom: 'Nouveau' })).rejects.toThrow(NotFoundException);
    });

    it('devrait mettre a jour le domaine sans changer le slug si le nom n est pas fourni', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(existingDomaine);
      mockPrisma.domaine.update.mockImplementation((args) => ({
        ...existingDomaine,
        ...args.data,
      }));

      const result = await service.update(id, { ordre: 5 });

      expect(prisma.domaine.update).toHaveBeenCalledWith({
        where: { id },
        data: { ordre: 5 },
      });
      expect(result.slug).toBe('sante');
    });

    it('devrait recalculer le slug si le nom est modifie', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(existingDomaine);
      mockPrisma.domaine.findFirst.mockResolvedValue(null); // slug libre
      mockPrisma.domaine.update.mockImplementation((args) => ({
        ...existingDomaine,
        ...args.data,
      }));

      const result = await service.update(id, { nom: 'Sante Moderne' });

      expect(prisma.domaine.findFirst).toHaveBeenCalledWith({
        where: { slug: 'sante-moderne', NOT: { id } },
      });
      expect(prisma.domaine.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          nom: 'Sante Moderne',
          slug: 'sante-moderne',
        },
      });
      expect(result.slug).toBe('sante-moderne');
    });
  });

  describe('remove', () => {
    const id = 'domaine-123';
    const existingDomaine = { id, nom: 'Sante', slug: 'sante' };

    it('devrait lever une NotFoundException si le domaine n existe pas', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });

    it('devrait lever une ConflictException si le domaine est lie a des metiers', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(existingDomaine);
      mockPrisma.metier.count.mockResolvedValue(1); // 1 metier lie
      mockPrisma.mention.count.mockResolvedValue(0);

      await expect(service.remove(id)).rejects.toThrow(ConflictException);
      expect(prisma.domaine.delete).not.toHaveBeenCalled();
    });

    it('devrait lever une ConflictException si le domaine est lie a des mentions', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(existingDomaine);
      mockPrisma.metier.count.mockResolvedValue(0);
      mockPrisma.mention.count.mockResolvedValue(2); // 2 mentions liees

      await expect(service.remove(id)).rejects.toThrow(ConflictException);
      expect(prisma.domaine.delete).not.toHaveBeenCalled();
    });

    it('devrait supprimer le domaine s il est libre', async () => {
      mockPrisma.domaine.findUnique.mockResolvedValue(existingDomaine);
      mockPrisma.metier.count.mockResolvedValue(0);
      mockPrisma.mention.count.mockResolvedValue(0);

      const result = await service.remove(id);

      expect(prisma.domaine.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result.message).toBe('Domaine supprime');
    });
  });
});
