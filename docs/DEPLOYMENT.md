# Déploiement — OrientMad

Ce guide décrit comment déployer OrientMad en production avec Docker Compose. Il est
volontairement générique (pas d'hébergeur précis) : à adapter selon la plateforme choisie
(VPS, PaaS, etc.).

## 1. Ce qui a été préparé pour la prod

- `docker-compose.prod.yml` : build des images en mode `prod` (backend Node compilé,
  frontend servi par Nginx), sans montage du code source, sans exposer le port Postgres.
- `.env.production.example` : modèle de variables d'environnement de production.
- `backend/.dockerignore`, `frontend/.dockerignore` : évitent de copier `node_modules`,
  `.env`, `dist`, etc. dans le contexte de build.
- `GET /health` (backend, public) : vérifie la connexion à la base, utilisé par le
  healthcheck Docker et peut servir de cible de monitoring/uptime externe.
- `main.ts` : `trust proxy` activé (nécessaire derrière un reverse proxy pour que les
  cookies `secure` fonctionnent), Swagger (`/api/docs`) désactivable via `SWAGGER_ENABLED=false`.
- `frontend/nginx.conf` : gzip, en-têtes de sécurité de base, cache long terme sur les
  assets hashés par Vite, pas de cache sur `index.html`.

## 2. Prérequis

- Un serveur avec Docker + Docker Compose.
- Un reverse proxy en frontal pour le TLS/HTTPS et le nom de domaine (ex. Caddy, Nginx,
  Traefik) — **ce dépôt ne gère pas la terminaison TLS lui-même**. Il route :
  - `https://ton-domaine.mg` → conteneur `frontend` (port 80)
  - `https://api.ton-domaine.mg` → conteneur `backend` (port 3000)

## 3. Configuration

```bash
cp .env.production.example .env
```

Puis remplace **toutes** les valeurs `CHANGE_ME` :

- `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` : générer avec
  `openssl rand -hex 64` (secrets JWT) et `openssl rand -base64 32` (mot de passe DB).
  Utiliser des valeurs **différentes** de celles de développement.
- `DATABASE_URL` : reprendre le mot de passe Postgres choisi.
- `FRONTEND_ORIGIN` : domaine public du frontend (utilisé pour CORS + cookies).
- `VITE_API_URL` : domaine public de l'API, **atteignable depuis le navigateur** des
  utilisateurs (jamais une adresse interne type `http://backend:3000`). Cette valeur est
  injectée au moment du `build` de l'image frontend (Vite), donc si tu la changes il faut
  reconstruire l'image.
- `COOKIE_SECURE=true` (cookies envoyés uniquement en HTTPS).
- `SWAGGER_ENABLED=false` pour ne pas exposer publiquement la doc Swagger (mets `true`
  temporairement si besoin d'y accéder).

## 4. Build et démarrage

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Au démarrage, le conteneur backend exécute automatiquement `prisma migrate deploy`
(applique les migrations) puis lance l'API. **Aucun seed n'est exécuté automatiquement en
prod** (contrairement au mode dev).

## 5. Compte administrateur / données initiales

Le script `backend/prisma/seed.ts` crée un compte admin (`admin@orientmad.mg`) **mais
insère aussi des données de démonstration** (métiers, université, articles de blog, coachs
et enseignants fictifs avec des emails `@test.mg`). Il est idempotent (peut être relancé
sans dupliquer), mais ne le lance pas tel quel en production si tu ne veux pas de ce
contenu de démo :

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

Pour un vrai lancement en production, alternative recommandée : créer le compte admin
manuellement (via un script ou une requête directe), et alimenter les vraies données
(domaines, métiers, universités) via le back-office `/admin` une fois connecté, plutôt que
via le seed de démo.

## 6. Mises à jour / redéploiement

```bash
git pull
docker compose -f docker-compose.prod.yml up --build -d
```

Les migrations Prisma en attente sont appliquées automatiquement au redémarrage du
conteneur backend.

## 7. Sauvegardes

Le volume Docker `db_data` contient toutes les données. Sauvegarde régulière recommandée :

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%F).sql
```

## 8. Supervision

- `GET https://api.ton-domaine.mg/health` → `{"status":"ok"}` si l'API et la base
  répondent (503 sinon). À brancher sur un service d'uptime externe (UptimeRobot,
  healthcheck du reverse proxy, etc.).
- `docker compose -f docker-compose.prod.yml logs -f backend` pour les logs applicatifs.

## 9. Checklist avant mise en ligne

- [ ] Tous les secrets de `.env` régénérés (différents de ceux de dev/`.env.example`).
- [ ] `COOKIE_SECURE=true` et le domaine est bien servi en HTTPS (reverse proxy configuré).
- [ ] `FRONTEND_ORIGIN` et `VITE_API_URL` pointent vers les vrais domaines publics.
- [ ] `SWAGGER_ENABLED=false` sauf besoin explicite.
- [ ] Décision prise sur le seed de démo (à exécuter ou non en l'état).
- [ ] Sauvegarde de la base testée et planifiée (cron ou outil externe).
- [ ] `.env` de production non commité (déjà ignoré par `.gitignore`).
