"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ExternalLink, ShieldCheck, Activity, Clock3 } from "lucide-react"
import Image from "next/image"
import { ManifestoSummaryItem } from "@/hooks/use-manifesto-data"

interface HeroSectionProps { items: ManifestoSummaryItem[] }

export function HeroSection({ items }: HeroSectionProps) {
  const scrollToAgendas = () => document.getElementById("agendas-section")?.scrollIntoView({ behavior: "smooth" })
  const featured = items.filter((item) => item.featured)
  const moving = items.filter((item) => ["Moving Forward", "Partially Delivered", "Delivered"].includes(item.publicStage)).length
  const dated = items.filter((item) => item.lastUpdated).length
  const trackerLinked = items.filter((item) => item.trackerAvailable).length

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-slate-50 py-16 sm:py-24">
      <div className="absolute inset-0 pointer-events-none">
        <Image src="/hero.webp" alt="Nepal reforms background" fill className="object-cover object-center opacity-15" priority quality={85} sizes="100vw" />
        <div className="absolute inset-0 bg-white/65" />
      </div>
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="border-emerald-200 bg-white/80 text-emerald-700">Public reform progress, not a polished fiction</Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">See which reform agendas are moving, stalled, or still waiting for proof.</h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-700">NepalReforms is the readable public surface. It gives a careful progress signal for each agenda, then hands you off to the tracker when you want deeper evidence and accountability detail.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-white/80 p-4 shadow-sm"><div className="text-2xl font-semibold text-slate-950">{items.length}</div><div className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Activity className="h-4 w-4 text-emerald-600" /> Public agendas tracked</div></div>
              <div className="rounded-2xl border bg-white/80 p-4 shadow-sm"><div className="text-2xl font-semibold text-slate-950">{moving}</div><div className="mt-1 flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="h-4 w-4 text-blue-600" /> Showing movement signals</div></div>
              <div className="rounded-2xl border bg-white/80 p-4 shadow-sm"><div className="text-2xl font-semibold text-slate-950">{dated}</div><div className="mt-1 flex items-center gap-2 text-sm text-slate-600"><Clock3 className="h-4 w-4 text-violet-600" /> With dated public updates</div></div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={scrollToAgendas} className="px-8">Explore agendas<ArrowDown className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline" asChild className="bg-white/70"><Link href="https://tracker.nepalreforms.com" target="_blank" rel="noreferrer">Open tracker<ExternalLink className="ml-2 h-4 w-4" /></Link></Button>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div><p className="text-sm font-semibold text-slate-900">What this page promises</p><p className="text-sm text-slate-600">Editorial summary first. Evidence depth via tracker.</p></div>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{trackerLinked} tracker links</Badge>
            </div>
            <div className="space-y-3">
              {featured.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-600">{item.progressLabel}</p></div>
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">{item.publicStage}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.headlineUpdate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
