# Gabo Scorekeeper

Une webapp mobile-first pour compter les scores d'une partie de Gabo, sans backend. Les données sont conservées dans le navigateur avec `localStorage`.

## Fonctionnalités

- 2 à 6 joueurs, avec noms modifiables
- Ajout des scores manche par manche
- Score cumulé et classement en direct
- Tableau récapitulatif en bas de page avec manches jouées et victoires
- Tri du récapitulatif par nombre de manches jouées, puis par score
- Score limité à 45 points par joueur et par manche dans cette version
- Option « Bonus des deux rois noirs (-15) » pour autoriser un résultat négatif
- Paliers activables : 50 -> 25, 100 -> 50, 120 -> 60
- Seuil de fin configurable, 120 points par défaut
- Fin de partie, gagnant et égalités pris en compte
- Suppression confirmée de la dernière manche
- Rejouer avec les mêmes joueurs ou commencer une nouvelle partie
- Récapitulatif des règles visible et aide détaillée
- Sauvegarde et reprise automatique via `localStorage`

> Les règles du Gabo peuvent varier selon les groupes. La limite de 45 points est appliquée comme règle de cette version et peut être adaptée à votre variante.

## Installation locale

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Ouvrir ensuite l'URL affichée par Vite, généralement `http://localhost:5173`.

## Vérification et production

```bash
npm run build
npm run preview
```

Le dossier de sortie de production est `dist`.

## Déploiement Vercel

Le projet est compatible avec Vercel :

```bash
npx vercel
```

Depuis le tableau de bord Vercel, utiliser :

- Build command : `npm run build`
- Output directory : `dist`

Aucune clé API ni donnée secrète n'est nécessaire.

## Structure

```text
src/
  App.tsx       # interface et logique de la partie
  main.tsx      # point d'entrée React
  styles.css    # styles responsive
```
