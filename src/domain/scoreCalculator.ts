export type ThresholdSettings = {
  thresholdsEnabled: boolean
  endScore: number
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
  if (totalScore === 120 && settings.endScore === 120 && settings.thresholdsEnabled) return { score: 60, thresholdApplied: 120, gameOver: true }
  if (totalScore >= settings.endScore) return { score: totalScore, thresholdApplied: null, gameOver: true }
  if (!settings.thresholdsEnabled) return { score: totalScore, thresholdApplied: null, gameOver: false }
  if (totalScore === 120 && settings.endScore >= 120) return { score: 60, thresholdApplied: 120, gameOver: true }
  if (totalScore === 100) return { score: 50, thresholdApplied: 100, gameOver: false }
  if (totalScore === 50) return { score: 25, thresholdApplied: 50, gameOver: false }
  if (totalScore >= settings.endScore) return { score: totalScore, thresholdApplied: null, gameOver: true }
  return { score: totalScore, thresholdApplied: null, gameOver: false }
}
