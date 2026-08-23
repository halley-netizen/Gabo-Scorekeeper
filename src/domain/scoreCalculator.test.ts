import { describe, expect, it } from 'vitest'
import { applyThreshold } from './scoreCalculator'

const enabled = { thresholdsEnabled: true, endScore: 120 }

describe('applyThreshold', () => {
  it('keeps 53 unchanged because only exact thresholds apply', () => {
    expect(applyThreshold(53, enabled)).toEqual({ score: 53, thresholdApplied: null, gameOver: false })
  })

  it('keeps 104 unchanged because only exact thresholds apply', () => {
    expect(applyThreshold(104, enabled)).toEqual({ score: 104, thresholdApplied: null, gameOver: false })
  })

  it('applies the exact 120 threshold and ends the game', () => {
    expect(applyThreshold(120, enabled)).toEqual({ score: 60, thresholdApplied: 120, gameOver: true })
    expect(applyThreshold(123, enabled)).toEqual({ score: 123, thresholdApplied: null, gameOver: true })
  })

  it('keeps 49 unchanged and applies exact 50', () => {
    expect(applyThreshold(49, enabled).score).toBe(49)
    expect(applyThreshold(50, enabled).score).toBe(25)
  })

  it('keeps 99 unchanged and applies exact 100', () => {
    expect(applyThreshold(99, enabled).score).toBe(99)
    expect(applyThreshold(100, enabled).score).toBe(50)
  })

  it('does not apply thresholds when disabled', () => {
    expect(applyThreshold(53, { thresholdsEnabled: false, endScore: 120 })).toEqual({ score: 53, thresholdApplied: null, gameOver: false })
  })

  it('uses a custom end score before applying any threshold', () => {
    expect(applyThreshold(80, { thresholdsEnabled: true, endScore: 80 })).toEqual({ score: 80, thresholdApplied: null, gameOver: true })
  })

  it('does not reduce an already finished score', () => {
    expect(applyThreshold(53, { ...enabled, gameOver: true })).toEqual({ score: 53, thresholdApplied: null, gameOver: true })
  })
})
