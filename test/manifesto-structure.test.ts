import { describe, it, expect } from 'bun:test'
import { manifestoData } from '@/lib/manifesto-data'

describe('manifesto data integrity', () => {
  it('should contain all reform proposals', () => {
    expect(manifestoData.length).toBeGreaterThanOrEqual(27)
  })

  it('every agenda item must conform to the required ManifestoItem contract', () => {
    manifestoData.forEach((item, index) => {
      // Basic identification
      expect(item.id, `Item ${index} missing id`).toBeTruthy()
      expect(item.title, `Item ${index} missing title`).toBeTruthy()
      expect(item.description, `Item ${index} missing description`).toBeTruthy()
      expect(item.category, `Item ${index} missing category`).toBeTruthy()
      expect(['High', 'Medium', 'Low']).toContain(item.priority)

      // Problem structure
      expect(item.problem, `Item ${index} missing problem`).toBeDefined()
      expect(item.problem.short, `Item ${index} missing problem.short`).toBeTruthy()
      expect(item.problem.long, `Item ${index} missing problem.long`).toBeTruthy()

      // Solution structure
      expect(Array.isArray(item.solution.short), `Item ${index} solution.short must be array`).toBe(true)
      expect(item.solution.short.length).toBeGreaterThan(0)
      expect(Array.isArray(item.solution.long.phases), `Item ${index} solution.long.phases must be array`).toBe(true)
      expect(item.solution.long.phases.length).toBeGreaterThan(0)

      // Real-world evidence
      expect(Array.isArray(item.realWorldEvidence.short), `Item ${index} realWorldEvidence.short must be array`).toBe(true)
      expect(Array.isArray(item.realWorldEvidence.long), `Item ${index} realWorldEvidence.long must be array`).toBe(true)

      // Implementation
      expect(Array.isArray(item.implementation.short), `Item ${index} implementation.short must be array`).toBe(true)
      expect(Array.isArray(item.implementation.long), `Item ${index} implementation.long must be array`).toBe(true)

      // Performance targets
      expect(Array.isArray(item.performanceTargets), `Item ${index} performanceTargets must be array`).toBe(true)
    })
  })

  it('all agenda IDs must be unique', () => {
    const ids = manifestoData.map((item) => item.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
