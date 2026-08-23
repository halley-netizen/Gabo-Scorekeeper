import { FormEvent, useEffect, useMemo, useState } from 'react'
import { applyThreshold, RoundProgress } from './domain/scoreCalculator'

type Player = { id: string; name: string }
type Round = { id: string; scores: Record<string, number>; results?: Record<string, RoundProgress>; createdAt: string }
type Game = { players: Player[]; rounds: Round[]; victories: Record<string, number>; threshold: number; stepsEnabled: boolean; negativeScores: boolean; finished: boolean }

const STORAGE_KEY = 'gabo-scorekeeper-game'
const MAX_ROUND_SCORE = 45
const MIN_ROUND_SCORE_WITH_BONUS = -15
const newPlayer = (index: number): Player => ({ id: crypto.randomUUID(), name: `Joueur ${index}` })
const emptyGame = (): Game => ({ players: [newPlayer(1), newPlayer(2)], rounds: [], victories: {}, threshold: 120, stepsEnabled: true, negativeScores: false, finished: false })

function loadGame(): Game {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return emptyGame()
    const parsed = JSON.parse(saved) as Partial<Game>
    return { ...emptyGame(), ...parsed, victories: parsed.victories ?? {} }
  } catch { return emptyGame() }
}

function calculateProgress(game: Game): { totals: Record<string, number>; roundResults: Array<Record<string, RoundProgress>> } {
  const totals = Object.fromEntries(game.players.map((player) => [player.id, 0])) as Record<string, number>
  const roundResults: Array<Record<string, RoundProgress>> = []
  const gameOverByPlayer = Object.fromEntries(game.players.map((player) => [player.id, false])) as Record<string, boolean>
  for (const round of game.rounds) {
    const results: Record<string, RoundProgress> = {}
    for (const player of game.players) {
      const score = round.scores[player.id] ?? 0
      const totalBefore = totals[player.id] + score
      const result = applyThreshold(totalBefore, { thresholdsEnabled: game.stepsEnabled, endScore: game.threshold, gameOver: gameOverByPlayer[player.id] })
      totals[player.id] = result.score
      results[player.id] = { ...result, totalBefore }
      if (result.gameOver) gameOverByPlayer[player.id] = true
    }
    roundResults.push(results)
  }
  return { totals, roundResults }
}

function calculateTotals(game: Game): Record<string, number> {
  return calculateProgress(game).totals
}

function calculateVictories(game: Game): Record<string, number> {
  const victories = Object.fromEntries(game.players.map((player) => [player.id, 0])) as Record<string, number>
  for (const round of game.rounds) {
    const scores = game.players.map((player) => round.scores[player.id]).filter((score): score is number => Number.isInteger(score))
    if (!scores.length) continue
    const lowest = Math.min(...scores)
    for (const player of game.players) if (round.scores[player.id] === lowest) victories[player.id]++
  }
  return victories
}

function calculateRawTotal(game: Game, playerId: string): number {
  return game.rounds.reduce((total, round) => total + (round.scores[playerId] ?? 0), 0)
}

function calculateAppliedSteps(game: Game, playerId: string): Array<{ round: number; at: number; resetTo: number }> {
  const stepHistory: Array<{ round: number; at: number; resetTo: number }> = []
  const progress = calculateProgress(game)
  for (const [index, results] of progress.roundResults.entries()) {
    const result = results[playerId]
    if (result?.thresholdApplied === 50) stepHistory.push({ round: index + 1, at: 50, resetTo: 25 })
    if (result?.thresholdApplied === 100) stepHistory.push({ round: index + 1, at: 100, resetTo: 50 })
    if (result?.thresholdApplied === 120) stepHistory.push({ round: index + 1, at: 120, resetTo: 60 })
  }
  return stepHistory
}

