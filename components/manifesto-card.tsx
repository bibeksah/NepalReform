"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import { AgendaVoteSection } from "@/components/agenda-vote-section"
import { ManifestoSummaryItem } from "@/hooks/use-manifesto-data"
import { AgendaProgressBar } from "@/components/agenda-progress-bar"
import { getStageTone } from "@/lib/public-progress"
import { cn } from "@/lib/utils"

interface ManifestoCardProps { item: ManifestoSummaryItem }

function getCategoryColor(category: string) {
  const colors = {
    "Anti-Corruption": "bg-red-100 text-red-800 border-red-200",
    "Electoral Reform": "bg-blue-100 text-blue-800 border-blue-200",
    Federalism: "bg-green-100 text-green-800 border-green-200",
    Transparency: "bg-purple-100 text-purple-800 border-purple-200",
    Governance: "bg-orange-100 text-orange-800 border-orange-200",
    "Constitutional Reform": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Digital Governance": "bg-teal-100 text-teal-800 border-teal-200",
    "Procurement Reform": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Competition Policy": "bg-pink-100 text-pink-800 border-pink-200",
    Transportation: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Education: "bg-lime-100 text-lime-800 border-lime-200",
    "Economic Development": "bg-amber-100 text-amber-800 border-amber-200",
    "Education Reform": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Security Reform": "bg-slate-100 text-slate-800 border-slate-200",
    "Investment Policy": "bg-violet-100 text-violet-800 border-violet-200",
    "Civil Service Reform": "bg-rose-100 text-rose-800 border-rose-200",
    "Judicial Reform": "bg-sky-100 text-sky-800 border-sky-200",
    "Financial Transparency": "bg-stone-100 text-stone-800 border-stone-200",
    "Public Administration": "bg-neutral-100 text-neutral-800 border-neutral-200",
    Healthcare: "bg-red-100 text-red-800 border-red-200",
    "Social Protection": "bg-blue-100 text-blue-800 border-blue-200",
    "Financial Management": "bg-green-100 text-green-800 border-green-200",
  }
  return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function ManifestoCard({ item }: ManifestoCardProps) {
  return (
    <Card className="group h-full border-slate-200 bg-white/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", getCategoryColor(item.category))}>{item.category}</Badge>
          <Badge variant="outline" className={cn("text-xs", getStageTone(item.publicStage))}>{item.publicStage}</Badge>
          {item.featured && <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">Featured</Badge>}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl leading-tight text-slate-950 group-hover:text-primary">{item.title}</CardTitle>
          <p className="text-sm leading-6 text-slate-600">{item.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <AgendaProgressBar value={item.progressPercent} label={item.progressLabel} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Latest public update</div>
            <p className="mt-1 text-sm text-slate-700">{item.headlineUpdate}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Trust signal</div>
            <p className="mt-1 text-sm text-slate-700">{item.trustLabel}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800"><Clock className="h-4 w-4 text-slate-500" />{item.lastUpdated ? `Last updated ${item.lastUpdated}` : "No dated update shown on this public page yet"}</div>
          <p className="mt-2 text-sm text-slate-600">{item.statusReason}</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-900"><FileText className="h-4 w-4 text-violet-600" />Promise provenance</div>
          <p className="mt-2 text-sm text-slate-700">
            {item.promiseSourceParty && item.promiseSourceDocument
              ? `${item.promiseSourceParty} / ${item.promiseSourceDocument}`
              : "Winning-party promise source not linked yet"}
          </p>
          <p className="mt-2 text-sm text-slate-600">{item.promiseSourceStatus}</p>
          {item.promiseSourceQuote ? (
            <blockquote className="mt-3 rounded-lg border-l-4 border-violet-300 bg-white/80 px-3 py-2 text-sm italic text-slate-700">
              &ldquo;{item.promiseSourceQuote}&rdquo;
            </blockquote>
          ) : (
            <p className="mt-3 text-xs text-slate-500">Exact supporting quote is not linked on the public page yet.</p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild className="sm:flex-1"><Link href={`/agenda/${item.id}`}>Read agenda summary<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          {item.trackerAvailable && item.trackerUrl ? (
            <Button asChild variant="outline" className="sm:flex-1 bg-transparent"><Link href={item.trackerUrl} target="_blank" rel="noreferrer">Open tracker evidence<ExternalLink className="ml-2 h-4 w-4" /></Link></Button>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 sm:flex-1">Tracker depth is not linked for this agenda yet.</div>
          )}
        </div>
        <div className="border-t border-slate-200 pt-4"><AgendaVoteSection agendaId={item.id} size="sm" /></div>
      </CardContent>
    </Card>
  )
}
