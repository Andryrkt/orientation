# Documentation Technique — OrientMad

Cette documentation s'adresse aux développeurs intervenant sur le projet **OrientMad**. Elle décrit l'architecture globale, le modèle de données, le processus d'installation et de développement, ainsi que la suite de tests.

---

## 1. Stack Technique

L'application OrientMad repose sur une stack moderne et robuste :

- **Infrastructure & Conteneurs** : Docker & docker-compose.
- **Backend (API)** :
  - Framework : [NestJS (v10)](https://nestjs.com/) (Node.js + TypeScript).
  - ORM : [Prisma ORM (v5)](https://www.prisma.io/).
  - Base de données : PostgreSQL 16.
  - Sécurité : Passport.js + JWT + bcryptjs + Helmet + CORS + Rate Limiting (nestjs/throttler).
  - Validation : class-validator & class-transformer.
- **Frontend** :
  - Framework : [React (v18)](https://react.dev/) + [Vite](https://vite.dev/) (TypeScript).
  - CSS & Design : TailwindCSS (v3) + Vanilla CSS.
  - State & Data Fetching : TanStack Query (React Query) + Axios.
  - Traduction : i18next + react-i18next.

---

## 2. Structure du Dépôt

```
orientmad/
├── docker-compose.yml       # Configuration multi-conteneurs Docker
├── backend/                 # API NestJS + Prisma
│   ├── prisma/              # Schéma de base de données, migrations et seeds
│   │   ├── schema.prisma    # Fichier de définition des modèles Prisma
│   │   └── seed.ts          # Script de peuplement de la base de données
│   ├── src/                 # Code source NestJS
│   │   ├── auth/            # Module d'authentification (register, login, JWT)
│   │   ├── domaines/        # Module de gestion des domaines
│   │   ├── metiers/         # Module de gestion des métiers
│   │   └── ...              # Autres modules métiers (universités, blogs, stages, etc.)
│   └── test/                # Configuration et code des tests E2E
├── frontend/                # Application React
│   └── src/                 # Composants, pages, services API, hooks
└── docs/                    # Documentations techniques et fonctionnelles
```

---

## 3. Installation et Démarrage rapide

### Prérequis
- [Docker](https://www.docker.com/) (Desktop ou Engine) avec Docker Compose.

### Étapes de démarrage

1. **Cloner le projet** et se positionner à la racine.
2. **Créer le fichier d'environnement** :
   ```bash
   cp .env.example .env
   ```
3. **Lancer les conteneurs avec Docker Compose** :
   ```bash
   docker compose up --build
   ```
   *Cette commande construit les images de dev et démarre les trois services : la base de données PostgreSQL (`db`), le serveur d'API (`backend`) et le client React (`frontend`).*
4. **Accès aux services** :
   - Frontend : `http://localhost:5174` (ou `5173` selon votre configuration).
   - API Backend : `http://localhost:3001` (ou `3000`).
   - Documentation de l'API (Swagger UI) : `http://localhost:3001/api/docs`.

---

## 4. Modèle de Données (Prisma)

Le schéma de base de données est modélisé dans [schema.prisma](file:///d:/orientation/backend/prisma/schema.prisma).

### Rôles (`Role`)
- `VISITOR` : Utilisateur non connecté / Visiteur public.
- `STUDENT` : Étudiant ou professionnel cherchant une orientation.
- `COACH` : Coach d'orientation professionnelle.
- `ADMIN` : Administrateur de la plateforme (accès complet au back-office).

### Entités principales et relations
- **Utilisateur (`utilisateurs`)** et son **Profil (`profils`)** : Relation 1-to-1. Contient les identifiants, hashs, et informations complémentaires (CV, compétences, intérêts).
- **Domaine (`domaines`)** : Catégories principales d'orientation (ex: Santé, Informatique, Droit). Un domaine est lié à plusieurs métiers, mentions de formation, stages ou bourses (relation 1-to-N).
- **Métier (`metiers`)** : Fiche métier complète contenant des descriptions, salaires, qualifications requises et traits RIASEC. Rattaché à un seul domaine.
- **Université (`universites`)** : Établissements supérieurs contenant des **Mentions (`mentions`)** (ex: Informatique), elles-mêmes divisées en **Parcours (`parcours`)** (ex: Génie Logiciel).
- **Favoris (`favoris`)** : Permet aux étudiants de sauvegarder des métiers, universités, etc.
- **Support (`tickets` & `ticket_messages`)** : Système de messagerie interne entre les étudiants et les administrateurs/coachs.

---

## 5. Guide de Développement

### Prisma (Gestion de la BDD)

Toutes les commandes Prisma doivent être exécutées dans le conteneur du backend ou depuis le dossier `backend/` local si les outils locaux sont installés :

- **Générer le client Prisma** :
  ```bash
  docker compose exec backend npx prisma generate
  ```
- **Créer une migration de base de données** :
  ```bash
  docker compose exec backend npx prisma migrate dev --name <nom_de_la_migration>
  ```
- **Lancer Prisma Studio** (Explorateur graphique de BDD) :
  ```bash
  docker compose exec backend npx prisma studio
  ```
  *(Disponible ensuite à l'adresse http://localhost:5555)*

---

## 6. Exécution des Tests

Les tests s'exécutent entièrement dans le conteneur Docker pour garantir la cohérence de l'environnement de test.

### Tests Unitaires
Valident la logique métier et les utilitaires en mockant la base de données.
```bash
docker compose exec -T backend npm run test
```
*Les fichiers de test unitaires sont nommés `*.spec.ts` et placés dans le dossier `backend/src/`.*

### Tests de Bout en Bout (E2E)
Testent les scénarios réels à travers les contrôleurs et les routes HTTP en interagissant avec la base de données.
```bash
docker compose exec -T backend npm run test:e2e
```
*Les fichiers de test E2E se trouvent dans [backend/test/](file:///d:/orientation/backend/test) (configurés via [jest-e2e.json](file:///d:/orientation/backend/test/jest-e2e.json)).*
