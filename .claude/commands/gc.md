Fais un git commit complet dans le repo courant.

## Étapes

1. Lance `git add .`
2. Lance `git diff --cached --stat` pour voir ce qui change
3. Lance `git diff --cached` pour lire le contenu des changements
4. Génère un message de commit au format Conventional Commits :
   - `feat:` nouvelle feature
   - `fix:` correction de bug
   - `style:` changements UI/CSS/styles uniquement
   - `refactor:` refactoring sans changement de comportement
   - `chore:` config, dépendances, tooling
   - Sujet ≤ 50 caractères, en français, sans majuscule ni point final
   - Exemple : `feat(creatrice): modal création bottom sheet`
5. Exécute `git commit -m "<message généré>"`
6. Affiche le hash du commit et le message

## Règles
- Ne jamais faire `git push` — seulement le commit
- Si rien à committer (`git status` vide) → dis-le et arrête
- Si $ARGUMENTS est fourni → utilise-le comme message directement sans analyser le diff
