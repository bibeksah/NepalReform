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
}

type PublicProgressOverride = Partial<PublicProgressFields>

const TRACKER_BASE_URL = "https://tracker.nepalreforms.com"
const FEATURED_IDS = new Set(["1", "2", "3", "7", "11", "19"])

const STAGE_CONFIG: Record<PublicStage, { percent: number | null; label: string }> = {
  Proposed: { percent: 10, label: "Public proposal" },
  "Building Support": { percent: 22, label: "Building support" },
  "Under Review": { percent: 38, label: "Under review" },
  "Moving Forward": { percent: 58, label: "Moving forward" },
  "Partially Delivered": { percent: 78, label: "Partially delivered" },
  Delivered: { percent: 100, label: "Delivered" },
  Stalled: { percent: null, label: "Status unclear" },
}

const PUBLIC_PROGRESS_OVERRIDES: Record<string, PublicProgressOverride> = {
  "2": {
    publicStage: "Delivered",
    progressPercent: 100,
    progressLabel: "Delivered - 100% signal",
    trustLabel: "Completed public milestone",
    headlineUpdate: "Nepal completed the March 2026 parliamentary election.",
    statusReason:
      "This agenda is marked complete because the election milestone itself has already been delivered. Use the tracker for deeper post-election evidence and accountability review.",
    lastUpdated: "5 Mar 2026",
    trackerAvailable: true,
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

  if (/(delivered|completed|implemented|operational|launched|full independence achievement)/.test(text)) return "Partially Delivered"
  if (/(ongoing|during campaign|live|operational in pilot|establish|deployment|recruit|build political consensus)/.test(text)) return "Moving Forward"
  if (/(before nominations|under review|draft|bill|amendment|ordinance|court|legal reform)/.test(text)) return "Under Review"
  if (/(pilot|consensus|support|public|campaign|voting|community)/.test(text)) return "Building Support"
  return "Proposed"
}

function inferProgressPercent(stage: PublicStage, source: PublicProgressSource): number | null {
  if (stage === "Stalled") return null
  const solutionCount = source.solution?.short?.length ?? 0
  const implementationCount = source.implementation?.short?.length ?? 0
  const evidenceCount = source.realWorldEvidence?.short?.length ?? 0
  const activitySignals = solutionCount + implementationCount + evidenceCount
  const baseline = STAGE_CONFIG[stage].percent
  if (baseline == null) return null
  if (stage === "Proposed" && activitySignals <= 2) return 10
  if (stage === "Building Support" && activitySignals <= 3) return 20
  return baseline
}

function inferTrustLabel(source: PublicProgressSource, stage: PublicStage): string {
  const hasUpdatedOn = Boolean(normalizeText(source.updatedOn))
  const evidenceCount = source.realWorldEvidence?.short?.length ?? 0
  if (hasUpdatedOn && evidenceCount >= 2 && stage !== "Proposed") return "Tracker-backed summary available"
  if (evidenceCount > 0) return "Public summary with some evidence"
  return "Public summary only"
}

function inferHeadlineUpdate(source: PublicProgressSource, stage: PublicStage): string {
  if (normalizeText(source.updatedOn)) return `Latest public update was recorded on ${source.updatedOn}.`
  const implementationLead = safeFirst(source.implementation?.short)
  if (implementationLead) return implementationLead
  const solutionLead = safeFirst(source.solution?.short)
  if (solutionLead) return solutionLead
  return stage === "Proposed"
    ? "This agenda is presented as a public reform direction, not proof of delivery yet."
    : "This agenda has public movement signals, but the latest implementation state is still limited here."
}

function inferStatusReason(source: PublicProgressSource, stage: PublicStage): string {
  const timeline = normalizeText(source.timeline)
  if (normalizeText(source.updatedOn)) return `Public-facing status has a dated update${timeline ? ` and a ${timeline} delivery horizon` : ""}.`
  if (normalizeText(source.problem?.short)) return "Status is inferred from agenda language and implementation cues because a dated tracker update is not yet shown on this page."
  if (stage === "Proposed") return "This remains a public proposal signal until stronger implementation evidence is linked."
  return "Public status remains limited; use the tracker for deeper evidence where available."
}

export function derivePublicProgress(source: PublicProgressSource): PublicProgressFields {
  const override = PUBLIC_PROGRESS_OVERRIDES[source.id]
  const publicStage = override?.publicStage ?? inferStage(source)
  const progressPercent = Object.prototype.hasOwnProperty.call(override ?? {}, "progressPercent")
    ? override?.progressPercent ?? null
    : inferProgressPercent(publicStage, source)
  const trackerUrl = inferTrackerUrl(source.id)

  return {
    publicStage,
    progressPercent,
    progressLabel:
      override?.progressLabel ??
      (progressPercent == null ? STAGE_CONFIG[publicStage].label : `${STAGE_CONFIG[publicStage].label} - ${progressPercent}% signal`),
    trustLabel: override?.trustLabel ?? inferTrustLabel(source, publicStage),
    headlineUpdate: override?.headlineUpdate ?? inferHeadlineUpdate(source, publicStage),
    statusReason: override?.statusReason ?? inferStatusReason(source, publicStage),
    lastUpdated: Object.prototype.hasOwnProperty.call(override ?? {}, "lastUpdated")
      ? override?.lastUpdated ?? null
      : normalizeText(source.updatedOn) || null,
    trackerAvailable: Object.prototype.hasOwnProperty.call(override ?? {}, "trackerAvailable")
      ? Boolean(override?.trackerAvailable)
      : Boolean(trackerUrl),
    trackerUrl,
    featured: FEATURED_IDS.has(source.id),
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

