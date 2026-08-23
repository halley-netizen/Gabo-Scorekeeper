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
- Tableau des pouvoirs des cartes dans l'aide : 7/8, 9/10, Valet/Dame et Roi
- Tri du récapitulatif par nombre de manches jouées, puis par score
- Score limité à 45 points par joueur et par manche dans cette version
- Option « Bonus des deux rois noirs (-15) » : score de manche autorisé entre -15 et 45
- Paliers exacts activables : 50 -> 25, 100 -> 50, 120 -> 60
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

Le score actuel applique uniquement les seuils exacts. `50` devient `25`, `100` devient `50` et `120` devient `60` tout en terminant la partie. Un score supérieur à 120, comme `123`, conserve son score réel et termine la partie. Un score de `53`, `99` ou `104` reste inchangé. L'application affiche le score actuel et conserve la somme brute dans la colonne `Total saisi` ainsi que dans le détail du joueur.

Priorité de calcul : vérifier d'abord la fin de partie, puis le seuil exact de 120, le seuil exact de 100 et enfin le seuil exact de 50. Si les paliers sont désactivés, le total est une addition simple.

La colonne `Paliers` du tableau indique combien de paliers chaque joueur a déclenchés. Chaque manche est évaluée avec le total courant : un total exactement égal à `50` déclenche `50 -> 25`, un total exactement égal à `100` déclenche `100 -> 50`, et un total exactement égal à `120` déclenche `120 -> 60` et termine la partie. Un total de `121` ou plus conserve le score réel et termine la partie. En cliquant sur une carte joueur, le popup affiche chaque palier avec sa manche, par exemple `Manche 3 : 50 -> 25`.

La fenêtre d'aide contient également le tableau des pouvoirs : `7 ou 8` permet de regarder une de ses propres cartes, `9 ou 10` une carte adverse, `Valet ou Dame` permet d'échanger une carte avec celle d'un adversaire sans regarder la carte donnée, et le `Roi` combine ces pouvoirs au choix. La règle spéciale de score des deux rois noirs reste décrite séparément.

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
- Vérification des seuils exacts `50 -> 25`, `100 -> 50` et `120 -> 60`
- Vérification de la conservation du score réel au-dessus de 120
- Ouverture du détail d'un joueur avec toutes ses manches saisies
- Confirmation obligatoire avant `Nouvelle partie`
- Effacement confirmé des scores, manches, victoires et options

Le build de production a également été validé avec `npm run build`. Les tests métier sont disponibles avec `npm test`.

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
