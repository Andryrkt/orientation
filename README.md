# OrientMad — Web V1

Application web d'orientation scolaire, universitaire et professionnelle à Madagascar.
Cette V1 couvre le socle (auth, profils, domaines, métiers, universités/mentions/parcours,
back-office admin). Voir `OrientMad_Cahier_des_charges.pdf` pour le périmètre complet et la
roadmap (stages, bourses, coachs, blog, questionnaire d'orientation, appli mobile Flutter).

## Stack

- Backend : NestJS (Node.js + TypeScript) + Prisma + PostgreSQL 16
- Frontend : React (Vite + TypeScript) + TailwindCSS + TanStack Query
- Infra : Docker + docker-compose

## Démarrage rapide

```bash
cp .env.example .env
docker compose up --build
```

- Frontend : http://localhost:5173
- Backend API : http://localhost:3000
- Documentation API (Swagger) : http://localhost:3000/api/docs

Au premier démarrage, les migrations Prisma s'exécutent automatiquement puis la base est
peuplée avec des données de démonstration (domaines, métiers, une université) ainsi qu'un
compte administrateur :

```
Email    : admin@orientmad.mg
Mot de passe : Admin123!
```

Connecte-toi avec ce compte puis rends-toi sur `/admin` pour accéder au back-office.

## Développement

Les dossiers `backend/` et `frontend/` sont montés en volume dans les conteneurs Docker :
toute modification du code source est prise en compte à chaud (hot-reload).

Pour travailler en dehors de Docker (autocomplétion IDE, etc.), installe les dépendances
localement dans chaque dossier :

```bash
cd backend && npm install
cd frontend && npm install
```

### Tests backend

```bash
cd backend
npm run test:e2e
```

Les tests e2e nécessitent une base PostgreSQL accessible via `DATABASE_URL` (celle du
docker-compose convient).

### Prisma

```bash
cd backend
npx prisma studio        # explorer la base de données
npx prisma migrate dev   # créer une nouvelle migration après modification du schema
```

## Structure du repo

```
backend/    API NestJS + schéma Prisma
frontend/   Application React (site public + back-office /admin)
docker-compose.yml
```
