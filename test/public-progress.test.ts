import { describe, it, expect } from 'bun:test'
import { derivePublicProgress, getStageTone, withPublicProgress } from '@/lib/public-progress'

describe('public-progress helper', () => {
  it('should derive default stage as Proposed when no signals present', () => {
    const item = {
      id: '99',
      title: 'Sample Proposed Reform',
      description: 'A brand new reform proposal with no movement.',
      category: 'Governance',
      priority: 'Medium',
      timeline: '2026-2027',
    }

    const progress = derivePublicProgress(item)
    expect(progress.publicStage).toBe('Proposed')
    expect(progress.progressPercent).toBeNull()
    expect(progress.trustLabel).toBe('Public summary only')
  })

  it('should infer Under Review stage when legal words are present', () => {
    const item = {
      id: '50',
      title: 'Judicial Amendment Draft',
      description: 'The draft bill is currently under review by parliamentary committee.',
      category: 'Justice',
      priority: 'High',
      timeline: '6 months',
    }

    const progress = derivePublicProgress(item)
    expect(progress.publicStage).toBe('Under Review')
  })

  it('should infer Moving Forward stage when movement words are present', () => {
    const item = {
      id: '51',
      title: 'Digital ID Card Deployment',
      description: 'Pilot deployment is ongoing in 3 provinces.',
      category: 'Digital Governance',
      priority: 'High',
      timeline: '1 year',
    }

    const progress = derivePublicProgress(item)
    expect(progress.publicStage).toBe('Moving Forward')
  })

  it('should infer Building Support when graph status has promise links', () => {
    const item = {
      id: '52',
      title: 'Anti-Corruption Court Reform',
      description: 'Establish special fast-track courts.',
      category: 'Anti-Corruption',
      priority: 'High',
      timeline: '1 year',
      graphStatus: {
        agendaId: '52',
        agendaItemId: 'item-52',
        title: 'Anti-Corruption Court Reform',
        updatedAt: '2026-03-01T00:00:00Z',
        active: true,
        priority: 'High',
        timeline: '1 year',
        solutionPlans: 1,
        implementationPlans: 1,
        evidenceSummaries: 1,
        performanceTargets: 2,
        alignmentAssessments: 1,
        relationTypes: ['PROMISES'],
        directPromiseLinks: 2,
        promiseLinks: [
          {
            promiseId: 'prom-1',
            promiseTitle: 'Establish Fast-Track Courts',
            relationType: 'DIRECT',
            alignmentAssessmentId: 'align-1',
            documentId: 'doc-1',
            documentName: 'RSP Bacha Patra',
            sourceReference: 'Manifesto 2026',
            sourcePage: 12,
            sourceExcerpt: 'We will establish fast-track corruption courts within 100 days.',
          },
        ],
      },
    }

    const progress = derivePublicProgress(item)
    expect(progress.publicStage).toBe('Building Support')
    expect(progress.trustLabel).toBe('Static graph snapshot with verified promise linkage')
    expect(progress.promiseSourceParty).toBe('RSP')
    expect(progress.promiseSourceCount).toBe(2)
  })

  it('should apply manual overrides for milestone agenda #2', () => {
    const item = {
      id: '2',
      title: 'Parliamentary Elections Milestone',
      description: 'Complete general election.',
      category: 'Democracy',
      priority: 'High',
      timeline: 'Completed',
    }

    const progress = derivePublicProgress(item)
    expect(progress.publicStage).toBe('Delivered')
    expect(progress.progressPercent).toBe(100)
    expect(progress.progressLabel).toBe('Delivered milestone verified')
  })

  it('should return correct tone classes for each stage', () => {
    expect(getStageTone('Delivered')).toContain('emerald')
    expect(getStageTone('Moving Forward')).toContain('blue')
    expect(getStageTone('Under Review')).toContain('amber')
    expect(getStageTone('Building Support')).toContain('violet')
    expect(getStageTone('Stalled')).toContain('rose')
    expect(getStageTone('Proposed')).toContain('slate')
  })

  it('should augment source object using withPublicProgress', () => {
    const item = {
      id: '1',
      title: 'CIAA Independence',
      description: 'Make CIAA independent.',
      category: 'Anti-Corruption',
      priority: 'High',
      timeline: '2 years',
    }

    const merged = withPublicProgress(item)
    expect(merged.id).toBe('1')
    expect(merged.publicStage).toBeDefined()
    expect(merged.trackerUrl).toContain('https://tracker.nepalreforms.com/agenda/1')
  })
})
