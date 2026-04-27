# 📱 Encaissly — Mobile

> Application mobile de suivi des ventes pour boutiques de créateurs

![Expo](https://img.shields.io/badge/Expo-v54-000020?logo=expo) ![React Native](https://img.shields.io/badge/React_Native-0.79-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

---

## Stack technique

| Technologie    | Rôle                                  |
| -------------- | ------------------------------------- |
| Expo v54       | Framework React Native                |
| Expo Router v6 | Navigation file-based (comme Next.js) |
| TypeScript     | Typage statique                       |
| Axios          | Client HTTP                           |
| Zustand        | État global (tokens, user connecté)   |
| TanStack Query | Cache et gestion des requêtes serveur |

---

## Prérequis

- Node.js v18+
- Expo Go sur ton téléphone **ou** un émulateur Android/iOS
- Le backend [encaissly-backend](../encaissly-backend) qui tourne en local

---

## Installation

```bash
# Cloner le projet
git clone <url-du-repo>
cd encaissly-mobile

# Installer les dépendances
npm install

# Lancer
npx expo start
```

> Le projet utilise `legacy-peer-deps=true` (fichier `.npmrc`) pour résoudre les conflits de peer dependencies liés à Expo.

---

## Variables d'environnement

Aucun fichier `.env` pour l'instant. L'URL de l'API est définie dans `constants/api.ts` :

```ts
export const API_BASE_URL = "http://192.168.x.x:3000";
```

> ⚠️ Remplace par ton IP locale (pas `localhost`). Sur Windows : `ipconfig` dans le terminal.

---

## Structure du projet

```
encaissly-mobile/
│
├── app/                          ← Expo Router (écrans)
│   ├── _layout.tsx               ← Layout racine — redirige auth/app selon le token
│   ├── (auth)/                   ← Groupe non-authentifié
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/                    ← Groupe authentifié
│       ├── _layout.tsx           ← Tab navigation
│       ├── index.tsx             ← Dashboard
│       ├── ventes/
│       │   ├── index.tsx
│       │   └── [id].tsx
│       ├── creatrice/
│       │   ├── index.tsx
│       │   └── [id].tsx
│       ├── stats.tsx
│       └── profil.tsx
│
├── components/                   ← Composants réutilisables
│   ├── ui/                       ← Button, Input, Card...
│   ├── vente/
│   └── creatrice/
│
├── services/                     ← Appels vers l'API NestJS
│   ├── api.ts                    ← Instance Axios + intercepteurs JWT / 401
│   ├── auth.service.ts
│   ├── vente.service.ts
│   ├── creatrice.service.ts
│   └── stats.service.ts
│
├── stores/                       ← État global Zustand
│   └── auth.store.ts             ← accessToken, refreshToken, user, logout
│
├── constants/
│   ├── colors.ts                 ← Palette Encaissly
│   └── api.ts                    ← BASE_URL
│
└── types/
    └── index.ts                  ← Types partagés (User, Vente, Creatrice, Boutique...)
```

---

## Architecture de navigation

```
app/_layout.tsx
  └── Vérifie accessToken dans le store Zustand
        ├── absent → router.replace('/(auth)/login')
        └── présent → router.replace('/(app)')
```

Expo Router gère deux groupes de routes :

- `(auth)/` — écrans publics (login, register)
- `(app)/` — écrans protégés (tab bar)

---

## Services & état

### Axios (`services/api.ts`)

Instance globale avec deux intercepteurs :

- **Request** — injecte automatiquement `Authorization: Bearer <token>` sur chaque requête
- **Response** — sur 401, appelle `logout()` du store et redirige vers le login

### Zustand (`stores/auth.store.ts`)

Store d'authentification avec :

| Propriété      | Type           | Description                       |
| -------------- | -------------- | --------------------------------- |
| `accessToken`  | `string\|null` | Token JWT (15 min)                |
| `refreshToken` | `string\|null` | Token de renouvellement (7 jours) |
| `user`         | `User\|null`   | Profil de l'utilisateur connecté  |
| `setTokens()`  | fonction       | Stocke les tokens après login     |
| `setUser()`    | fonction       | Stocke le profil après `/profile` |
| `logout()`     | fonction       | Réinitialise tout                 |

### TanStack Query

Utilisé dans les écrans pour toutes les requêtes serveur (`useQuery` pour les GET, `useMutation` pour les POST/PATCH/DELETE). Gère automatiquement le cache, les états loading/error, et l'invalidation après mutation.

---

## Types (`types/index.ts`)

Tous les types sont alignés sur le schéma Prisma du backend :

`User`, `AuthTokens`, `Creatrice`, `Vente`, `Boutique`

Enums : `Plan` (`FREE`/`PRO`), `Role` (`GERANTE`/`CREATRICE`), `Status` (`ACTIVE`/`INVITE`/`SUSPENDUE`), `ModePaiement` (`ESPECES`/`CARTE`)

---

## Roadmap mobile

- [ ] Écrans d'authentification (login / register)
- [ ] Dashboard des ventes
- [ ] Gestion des créatrices
- [ ] Création d'une vente (avec photo)
- [ ] Stats et rapports
- [ ] Profil utilisateur
- [ ] Intégration paiement Stripe
- [ ] Visualisation des exports (PDF viewer)
- [ ] Google OAuth

---

## Lien backend

Ce projet consomme l'API REST [encaissly-backend](../encaissly-backend) — NestJS + Prisma v7 + PostgreSQL (Neon).
