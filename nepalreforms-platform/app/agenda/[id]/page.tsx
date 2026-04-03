"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Globe, Scale, Target, TrendingUp, Users, ChevronRight, FileText } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AgendaVoteSection } from "@/components/agenda-vote-section"
import { SuggestionSection } from "@/components/suggestion-section"
import { ShareDialog } from "@/components/share-dialog"
import { PhaseCollapsible } from "@/components/phase-collapsible"
import { useAgendaSummary, useAgendaDetail, CombinedManifestoItem } from "@/hooks/use-agenda-detail"
import { useManifestoData } from "@/hooks/use-manifesto-data"
import { AgendaProgressBar } from "@/components/agenda-progress-bar"
import { TrackerHandoffCard } from "@/components/tracker-handoff-card"
import { getStageTone } from "@/lib/public-progress"
import { cn } from "@/lib/utils"

export default function AgendaPage() {
  const params = useParams()
  const agendaId = params?.id as string
  const [mounted, setMounted] = useState(false)
  const { manifestoData } = useManifestoData()
  const totalReforms = manifestoData.length || 31
  const { summaryData, loading: summaryLoading } = useAgendaSummary(agendaId)
  const { combinedData, loading: detailLoading, error } = useAgendaDetail(agendaId, summaryData || undefined)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <AgendaPageSkeleton />
  if (error || (!summaryLoading && !detailLoading && !combinedData)) notFound()
  if (summaryLoading || detailLoading || !combinedData) return <AgendaPageSkeleton />
  return <AgendaPageContent item={combinedData} totalReforms={totalReforms} />
}

