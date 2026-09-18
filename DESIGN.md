# Design system — Gabo Scorekeeper

Refonte UI de l'application (single-page, React + TypeScript + Vite, CSS vanilla). Direction : **Linear / Vercel density** — outil dense en information, bordures fines, hiérarchie typographique nette, décoration minimale.

## 1. Tokens

Tous les tokens sont des custom properties CSS, définis sur `:root` (clair) puis redéfinis sous `@media (prefers-color-scheme: dark)` et `:root[data-theme="dark"]` (bascule manuelle, cf. §5).

### Couleurs

| Rôle | Clair | Sombre | Usage |
| --- | --- | --- | --- |
| `--color-bg` | `#FAFAFA` | `#0B0B0C` | fond de page |
| `--color-surface` | `#FFFFFF` | `#17171A` | cartes, tableaux |
| `--color-surface-raised` | `#FFFFFF` | `#1E1E22` | modales, popovers |
| `--color-border` | `#E4E4E7` | `#2A2A2E` | séparateurs, bordures par défaut |
| `--color-border-strong` | `#D4D4D8` | `#3A3A40` | bordures actives / hover |
| `--color-text` | `#18181B` | `#F4F4F5` | texte principal |
| `--color-text-secondary` | `#52525B` | `#A1A1AA` | texte secondaire, labels |
| `--color-text-tertiary` | `#A1A1AA` | `#6B6B72` | placeholder, désactivé |
| `--color-primary` | `#0F766E` (teal-700) | `#2DD4BF` (teal-400) | liens, sélection, highlight leader |
| `--color-primary-strong` | `#0D9488` | `#5EEAD4` | hover primaire |
| `--color-primary-soft` | `#CCFBF1` | `rgba(45,212,191,.14)` | fonds teintés (chip actif, leader) |
| `--color-accent` | `#D97706` (amber-600) | `#F59E0B` (amber-500) | CTA principal, eyebrow, victoires |
| `--color-accent-strong` | `#B45309` | `#FBBF24` | hover CTA |
| `--color-accent-soft` | `#FEF3C7` | `rgba(245,158,11,.14)` | fonds teintés accent |
| `--color-danger` | `#DC2626` | `#F87171` | actions destructives |
| `--color-danger-soft` | `#FEE2E2` | `rgba(248,113,113,.14)` | fonds teintés danger |

Primaire (teal) = état/sélection/navigation. Accent (amber) = action principale et données « positives » (victoires). Les deux sont volontairement non-violets pour éviter le cliché « gradient IA ».

**Avatars du podium** : palette de 6 teintes solides distinctes (teal, amber, bleu, rose, violet, lime), une couleur par joueur dérivée d'un hash de son id — usage de type « avatar Slack/GitHub », pas un gradient hero.

### Typographie

| Rôle | Police | Usage |
| --- | --- | --- |
| `--font-display` | Space Grotesk | titres (h1–h4), nom du gagnant, boutons primaires |
| `--font-body` | Manrope | texte courant, labels, tableaux |
| `--font-mono` | JetBrains Mono | scores et chiffres (tabular-nums) |

Choix volontaire d'éviter Inter/Roboto par défaut : Space Grotesk apporte du caractère (proche des outils dev denses) sans tomber dans l'esthétique « IA générique ».

| Style | Taille | Poids | Line-height | Police |
| --- | --- | --- | --- | --- |
| `--text-h1` | `clamp(1.75rem, 1.45rem + 1.3vw, 2.5rem)` | 700 | 1.15 | display |
| `--text-h2` | `clamp(1.375rem, 1.2rem + 0.7vw, 1.625rem)` | 700 | 1.2 | display |
| `--text-h3` | `1.0625rem` (17px) | 600 | 1.3 | display |
| `--text-h4` | `0.9375rem` (15px) | 600 | 1.35 | display |
| `--text-eyebrow` | `0.6875rem` (11px), uppercase, +0.08em | 600 | 1.2 | body |
| `--text-body` | `0.9375rem` (15px) | 400 | 1.55 | body |
| `--text-body-sm` | `0.8125rem` (13px) | 400 | 1.5 | body |
| `--text-caption` | `0.75rem` (12px) | 500 | 1.4 | body |
| `--text-score` | `clamp(2rem, 1.7rem + 1vw, 2.75rem)` | 500, tabular-nums | 1 | mono |

