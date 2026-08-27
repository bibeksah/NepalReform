import trackerGraphSnapshot from "@/lib/tracker-graph-snapshot.json"

export interface AgendaPromiseLink {
  promiseId: string
  promiseTitle: string
  relationType: string
  alignmentAssessmentId: string
  documentId: string
  documentName: string
  sourceReference: string
  sourcePage: number | null
  sourceExcerpt: string
}

export interface AgendaGraphStatus {
  agendaId: string
  agendaItemId: string
  title: string
  updatedAt: string | null
  active: boolean
  priority: string
  timeline: string
  solutionPlans: number
  implementationPlans: number
  evidenceSummaries: number
  performanceTargets: number
  alignmentAssessments: number
  relationTypes: string[]
  directPromiseLinks: number
  promiseLinks: AgendaPromiseLink[]
}

function normalizePromiseLink(value: unknown): AgendaPromiseLink | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  const promiseId = typeof raw.promiseId === "string" ? raw.promiseId.trim() : ""
  const promiseTitle = typeof raw.promiseTitle === "string" ? raw.promiseTitle.trim() : ""
  if (!promiseId && !promiseTitle) return null

  return {
    promiseId,
    promiseTitle,
    relationType: typeof raw.relationType === "string" ? raw.relationType.trim() : "",
    alignmentAssessmentId: typeof raw.alignmentAssessmentId === "string" ? raw.alignmentAssessmentId.trim() : "",
    documentId: typeof raw.documentId === "string" ? raw.documentId.trim() : "",
    documentName: typeof raw.documentName === "string" ? raw.documentName.trim() : "",
    sourceReference: typeof raw.sourceReference === "string" ? raw.sourceReference.trim() : "",
    sourcePage: typeof raw.sourcePage === "number" ? raw.sourcePage : null,
    sourceExcerpt: typeof raw.sourceExcerpt === "string" ? raw.sourceExcerpt.trim() : "",
  }
}

function normalizeAgendaGraphStatus(value: unknown): AgendaGraphStatus | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  const agendaId = typeof raw.agendaId === "string" ? raw.agendaId.trim() : ""
  if (!agendaId) return null

  const promiseLinks = Array.isArray(raw.promiseLinks)
    ? raw.promiseLinks.map(normalizePromiseLink).filter((item): item is AgendaPromiseLink => Boolean(item))
    : []

  return {
    agendaId,
    agendaItemId: typeof raw.agendaItemId === "string" ? raw.agendaItemId.trim() : "",
    title: typeof raw.title === "string" ? raw.title : "",
    updatedAt: typeof raw.updatedAt === "string" && raw.updatedAt.trim() ? raw.updatedAt.trim() : null,
    active: raw.active !== false,
    priority: typeof raw.priority === "string" ? raw.priority.trim() : "",
    timeline: typeof raw.timeline === "string" ? raw.timeline.trim() : "",
    solutionPlans: typeof raw.solutionPlans === "number" ? raw.solutionPlans : 0,
    implementationPlans: typeof raw.implementationPlans === "number" ? raw.implementationPlans : 0,
    evidenceSummaries: typeof raw.evidenceSummaries === "number" ? raw.evidenceSummaries : 0,
    performanceTargets: typeof raw.performanceTargets === "number" ? raw.performanceTargets : 0,
    alignmentAssessments: typeof raw.alignmentAssessments === "number" ? raw.alignmentAssessments : 0,
    relationTypes: Array.isArray(raw.relationTypes)
      ? raw.relationTypes.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [],
    directPromiseLinks: typeof raw.directPromiseLinks === "number" ? raw.directPromiseLinks : promiseLinks.length,
    promiseLinks,
  }
}

function getSnapshotAgendaGraphStatus(ids: string[]): Record<string, AgendaGraphStatus> {
  const normalizedIds = new Set(ids.map((value) => value.trim()).filter(Boolean))
  const payload = trackerGraphSnapshot as { data?: unknown[] }
  const items = Array.isArray(payload?.data) ? payload.data : []

  return items.reduce((acc: Record<string, AgendaGraphStatus>, item: unknown) => {
    const normalized = normalizeAgendaGraphStatus(item)
    if (!normalized) return acc
    if (normalizedIds.size > 0 && !normalizedIds.has(normalized.agendaId)) return acc
    acc[normalized.agendaId] = normalized
    return acc
  }, {})
}

async function getLiveAgendaGraphStatus(ids: string[]): Promise<Record<string, AgendaGraphStatus>> {
  try {
    const params = new URLSearchParams()
    params.set("ids", ids.join(","))
    const response = await fetch(`/api/tracker/agendas/graph-status?${params.toString()}`, {
      cache: "no-store",
    })
    if (!response.ok) return {}

    const payload: { data?: unknown[] } = await response.json()
    const items = Array.isArray(payload?.data) ? payload.data : []
    return items.reduce((acc: Record<string, AgendaGraphStatus>, item: unknown) => {
      const normalized = normalizeAgendaGraphStatus(item)
      if (normalized) acc[normalized.agendaId] = normalized
      return acc
    }, {})
  } catch (error) {
    console.error("Failed to load live agenda graph status", error)
    return {}
  }
}

export async function fetchAgendaGraphStatus(ids: string[]): Promise<Record<string, AgendaGraphStatus>> {
  const normalizedIds = Array.from(new Set(ids.map((value) => value.trim()).filter(Boolean)))
  if (!normalizedIds.length) return {}

  const snapshotResults = getSnapshotAgendaGraphStatus(normalizedIds)
  const missingIds = normalizedIds.filter((id) => !snapshotResults[id])
  if (!missingIds.length) return snapshotResults

  const liveResults = await getLiveAgendaGraphStatus(missingIds)
  return { ...snapshotResults, ...liveResults }
}
