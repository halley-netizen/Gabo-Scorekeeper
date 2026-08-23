import { FormEvent, useEffect, useMemo, useState } from 'react'

type Player = { id: string; name: string }
type Round = { id: string; scores: Record<string, number>; createdAt: string }
type Game = { players: Player[]; rounds: Round[]; victories: Record<string, number>; threshold: number; stepsEnabled: boolean; negativeScores: boolean; finished: boolean }

const STORAGE_KEY = 'gabo-scorekeeper-game'
const MAX_ROUND_SCORE = 45
const steps = [{ at: 50, resetTo: 25 }, { at: 100, resetTo: 50 }, { at: 120, resetTo: 60 }]

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

function calculateTotals(game: Game): Record<string, number> {
  const totals = Object.fromEntries(game.players.map((player) => [player.id, 0])) as Record<string, number>
  for (const round of game.rounds) {
    for (const player of game.players) {
      totals[player.id] += round.scores[player.id] ?? 0
      if (game.stepsEnabled) {
        const step = [...steps].reverse().find((item) => totals[player.id] >= item.at)
        if (step) totals[player.id] = step.resetTo
      }
    }
  }
  return totals
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

function App() {
  const [game, setGame] = useState<Game>(loadGame)
  const [showRules, setShowRules] = useState(false)
  const [roundOpen, setRoundOpen] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const totals = useMemo(() => calculateTotals(game), [game])
  const victories = useMemo(() => calculateVictories(game), [game])
  const orderedPlayers = useMemo(() => [...game.players].sort((a, b) => totals[a.id] - totals[b.id]), [game.players, totals])
  const roundsPlayed = (playerId: string) => game.rounds.filter((round) => Number.isInteger(round.scores[playerId])).length
  const summaryPlayers = useMemo(() => [...game.players].sort((a, b) => roundsPlayed(b.id) - roundsPlayed(a.id) || totals[a.id] - totals[b.id]), [game.players, game.rounds, totals])
  const highestScore = Math.max(...game.players.map((player) => totals[player.id]), 1)
  const highestVictories = Math.max(...game.players.map((player) => victories[player.id] ?? 0), 1)
  const selectedPlayer = game.players.find((player) => player.id === selectedPlayerId)

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(game)), [game])

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
    if (Object.values(scores).some((score) => !Number.isInteger(score) || score < (game.negativeScores ? -9999 : 0) || score > MAX_ROUND_SCORE)) {
      window.alert(`Chaque score doit être un entier compris entre ${game.negativeScores ? '-9999' : '0'} et ${MAX_ROUND_SCORE}.`)
      return
    }
    const nextGame = { ...game, rounds: [...game.rounds, { id: crypto.randomUUID(), scores, createdAt: new Date().toISOString() }] }
    const nextTotals = calculateTotals(nextGame)
    const finished = Object.values(nextTotals).some((total) => total >= game.threshold)
    updateGame({ rounds: nextGame.rounds, finished })
    setRoundOpen(false)
  }

  return <main className="app-shell">
    <header className="topbar">
      <div><p className="eyebrow">Carnet de table</p><h1>Gabo <span>Scorekeeper</span></h1></div>
      <button className="icon-button" onClick={() => setShowRules(true)} aria-label="Ouvrir les règles">?</button>
    </header>

    {game.finished && <section className="finish-banner"><div><p className="eyebrow">Partie terminée</p><h2>{orderedPlayers[0].name} gagne la partie</h2><p>Le score le plus bas remporte Gabo.</p></div><div className="finish-actions"><button onClick={() => resetGame(true)}>Rejouer</button><button className="secondary" onClick={startNewGame}>Nouvelle partie</button></div></section>}

    <section className="setup-panel">
      <div className="section-heading"><div><p className="eyebrow">Configuration</p><h2>Les joueurs</h2></div><span className="count">{game.players.length}/6</span></div>
      <div className="player-list">{game.players.map((player, index) => <div className="player-row" key={player.id}><span className="player-number">0{index + 1}</span><input value={player.name} onChange={(event) => updatePlayer(player.id, event.target.value)} aria-label={`Nom du joueur ${index + 1}`} /><button className="remove" onClick={() => removePlayer(player.id)} disabled={game.players.length <= 2} aria-label={`Supprimer ${player.name}`}>x</button></div>)}</div>
      <button className="add-player" onClick={addPlayer} disabled={game.players.length >= 6}>+ Ajouter un joueur</button>
      <div className="options-grid"><label>Seuil de fin<input type="number" min="1" value={game.threshold} onChange={(event) => updateGame({ threshold: Math.max(1, Number(event.target.value)) })} /></label><label className="toggle-label"><input type="checkbox" checked={game.stepsEnabled} onChange={(event) => updateGame({ stepsEnabled: event.target.checked })} /><span className="toggle" /> Paliers activés</label><label className="toggle-label"><input type="checkbox" checked={game.negativeScores} onChange={(event) => updateGame({ negativeScores: event.target.checked })} /><span className="toggle" /> Bonus des deux rois noirs (-15)</label></div>
    </section>

    <section className="score-section"><div className="section-heading"><div><p className="eyebrow">En direct</p><h2>Tableau des scores</h2></div><span className="round-count">{game.rounds.length} manche{game.rounds.length > 1 ? 's' : ''}</span></div><div className="score-grid">{orderedPlayers.map((player, index) => <button className={`score-card ${index === 0 ? 'leader' : ''}`} key={player.id} onClick={() => setSelectedPlayerId(player.id)} aria-label={`Voir les scores de ${player.name}`}><div className="rank">#{index + 1}</div><h3>{player.name}</h3><strong>{totals[player.id]}</strong><small>{victories[player.id] ?? 0} victoire{(victories[player.id] ?? 0) > 1 ? 's' : ''} · détails</small></button>)}</div></section>

    <section className="action-panel"><div><p className="eyebrow">À la table</p><h2>Ajouter une manche</h2><p className="muted">Saisissez les points de chacun, puis validez.</p></div><button className="primary" onClick={() => setRoundOpen(true)} disabled={game.finished}>+ Nouvelle manche</button>{game.rounds.length > 0 && <button className="text-button" onClick={deleteLastRound}>Supprimer la dernière manche</button>}<button className="text-button danger-button" onClick={startNewGame}>Nouvelle partie</button></section>

    <section className="summary-section"><div className="section-heading"><div><p className="eyebrow">Récapitulatif</p><h2>Manches & victoires</h2></div></div><div className="analytics-chart"><div className="chart-legend"><span><i className="legend-score" /> Score total</span><span><i className="legend-wins" /> Victoires</span></div>{summaryPlayers.map((player) => { const score = totals[player.id]; const playerVictories = victories[player.id] ?? 0; return <div className="chart-row" key={player.id}><div className="chart-name"><strong>{player.name}</strong><small>{roundsPlayed(player.id)} manche{roundsPlayed(player.id) > 1 ? 's' : ''}</small></div><div className="chart-bars"><div className="bar-line"><span className="bar-value">{score}</span><div className="bar-track"><div className="bar-fill score-fill" style={{ width: `${Math.max((score / highestScore) * 100, score > 0 ? 4 : 0)}%` }} /></div></div><div className="bar-line"><span className="bar-value wins">{playerVictories}</span><div className="bar-track"><div className="bar-fill wins-fill" style={{ width: `${playerVictories ? Math.max((playerVictories / highestVictories) * 100, 4) : 0}%` }} /></div></div></div></div> })}</div><div className="summary-table-wrap"><table className="summary-table"><thead><tr><th>Rang</th><th>Joueur</th><th>Manches</th><th>Score</th><th>Victoires</th></tr></thead><tbody>{summaryPlayers.map((player, index) => <tr key={player.id}><td>#{index + 1}</td><td>{player.name}</td><td>{roundsPlayed(player.id)}</td><td>{totals[player.id]}</td><td className="wins">{victories[player.id] ?? 0}</td></tr>)}</tbody></table></div></section>

    <section className="rules-summary"><p className="eyebrow">À retenir</p><h2>Récapitulatif des règles</h2><div className="rules-columns"><p><strong>But</strong><br />Obtenir le moins de points possible. Une manche se joue généralement avec 4 cartes par joueur.</p><p><strong>Score</strong><br />Dans cette version, le plafond est fixé à 45 points par joueur et par manche. Le barème exact pouvant varier selon les groupes, confirmez cette limite avec votre variante. Les deux rois noirs donnent -15 points, avec un minimum de 0 par défaut.</p><p><strong>Fin</strong><br />Le seuil est fixé à 120 points par défaut. Quand il est atteint, le joueur au score final le plus bas gagne, même si un autre joueur a déclenché la fin.</p><p><strong>Paliers</strong><br />Quand ils sont activés : 50 devient 25, 100 devient 50 et 120 devient 60. Les variantes peuvent différer selon les groupes.</p></div><button className="text-button" onClick={() => setShowRules(true)}>Lire les règles détaillées</button></section>

    {roundOpen && <div className="modal-backdrop"><form className="round-modal" onSubmit={submitRound}><button type="button" className="close" onClick={() => setRoundOpen(false)} aria-label="Fermer">x</button><p className="eyebrow">Manche {game.rounds.length + 1}</p><h2>Entrer les scores</h2>{game.players.map((player) => <label key={player.id}>{player.name}<input name={player.id} type="number" min={game.negativeScores ? undefined : 0} max={MAX_ROUND_SCORE} step="1" required autoComplete="off" placeholder="0" /></label>)}<p className="modal-note">Maximum par joueur et par manche : {MAX_ROUND_SCORE} points. Le bonus des deux rois noirs correspond à un score de manche réduit de 15 points.</p><button className="primary" type="submit">Valider la manche</button></form></div>}
    {selectedPlayer && <div className="modal-backdrop"><section className="round-modal player-details"><button type="button" className="close" onClick={() => setSelectedPlayerId(null)} aria-label="Fermer">x</button><p className="eyebrow">Détail du joueur</p><h2>{selectedPlayer.name}</h2><div className="detail-total"><strong>{totals[selectedPlayer.id]}</strong><span>points après paliers</span></div><p className="detail-raw-total">Somme des scores saisis : <strong>{calculateRawTotal(game, selectedPlayer.id)} points</strong></p><div className="detail-list">{game.rounds.length ? game.rounds.map((round, index) => <div className="detail-row" key={round.id}><span>Manche {index + 1}</span><strong>{round.scores[selectedPlayer.id] ?? 0} points</strong></div>) : <p className="muted">Aucune manche saisie.</p>}</div><p className="modal-note">Victoires : {victories[selectedPlayer.id] ?? 0}. Les scores affichés correspondent aux valeurs saisies pour chaque manche. Avec les paliers activés, le total peut être inférieur à leur somme.</p></section></div>}
    {showRules && <div className="modal-backdrop"><section className="round-modal rules"><button type="button" className="close" onClick={() => setShowRules(false)} aria-label="Fermer">x</button><p className="eyebrow">Aide</p><h2>Les règles du Gabo</h2><p>Le but est d'obtenir le moins de points possible. Chaque joueur reçoit généralement 4 cartes et tente de terminer la manche avec le meilleur score.</p><h3>Calcul</h3><p>Entrez directement le score de la manche. Avec les deux rois noirs, appliquez le bonus de -15 points. Le score est limité à 0, sauf si les scores négatifs sont activés.</p><h3>Fin de partie</h3><p>La partie s'arrête lorsqu'un total atteint le seuil configuré. Le gagnant est le joueur au total final le plus bas.</p><p className="modal-note">Les règles peuvent varier selon les groupes et les variantes jouées.</p></section></div>}
  </main>
}

export default App