### Espacement (rythme 8px)

`--space-3xs: 2px` · `--space-2xs: 4px` · `--space-xs: 8px` · `--space-sm: 12px` · `--space-md: 16px` · `--space-lg: 24px` · `--space-xl: 32px` · `--space-2xl: 48px` · `--space-3xl: 64px`

### Rayons, ombres, transitions

- Radius : `--radius-sm: 6px` (inputs, chips) · `--radius-md: 10px` (cartes) · `--radius-lg: 16px` (modales) · `--radius-pill: 999px` (toggles, avatars, badges)
- Ombres : `--shadow-xs`, `--shadow-sm`, `--shadow-md` (cartes au survol), `--shadow-modal` (modales, diffuse, jamais d'offset dur coloré comme dans l'ancienne version)
- Transitions : `--transition-fast: 120ms ease` (hover/active) · `--transition-base: 180ms cubic-bezier(.4,0,.2,1)` (ouverture modale, toggle)
- Focus : anneau `box-shadow: 0 0 0 3px var(--color-primary-soft)` sur `:focus-visible` uniquement (jamais sur clic souris)

## 2. Écrans

L'app est une **page unique** avec modales (pas de navigation multi-pages). Sections dans l'ordre :

1. **Topbar** — titre, bouton aide (?), bouton thème clair/sombre.
2. **Configuration** — liste des joueurs (2 à 6, noms éditables), sélecteur de partie 60/120/180 (segmented control), toggles paliers / bonus deux rois noirs.
3. **Tableau des scores (live)** — grille de cartes par joueur, triées par score, badge « Leader » sur le premier.
4. **Ajouter une manche** — CTA principal + actions secondaires (supprimer dernière manche, nouvelle partie).
5. **Récapitulatif** — graphique en barres (score / victoires) + tableau détaillé (scroll horizontal si nécessaire).
6. **Règles** — résumé en 2 colonnes (1 colonne en mobile).
7. **Modales** — Nouvelle manche (scores + sélecteur Gabo en chips), Détail joueur, Aide/règles complètes, Podium de fin de partie.

### Adaptation par breakpoint

- **320–480px** : tout en une colonne, cartes de score empilées, chips Gabo/mode en wrap sur plusieurs lignes, tableau récap dans un conteneur `overflow-x: auto` dédié (jamais le body).
- **480–768px** : cartes de score en 2 colonnes (`auto-fit, minmax(160px,1fr)`), reste identique.
- **768–1024px** : règles en 2 colonnes, options de configuration sur une ligne.
- **1024–1440px+** : largeur de page plafonnée (`max-width: 1120px`), plus de colonnes de cartes.

Le `.score-grid` utilise une **container query** (`container-type: inline-size`) : chaque carte adapte son layout interne (nom + score en ligne vs empilés) selon sa propre largeur plutôt que le viewport — utile car le nombre de joueurs (2 à 6) change le nombre de colonnes indépendamment de la taille d'écran.

## 3. Composants et états

Chaque composant interactif définit : `default`, `hover`, `:focus-visible`, `active`, `disabled`, et `empty`/`loading` quand pertinent.

