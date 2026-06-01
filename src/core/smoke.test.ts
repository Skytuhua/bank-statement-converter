import { describe, it, expect } from 'vitest'

// Baseline test to verify the test runner is wired up (Gate 3).
describe('toolchain smoke test', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2)
  })
})
