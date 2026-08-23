# Gabo Scorekeeper — Cahier des charges pour Claude Code

## Objectif

Créer une simple webapp responsive permettant de compter automatiquement les scores d'une partie de Gabo.

L'application doit être facile à utiliser sur smartphone, fonctionner sans backend et être déployable sur Vercel.

## Stack technique

- React + Vite.
- JavaScript ou TypeScript, avec préférence pour TypeScript si cela ne complexifie pas inutilement le projet.
- CSS moderne ou Tailwind CSS.
- Pas de backend pour la première version.
- Persistance locale avec `localStorage`.
- Projet compatible avec un déploiement Vercel depuis GitHub ou avec la commande Vercel CLI.

## Fonctionnalités principales

### Création d'une partie

- Créer une nouvelle partie.
- Ajouter de 2 à 6 joueurs.
- Modifier le nom d'un joueur avant et pendant la configuration.
- Supprimer un joueur.
- Choisir un seuil de fin de partie, avec 120 points par défaut.
- Démarrer la partie uniquement avec au moins 2 joueurs.

### Tableau de scores

Afficher un tableau contenant :

- Le nom de chaque joueur.
- Le score de chaque manche.
- Le total cumulé de chaque joueur.
- Le classement actuel.
- Le nombre de manches jouées.

Le score cumulé doit être recalculé automatiquement après chaque manche.

### Ajout d'une manche

Prévoir un formulaire simple permettant de saisir le score de chaque joueur.

Contraintes :

- Tous les joueurs doivent avoir un score avant validation.
- Autoriser les nombres entiers positifs ou nuls.
- Afficher une erreur claire si une valeur est invalide.
- Permettre d'annuler la saisie.
- Permettre de modifier ou supprimer la dernière manche afin de corriger une erreur.
- Demander une confirmation avant la suppression d'une manche.

### Fin de partie

La partie se termine lorsque le total cumulé d'au moins un joueur atteint ou dépasse le seuil configuré, 120 points par défaut.

À la fin de la partie :

- Terminer le calcul de la manche en cours.
- Afficher le classement final.
- Déclarer gagnant le joueur ayant le score cumulé le plus bas.
- Afficher les joueurs ayant atteint ou dépassé le seuil.
- Afficher les ex æquo si plusieurs joueurs ont le même score minimum.
- Empêcher l'ajout de nouvelles manches tant que la partie n'est pas recommencée.
- Proposer « Nouvelle partie » et « Rejouer avec les mêmes joueurs ».

Important : le joueur qui atteint ou dépasse le seuil déclenche la fin de la partie, mais n'est pas automatiquement le perdant ni le gagnant. Le gagnant est celui qui possède le score final le plus bas.

## Options configurables

Créer une section « Options de la partie » accessible avant le démarrage et, si possible, pendant la partie sans modifier l'historique déjà enregistré.

### Activation des paliers

Ajouter une option :

- `Paliers activés : oui/non`.

Si les paliers sont activés, prévoir une structure configurable plutôt que de coder les valeurs directement dans l'interface. Valeurs initiales proposées :

- À 50 points : retour à 25 points.
- À 100 points : retour à 50 points.
- À 120 points : retour à 60 points.

Avant de valider définitivement cette logique, afficher clairement les paliers dans l'interface et isoler leur calcul dans une fonction dédiée. Le seuil de fin doit rester configurable.

Si les paliers sont désactivés, le total cumulé est simplement la somme des scores de manche.

### Règle spéciale des deux rois noirs

Ajouter une option :

- `Règle des deux rois noirs activée : oui/non`.

Règle à appliquer :

- Si un joueur termine la manche avec les deux rois noirs, il bénéficie d'une réduction de 15 points.
- Cette réduction s'applique au score de la manche.
- Les deux rois noirs ne valent donc pas +15 points et ne doivent pas être comptés deux fois.
- Exemple : deux rois noirs + un 7 + un As = `-15 + 7 + 1 = -7` points.
- Le score minimum d'une manche est 0 par défaut, afin d'éviter un total négatif.
- Prévoir une option avancée `Autoriser les scores négatifs : oui/non`.
- Si les deux rois noirs ne sont pas présents, appliquer le barème normal configuré.

L'application de comptage ne doit pas avoir besoin de connaître les cartes individuelles si l'utilisateur saisit directement le score final de la manche. Dans ce cas, proposer deux modes :

1. **Mode rapide** : l'utilisateur saisit directement les points de chaque joueur.
2. **Mode cartes optionnel** : l'utilisateur peut indiquer les cartes finales afin que l'application calcule automatiquement la règle des deux rois noirs.

Pour la première version, le mode rapide est prioritaire. Ajouter dans le formulaire une case ou un champ « Bonus deux rois noirs : -15 » permettant d'appliquer explicitement la règle.

## Page ou aide des règles

