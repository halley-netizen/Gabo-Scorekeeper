export type GameMode = 60 | 120 | 180

export type GameModeConfig = { endScore: number; steps: number[] }

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  60: { endScore: 60, steps: [50, 60] },
  120: { endScore: 120, steps: [50, 100, 120] },
  180: { endScore: 180, steps: [50, 100, 150, 180] },
}

export type ThresholdSettings = {
  thresholdsEnabled: boolean
  steps: number[]
  gameOver?: boolean
}

export type ThresholdResult = {
  score: number
  thresholdApplied: number | null
  gameOver: boolean
}

export type RoundProgress = ThresholdResult & {
  totalBefore: number
}

export function applyThreshold(totalScore: number, settings: ThresholdSettings): ThresholdResult {
  if (settings.gameOver) return { score: totalScore, thresholdApplied: null, gameOver: true }
  const endScore = settings.steps[settings.steps.length - 1]
  if (totalScore >= endScore) {
    if (settings.thresholdsEnabled && totalScore === endScore) {
      return { score: Math.floor(totalScore / 2), thresholdApplied: totalScore, gameOver: true }
    }
    return { score: totalScore, thresholdApplied: null, gameOver: true }
  }
  if (settings.thresholdsEnabled && settings.steps.includes(totalScore)) {
    return { score: Math.floor(totalScore / 2), thresholdApplied: totalScore, gameOver: false }
  }
  return { score: totalScore, thresholdApplied: null, gameOver: false }
}
