import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('OrientMad API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const suffix = `${Date.now()}`;
  const studentEmail = `student-${suffix}@test.mg`;
  const adminEmail = `admin-${suffix}@test.mg`;
  let domaineId: string;
  let metierId: string;
  let nouveauDomaineId: string;
  let studentToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    const domaine = await prisma.domaine.create({
      data: { nom: `Domaine test ${suffix}`, slug: `domaine-test-${suffix}` },
    });
    domaineId = domaine.id;

    await prisma.utilisateur.create({
      data: {
        nom: 'Admin',
        prenom: 'Test',
        email: adminEmail,
        password: await bcrypt.hash('Admin123!', 10),
        role: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    await prisma.metier.deleteMany({ where: { domaineId: { in: [domaineId, nouveauDomaineId].filter(Boolean) } } });
    await prisma.domaine.deleteMany({ where: { id: { in: [domaineId, nouveauDomaineId].filter(Boolean) } } });
    await prisma.utilisateur.deleteMany({ where: { email: { in: [studentEmail, adminEmail] } } });
    await app.close();
  });

  it('POST /auth/register cree un compte et renvoie un access token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      nom: 'Etudiant',
      prenom: 'Test',
      email: studentEmail,
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    studentToken = res.body.accessToken;
  });

  it('POST /auth/login refuse des identifiants invalides', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifiant: studentEmail, password: 'mauvais-mdp' });
    expect(res.status).toBe(401);
  });

  it('POST /auth/login connecte l\'admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ identifiant: adminEmail, password: 'Admin123!' });
    expect(res.status).toBe(200);
    adminToken = res.body.accessToken;
  });

  it('GET /domaines est accessible publiquement', async () => {
    const res = await request(app.getHttpServer()).get('/domaines');
    expect(res.status).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  it('POST /metiers refuse un utilisateur non-admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/metiers')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ domaineId, nom: 'Metier interdit' });
    expect(res.status).toBe(403);
  });

  it('POST /metiers refuse une requete non authentifiee', async () => {
    const res = await request(app.getHttpServer())
      .post('/metiers')
      .send({ domaineId, nom: 'Metier interdit' });
    expect(res.status).toBe(401);
  });

  it('POST /metiers permet a un admin de creer un metier', async () => {
    const res = await request(app.getHttpServer())
      .post('/metiers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ domaineId, nom: `Metier test ${suffix}` });
    expect(res.status).toBe(201);
    expect(res.body.slug).toContain('metier-test');
    metierId = res.body.id;
  });

  it('PATCH /metiers/:id permet a un admin de modifier un metier', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/metiers/${metierId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ salaireMin: 500000 });
    expect(res.status).toBe(200);
    expect(res.body.salaireMin).toBe(500000);
  });

  it('DELETE /metiers/:id permet a un admin de supprimer un metier', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/metiers/${metierId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('POST /domaines refuse un utilisateur non-admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/domaines')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ nom: 'Domaine interdit', ordre: 10 });
    expect(res.status).toBe(403);
  });

  it('POST /domaines permet a un admin de creer un domaine', async () => {
    const res = await request(app.getHttpServer())
      .post('/domaines')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nom: `Nouveau domaine ${suffix}`, ordre: 10 });
    expect(res.status).toBe(201);
    expect(res.body.slug).toContain('nouveau-domaine');
    nouveauDomaineId = res.body.id;
  });

  it('PATCH /domaines/:id permet a un admin de modifier un domaine', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/domaines/${nouveauDomaineId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ordre: 15 });
    expect(res.status).toBe(200);
    expect(res.body.ordre).toBe(15);
  });

  it('DELETE /domaines/:id permet a un admin de supprimer un domaine', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/domaines/${nouveauDomaineId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
