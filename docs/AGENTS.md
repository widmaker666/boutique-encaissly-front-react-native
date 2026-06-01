# Encaissly — Agents & Skills Claude Code

> Référence complète des agents spécialisés, skills et serveurs MCP configurés pour le projet.
> Stack : **Expo 54** · **NestJS 11** · **Prisma 7** · **TypeScript strict**

---

## Table des matières

- [Agents spécialisés](#agents-spécialisés)
- [Skills (commandes /)](#skills-commandes-)
- [Serveurs MCP](#serveurs-mcp)
- [Workflow recommandé](#workflow-recommandé)
- [Règles globales](#règles-globales)

---

## Agents spécialisés

Les agents sont définis dans `.claude/agents/`. Claude Code les sélectionne automatiquement selon le contexte, ou tu peux les cibler avec `@agent-name`.

### 🏗️ `nestjs` — Sonnet 4.6

**Périmètre :** backend `boutique-backend` · NestJS v11 · Prisma v7 · TypeScript strict

**Déclenche cet agent pour :**
- Créer/modifier des modules NestJS (service, controller, module)
- Écrire ou modifier des DTOs et validations (`class-validator`)
- Modifier le schéma Prisma et générer des migrations
- Implémenter des guards, interceptors, pipes
- Ajouter/modifier des endpoints REST

**Comportements :**
- Spawne des subagents **Haiku** pour lire les fichiers backend en parallèle
- Vérifie `npx tsc --noEmit` après chaque modification
- Utilise **Context7** pour la doc NestJS/Prisma à jour
- Style caveman — réponses courtes, pas de blabla
- **Confirmation obligatoire** avant tout `git commit` ou `git push`

**Conventions projet :**
```
//-  commentaires
private readonly  sur toutes les injections constructor
import * as bcrypt from 'bcrypt'
Prisma client dans src/generated
Vérification existence avant update/delete (NotFoundException)
```

---

### 📱 `react-native` — Sonnet 4.6

**Périmètre :** mobile `encaissly-mobile` · Expo v54 · React Native 0.81 · Expo Router · TanStack Query · Zustand

**Déclenche cet agent pour :**
- Créer/modifier des écrans (`pages/`)
- Écrire des styles (`styles/pages/` ou `styles/components/`)
- Implémenter des appels API avec TanStack Query (`useQuery`, `useMutation`)
- Modifier le store Zustand (`stores/auth.store.ts`)
- Tout ce qui touche à la navigation Expo Router

**Comportements :**
- Active `/frontend-design` pour chaque nouvel écran
- Propose un **mockup ASCII** avant de coder un composant visuel
- Spawne des subagents **Haiku** pour lecture parallèle (page + style + service)
- Utilise **Context7** pour Expo/RN/TanStack Query
- Vérifie `npx tsc --noEmit` après chaque modif
- **Confirmation obligatoire** avant commit/push

**Conventions projet :**
```
Jamais de styles inline → tout dans styles/pages/ ou styles/components/
Tokens : Colors (constants/colors.ts), Fonts, typo (typography.styles.ts)
app/      = routing uniquement (re-exports)
pages/    = contenu réel des écrans
services/ = tous les appels API via instance Axios
```

**Double axe métier — toujours gérer les 4 cas :**

| role | plan | comportement |
|------|------|---|
| `GERANTE` | `FREE` | limites + bloc upgrade |
| `GERANTE` | `PRO` | full access |
| `CREATRICE` | `FREE` | stats mois en cours uniquement |
| `CREATRICE` | `PRO` | accès complet |

---

### 🔐 `security` — Opus 4.8

> ⚠️ **Modèle Opus — coûteux.** Réserver aux features sensibles uniquement.

**Périmètre :** authentification · autorisation · protection données · RGPD

**Déclenche cet agent pour :**
- Implémenter ou auditer l'authentification JWT / refresh tokens / Google OAuth
- Configurer des Guards NestJS et vérification des rôles
- Valider la sécurité des DTOs (class-validator, inputs)
- Vérifier la conformité RGPD (consentement, suppression, export)
- Auditer le stockage des tokens côté mobile

**Checklist systématique :**
1. Auth — token vérifié ? expiry géré ?
2. Autorisation — guard en place ? rôle vérifié côté serveur ?
3. Validation — DTO avec class-validator ?
4. Données sensibles — `password`/`token` jamais retournés ?
5. RGPD — donnée personnelle ? droit à l'effacement prévu ?
6. Mobile — token en mémoire ou `SecureStore` ? jamais `AsyncStorage` non chiffré

**Format de rapport :**
```
CRITIQUE : [vulnérabilité bloquante]
ÉLEVÉ    : [risque important]
MOYEN    : [amélioration recommandée]
INFO     : [bonne pratique]
```

---

### 📝 `doc-writer` — Haiku 4.5

**Périmètre :** documentation projet uniquement

**Déclenche cet agent pour :**
- Mettre à jour `docs/agents-skills.html` et `docs/AGENTS.md`
- Après l'ajout ou la suppression d'un agent, skill ou serveur MCP

**Comportements :**
- Lit `.claude/agents/` et `.claude/commands/` en parallèle
- Met à jour les deux fichiers de doc simultanément
- Ne touche jamais au code métier
- Modèle **Haiku** — économique, rapide

---

## Skills (commandes /)

### Skills projet (custom)

| Commande | Description |
|---|---|
| `/feature <nom>` | Spawne 2 subagents Haiku en parallèle : mobile (page + style + service) + backend (service + controller + DTOs). Retourne état des lieux + incohérences. |
| `/sync-types` | Compare `types/index.ts` avec schéma Prisma + DTOs. Tableau par entité : ✅ ok / ⚠️ manquant / ❌ incompatible. |

### Skills Caveman (économie de tokens ~75%)

| Commande | Description |
|---|---|
| `/caveman` | Mode communication ultra-compressé. Niveaux : `lite`, `full` (défaut), `ultra`. |
| `/caveman-commit` | Messages de commit Conventional Commits ultra-courts (sujet ≤ 50 chars). |
| `/caveman-review` | Code review compressé : une ligne par commentaire (localisation + problème + fix). |
| `/caveman-compress <fichier>` | Compresse un fichier mémoire. Backup `.original.md` créé automatiquement. |
| `/cavecrew` | Guide de délégation aux subagents. Spawne investigator / builder / reviewer selon le contexte. |
| `/caveman-stats` | Affiche la consommation réelle de tokens et les économies de la session. |

### Skills Design (Anthropic)

| Commande | Description |
|---|---|
| `/frontend-design` | Direction artistique pour les nouveaux écrans. Évite les patterns IA génériques. Activé automatiquement par l'agent `react-native`. |

---

## Serveurs MCP

Configurés dans `.mcp.json` à la racine du projet.

| Serveur | Package npm | Rôle |
|---|---|---|
| `context7` | `@upstash/context7-mcp` | Doc à jour en temps réel : Expo, React Native, NestJS, Prisma, TanStack Query. |
| `filesystem` | `@modelcontextprotocol/server-filesystem` | Accès aux deux projets depuis une session : `encaissly-mobile/` + `boutique-backend/`. |

**Installation du package context7 (pré-requis) :**
```bash
npm install -g @upstash/context7-mcp
```

---

## Workflow recommandé

Pour chaque nouvelle feature full-stack :

```
1. /feature <nom>         → état des lieux mobile + backend
2. Agent nestjs           → backend en premier (service, DTO, endpoint)
3. /sync-types            → vérifier alignement des types
4. Agent react-native     → mobile (mockup → composant → styles)
5. /caveman-commit        → message de commit propre
6. Confirmation           → agents demandent TOUJOURS avant commit/push
```

---

## Règles globales

Appliquées par **tous** les agents sans exception :

### ❌ Jamais sans confirmation
- `git commit` → toujours demander après avoir affiché le diff
- `git push` → toujours demander explicitement

### ✅ Vérification TypeScript obligatoire
```bash
npx tsc --noEmit
```
Zéro erreur TS avant de continuer. Si erreur → corrige d'abord.

### 💰 Allocation des modèles
| Tâche | Modèle | Raison |
|---|---|---|
| Lecture de fichiers (subagents) | Haiku 4.5 | Économique, rapide |
| Code, analyse, implémentation | Sonnet 4.6 | Bon rapport qualité/coût |
| Sécurité, RGPD, auth | Opus 4.8 | Raisonnement profond requis |

---

*Documentation maintenue par l'agent `doc-writer`. Mettre à jour avec `/agent doc-writer` après tout changement.*
