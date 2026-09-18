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
- 3 parties prédéfinies avec leurs paliers exacts, activables ou non : 60 (50/60), 120 par défaut (50/100/120), 180 (50/100/150/180)
- Seuil de fin verrouillé dès la première manche jouée ; seule une nouvelle partie permet d'en changer
- Fin de partie, gagnant et égalités pris en compte
- Suppression confirmée de la dernière manche
- Rejouer avec les mêmes joueurs ou commencer une nouvelle partie
- Nouvelle partie protégée par une confirmation avant l'effacement complet
- Sélection optionnelle du joueur qui a dit « Gabo » à chaque manche, comptabilisée dans le récapitulatif
- Popup de fin de partie avec podium (avatars colorés) et récapitulatif complet des scores, victoires et appels de Gabo
- Récapitulatif des règles visible et aide détaillée
- Sauvegarde et reprise automatique via `localStorage`

> Les règles du Gabo peuvent varier selon les groupes. La limite de 45 points est appliquée comme règle de cette version et peut être adaptée à votre variante.

## Utilisation

1. Modifiez les noms des joueurs et choisissez le seuil de fin parmi les 3 parties prédéfinies : `60`, `120` ou `180`.
2. Activez ou désactivez les paliers et le bonus négatif des deux rois noirs.
3. Cliquez sur `Nouvelle manche`, saisissez un entier compris entre 0 et 45 pour chaque joueur, et désignez optionnellement le joueur qui a dit « Gabo » pour cette manche.
4. Consultez le classement en direct, puis le graphique et le tableau `Manches & victoires` en bas de page.
5. Quand le seuil choisi est atteint, la partie se termine et un popup podium s'affiche avec le classement final. Le joueur au score final le plus bas gagne; les égalités sont conservées.

`Rejouer` conserve les mêmes joueurs mais remet les scores à zéro. `Nouvelle partie` efface les joueurs, options, manches, scores et victoires après confirmation.

Le graphique présente une ligne par joueur avec une barre pour le score total, une barre pour les victoires et le nombre de manches jouées. Les données sont recalculées après chaque manche.

### Seuil de fin et paliers