Ajouter une page « Règles du Gabo » ou une fenêtre d'aide accessible depuis toutes les pages principales.

Cette page doit rappeler clairement :

- Le but du jeu : obtenir le moins de points possible.
- Le nombre de cartes par joueur, généralement 4.
- Le déroulement général d'une manche.
- La possibilité d'annoncer « Gabo » selon la variante utilisée.
- Le calcul des scores.
- La règle spéciale des deux rois noirs.
- Le fonctionnement des paliers lorsqu'ils sont activés.
- Le seuil de fin de partie.
- La règle de détermination du gagnant.
- Un avertissement indiquant que les règles du Gabo peuvent varier selon les groupes.

Présenter les règles sous forme de sections lisibles, avec des exemples. Ne pas surcharger l'écran principal.

## Persistance et reprise

Sauvegarder automatiquement dans `localStorage` :

- Les joueurs.
- Les options de la partie.
- L'historique des manches.
- Les scores cumulés.
- L'état de la partie : en cours ou terminée.

Après un rechargement du navigateur, proposer de reprendre la partie en cours.

Prévoir également :

- Une action « Réinitialiser la partie ».
- Une confirmation avant une suppression définitive.
- Une gestion correcte d'un `localStorage` vide ou corrompu.

## Interface et expérience utilisateur

- Design mobile-first.
- Interface claire et rapide à utiliser autour d'une table de jeu.
- Gros champs numériques et boutons suffisamment espacés.
- Score total toujours visible.
- Mise en évidence du meilleur score actuel.
- Mise en évidence de la fin de partie.
- Couleurs accessibles et contraste suffisant.
- Compatible clavier et lecteurs d'écran autant que possible.
- Prévoir un mode sombre simple si cela ne ralentit pas le développement.
- Interface en français.

## Architecture recommandée

Organiser le code avec une séparation claire entre l'interface et la logique métier.

Exemple de structure :

```text
src/
  components/
    GameSetup.tsx
    ScoreBoard.tsx
    AddRoundForm.tsx
    FinalResults.tsx
    RulesPage.tsx
    SettingsPanel.tsx
    ConfirmDialog.tsx
  domain/
    scoreCalculator.ts
    gameRules.ts
    ranking.ts
    types.ts
  hooks/
    useGameState.ts
    useLocalStorage.ts
  App.tsx
  main.tsx
  styles.css
```

Créer des fonctions testables et indépendantes pour :

- Additionner les scores.
- Appliquer ou non les paliers.
- Appliquer la réduction des deux rois noirs.
- Détecter la fin de partie.
- Déterminer le ou les gagnants.
- Gérer les égalités.
- Modifier ou supprimer une manche.

## Tests à prévoir

Ajouter au minimum des tests pour :

- Une nouvelle partie avec deux joueurs.
- L'ajout d'une manche complète.
- Le calcul des totaux cumulés.
- Le refus d'une manche incomplète.
- La détection du seuil de 120 points.
- Le gagnant avec le score le plus bas.
- Une égalité entre plusieurs gagnants.
- Les paliers désactivés.
- Les paliers activés.
- La règle des deux rois noirs avec un résultat égal à 0 après limitation.
- La règle des deux rois noirs avec un score négatif autorisé.
- La modification de la dernière manche.
- La suppression de la dernière manche.
- La sauvegarde et la restauration avec `localStorage`.

## Déploiement sur Vercel

Préparer le projet pour Vercel.

Le projet doit inclure :

- Un `package.json` avec les scripts `dev`, `build` et `preview`.
- Une commande de build fonctionnelle.
- Un fichier `README.md` expliquant l'installation locale.
- Une configuration adaptée à Vite si nécessaire.
- Aucune clé API ni donnée secrète.

Instructions attendues :

```bash
npm install
npm run dev
npm run build
```

Pour le déploiement :

1. Créer un dépôt GitHub.
2. Y pousser le projet.
3. Importer le dépôt dans Vercel.
4. Utiliser la commande de build `npm run build`.
5. Utiliser le dossier de sortie `dist`.
6. Vérifier l'application sur l'URL Vercel générée.

Le projet doit également fonctionner avec :

```bash
npx vercel
```

## Méthode de travail demandée à Claude Code

Avant de coder :

1. Reformuler brièvement les règles et les hypothèses.
2. Signaler toute ambiguïté concernant les paliers, le Gabo ou les scores négatifs.
3. Présenter l'architecture et l'arborescence des fichiers.
4. Implémenter ensuite l'application par étapes.

Après le développement :

1. Installer les dépendances.
2. Lancer les tests.
3. Lancer le build de production.
4. Corriger les erreurs éventuelles.
5. Vérifier le fonctionnement sur mobile et desktop.
6. Donner les instructions exactes pour lancer et déployer l'application sur Vercel.
7. Ne pas ajouter de fonctionnalités complexes non demandées comme un compte utilisateur, un backend ou une authentification.
