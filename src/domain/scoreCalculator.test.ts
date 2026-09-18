import { describe, expect, it } from 'vitest'
import { applyThreshold, GAME_MODES } from './scoreCalculator'

const mode120 = { thresholdsEnabled: true, steps: GAME_MODES[120].steps }

describe('applyThreshold - mode 120', () => {
  it('keeps 53 unchanged because only exact thresholds apply', () => {
    expect(applyThreshold(53, mode120)).toEqual({ score: 53, thresholdApplied: null, gameOver: false })
  })

  it('keeps 104 unchanged because only exact thresholds apply', () => {
    expect(applyThreshold(104, mode120)).toEqual({ score: 104, thresholdApplied: null, gameOver: false })
  })

  it('applies the exact 120 threshold and ends the game', () => {
    expect(applyThreshold(120, mode120)).toEqual({ score: 60, thresholdApplied: 120, gameOver: true })
    expect(applyThreshold(123, mode120)).toEqual({ score: 123, thresholdApplied: null, gameOver: true })
  })

  it('keeps 49 unchanged and applies exact 50', () => {
    expect(applyThreshold(49, mode120).score).toBe(49)
    expect(applyThreshold(50, mode120).score).toBe(25)
  })

  it('keeps 99 unchanged and applies exact 100', () => {
    expect(applyThreshold(99, mode120).score).toBe(99)
    expect(applyThreshold(100, mode120).score).toBe(50)
  })

  it('does not apply thresholds when disabled', () => {
    expect(applyThreshold(53, { thresholdsEnabled: false, steps: GAME_MODES[120].steps })).toEqual({ score: 53, thresholdApplied: null, gameOver: false })
  })

  it('ends the game at the raw score when disabled and above the end score', () => {
    expect(applyThreshold(120, { thresholdsEnabled: false, steps: GAME_MODES[120].steps })).toEqual({ score: 120, thresholdApplied: null, gameOver: true })
  })

  it('does not reduce an already finished score', () => {
    expect(applyThreshold(53, { ...mode120, gameOver: true })).toEqual({ score: 53, thresholdApplied: null, gameOver: true })
  })
})

describe('applyThreshold - mode 60', () => {
  const mode60 = { thresholdsEnabled: true, steps: GAME_MODES[60].steps }

  it('applies exact 50 then ends the game at exact 60', () => {
    expect(applyThreshold(50, mode60)).toEqual({ score: 25, thresholdApplied: 50, gameOver: false })
    expect(applyThreshold(60, mode60)).toEqual({ score: 30, thresholdApplied: 60, gameOver: true })
  })

  it('preserves the raw score above 60', () => {
    expect(applyThreshold(65, mode60)).toEqual({ score: 65, thresholdApplied: null, gameOver: true })
  })
})

describe('applyThreshold - mode 180', () => {
  const mode180 = { thresholdsEnabled: true, steps: GAME_MODES[180].steps }

  it('applies exact 50, 100 and 150, then ends the game at exact 180', () => {
    expect(applyThreshold(50, mode180)).toEqual({ score: 25, thresholdApplied: 50, gameOver: false })
    expect(applyThreshold(100, mode180)).toEqual({ score: 50, thresholdApplied: 100, gameOver: false })
    expect(applyThreshold(150, mode180)).toEqual({ score: 75, thresholdApplied: 150, gameOver: false })
    expect(applyThreshold(180, mode180)).toEqual({ score: 90, thresholdApplied: 180, gameOver: true })
  })

  it('preserves the raw score above 180', () => {
    expect(applyThreshold(181, mode180)).toEqual({ score: 181, thresholdApplied: null, gameOver: true })
  })
})