Chacune des 3 parties prédéfinies a ses propres paliers exacts, qui s'appliquent au total courant d'un joueur (et non au score d'une seule manche) :

| Partie | Paliers exacts | Réduction |
| --- | --- | --- |
| 60 | 50, 60 | 50 -> 25, 60 -> 30 (fin de partie) |
| 120 (par défaut) | 50, 100, 120 | 50 -> 25, 100 -> 50, 120 -> 60 (fin de partie) |
| 180 | 50, 100, 150, 180 | 50 -> 25, 100 -> 50, 150 -> 75, 180 -> 90 (fin de partie) |

Un total qui atteint exactement un palier intermédiaire voit son score divisé par deux et la partie continue. Un total qui atteint exactement le dernier palier (le seuil de fin) voit son score divisé par deux et la partie se termine. Un total qui dépasse le seuil de fin sans l'atteindre exactement conserve son score réel et termine également la partie. Si les paliers sont désactivés, le total est une addition simple jusqu'au seuil de fin choisi.

La colonne `Paliers` du tableau indique combien de paliers chaque joueur a déclenchés. En cliquant sur une carte joueur, le popup affiche chaque palier avec sa manche, par exemple `Manche 3 : 50 -> 25`.

**Verrouillage du seuil** : les boutons `60` / `120` / `180` ne peuvent être changés qu'avant la toute première manche de la partie. Dès qu'une manche est saisie (`game.rounds.length > 0`), les 3 boutons sont grisés et désactivés, et un message « verrouillé, commencez une nouvelle partie pour changer » apparaît sous les paliers. Cela évite de fausser une partie en cours en changeant son seuil de fin en pleine partie. Pour jouer avec un autre seuil, il faut démarrer une `Nouvelle partie` (ou `Supprimer la dernière manche` jusqu'à revenir à zéro manche, ce qui redéverrouille temporairement le sélecteur). L'option `Paliers activés` et le bonus des deux rois noirs restent modifiables à tout moment, y compris en cours de partie.

### Dire Gabo

Dans le formulaire `Nouvelle manche`, un groupe de boutons radio « Qui a dit Gabo ? (optionnel) » liste `Personne` (sélectionné par défaut) puis chaque joueur. Un seul joueur peut être désigné par manche, celui qui annonce Gabo en pensant avoir le score le plus bas. Ce choix est purement déclaratif : il n'a aucun effet sur le calcul du score ni sur la détermination du vainqueur de la manche (basée uniquement sur le score le plus bas saisi). Il alimente uniquement un compteur par joueur, visible à trois endroits :

- la colonne `Gabo` du tableau récapitulatif `Manches & victoires` (`—` si le joueur n'a jamais dit Gabo) ;
- le détail d'un joueur (clic sur sa carte de score), avec un tag `Gabo dit` sur chaque manche concernée et le total dans la note de bas de popup ;
- le récapitulatif du popup de fin de partie, ligne par ligne.

### Podium de fin de partie

Quand la partie se termine (seuil de fin atteint ou dépassé), un popup s'affiche automatiquement, sans action requise :

- **Podium** : les 3 premiers joueurs (score le plus bas en tête), chacun avec un avatar rond généré automatiquement à partir de ses initiales (1 à 2 lettres) sur un fond de couleur déterministe (dérivée d'un hash de l'identifiant du joueur, dans une palette de 6 teintes reprenant la charte de l'app). Les colonnes ont une hauteur décroissante (1er > 2e > 3e), façon estrade, avec le score de chacun affiché au-dessus.
- **Récapitulatif** : sous le podium, la liste complète des joueurs classés par rang (pas seulement le top 3), avec avatar, nom, score final, nombre de victoires et nombre d'appels de Gabo.
- **Actions** : `Rejouer` (mêmes joueurs, scores remis à zéro) et `Nouvelle partie` (confirmation puis effacement complet), directement depuis le popup.

Si le popup est fermé (bouton `x`), il reste réaccessible via le bouton `Voir le podium` du bandeau « Partie terminée » affiché en haut de page tant que la partie est terminée.

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
- Vérification des seuils exacts `50 -> 25`, `100 -> 50` et `120 -> 60` en partie à 120, et `50 -> 25`, `60 -> 30` en partie à 60
- Vérification de la conservation du score réel au-dessus du seuil de fin
- Sélection du joueur ayant dit Gabo sur une manche, comptage vérifié dans le récapitulatif et le détail du joueur
- Fin de partie déclenchant automatiquement le popup podium avec avatars, classement et récapitulatif complet
- Ouverture du détail d'un joueur avec toutes ses manches saisies
- Confirmation obligatoire avant `Nouvelle partie`
- Effacement confirmé des scores, manches, victoires et options
- Verrouillage des boutons `60` / `120` / `180` dès la première manche saisie, avec déverrouillage après `Nouvelle partie`

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
  App.tsx                         # interface, état de la partie, calculs dérivés (totaux, victoires, appels de Gabo)
  main.tsx                        # point d'entrée React
  styles.css                      # styles responsive (thème clair, une seule feuille)
  domain/
    scoreCalculator.ts            # logique pure des seuils de fin et paliers (GAME_MODES, applyThreshold)
    scoreCalculator.test.ts       # tests unitaires Vitest de la logique de seuils, pour les 3 modes
```

`scoreCalculator.ts` est le seul module testé unitairement : il ne dépend pas de React et reçoit un score cumulé plus des réglages (`thresholdsEnabled`, `steps`), pour rester facile à faire évoluer si les règles de paliers changent encore. Tout le reste (joueurs, manches, victoires, appels de Gabo, persistance `localStorage`) vit dans `App.tsx`, qui reste volontairement un seul composant.
