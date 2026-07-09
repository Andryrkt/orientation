# Plan — Refonte Thème Dégradé Profond (Figma Design)

Transformation complète de l'interface vers un thème sombre et vibrant (violet/indigo profond) avec des cartes illustrées, inspiré du design Figma partagé.

## Aperçu des changements

Le design actuel utilise un thème clair (fond blanc/gris). Nous allons le transformer vers :
- 🌙 **Fond sombre profond** : dégradé `#0f0c29 → #302b63 → #24243e` (violet/indigo)
- 🎨 **Cartes glassmorphic** : fond semi-transparent avec `backdrop-blur`
- 🖼️ **Illustrations / Icônes** : chaque carte aura un pictogramme visuel coloré
- ✨ **Accents néon** : couleurs vives sur fond sombre (purple, cyan, indigo)
- 🔤 **Typographie contrastée** : titres en blanc, sous-titres en gris clair

---

## Proposed Changes

### [Component: Thème global]

#### [MODIFY] [index.css](file:///d:/orientation/frontend/src/index.css)
- Refonte du fond global vers le thème sombre (`#0f0c29` → `#1a1040`)
- Nouvelles classes utilitaires : `.glass-card`, `.gradient-text`, `.neon-badge`
- Mise à jour du fond `body` en dark mode profond

#### [MODIFY] [tailwind.config.js](file:///d:/orientation/frontend/tailwind.config.js)
- Ajout des couleurs dark : `dark-900`, `dark-800`, `dark-700`
- Ajout des couleurs d'accent néon : `neon-purple`, `neon-cyan`, `neon-indigo`

---

### [Component: Layout principal]

#### [MODIFY] [PublicLayout.tsx](file:///d:/orientation/frontend/src/components/PublicLayout.tsx)
- Header avec fond sombre glassmorphique (`bg-black/30 backdrop-blur-lg`)
- Logo et liens en couleurs claires
- Footer sombre cohérent avec le thème

---

### [Component: Page d'accueil (Home)]

#### [MODIFY] [Home.tsx](file:///d:/orientation/frontend/src/pages/Home.tsx)
- Section Hero avec fond en dégradé sombre vibrant + particules lumineuses
- Titre avec `gradient-text` animé (violet → cyan)
- Feature Cards en glassmorphism avec icônes colorées sur fond sombre
- Statistiques dans des blocs dark glassmorphic

---

### [Component: Pages de listes]

#### [MODIFY] [MetiersList.tsx](file:///d:/orientation/frontend/src/pages/MetiersList.tsx)
- Bannière en thème sombre avec illustration SVG
- Cartes avec illustration/icône colorée, fond glassmorphic et badge de domaine néon

#### [MODIFY] [DomainesList.tsx](file:///d:/orientation/frontend/src/pages/DomainesList.tsx)
- Même traitement : bannière sombre + cartes glassmorphic

---

## User Review Required

> [!IMPORTANT]
> Ce changement modifie **l'identité visuelle complète** de l'application (thème clair → thème sombre). L'ensemble de l'interface sera transformé. Souhaitez-vous que je modifie aussi les pages de détail (ex: détail d'un métier, d'une université) ou uniquement les pages de listes et la page d'accueil ?

> [!WARNING]
> Le passage au mode sombre va également modifier la lisibilité des formulaires et des champs de saisie. Confirmez-vous que vous souhaitez un thème sombre global ?

## Open Questions

1. Souhaitez-vous que les pages de **détail** (ex: `/metiers/:slug`, `/universites/:slug`) soient également en thème sombre ?
2. Voulez-vous garder le design en **dark mode uniquement**, ou avoir un toggle light/dark ?
3. Les illustrations/icônes des cartes seront-elles **des émojis**, **des SVG vectoriels personnalisés**, ou **des images générées par IA** ?
