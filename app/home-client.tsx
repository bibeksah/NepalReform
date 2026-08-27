"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { useManifestoData } from "@/hooks/use-manifesto-data"
import { Badge } from "@/components/ui/badge"
import { TrackerHandoffCard } from "@/components/tracker-handoff-card"

const ManifestoList = dynamic(() => import("@/components/manifesto-list").then(mod => ({ default: mod.ManifestoList })), { ssr: true, loading: () => <div className="flex justify-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div></div> })
const TestimonialCarousel = dynamic(() => import("@/components/testimonial-carousel").then(mod => ({ default: mod.TestimonialCarousel })), { ssr: true })

export default function HomeClient() {
  const { manifestoData } = useManifestoData()
  const stageCounts = manifestoData.reduce<Record<string, number>>((acc, item) => { acc[item.publicStage] = (acc[item.publicStage] ?? 0) + 1; return acc }, {})
  const featuredItems = manifestoData.filter((item) => item.featured).slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection items={manifestoData} />
        <section className="border-y bg-slate-50/60 py-14 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-3xl space-y-3">
              <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">Public progress snapshot</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">A clearer homepage starts with progress, not just proposals.</h2>
              <p className="text-lg text-slate-600">These counts are public signals, not a claim of full accountability coverage. For agenda-level depth, follow the explicit tracker links.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Object.entries(stageCounts).map(([stage, count]) => <div key={stage} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">{stage}</div><div className="mt-2 text-3xl font-semibold text-slate-950">{count}</div></div>)}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-950">Featured agenda updates</h3>
                <div className="mt-4 space-y-4">
                  {featuredItems.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-slate-900">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.headlineUpdate}</p></div><Link href={`/agenda/${item.id}`} className="text-sm font-medium text-primary hover:underline">Open</Link></div></div>)}
                </div>
              </div>
              <TrackerHandoffCard trackerAvailable={true} trackerUrl="https://tracker.nepalreforms.com" />
            </div>
          </div>
        </section>
        <section id="agendas-section" className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="max-w-3xl space-y-3">
              <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">Agenda explorer</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Scan the reform agenda by status, not just manifesto order.</h2>
              <p className="text-lg text-slate-600">Every card gives a summary signal: stage, cautious progress estimate, update headline, trust framing, and a direct jump to the tracker for deeper evidence.</p>
            </div>
            <ManifestoList />
          </div>
        </section>
        <section className="bg-white py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border bg-slate-50/70 p-6 sm:p-8">
              <h3 className="text-2xl font-semibold text-slate-950">How to use NepalReforms well</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div><p className="font-medium text-slate-900">1. Scan the public signal</p><p className="mt-2 text-sm text-slate-600">Use this platform to compare agendas quickly and understand what appears to be moving or stuck.</p></div>
                <div><p className="font-medium text-slate-900">2. Open the tracker for proof</p><p className="mt-2 text-sm text-slate-600">When you need records, provenance, or deeper accountability detail, jump to the tracker.</p></div>
                <div><p className="font-medium text-slate-900">3. Add public pressure</p><p className="mt-2 text-sm text-slate-600">Vote, share, and contribute ideas so the strongest agendas gain visibility and scrutiny.</p></div>
              </div>
            </div>
          </div>
        </section>
        <TestimonialCarousel />
        <footer className="border-t bg-muted/50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center space-y-4"><div className="flex justify-center items-center gap-3"><img src="/nepal-flag-logo.png" alt="NepalReforms Logo" className="h-8 w-8 object-contain" loading="lazy" /><span className="text-lg font-semibold text-foreground">NepalReforms</span></div><p className="text-sm text-muted-foreground">Public reform summaries for Nepal, with explicit handoff to deeper tracker evidence.</p><p className="text-xs text-muted-foreground">Powered by <Link href="https://nexalaris.com/" target="_blank" className="font-medium text-primary hover:underline">Nexalaris Tech Pvt. Ltd.</Link></p></div></div>
        </footer>
      </main>
    </div>
  )
}
