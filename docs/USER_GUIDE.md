# Guide de l'Utilisateur et d'Administration — OrientMad

Ce guide détaille le fonctionnement d'**OrientMad**, l'application web d'orientation scolaire, universitaire et professionnelle à Madagascar. Il est divisé en deux parties : une partie pour les utilisateurs (étudiants, visiteurs) et une partie pour les gestionnaires (administrateurs).

---

## 1. Présentation Générale

**OrientMad** a pour but d'aider les élèves, étudiants et jeunes professionnels malgaches à construire leur parcours d'avenir. L'application regroupe :
- Des fiches métiers détaillées et adaptées au marché de l'emploi à Madagascar.
- Un annuaire complet des établissements d'enseignement supérieur (universités publiques et privées, instituts) avec leurs mentions et parcours.
- Un espace d'orientation avec profil utilisateur et sauvegarde de favoris.
- Un canal d'aide et d'assistance via un système de tickets.

---

## 2. Rôles et Droits d'Accès

| Fonctionnalité | Visiteur Anonyme | Étudiant Connecté | Administrateur |
| :--- | :---: | :---: | :---: |
| Consulter les domaines et métiers | ✅ | ✅ | ✅ |
| Consulter les universités et formations | ✅ | ✅ | ✅ |
| S'inscrire / Se connecter | ✅ | ✅ | ✅ |
| Gérer son profil et ses favoris | ❌ | ✅ | ✅ |
| Ouvrir et échanger par tickets de support | ❌ | ✅ | ✅ |
| Accéder au Back-Office (`/admin`) | ❌ | ❌ | ✅ |
| Créer / Modifier / Supprimer des données | ❌ | ❌ | ✅ |

---

## 3. Guide de l'Utilisateur (Étudiant / Visiteur)

### 3.1. Inscription et Connexion
- **Inscription** : Cliquez sur "S'inscrire", saisissez votre nom, prénom, e-mail, téléphone (facultatif) et un mot de passe sécurisé. Un compte étudiant sera automatiquement créé.
- **Connexion** : Saisissez votre e-mail (ou téléphone) et votre mot de passe pour vous connecter à votre espace.

### 3.2. Exploration des Domaines et Métiers
- **Domaines** : Les métiers sont regroupés par secteurs d'activité (ex: Santé, Informatique, BTP).
- **Fiches Métiers** : Chaque fiche décrit les missions, les compétences requises, les conditions de travail, le niveau d'études recommandé et une estimation des salaires minimum et maximum à Madagascar.
- **RIASEC** : Les traits de personnalité liés au métier (Réaliste, Investigateur, Artistique, Social, Entreprenant, Conventionnel) sont indiqués pour faciliter l'adéquation profil-métier.

### 3.3. Annuaire des Formations
- **Universités** : Recherchez des établissements par ville ou par statut (public/privé).
- **Mentions & Parcours** : Consultez les cursus proposés au sein de chaque établissement (ex: Mention Informatique -> Parcours Base de données et Génie Logiciel).

### 3.4. Espace Personnel
- **Mon Profil** : Complétez vos informations personnelles, vos centres d'intérêt et vos formations pour affiner les suggestions d'orientation.
- **Mes Favoris** : Cliquez sur l'icône de cœur sur n'importe quel métier ou université pour le sauvegarder dans vos favoris et le retrouver rapidement dans votre tableau de bord.
- **Support Client** : Vous avez une question sur une université ou un métier ? Ouvrez un ticket de discussion avec un conseiller depuis votre espace.

---

## 4. Guide d'Administration (Back-Office)

### 4.1. Accès au Panel Admin
Les administrateurs peuvent se connecter avec leurs identifiants puis se rendre sur l'URL `http://localhost:5174/admin` (ou via le bouton "Administration" dans le menu de navigation).

*(Données d'accès par défaut en développement : `admin@orientmad.mg` / `Admin123!`)*

### 4.2. Gestion des Domaines et Métiers
L'administrateur peut restructurer les référentiels métiers :
- **Ajout de Domaine** : Créer des catégories de classement avec un titre, une icône et un ordre d'affichage personnalisé. Le slug d'URL se génère automatiquement et de façon unique.
- **Ajout / Modification de Métier** : Saisir les missions, compétences comportementales et techniques, salaires, conditions et tendances du marché à Madagascar.
- **Sécurité de suppression** : Pour éviter toute perte de données accidentelle, l'application bloque la suppression d'un domaine si des fiches métiers ou des formations y sont encore rattachées.

### 4.3. Gestion des Établissements et Formations
L'administrateur peut enrichir l'annuaire d'études supérieures :
- Enregistrer de nouvelles universités (adresse, géolocalisation, photos, contacts).
- Rattacher des Mentions (Licence, Master, etc.) et des parcours d'études avec les frais annuels estimés et les conditions d'accès.

### 4.4. Support et Modération
- **Tickets de Support** : Consulter la liste des demandes envoyées par les étudiants, y répondre ou clore les tickets résolus.
- **Modération** : Modérer les commentaires postés sur les articles de blog du site.
