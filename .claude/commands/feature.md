Utilise deux sous-agents haiku en parallèle pour lire les fichiers de la feature "$ARGUMENTS", puis synthétise.

**Agent 1 — Mobile (haiku) :**
Lis ces fichiers dans `encaissly-mobile` :
- `pages/$ARGUMENTS/index.tsx`
- `styles/pages/$ARGUMENTS.style.ts` (essaie aussi `creatrice.styles.ts` si le premier n'existe pas)
- `types/index.ts`
- Dans `services/api.ts`, trouve et retourne uniquement la section du service lié à "$ARGUMENTS"

**Agent 2 — Backend (haiku) :**
Lis ces fichiers dans `C:\Users\Alexandre\Desktop\Appli_compta_goodthing\boutique-backend` :
- `src/$ARGUMENTS/$ARGUMENTS.service.ts`
- `src/$ARGUMENTS/$ARGUMENTS.controller.ts`
- Tous les fichiers dans `src/$ARGUMENTS/dto/`

Une fois les deux agents terminés, donne un résumé structuré :
1. **État mobile** — ce qui est implémenté, les types utilisés
2. **État backend** — endpoints disponibles, DTOs, logique service
3. **Incohérences** — champs manquants côté mobile, types incompatibles, endpoints non utilisés
