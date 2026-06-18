# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Règles d'orchestration (toujours actives)

### Context7 — doc à jour obligatoire
Avant toute réponse sur une lib/framework/SDK (Expo, React Native, TanStack Query, Zustand, Axios, etc.) :
1. `mcp__context7__resolve-library-id` avec le nom de la lib + la question
2. `mcp__context7__query-docs` avec l'ID trouvé
Ne jamais se fier à la mémoire d'entraînement pour les APIs récentes.

### Caveman — communication compressée
- **Prompts vers sous-agents** : caveman full (fragments, pas de politesse)
- **Invocation skills/commands** : args compressés
- **Raisonnement interne** : caveman full
- **Sortie utilisateur** : lisible, pas de caveman
- **Warnings sécu / actions destructives** : toujours clair et explicite

### Planner en amont
Avant toute feature non triviale → `encaissly-planner` pour produire un plan validé avant d'exécuter quoi que ce soit.

## Commands

```bash
npx expo start           # Start dev server (scan QR with Expo Go)
npx expo start --android # Launch on Android emulator
npx expo start --ios     # Launch on iOS simulator
npx expo start --web     # Launch in browser
```

No lint or test scripts are configured yet.

## Architecture

**Expo Router (file-based routing)** — `app/` maps directly to routes, similar to Next.js App Router:
- `app/_layout.tsx` — root layout: loads fonts, sets up `QueryClientProvider`, guards auth (redirects based on `accessToken` in Zustand store)
- `app/(auth)/` — public screens (login, register)
- `app/(app)/` — protected tab navigator (5 tabs: Dashboard, Ventes, Creatrice, Stats, Profil)

Each route file in `app/` is thin — it just renders the corresponding component from `pages/`.

**Layer separation:**
- `app/` — routing only
- `pages/` — full screen components
- `components/` — reusable UI (currently empty placeholders)
- `services/api.ts` — all API calls via a single Axios instance
- `stores/auth.store.ts` — Zustand store for auth state (in-memory, no persistence)
- `types/index.ts` — shared TypeScript interfaces
- `styles/` — StyleSheets co-located by page and utility

## API Layer (`services/api.ts`)

Single Axios instance with:
- **Request interceptor**: auto-injects `Authorization: Bearer <token>` from Zustand store
- **Response interceptor**: on 401 → calls `logout()` and navigates to login

Service objects: `authService`, `statsService`, `venteService`, `boutiqueService`, `evenementService`, `creatriceService`.

All data fetching in pages uses **TanStack Query** (`useQuery`, `useMutation`) — don't fetch directly in components.

## Business Logic

The app has two axes of conditional rendering:

| Dimension | Values | Effect |
|-----------|--------|--------|
| `role` | `GERANTE` / `CREATRICE` | Controls which features and data are shown |
| `plan` | `FREE` / `PRO` | FREE = 1 boutique, 1 month history, 3 créatrices max; PRO = multi-boutiques, 3-month history, full stats |

Always check both dimensions when adding features to the Dashboard or any screen that differs by user type.

## Design System

- **Primary color**: `#7a41bb` (purple) — defined in `constants/colors.ts`
- **Fonts**: Norwester (display/headers) + Now family (Thin/Light/Regular/Medium/Bold/Black) — loaded in root layout
- **Typography utilities**: `styles/utils/typography.styles.ts`
- **Path alias**: `@/*` resolves to project root (configured in `tsconfig.json`)

## Environment

`.env` variables (all prefixed `EXPO_PUBLIC_`):
- `EXPO_PUBLIC_API_URL` — backend base URL
- Google OAuth client IDs (Web, Android, iOS)

Token storage is in-memory only (Zustand, no `SecureStore` yet) — tokens are lost on app restart.