function AgendaPageContent({ item, totalReforms }: { item: CombinedManifestoItem; totalReforms: number }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6"><Link href="/#agendas-section"><Button variant="outline" size="sm" className="gap-2 bg-transparent"><ArrowLeft className="h-4 w-4" />Back to agenda explorer</Button></Link></div>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("text-sm", getCategoryColor(item.category))}>{item.category}</Badge>
                <Badge variant="outline" className={cn("text-sm", getStageTone(item.publicStage))}>{item.publicStage}</Badge>
                <Badge variant="outline" className="text-sm border-slate-200 bg-slate-50 text-slate-700">#{item.id}</Badge>
              </div>
              <div className="mt-4 space-y-4"><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{item.title}</h1><p className="text-lg leading-8 text-slate-600">{item.description}</p></div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-slate-500">Headline update</div><p className="mt-2 text-sm text-slate-700">{item.headlineUpdate}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-slate-500">Trust framing</div><p className="mt-2 text-sm text-slate-700">{item.trustLabel}</p></div>
              </div>
              <div className="mt-6 space-y-4">
                <AgendaProgressBar value={item.progressPercent} label={item.progressLabel} />
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600"><div className="flex items-center gap-2 font-medium text-slate-800"><Clock className="h-4 w-4" />{item.lastUpdated ? `Last updated ${item.lastUpdated}` : "No dated public update is shown here yet"}</div><p className="mt-2">{item.statusReason}</p></div>
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-medium text-violet-900"><FileText className="h-4 w-4 text-violet-600" />Promise provenance</div>
                  <p className="mt-2">{item.promiseSourceParty && item.promiseSourceDocument ? `${item.promiseSourceParty} / ${item.promiseSourceDocument}` : "Winning-party promise source not linked yet"}</p>
                  <p className="mt-2 text-slate-600">{item.promiseSourceStatus}</p>
                  {item.promiseSourceQuote ? (
                    <blockquote className="mt-3 rounded-xl border-l-4 border-violet-300 bg-white/80 px-4 py-3 italic text-slate-700">ï¿½{item.promiseSourceQuote}ï¿½</blockquote>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">Exact supporting quote is not linked on the public page yet.</p>
                  )}
                </div>
              </div>
              <div className="mt-6"><TrackerHandoffCard trackerAvailable={item.trackerAvailable} trackerUrl={item.trackerUrl} /></div>
            </section>

            <Card><CardHeader><CardTitle>What problem this agenda is trying to fix</CardTitle></CardHeader><CardContent className="space-y-4">{item.problem.short ? <div className="rounded-xl border-l-4 border-rose-400 bg-rose-50 p-4 text-sm text-slate-700">{item.problem.short}</div> : null}<div className="rounded-xl border-l-4 border-rose-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">{item.problem.long}</div></CardContent></Card>

            <Card>
              <CardHeader><CardTitle>Roadmap and proposed changes</CardTitle></CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="summary">Summary</TabsTrigger><TabsTrigger value="phases">Detailed phases</TabsTrigger></TabsList>
                  <TabsContent value="summary" className="mt-4"><div className="space-y-3">{item.solution.short.map((solution, index) => <div key={index} className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50 p-4 text-sm text-slate-700">{solution}</div>)}</div></TabsContent>
                  <TabsContent value="phases" className="mt-4 space-y-4">{item.solution.long.phases.map((phase, phaseIndex) => <PhaseCollapsible key={phaseIndex} phase={phase} index={phaseIndex} />)}</TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-green-600" />Real-world evidence</CardTitle></CardHeader><CardContent className="space-y-4">{item.realWorldEvidence.long.map((evidence, index) => <Card key={index} className="border-green-200 bg-green-50/40"><CardHeader className="pb-3"><h4 className="font-semibold">{evidence.country}</h4></CardHeader><CardContent className="space-y-2 text-sm text-slate-700"><p>{evidence.details}</p><p className="font-medium text-green-700">{evidence.impact}</p></CardContent></Card>)}</CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" />Implementation path</CardTitle></CardHeader><CardContent className="space-y-4">{item.implementation.long.map((phase, index) => <Card key={index} className="border-blue-200 bg-blue-50/30"><CardHeader className="pb-3"><div className="flex items-center gap-3"><Badge variant="outline" className="bg-blue-600 text-white border-blue-600">{phase.timeline}</Badge><h4 className="font-semibold">{phase.description}</h4></div></CardHeader><CardContent><ul className="space-y-2">{phase.details.map((detail, detailIndex) => <li key={detailIndex} className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-foreground leading-relaxed">{detail}</span></li>)}</ul></CardContent></Card>)}</CardContent></Card>
          </div>

          <div className="space-y-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-600" />Public targets</CardTitle></CardHeader><CardContent className="space-y-3">{item.performanceTargets.map((target, index) => <div key={index} className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm text-slate-700">{target}</div>)}</CardContent></Card>
            {item.legalFoundation && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-indigo-600" />Legal foundation</CardTitle></CardHeader><CardContent><p className="rounded-xl bg-indigo-50 p-4 text-sm leading-7 text-slate-700">{item.legalFoundation}</p></CardContent></Card>}
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Public support</CardTitle></CardHeader><CardContent><AgendaVoteSection agendaId={item.id} size="default" className="mb-3" /><p className="text-xs text-muted-foreground">Public support here is a signal of engagement, not proof of delivery.</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Quick information</CardTitle></CardHeader><CardContent className="space-y-4"><div><label className="text-sm font-medium text-muted-foreground">Category</label><p className="text-foreground font-medium">{item.category}</p></div><div><label className="text-sm font-medium text-muted-foreground">Timeline</label><p className="text-foreground font-medium">{item.timeline}</p></div><div><label className="text-sm font-medium text-muted-foreground">Tracker</label><p className="text-foreground font-medium">{item.trackerAvailable ? "Available" : "Not linked yet"}</p></div>{item.updatedOn && <div><label className="text-sm font-medium text-muted-foreground">Last updated</label><p className="text-foreground font-medium">{item.updatedOn}</p></div>}</CardContent></Card>
            <Card><CardHeader><CardTitle>Navigate agendas</CardTitle></CardHeader><CardContent className="space-y-3">{Number.parseInt(item.id) > 1 && <Link href={`/agenda/${Number.parseInt(item.id) - 1}`}><Button variant="outline" size="sm" className="w-full justify-start bg-transparent"><ArrowLeft className="h-4 w-4 mr-2" />Previous agenda</Button></Link>}{Number.parseInt(item.id) < totalReforms && <Link href={`/agenda/${Number.parseInt(item.id) + 1}`}><Button variant="outline" size="sm" className="w-full justify-start bg-transparent">Next agenda<ArrowLeft className="h-4 w-4 ml-2 rotate-180" /></Button></Link>}<Link href="/#agendas-section"><Button variant="secondary" size="sm" className="w-full">View all agendas</Button></Link></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Share and contribute</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Share this public summary, then use the tracker for deeper evidence when you want to verify the agendaï¿½s status.</p><ShareDialog title={`Agenda #${item.id}: ${item.title}`} description={item.description} /><div className="max-h-96 overflow-y-auto pr-2"><SuggestionSection agendaId={item.id} /></div></CardContent></Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function AgendaPageSkeleton() {
  return <div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="mb-6"><Skeleton className="h-10 w-48" /></div><div className="mb-8"><div className="flex gap-2 mb-4"><Skeleton className="h-6 w-24" /><Skeleton className="h-6 w-24" /><Skeleton className="h-6 w-24" /></div><Skeleton className="h-12 w-3/4 mb-4" /><Skeleton className="h-6 w-full max-w-4xl" /></div><div className="grid gap-8 lg:grid-cols-3"><div className="lg:col-span-2 space-y-8">{Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-6 w-64" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>)}</div><div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>)}</div></div></main></div>
}

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
