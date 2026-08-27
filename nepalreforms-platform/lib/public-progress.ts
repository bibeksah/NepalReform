import type { AgendaGraphStatus, AgendaPromiseLink } from "@/lib/tracker-graph"

export type PublicStage =
  | "Proposed"
  | "Building Support"
  | "Under Review"
  | "Moving Forward"
  | "Partially Delivered"
  | "Delivered"
  | "Stalled"

export interface PublicProgressFields {
  publicStage: PublicStage
  progressPercent: number | null
  progressLabel: string
  trustLabel: string
  headlineUpdate: string
  statusReason: string
  lastUpdated: string | null
  trackerAvailable: boolean
  trackerUrl: string | null
  featured: boolean
  promiseSourceTitle: string | null
  promiseSourceParty: string | null
  promiseSourceDocument: string | null
  promiseSourceQuote: string | null
  promiseSourceStatus: string
  promiseSourceAvailable: boolean
  promiseSourceCount: number
  graphStatus: AgendaGraphStatus | null
}

type PublicProgressSource = {
  id: string
  title: string
  description: string
  category: string
  priority: string
  timeline: string
  performanceTargets?: string[]
  problem?: { short?: string }
  solution?: { short?: string[] }
  implementation?: { short?: string[] }
  realWorldEvidence?: { short?: string[] }
  updatedOn?: string
  graphStatus?: AgendaGraphStatus | null
}

type PublicProgressOverride = Partial<PublicProgressFields>

const TRACKER_BASE_URL = "https://tracker.nepalreforms.com"
const STATIC_SNAPSHOT_UPDATED_AT = "2026-04-03T11:15:00Z"
const FEATURED_IDS = new Set(["1", "2", "3", "7", "11", "19"])

const STAGE_CONFIG: Record<PublicStage, { label: string }> = {
  Proposed: { label: "Proposal only" },
  "Building Support": { label: "Promise linkage found" },
  "Under Review": { label: "Under review" },
  "Moving Forward": { label: "Movement detected" },
  "Partially Delivered": { label: "Partially delivered" },
  Delivered: { label: "Delivered" },
  Stalled: { label: "Status unclear" },
}

const PUBLIC_PROGRESS_OVERRIDES: Record<string, PublicProgressOverride> = {
  "2": {
    publicStage: "Delivered",
    progressPercent: 100,
    progressLabel: "Delivered milestone verified",
    trustLabel: "Election milestone completed",
    headlineUpdate: "Nepal completed the March 2026 parliamentary election.",
    statusReason:
      "This agenda is treated as delivered because the election milestone itself has already happened. Promise linkage and post-election accountability evidence should be tracked separately.",
    lastUpdated: "5 Mar 2026",
    trackerAvailable: true,
    promiseSourceTitle: null,
    promiseSourceParty: null,
    promiseSourceDocument: null,
    promiseSourceQuote: null,
    promiseSourceStatus: "No verified manifesto promise link is published in the tracker graph for this agenda yet.",
    promiseSourceAvailable: false,
    promiseSourceCount: 0,
  },
}

function safeFirst(items?: string[], fallback?: string) {
  if (!Array.isArray(items)) return fallback ?? ""
  return items.find((item) => typeof item === "string" && item.trim())?.trim() ?? (fallback ?? "")
}

function normalizeText(value?: string | null) {
  return typeof value === "string" ? value.trim() : ""
}

function inferTrackerUrl(id: string): string {
  return `${TRACKER_BASE_URL}/agenda/${encodeURIComponent(id)}`
}

