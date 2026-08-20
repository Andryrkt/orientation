# Avenir assuré — Web V1

Application web d'orientation scolaire, universitaire et professionnelle à Madagascar.
Cette V1 couvre le socle (auth, profils, domaines, métiers, universités/mentions/parcours,
back-office admin). Voir `Avenir_assure_Cahier_des_charges.pdf` pour le périmètre complet et la
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

- Frontend : http://localhost:5174
- Backend API : http://localhost:3001
- Documentation API (Swagger) : http://localhost:3001/api/docs

Les ports par défaut (`.env.example`) sont volontairement décalés (3001, 5174, 5434) pour éviter
les conflits avec d'autres projets locaux utilisant les ports standards 3000/5173/5432. Modifie
`.env` si tu veux revenir aux ports par défaut.

Au premier démarrage, les migrations Prisma s'exécutent automatiquement puis la base est
peuplée avec des données de démonstration (domaines, métiers, une université) ainsi qu'un
compte administrateur :

```
Email    : admin@avenirassure.mg
Mot de passe : Admin123!
```

Connecte-toi avec ce compte puis rends-toi sur `/admin` pour accéder au back-office.

Un compte secrétaire de démonstration est également créé (rattaché au point de vente
« Point de vente Analakely ») pour tester la saisie journalière sur `/saisie-journaliere` :

```
Email    : secretaire@avenirassure.mg
Mot de passe : Secretaire123!
```

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
#pour mailer
#SMTP_HOST=...
#SMTP_PORT=587
#SMTP_USER=...
#SMTP_PASSWORD=...
#SMTP_FROM=no-reply@avenirassure.mg