# Gabo Scorekeeper

Une webapp mobile-first pour compter les scores d'une partie de Gabo, sans backend. Les données sont conservées dans le navigateur avec `localStorage`.

## Fonctionnalités

- 2 à 6 joueurs, avec noms modifiables
- Ajout des scores manche par manche
- Score cumulé et classement en direct
- Distinction visible entre score actuel après paliers et total des scores saisis
- Tableau récapitulatif en bas de page avec manches jouées et victoires
- Graphique analytique comparant le score total et les victoires par joueur
- Détail des scores saisis par joueur en cliquant sur sa carte
- Historique des paliers déclenchés, avec la manche et la remise appliquée
- Tri du récapitulatif par nombre de manches jouées, puis par score
- Score limité à 45 points par joueur et par manche dans cette version
- Option « Bonus des deux rois noirs (-15) » : score de manche autorisé entre -15 et 45
- Paliers activables : 50 -> 25, 100 -> 50, 120 -> 60
- Seuil de fin configurable, 120 points par défaut
- Fin de partie, gagnant et égalités pris en compte
- Suppression confirmée de la dernière manche
- Rejouer avec les mêmes joueurs ou commencer une nouvelle partie
- Nouvelle partie protégée par une confirmation avant l'effacement complet
- Récapitulatif des règles visible et aide détaillée
- Sauvegarde et reprise automatique via `localStorage`

> Les règles du Gabo peuvent varier selon les groupes. La limite de 45 points est appliquée comme règle de cette version et peut être adaptée à votre variante.

## Utilisation

1. Modifiez les noms des joueurs et configurez le seuil de fin.
2. Activez ou désactivez les paliers et le bonus négatif des deux rois noirs.
3. Cliquez sur `Nouvelle manche` et saisissez un entier compris entre 0 et 45 pour chaque joueur.
4. Consultez le classement en direct, puis le graphique et le tableau `Manches & victoires` en bas de page.
5. Quand le seuil est atteint, la partie se termine. Le joueur au score final le plus bas gagne; les égalités sont conservées.

`Rejouer` conserve les mêmes joueurs mais remet les scores à zéro. `Nouvelle partie` efface les joueurs, options, manches, scores et victoires après confirmation.

Le graphique présente une ligne par joueur avec une barre pour le score total, une barre pour les victoires et le nombre de manches jouées. Les données sont recalculées après chaque manche.

Le score actuel tient compte des paliers. Par exemple, avec les paliers activés, `25 + 35 = 60` points saisis déclenche le palier `50 -> 25`. L'application affiche donc le score actuel `25` et conserve la somme brute `60` dans la colonne `Total saisi` ainsi que dans le détail du joueur.

La colonne `Paliers` du tableau indique combien de paliers chaque joueur a déclenchés. Les seuils sont franchis une seule fois sur la somme brute cumulée des scores saisis : un total de `115` déclenche `50 -> 25`, puis `100 -> 50`, sans réappliquer le palier de 50 après une remise. En cliquant sur une carte joueur, le popup affiche chaque palier avec sa manche, par exemple `Manche 3 : 50 -> 25`.

La case `Bonus des deux rois noirs (-15)` autorise un score de manche compris entre `-15` et `45`. Le score ne peut jamais descendre sous `-15`, car le bonus des deux rois noirs est limité à cette réduction. Sans cette option, le score minimal reste `0`.

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

## Tests end-to-end effectués

Le parcours navigateur a été vérifié sur l'application locale :

- Ouverture de l'application et affichage responsive du graphique analytique
- Ajout d'une manche valide avec mise à jour du classement, du graphique et du tableau
- Refus d'un score de `46` et maintien du formulaire ouvert
- Acceptation du score maximum de `45`
- Comptage des victoires à chaque manche, avec égalités comptées pour chaque joueur concerné
- Vérification du cas `25 + 35` : la somme brute est distinguée du total après palier `50 -> 25`
- Ouverture du détail d'un joueur avec toutes ses manches saisies
- Confirmation obligatoire avant `Nouvelle partie`
- Effacement confirmé des scores, manches, victoires et options

Le build de production a également été validé avec `npm run build`.

Pour lancer le serveur de développement sur Windows si PowerShell bloque `npx.ps1`, utilisez les wrappers `.cmd` :

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

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