function App() {
  const [game, setGame] = useState<Game>(loadGame)
  const [showRules, setShowRules] = useState(false)
  const [roundOpen, setRoundOpen] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [thresholdNotice, setThresholdNotice] = useState<string | null>(null)
  const totals = useMemo(() => calculateTotals(game), [game])
  const victories = useMemo(() => calculateVictories(game), [game])
  const orderedPlayers = useMemo(() => [...game.players].sort((a, b) => totals[a.id] - totals[b.id]), [game.players, totals])
  const roundsPlayed = (playerId: string) => game.rounds.filter((round) => Number.isInteger(round.scores[playerId])).length
  const summaryPlayers = useMemo(() => [...game.players].sort((a, b) => roundsPlayed(b.id) - roundsPlayed(a.id) || totals[a.id] - totals[b.id]), [game.players, game.rounds, totals])
  const highestScore = Math.max(...game.players.map((player) => totals[player.id]), 1)
  const highestVictories = Math.max(...game.players.map((player) => victories[player.id] ?? 0), 1)
  const selectedPlayer = game.players.find((player) => player.id === selectedPlayerId)

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(game)), [game])
  useEffect(() => {
    if (!thresholdNotice) return
    const timeout = window.setTimeout(() => setThresholdNotice(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [thresholdNotice])

  function updateGame(patch: Partial<Game>) { setGame((current) => ({ ...current, ...patch })) }
  function resetGame(samePlayers = false) {
    setGame((current) => ({ ...emptyGame(), players: samePlayers ? current.players : emptyGame().players }))
    setRoundOpen(false)
  }
  function startNewGame() {
    if (!window.confirm('Démarrer une nouvelle partie ? Tous les joueurs, scores, manches et options actuels seront supprimés.')) return
    resetGame()
  }
  function addPlayer() {
    if (game.players.length < 6) updateGame({ players: [...game.players, newPlayer(game.players.length + 1)] })
  }
  function updatePlayer(id: string, name: string) { updateGame({ players: game.players.map((player) => player.id === id ? { ...player, name } : player) }) }
  function removePlayer(id: string) { if (game.players.length > 2) updateGame({ players: game.players.filter((player) => player.id !== id) }) }
  function deleteLastRound() {
    if (!game.rounds.length || !window.confirm('Supprimer la dernière manche ?')) return
    updateGame({ rounds: game.rounds.slice(0, -1), finished: false })
  }

  function submitRound(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const scores = Object.fromEntries(game.players.map((player) => [player.id, Number(data.get(player.id))]))
    if (Object.values(scores).some((score) => !Number.isInteger(score) || score < (game.negativeScores ? MIN_ROUND_SCORE_WITH_BONUS : 0) || score > MAX_ROUND_SCORE)) {
      window.alert(`Chaque score doit être un entier compris entre ${game.negativeScores ? MIN_ROUND_SCORE_WITH_BONUS : '0'} et ${MAX_ROUND_SCORE}.`)
      return
    }
    const nextGame = { ...game, rounds: [...game.rounds, { id: crypto.randomUUID(), scores, createdAt: new Date().toISOString() }] }
    const progress = calculateProgress(nextGame)
    const results = progress.roundResults.at(-1) ?? {}
    const finished = Object.values(results).some((result) => result.gameOver)
    nextGame.rounds[nextGame.rounds.length - 1].results = results
    const applied = Object.values(results).find((result) => result.thresholdApplied !== null)
    if (applied) setThresholdNotice(`Palier atteint : le score redescend à ${applied.score} points.`)
    if (finished) setThresholdNotice('Fin de partie : le score réel est conservé.')
    updateGame({ rounds: nextGame.rounds, finished })
    setRoundOpen(false)
  }

  return <main className="app-shell">
    <header className="topbar">
      <div><p className="eyebrow">Carnet de table</p><h1>Gabo <span>Scorekeeper</span></h1></div>
      <button className="icon-button" onClick={() => setShowRules(true)} aria-label="Ouvrir les règles">?</button>
    </header>

    {thresholdNotice && <div className="threshold-notice" role="status">{thresholdNotice}</div>}

    {game.finished && <section className="finish-banner"><div><p className="eyebrow">Partie terminée</p><h2>{orderedPlayers[0].name} gagne la partie</h2><p>Le score le plus bas remporte Gabo.</p></div><div className="finish-actions"><button onClick={() => resetGame(true)}>Rejouer</button><button className="secondary" onClick={startNewGame}>Nouvelle partie</button></div></section>}

    <section className="setup-panel">
      <div className="section-heading"><div><p className="eyebrow">Configuration</p><h2>Les joueurs</h2></div><span className="count">{game.players.length}/6</span></div>
      <div className="player-list">{game.players.map((player, index) => <div className="player-row" key={player.id}><span className="player-number">0{index + 1}</span><input value={player.name} onChange={(event) => updatePlayer(player.id, event.target.value)} aria-label={`Nom du joueur ${index + 1}`} /><button className="remove" onClick={() => removePlayer(player.id)} disabled={game.players.length <= 2} aria-label={`Supprimer ${player.name}`}>x</button></div>)}</div>
      <button className="add-player" onClick={addPlayer} disabled={game.players.length >= 6}>+ Ajouter un joueur</button>
      <div className="options-grid"><label>Seuil de fin<input type="number" min="1" value={game.threshold} onChange={(event) => updateGame({ threshold: Math.max(1, Number(event.target.value)) })} /></label><label className="toggle-label"><input type="checkbox" checked={game.stepsEnabled} onChange={(event) => updateGame({ stepsEnabled: event.target.checked })} /><span className="toggle" /> Paliers activés</label><label className="toggle-label"><input type="checkbox" checked={game.negativeScores} onChange={(event) => updateGame({ negativeScores: event.target.checked })} /><span className="toggle" /> Bonus des deux rois noirs (-15)</label></div>
    </section>

    <section className="score-section"><div className="section-heading"><div><p className="eyebrow">En direct</p><h2>Tableau des scores</h2></div><span className="round-count">{game.rounds.length} manche{game.rounds.length > 1 ? 's' : ''}</span></div><div className="score-grid">{orderedPlayers.map((player, index) => <button className={`score-card ${index === 0 ? 'leader' : ''}`} key={player.id} onClick={() => setSelectedPlayerId(player.id)} aria-label={`Voir les scores de ${player.name}`}><div className="rank">#{index + 1}</div><h3>{player.name}</h3><strong>{totals[player.id]}</strong><small>après paliers · {calculateRawTotal(game, player.id)} saisis</small><small>{victories[player.id] ?? 0} victoire{(victories[player.id] ?? 0) > 1 ? 's' : ''} · détails</small></button>)}</div></section>

    <section className="action-panel"><div><p className="eyebrow">À la table</p><h2>Ajouter une manche</h2><p className="muted">Saisissez les points de chacun, puis validez.</p></div><button className="primary" onClick={() => setRoundOpen(true)} disabled={game.finished}>+ Nouvelle manche</button>{game.rounds.length > 0 && <button className="text-button" onClick={deleteLastRound}>Supprimer la dernière manche</button>}<button className="text-button danger-button" onClick={startNewGame}>Nouvelle partie</button></section>

    <section className="summary-section"><div className="section-heading"><div><p className="eyebrow">Récapitulatif</p><h2>Manches & victoires</h2></div></div><div className="analytics-chart"><div className="chart-legend"><span><i className="legend-score" /> Score après paliers</span><span><i className="legend-wins" /> Victoires</span></div>{summaryPlayers.map((player) => { const score = totals[player.id]; const playerVictories = victories[player.id] ?? 0; return <div className="chart-row" key={player.id}><div className="chart-name"><strong>{player.name}</strong><small>{roundsPlayed(player.id)} manche{roundsPlayed(player.id) > 1 ? 's' : ''}</small></div><div className="chart-bars"><div className="bar-line"><span className="bar-value">{score}</span><div className="bar-track"><div className="bar-fill score-fill" style={{ width: `${Math.max((score / highestScore) * 100, score > 0 ? 4 : 0)}%` }} /></div></div><div className="bar-line"><span className="bar-value wins">{playerVictories}</span><div className="bar-track"><div className="bar-fill wins-fill" style={{ width: `${playerVictories ? Math.max((playerVictories / highestVictories) * 100, 4) : 0}%` }} /></div></div></div></div> })}</div><div className="summary-table-wrap"><table className="summary-table"><thead><tr><th>Rang</th><th>Joueur</th><th>Manches</th><th>Score actuel</th><th>Total saisi</th><th>Paliers</th><th>Victoires</th></tr></thead><tbody>{summaryPlayers.map((player, index) => <tr key={player.id}><td>#{index + 1}</td><td>{player.name}</td><td>{roundsPlayed(player.id)}</td><td>{totals[player.id]}</td><td>{calculateRawTotal(game, player.id)}</td><td className="steps-cell">{calculateAppliedSteps(game, player.id).length || '—'}</td><td className="wins">{victories[player.id] ?? 0}</td></tr>)}</tbody></table></div></section>

    <section className="rules-summary"><p className="eyebrow">À retenir</p><h2>Récapitulatif des règles</h2><div className="rules-columns"><p><strong>But</strong><br />Obtenir le moins de points possible. Une manche se joue généralement avec 4 cartes par joueur.</p><p><strong>Score</strong><br />Dans cette version, le score va de 0 à 45 par joueur et par manche. Avec le bonus des deux rois noirs activé, le minimum devient -15 et ne peut pas être dépassé vers le bas.</p><p><strong>Fin</strong><br />Le seuil est fixé à 120 points par défaut. À 120 exactement, le score devient 60 et la partie se termine. Au-dessus de 120, le score réel est conservé et la partie se termine.</p><p><strong>Paliers exacts</strong><br />Quand ils sont activés : exactement 50 devient 25, exactement 100 devient 50 et exactement 120 devient 60. Un score de 53, 99 ou 121 reste inchangé.</p></div><button className="text-button" onClick={() => setShowRules(true)}>Lire les règles détaillées</button></section>

    {roundOpen && <div className="modal-backdrop"><form className="round-modal" onSubmit={submitRound}><button type="button" className="close" onClick={() => setRoundOpen(false)} aria-label="Fermer">x</button><p className="eyebrow">Manche {game.rounds.length + 1}</p><h2>Entrer les scores</h2>{game.players.map((player) => <label key={player.id}>{player.name}<input name={player.id} type="number" min={game.negativeScores ? MIN_ROUND_SCORE_WITH_BONUS : 0} max={MAX_ROUND_SCORE} step="1" required autoComplete="off" placeholder="0" /></label>)}<p className="modal-note">Score par joueur et par manche : de {game.negativeScores ? MIN_ROUND_SCORE_WITH_BONUS : 0} à {MAX_ROUND_SCORE}. Le bonus des deux rois noirs peut produire au maximum -15 points.</p><button className="primary" type="submit">Valider la manche</button></form></div>}
    {selectedPlayer && <div className="modal-backdrop"><section className="round-modal player-details"><button type="button" className="close" onClick={() => setSelectedPlayerId(null)} aria-label="Fermer">x</button><p className="eyebrow">Détail du joueur</p><h2>{selectedPlayer.name}</h2><div className="detail-total"><strong>{totals[selectedPlayer.id]}</strong><span>points après paliers</span></div><p className="detail-raw-total">Somme des scores saisis : <strong>{calculateRawTotal(game, selectedPlayer.id)} points</strong></p><div className="detail-list">{game.rounds.length ? game.rounds.map((round, index) => { const result = round.results?.[selectedPlayer.id]; return <div className="detail-row detail-round" key={round.id}><div><span>Manche {index + 1}</span>{result && <small>Total avant palier : {result.totalBefore}</small>}</div><strong>{round.scores[selectedPlayer.id] ?? 0} points{result?.thresholdApplied ? ` · ${result.thresholdApplied} → ${result.score}` : ''}</strong>{result?.gameOver && <small className="game-over-label">Fin de partie · score réel conservé</small>}</div> }) : <p className="muted">Aucune manche saisie.</p>}</div><div className="step-history"><strong>Paliers déclenchés</strong>{calculateAppliedSteps(game, selectedPlayer.id).length ? calculateAppliedSteps(game, selectedPlayer.id).map((step) => <div className="step-history-row" key={`${step.round}-${step.at}`}><span>Manche {step.round}</span><strong>{step.at} → {step.resetTo}</strong></div>) : <p className="muted">Aucun palier déclenché.</p>}</div><p className="modal-note">Victoires : {victories[selectedPlayer.id] ?? 0}. Les scores affichés correspondent aux valeurs saisies pour chaque manche.</p></section></div>}
    {showRules && <div className="modal-backdrop"><section className="round-modal rules"><button type="button" className="close" onClick={() => setShowRules(false)} aria-label="Fermer">x</button><p className="eyebrow">Aide</p><h2>Les règles du Gabo</h2><p>Le but est d'obtenir le moins de points possible. Chaque joueur reçoit généralement 4 cartes et tente de terminer la manche avec le meilleur score.</p><h3>Pouvoirs des cartes</h3><div className="card-powers-table-wrap"><table className="card-powers-table"><thead><tr><th>Carte</th><th>Pouvoir</th></tr></thead><tbody><tr><td>7 ou 8</td><td>Regarder une de ses propres cartes</td></tr><tr><td>9 ou 10</td><td>Regarder une carte d'un adversaire</td></tr><tr><td>Valet ou Dame</td><td>Échanger une de ses cartes avec celle d'un adversaire sans regarder la carte donnée</td></tr><tr><td>Roi</td><td>Carte polyvalente : choisir l'un des pouvoirs ci-dessus, selon l'action souhaitée</td></tr></tbody></table></div><p className="modal-note">Le Roi combine les pouvoirs des cartes précédentes. Les pouvoirs peuvent varier selon les groupes et les variantes du Gabo. Les deux rois noirs conservent en plus leur règle spéciale de score.</p><h3>Calcul</h3><p>Entrez directement le score de la manche. Avec les deux rois noirs, appliquez le bonus de -15 points. Le score est limité à 0, sauf si les scores négatifs sont activés.</p><h3>Paliers exacts</h3><p>Un total exactement égal à 50 devient 25. Un total exactement égal à 100 devient 50. Un total exactement égal à 120 devient 60 et termine la partie. Les totaux supérieurs à 120 gardent leur score réel; les totaux comme 53, 99 ou 104 restent inchangés.</p><h3>Fin de partie</h3><p>La partie s'arrête lorsqu'un total atteint ou dépasse le seuil configuré. Le gagnant est le joueur au total final le plus bas.</p><p className="modal-note">Les règles peuvent varier selon les groupes et les variantes jouées.</p></section></div>}
  </main>
}

export default App