function inferStage(source: PublicProgressSource): PublicStage {
  const graphStatus = source.graphStatus
  if ((graphStatus?.directPromiseLinks ?? 0) > 0) return "Building Support"

  const text = [
    source.title,
    source.description,
    source.timeline,
    source.updatedOn,
    source.problem?.short,
    ...(source.solution?.short ?? []),
    ...(source.implementation?.short ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  if (/(ongoing|in progress|underway|deployment|pilot)/.test(text)) return "Moving Forward"
  if (/(under review|draft|bill|amendment|ordinance|court|legal reform)/.test(text)) return "Under Review"
  return "Proposed"
}

function inferProgressPercent(source: PublicProgressSource): number | null {
  if (source.id === "2") return 100
  return null
}

function inferTrustLabel(source: PublicProgressSource): string {
  const graphStatus = source.graphStatus
  if ((graphStatus?.directPromiseLinks ?? 0) > 0) return "Static graph snapshot with verified promise linkage"
  if (graphStatus) return "Static graph snapshot checked, but promise linkage is still missing"
  return "Public summary only"
}

function inferHeadlineUpdate(source: PublicProgressSource): string {
  const graphStatus = source.graphStatus
  const directPromiseLinks = graphStatus?.directPromiseLinks ?? 0
  if (directPromiseLinks > 0) {
    return `Tracker graph links ${directPromiseLinks} promise${directPromiseLinks === 1 ? "" : "s"} to this agenda.`
  }
  if (normalizeText(source.updatedOn)) return `Latest public update was recorded on ${source.updatedOn}.`
  const implementationLead = safeFirst(source.implementation?.short)
  if (implementationLead) return implementationLead
  const solutionLead = safeFirst(source.solution?.short)
  if (solutionLead) return solutionLead
  return "This agenda is visible publicly, but delivery progress is not numerically verified here yet."
}

function inferStatusReason(source: PublicProgressSource, stage: PublicStage): string {
  const graphStatus = source.graphStatus
  const directPromiseLinks = graphStatus?.directPromiseLinks ?? 0

  if (source.id === "2") {
    return "This agenda is marked as delivered because the election milestone itself has already happened. Promise linkage should still come from explicit graph evidence, not assumption."
  }

  if (directPromiseLinks > 0) {
    return "This page uses verified agenda-to-promise links from a static public snapshot exported from the tracker graph. A numeric progress bar stays unfilled until delivery evidence is strong enough to justify a real percentage."
  }

  if (graphStatus) {
    return "The static public snapshot was checked, but no verified promise link is currently published for this agenda. A numeric delivery percentage would be misleading, so it is intentionally withheld."
  }

  if (stage === "Proposed") {
    return "This remains a public proposal view until the tracker graph publishes verified promise linkage or delivery evidence."
  }

  return "Public status remains limited; numeric delivery progress is intentionally withheld until stronger evidence is available."
}

function sortPromiseLinks(links: AgendaPromiseLink[]): AgendaPromiseLink[] {
  return [...links].sort((left, right) => {
    const leftScore = Number(Boolean(left.sourceExcerpt)) * 4 + Number(Boolean(left.documentName || left.sourceReference)) * 2 + Number(Boolean(left.promiseTitle))
    const rightScore = Number(Boolean(right.sourceExcerpt)) * 4 + Number(Boolean(right.documentName || right.sourceReference)) * 2 + Number(Boolean(right.promiseTitle))
    return rightScore - leftScore
  })
}

function pickPrimaryPromiseLink(graphStatus?: AgendaGraphStatus | null): AgendaPromiseLink | null {
  const links = sortPromiseLinks((graphStatus?.promiseLinks ?? []).filter((item) => item.promiseId || item.promiseTitle))
  return links[0] ?? null
}

function formatDocumentLabel(link: AgendaPromiseLink | null): string | null {
  if (!link) return null
  const explicit = normalizeText(link.documentName)
  if (explicit) return explicit

  const sourceReference = normalizeText(link.sourceReference)
  if (!sourceReference) return null

  const lowered = sourceReference.toLowerCase()
  if (lowered.includes("bacha") && lowered.includes("patra")) return "Bacha Patra"
  if (lowered.includes("manifesto") && lowered.includes("rsp")) return "RSP manifesto"

  const parts = sourceReference.split(/[\\/]/).filter(Boolean)
  return parts[parts.length - 1] ?? sourceReference
}

function inferPartyLabel(link: AgendaPromiseLink | null): string | null {
  if (!link) return null
  const haystack = `${link.documentName} ${link.sourceReference}`.toLowerCase()
  if (haystack.includes("rsp") || (haystack.includes("bacha") && haystack.includes("patra"))) return "RSP"
  return null
}

function formatQuote(excerpt: string | null | undefined): string | null {
  const normalized = normalizeText(excerpt)
  return normalized || null
}

function inferPromiseSource(source: PublicProgressSource) {
  const graphStatus = source.graphStatus
  const override = PUBLIC_PROGRESS_OVERRIDES[source.id]
  const primaryLink = pickPrimaryPromiseLink(graphStatus)
  const promiseCount = graphStatus?.directPromiseLinks ?? 0

  if (override && typeof override.promiseSourceAvailable === "boolean") {
    return {
      promiseSourceTitle: Object.prototype.hasOwnProperty.call(override, "promiseSourceTitle") ? override.promiseSourceTitle ?? null : null,
      promiseSourceParty: Object.prototype.hasOwnProperty.call(override, "promiseSourceParty") ? override.promiseSourceParty ?? null : null,
      promiseSourceDocument: Object.prototype.hasOwnProperty.call(override, "promiseSourceDocument") ? override.promiseSourceDocument ?? null : null,
      promiseSourceQuote: Object.prototype.hasOwnProperty.call(override, "promiseSourceQuote") ? override.promiseSourceQuote ?? null : null,
      promiseSourceStatus: override.promiseSourceStatus ?? "",
      promiseSourceAvailable: Boolean(override.promiseSourceAvailable),
      promiseSourceCount: override.promiseSourceCount ?? 0,
    }
  }

  if (primaryLink) {
    return {
      promiseSourceTitle: normalizeText(primaryLink.promiseTitle) || null,
      promiseSourceParty: inferPartyLabel(primaryLink),
      promiseSourceDocument: formatDocumentLabel(primaryLink),
      promiseSourceQuote: formatQuote(primaryLink.sourceExcerpt),
      promiseSourceStatus:
        promiseCount > 1
          ? `Static graph snapshot links ${promiseCount} promises to this agenda. Showing one linked promise here.`
          : "Static graph snapshot has a verified promise link for this agenda.",
      promiseSourceAvailable: true,
      promiseSourceCount: promiseCount || 1,
    }
  }

  return {
    promiseSourceTitle: null,
    promiseSourceParty: null,
    promiseSourceDocument: null,
    promiseSourceQuote: null,
    promiseSourceStatus: graphStatus
      ? "No verified manifesto promise link is published in the static graph snapshot for this agenda yet."
      : "Static graph snapshot data is not available on this page right now.",
    promiseSourceAvailable: false,
    promiseSourceCount: 0,
  }
}

export function derivePublicProgress(source: PublicProgressSource): PublicProgressFields {
  const override = PUBLIC_PROGRESS_OVERRIDES[source.id]
  const publicStage = override?.publicStage ?? inferStage(source)
  const progressPercent = Object.prototype.hasOwnProperty.call(override ?? {}, "progressPercent")
    ? override?.progressPercent ?? null
    : inferProgressPercent(source)
  const trackerUrl = inferTrackerUrl(source.id)
  const promiseSource = inferPromiseSource(source)
  const graphStatus = source.graphStatus ?? null

  let progressLabel = STAGE_CONFIG[publicStage].label
  if (progressPercent != null) {
    progressLabel = override?.progressLabel ?? `${STAGE_CONFIG[publicStage].label} - ${progressPercent}% verified`
  } else if (promiseSource.promiseSourceCount > 0) {
    progressLabel = `${promiseSource.promiseSourceCount} linked promise${promiseSource.promiseSourceCount === 1 ? "" : "s"}; delivery progress not verified`
  } else {
    progressLabel = "Delivery progress not verified yet"
  }

  return {
    publicStage,
    progressPercent,
    progressLabel,
    trustLabel: override?.trustLabel ?? inferTrustLabel(source),
    headlineUpdate: override?.headlineUpdate ?? inferHeadlineUpdate(source),
    statusReason: override?.statusReason ?? inferStatusReason(source, publicStage),
    lastUpdated: Object.prototype.hasOwnProperty.call(override ?? {}, "lastUpdated")
      ? override?.lastUpdated ?? null
      : normalizeText(source.updatedOn) || normalizeText(graphStatus?.updatedAt) || STATIC_SNAPSHOT_UPDATED_AT,
    trackerAvailable: Object.prototype.hasOwnProperty.call(override ?? {}, "trackerAvailable")
      ? Boolean(override?.trackerAvailable)
      : Boolean(trackerUrl),
    trackerUrl,
    featured: FEATURED_IDS.has(source.id),
    promiseSourceTitle: promiseSource.promiseSourceTitle,
    promiseSourceParty: promiseSource.promiseSourceParty,
    promiseSourceDocument: promiseSource.promiseSourceDocument,
    promiseSourceQuote: promiseSource.promiseSourceQuote,
    promiseSourceStatus: promiseSource.promiseSourceStatus,
    promiseSourceAvailable: promiseSource.promiseSourceAvailable,
    promiseSourceCount: promiseSource.promiseSourceCount,
    graphStatus,
  }
}

export function withPublicProgress<T extends PublicProgressSource>(source: T): T & PublicProgressFields {
  return { ...source, ...derivePublicProgress(source) }
}

export function getStageTone(stage: PublicStage) {
  switch (stage) {
    case "Delivered":
    case "Partially Delivered":
      return "text-emerald-700 border-emerald-200 bg-emerald-50"
    case "Moving Forward":
      return "text-blue-700 border-blue-200 bg-blue-50"
    case "Under Review":
      return "text-amber-700 border-amber-200 bg-amber-50"
    case "Building Support":
      return "text-violet-700 border-violet-200 bg-violet-50"
    case "Stalled":
      return "text-rose-700 border-rose-200 bg-rose-50"
    default:
      return "text-slate-700 border-slate-200 bg-slate-50"
  }
}