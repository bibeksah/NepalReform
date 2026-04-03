"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal, Star } from "lucide-react"
import { ManifestoCard } from "./manifesto-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useHydration } from "@/hooks/use-hydration"
import { useManifestoData } from "@/hooks/use-manifesto-data"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

const STAGES = ["Proposed", "Building Support", "Under Review", "Moving Forward", "Partially Delivered", "Delivered", "Stalled"]

export function ManifestoList() {
  const isHydrated = useHydration()
  const { manifestoData, loading } = useManifestoData()
  const [search, setSearch] = useState("")
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const categories = useMemo(() => [...new Set(manifestoData.map((item) => item.category))], [manifestoData])

  const filteredData = useMemo(() => manifestoData.filter((item) => {
    const query = search.trim().toLowerCase()
    const matchesQuery = !query || [item.title, item.description, item.category, item.publicStage, item.headlineUpdate].join(" ").toLowerCase().includes(query)
    const matchesStage = selectedStages.length === 0 || selectedStages.includes(item.publicStage)
    const matchesFeatured = !featuredOnly || item.featured
    return matchesQuery && matchesStage && matchesFeatured
  }), [manifestoData, search, selectedStages, featuredOnly])

  const featuredCount = manifestoData.filter((item) => item.featured).length

  if (!isHydrated || loading) {
    return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-2xl" />)}</div><div className="space-y-5">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-72 w-full rounded-3xl" />)}</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Agendas in public view</div><div className="mt-2 text-3xl font-semibold text-slate-950">{manifestoData.length}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Featured agendas</div><div className="mt-2 text-3xl font-semibold text-slate-950">{featuredCount}</div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Categories covered</div><div className="mt-2 text-3xl font-semibold text-slate-950">{categories.length}</div></div>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agendas, categories, or status…" className="pl-10" /></div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setShowFilters((v) => !v)}><SlidersHorizontal className="mr-2 h-4 w-4" />Filters</Button>
            <Button variant={featuredOnly ? "default" : "outline"} onClick={() => setFeaturedOnly((v) => !v)}><Star className="mr-2 h-4 w-4" />Featured only</Button>
          </div>
        </div>
        <Collapsible open={showFilters}><CollapsibleContent><div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-2 xl:grid-cols-4">{STAGES.map((stage) => { const checked = selectedStages.includes(stage); return <label key={stage} className="flex items-center gap-2 text-sm text-slate-700"><Checkbox checked={checked} onCheckedChange={(value) => setSelectedStages((current) => value ? [...current, stage] : current.filter((item) => item !== stage))} />{stage}</label> })}</div></CollapsibleContent></Collapsible>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600"><span>Showing {filteredData.length} of {manifestoData.length} agendas</span>{selectedStages.map((stage) => <Badge key={stage} variant="outline">{stage}</Badge>)}{featuredOnly && <Badge variant="outline">Featured</Badge>}</div>
      {filteredData.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><h3 className="text-lg font-semibold text-slate-900">No agendas match these filters</h3><p className="mt-2 text-sm text-slate-600">Try a broader search or clear the status filter to see more public progress summaries.</p></div> : <div className="grid gap-6 lg:grid-cols-2">{filteredData.map((item) => <ManifestoCard key={item.id} item={item} />)}</div>}
    </div>
  )
}
