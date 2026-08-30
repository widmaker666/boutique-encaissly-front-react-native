# 📱 Encaissly — Mobile

> Caisse intelligente pour boutiques de créateurs — suivi des ventes, commissions et statistiques.

![Expo](https://img.shields.io/badge/Expo-v54-000020?logo=expo) ![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

---

## Stack technique

| Technologie                              | Rôle                                                     |
| ----------------------------------------- | --------------------------------------------------------- |
| Expo v54 (managed)                        | Framework React Native                                    |
| Expo Router v6                            | Navigation file-based (comme Next.js App Router)          |
| TypeScript                                | Typage statique                                            |
| Axios                                     | Client HTTP                                                |
| Zustand                                   | État global (tokens, user, mode DUO, événement actif)      |
| TanStack Query                            | Cache et gestion des requêtes serveur                      |
| `@react-native-google-signin/google-signin` | Connexion Google **native** (Credential Manager, pas de navigateur) |
| EAS Build / EAS Update                    | Build natif + mises à jour OTA (JS-only)                   |

---

## Prérequis

- Node.js v18+
- Expo Go (dev rapide) **ou** un build EAS installé sur l'appareil (requis pour tester le login Google, qui ne fonctionne pas dans Expo Go)
- Le backend [boutique-backend](../boutique-backend) qui tourne (local ou déployé)
- Un compte Expo (`eas login`) pour builder/publier

---

## Installation

```bash
git clone <url-du-repo>
cd encaissly-mobile
npm install

# Copier et remplir le .env (voir section suivante)
cp .env.example .env

npx expo start          # QR code, scan avec Expo Go
npx expo start --android
npx expo start --ios
```

---

## Variables d'environnement

Toutes préfixées `EXPO_PUBLIC_` (obligatoire pour qu'Expo les embarque côté client). Fichier `.env` à la racine, **jamais commité** (dans `.gitignore`).

```env
EXPO_PUBLIC_API_URL=https://ton-backend.example.com

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...apps.googleusercontent.com

EXPO_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...
EXPO_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=price_...
EXPO_PUBLIC_STRIPE_PRICE_DUO_MONTHLY=price_...
EXPO_PUBLIC_STRIPE_PRICE_DUO_ANNUAL=price_...
```

Le `iosUrlScheme` du plugin Google Sign-In (`app.json`) est dérivé du client iOS et doit être mis à jour si ce client change (voir `app.json` → `plugins` → `@react-native-google-signin/google-signin`).

---

## Structure du projet

```
encaissly-mobile/
│
├── app/                      ← Expo Router — ROUTING UNIQUEMENT (pas de logique/JSX métier)
│   ├── _layout.tsx           ← Layout racine : polices, QueryClientProvider, guard auth
│   ├── (auth)/                ← Groupe non-authentifié
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── legal.tsx          ← CGU/confidentialité (accessible avant ET après connexion)
│   └── (app)/                 ← Groupe authentifié, tab bar
│       ├── _layout.tsx        ← Déclare les tabs, cache/affiche "Boutique" selon affiliation
│       ├── index.tsx           ← Dashboard
│       ├── ventes.tsx
│       ├── creatrice/          ← "Créatrices" (GERANTE) ou "Ma fiche" (CREATRICE)
│       ├── stats.tsx
│       ├── profil.tsx
│       ├── boutique-membre.tsx        ← Onglet "Boutique" (masqué si aucune affiliation)
│       ├── mes-ventes-boutique/[id]   ← Ventes d'une créatrice dans une boutique précise
│       ├── boutique/[id]              ← Fiche boutique détaillée (GERANTE, stats + exports)
│       ├── aide.tsx                    ← Guide d'utilisation par section/rôle
│       └── notifications.tsx
│
├── pages/                     ← Contenu réel des écrans (chaque route app/ ré-exporte un composant d'ici)
│   ├── Dashboard/, Ventes/, Stats/, Profil/, Creatrice/, Boutique/, BoutiqueMembre/
│   ├── Login/, Register/, Legal/, Aide/, Notifications/, Onboarding/
│
├── components/                ← Composants réutilisables (DuoModeToggle, modales Creatrice...)
│
├── services/api.ts            ← Instance Axios unique + tous les *Service (auth, vente, stats,
│                                 boutique, evenement, article, creatrice, user, stripe, notification)
│                                 + signInWithGoogle() (Google Sign-In natif)
│
├── stores/auth.store.ts       ← Zustand : accessToken, refreshToken, user, duoMode, activeEvenementId
│                                 (en mémoire uniquement — perdu au redémarrage de l'app)
│
├── styles/                    ← StyleSheets — soit co-localisées dans pages/<Ecran>/ (fichiers récents),
│                                 soit dans styles/pages/<ecran>.style.ts (fichiers plus anciens)
│
├── constants/                 ← colors.ts (#7a41bb primaire), fonts.ts (Norwester + famille Now)
│
├── eas.json                   ← Profils EAS Build (preview = APK interne) + channel EAS Update
└── types/index.ts             ← Types partagés, alignés sur le schéma Prisma du backend
```

**Path alias** : `@/*` → racine du projet (voir `tsconfig.json`).

---

## Architecture de navigation

```
app/_layout.tsx
  └── Vérifie accessToken dans le store Zustand
        ├── absent → redirige vers (auth)/login
        └── présent → redirige vers (app)/
```

- `(auth)/` — écrans publics. `register.tsx` propose un choix Google/Email : le chemin Google authentifie **d'abord** (récupère email/prénom/nom), préremplit le formulaire, et ne crée le compte qu'à la soumission finale (rôle + CGU acceptées) — jamais de création silencieuse.
- `(app)/` — tab bar à 5-6 onglets. L'onglet **Boutique** n'apparaît que pour un compte affilié à au moins une boutique en tant que créatrice (`BoutiqueMember`). Plusieurs routes existent hors tab bar (`href: null`) : fiches détail, aide, notifications.

---

## Rôles, plans et mode DUO

| Rôle              | Description                                          |
| ------------------ | ------------------------------------------------------ |
| `GERANTE`          | Gère une/plusieurs boutiques, ses créatrices, les ventes |
| `CREATRICE`        | Voit ses propres ventes/commissions, peut être affiliée à une ou plusieurs boutiques d'autres gérantes |
| `GERANTE_CREATRICE` | Compte "DUO" — cumule les deux, bascule via `DuoModeToggle` (`duoMode` dans Zustand, **jamais envoyé au backend** : le serveur résout toujours l'accès via la vraie relation en base, pas via ce toggle) |

| Plan   | Limites / accès                                                             |
| ------ | ------------------------------------------------------------------------------ |
| `FREE` | 1 boutique, 1 mois d'historique, 3 créatrices max, 1 événement max, exports filigranés |
| `PRO`  | Multi-boutiques, 3 mois d'historique, stats complètes, exports illimités        |
| `DUO`  | **Débloque exactement comme PRO** — c'est un plan payant à part entière, pas une variante de FREE. Toute vérification de fonctionnalité doit traiter `PRO` et `DUO` de façon identique (jamais `plan === "PRO"` seul). |

---

## Fonctionnalités principales

- **Auth** : email/mot de passe + Google natif (Credential Manager, `signInWithGoogle()` dans `services/api.ts`), refresh token, CGU obligatoires (vérifiées côté serveur)
- **Ventes** : création (article catalogué ou manuel), édition et suppression avec double confirmation, mode de paiement ESPECES/CARTE, case à cocher pour forcer la commission à 0% sur une vente donnée
- **Créatrices** : fiches créées directement ou par invitation (email + notification in-app), commission par créatrice
- **Événements** : une créatrice peut gérer un événement personnel (marché, foire) indépendamment d'une boutique
- **Boutiques** : une gérante possède ses boutiques ; une créatrice peut être membre de boutiques d'autres gérantes et consulter uniquement ses propres ventes là-bas (onglet "Boutique")
- **Stats & exports** : PDF/Excel/CSV, filigrane en FREE, historique étendu en PRO/DUO
- **Notifications in-app** : invitations, ventes, badge sur la tab bar
- **Suppression de compte** (droit à l'effacement RGPD) : anonymise le compte, conserve les données comptables (obligation légale de conservation)

---

## Déploiement

- **Backend** : Railway, déploiement auto sur push vers `main` du repo backend
- **Mobile** :
  - Fix JS (écran, style, logique métier) → `eas update --branch preview` — aucune réinstallation nécessaire
  - Fix natif (nouvelle lib, permission, config `app.json` native) → `eas build --platform android --profile preview`, puis réinstallation manuelle de l'APK
  - `eas build:list` pour retrouver le lien d'un build

---

## Types (`types/index.ts`)

Alignés sur le schéma Prisma du backend : `User`, `Creatrice`, `Vente`, `Boutique`, `Evenement`, `Article`.
Enums : `Plan` (`FREE`/`PRO`/`DUO`), `Role` (`GERANTE`/`CREATRICE`/`GERANTE_CREATRICE`), `Status` (`ACTIVE`/`INVITE`/`SUSPENDUE`), `ModePaiement` (`ESPECES`/`CARTE`).

---

## Lien backend

Ce projet consomme l'API REST [boutique-backend](../boutique-backend) — NestJS + Prisma v7 + PostgreSQL (Neon).