- **Boutons** : primaire (accent plein), secondaire (bordure), texte (sans fond), danger (rouge). Hauteur mini 44px. `disabled` = opacité 0.45 + `cursor: not-allowed`, pas de hover.
- **Segmented control** (mode 60/120/180, Gabo) : chips avec `input` natif caché + `label` stylée (`:has(:checked)`), min 44px de haut, wrap en mobile.
- **Toggles** (paliers, bonus) : switch stylé sur `input[type=checkbox]`, anneau focus visible au clavier.
- **Inputs** : bordure pleine + fond `--color-surface` (plus de simple soulignement), état `:invalid` visible (bordure danger), focus = anneau primaire.
- **Cartes de score** : bordure fine, ombre au survol (desktop uniquement), badge « Leader » sur le premier.
- **Tableau récap** : lignes zébrées légères, hover de ligne, cellules numériques alignées à droite en `--font-mono`.
- **Toasts** (`threshold-notice`) : composant à part entière (était non stylé avant) — position fixe haut, icône, bordure accent, `--shadow-md`, auto-dismiss déjà géré en JS.
- **Empty state** : « Aucune manche saisie » — bloc centré, icône trait fin (pas d'illustration stock), texte secondaire.
- **Loading** : l'app n'a aucune opération asynchrone (tout est local/synchrone via `localStorage`), donc aucun écran ne l'utilise réellement. Un utilitaire `.is-loading` (spinner CSS sur `--font-mono`) est tout de même défini dans le design system pour une future intégration backend, documenté ici plutôt que simulé artificiellement.
- **Modales** : `--shadow-modal`, `--radius-lg`, fond avec léger flou (`backdrop-filter: blur(4px)`), plus de shadow décalée colorée façon autocollant.

## 4. Icônes

Petit set de SVG inline (trait, `stroke="currentColor"`, 24×24, pas de librairie) : fermer, ajouter, supprimer, soleil/lune (thème), coche. Cohérent avec l'esthétique « outil », évite les émojis et les icônes remplies.

## 5. Mode sombre

- Par défaut : suit `prefers-color-scheme`.
- Bascule manuelle : bouton soleil/lune dans la topbar, préférence stockée dans `localStorage` (`gabo-scorekeeper-theme`), appliquée via `data-theme="light|dark"` sur `<html>`, qui prend le pas sur la préférence système.

## 6. Auto-revue

Vérifié en conditions réelles (`agent-browser`, app locale) à 320/390/420/768/1024/1440px, clair et sombre, avec une vraie partie jouée jusqu'au podium.

| Règle | Statut | Note |
| --- | --- | --- |
| Mobile-first, pas d'overflow horizontal à 320/390/768/1024/1440 | ✅ | `scrollWidth === clientWidth` vérifié à chaque largeur, modale ouverte comprise |
| Cibles tactiles ≥ 44×44px | ✅ (2 violations trouvées et corrigées) | `.close` n'avait aucune taille explicite (~18px réel) → fixé à 44×44 avec zone cliquable ronde. `.text-button` était à 40px de hauteur mini → remonté à 44px |
| États hover/focus/active/disabled | ✅ | définis pour tous les composants interactifs ; `:focus-visible` uniquement (pas d'anneau au clic souris) |
| Boutons sans classe explicite | ✅ (1 régression trouvée et corrigée) | `Voir le podium` / `Rejouer` n'avaient pas de className (hérité de l'ancien CSS qui stylait `.finish-actions button` implicitement) → rendus sans fond ni bordure dans le nouveau système. Corrigé en assignant `primary`/`secondary` explicitement dans le JSX plutôt que de recréer une règle implicite |
| État empty | ✅ | détail joueur sans manche, avec icône |
| État loading | ⚠️ | pas d'usage réel (app 100% synchrone) — utilitaire documenté mais non exercé dans l'UI |
| Pas de gradient violet sur blanc / hero générique | ✅ | palette teal + amber, pas de hero, pas d'illustration stock |
| Container queries « où pertinent » | ✅ | `.score-grid` uniquement (seul cas où la largeur du conteneur diverge du viewport) |
| Pas de sur-usage d'Inter/Roboto | ✅ | Space Grotesk / Manrope / JetBrains Mono |
| Dark mode | ✅ | suit `prefers-color-scheme` par défaut, bascule manuelle testée et persistée |
| `npm test` / `npm run build` | ✅ | 12/12 tests, build de production sans erreur après chaque changement |
