"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  FileSearch,
  GitBranch,
  Layers,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  Vote,
  Coins,
  AlertTriangle,
  Building2,
  UserCheck,
  Send,
  Share2,
  Clock,
  Code2,
} from "lucide-react"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function TrackerComingSoonClient() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("citizen")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast.success("You're on the early access list!", {
        description: `We'll notify you when the NepalReforms Tracker enters public beta.`,
      })
    }, 600)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "NepalReforms Tracker — Coming Soon",
          text: "Tracking Nepal's political promises, Red Book budgets, and ground reality with a verified knowledge graph.",
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="flex-1">
        {/* Top Status Announcement Bar */}
        <div className="border-b border-emerald-900/10 bg-emerald-950 text-emerald-100 text-xs py-2.5 px-4">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono uppercase tracking-wider font-semibold text-emerald-300">
                ALPHA ENGINE INGESTION ACTIVE
              </span>
              <span className="hidden sm:inline text-emerald-400/60">•</span>
              <span className="hidden sm:inline text-emerald-200/80">
                Neo4j Knowledge Graph + Red Book Budget Pipeline in Development
              </span>
            </div>
            <div className="flex items-center gap-3 text-emerald-300">
              <span className="font-mono text-[11px]">TARGET BETA: Q2 2026</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                aria-label="Share tracker preview link"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="text-xs">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50/50 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-900 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>NepalReforms Intelligence Backbone • Tracker V1.0</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl text-balance">
                The Public Accountability Engine for Nepal’s Governance.
              </h1>

              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto text-balance">
                Connecting <strong>manifesto promises</strong>, <strong>Red Book budget lines</strong>,{" "}
                <strong>money flow events</strong>, and <strong>ground-reality evidence</strong> into an open,
                unforgiving public knowledge graph.
              </p>

              {/* Early Access Notification Form */}
              <div className="pt-4 max-w-xl mx-auto">
                {!submitted ? (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="email"
                        placeholder="Enter your email for early access..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-white border-slate-300 focus-visible:ring-emerald-600 placeholder:text-slate-400"
                        required
                        aria-label="Email address for launch notification"
                      />
                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-xs transition-all duration-200 cursor-pointer shrink-0"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                            Registering...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Get Notified
                            <Send className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                      <span>✓ Zero spam</span>
                      <span>•</span>
                      <span>✓ Open source & transparent</span>
                      <span>•</span>
                      <span>✓ Citizen-first</span>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="text-sm font-medium">
                      You are on the early access queue. We will send you an invite as soon as the live graph is ready!
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Navigation */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" asChild className="border-slate-300 bg-white hover:bg-slate-100">
                  <Link href="/#agendas-section">
                    Explore 27 Public Agendas
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-slate-700 hover:text-emerald-800">
                  <Link href="/testimonials">
                    Read Citizen Voices
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Live System Telemetry / Ingestion Counters */}
        <section className="py-12 bg-slate-900 text-slate-100 border-b border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  DATABASE READINESS & INGESTION TELEMETRY
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                  What’s Being Modeled Behind the Scenes
                </h2>
              </div>
              <Badge variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-300 font-mono text-xs">
                STATUS: INGESTION STAGE 2
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono">CORE_AGENDAS</span>
                  <Layers className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-3 text-3xl font-extrabold font-mono text-white">27</div>
                <p className="mt-1 text-xs text-slate-400">Manifesto agendas linked with baseline goals</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono">PROMISES_EXTRACTED</span>
                  <FileSearch className="h-4 w-4 text-blue-400" />
                </div>
                <div className="mt-3 text-3xl font-extrabold font-mono text-white">1,248+</div>
                <p className="mt-1 text-xs text-slate-400">RSP Bacha Patra & Parliamentary election pledges</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono">BUDGET_INDEXED</span>
                  <Coins className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-3 text-3xl font-extrabold font-mono text-white">NPR 1.86T</div>
                <p className="mt-1 text-xs text-slate-400">Red Book federal & provincial budget line items</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono">MPS_TRACKED</span>
                  <Vote className="h-4 w-4 text-purple-400" />
                </div>
                <div className="mt-3 text-3xl font-extrabold font-mono text-white">275</div>
                <p className="mt-1 text-xs text-slate-400">House of Representatives members with local commitments</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-mono">LOCAL_UNITS</span>
                  <MapPin className="h-4 w-4 text-rose-400" />
                </div>
                <div className="mt-3 text-3xl font-extrabold font-mono text-white">753</div>
                <p className="mt-1 text-xs text-slate-400">Municipalities & local councils mapped for ground audits</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Architecture Deep-Dive */}
        <section className="py-16 sm:py-20 bg-slate-50/80 border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-3xl space-y-3">
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800">
                ENGINE ARCHITECTURE
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Four Pillars of Public Accountability
              </h2>
              <p className="text-base sm:text-lg text-slate-600">
                Unlike static promise checklists, NepalReforms Tracker builds a multi-dimensional graph where policy,
                money, and physical reality intersect.
              </p>
            </div>

            <Tabs defaultValue="promise" className="space-y-6">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 h-auto p-1.5 bg-slate-200/80 rounded-xl">
                <TabsTrigger
                  value="promise"
                  className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs font-medium text-xs sm:text-sm"
                >
                  <FileSearch className="mr-2 h-4 w-4 text-emerald-600 hidden sm:inline" />
                  1. Promise Engine
                </TabsTrigger>
                <TabsTrigger
                  value="budget"
                  className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs font-medium text-xs sm:text-sm"
                >
                  <Coins className="mr-2 h-4 w-4 text-amber-600 hidden sm:inline" />
                  2. Red Book Flow
                </TabsTrigger>
                <TabsTrigger
                  value="divergence"
                  className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs font-medium text-xs sm:text-sm"
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-rose-600 hidden sm:inline" />
                  3. Reality Divergence
                </TabsTrigger>
                <TabsTrigger
                  value="parliament"
                  className="py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs font-medium text-xs sm:text-sm"
                >
                  <Vote className="mr-2 h-4 w-4 text-purple-600 hidden sm:inline" />
                  4. MP & District Map
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Promise Engine */}
              <TabsContent value="promise" className="focus-visible:outline-none">
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-950">
                          Structured Promise & Agenda Mapping
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm mt-1">
                          Manifestos and political declarations are parsed into typed entities with strict provenance.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-center border-emerald-200 bg-emerald-50 text-emerald-800 font-mono text-xs">
                        STRICT_PROVENANCE_MODEL
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-slate-500">SAMPLE PROMISE #RSP-BP-014</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            VERIFIED_LINKAGE
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          Digitize all national identity & public service delivery within 100 days
                        </h4>
                        <p className="text-xs text-slate-600">
                          <strong>Source:</strong> RSP Bacha Patra 2079/2082 • Page 14 • Paragraph 3
                        </p>
                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200 font-mono">
                          Linked Agenda: #1 (Digital Governance & Anti-Corruption Portal)
                          <br />
                          Implementing Body: Ministry of Communication & Information Technology
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-slate-500">SAMPLE PROMISE #NC-MAN-038</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            PENDING_BUDGET
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          Establish specialized anti-graft fast-track courts in all 7 provinces
                        </h4>
                        <p className="text-xs text-slate-600">
                          <strong>Source:</strong> NC Parliamentary Manifesto • Section 4.2
                        </p>
                        <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200 font-mono">
                          Linked Agenda: #11 (Judicial & CIAA Autonomy Reform)
                          <br />
                          Implementing Body: Judicial Council / Ministry of Law
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>No Phantom Links:</strong> The graph will never invent a promise-to-project connection
                        without an exact reference ID or human-reviewed confirmation.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Red Book Flow */}
              <TabsContent value="budget" className="focus-visible:outline-none">
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-950">
                          Red Book & Expenditure Tracking
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm mt-1">
                          Tracing budget allocations from the Ministry of Finance to actual district disbursements.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-center border-amber-200 bg-amber-50 text-amber-800 font-mono text-xs">
                        EVENT_SOURCED_BUDGETS
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 text-sm">
                            Education Infrastructure Modernization (FY 2081/82)
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-700">NPR 14.80 Arba</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Allocated: NPR 14.8B</span>
                            <span>Released: NPR 10.2B (68.9%)</span>
                            <span>Utilized: NPR 5.4B (36.4%)</span>
                          </div>
                          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-600 h-full" style={{ width: "36.4%" }} title="Utilized (36.4%)" />
                            <div className="bg-amber-400 h-full" style={{ width: "32.5%" }} title="Released but unspent (32.5%)" />
                            <div className="bg-slate-300 h-full" style={{ width: "31.1%" }} title="Unreleased (31.1%)" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 font-mono">
                          <span className="bg-white px-2 py-0.5 rounded border">Budget Code: 350-02-10</span>
                          <span className="bg-white px-2 py-0.5 rounded border">Executing Agency: MoEST</span>
                          <span className="bg-white px-2 py-0.5 rounded border">Treasury Code: FCGO-2081</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Reality Divergence */}
              <TabsContent value="divergence" className="focus-visible:outline-none">
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-950">
                          Paper Truth vs. Ground Reality
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm mt-1">
                          Identifying where government progress reports diverge from citizen-verified ground status.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-center border-rose-200 bg-rose-50 text-rose-800 font-mono text-xs">
                        DIVERGENCE_DETECTOR
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700">
                            <th className="p-3 font-semibold">Tracked Project</th>
                            <th className="p-3 font-semibold">Paper Truth (Official Claim)</th>
                            <th className="p-3 font-semibold">Ground Truth (Citizen Audit)</th>
                            <th className="p-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr className="bg-white hover:bg-slate-50/50">
                            <td className="p-3 font-medium text-slate-900">
                              Kathmandu-Terai Fast Track Tunnel Package
                            </td>
                            <td className="p-3 text-emerald-700 font-mono">
                              88% Complete (Ministry Annual Report)
                            </td>
                            <td className="p-3 text-amber-700 font-mono">
                              64% Physical Progress (Geo-audit Q1 2026)
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                                24% Divergence
                              </span>
                            </td>
                          </tr>
                          <tr className="bg-white hover:bg-slate-50/50">
                            <td className="p-3 font-medium text-slate-900">
                              District Hospital 50-Bed ICU (Rautahat)
                            </td>
                            <td className="p-3 text-emerald-700 font-mono">
                              100% Inaugurated & Operational
                            </td>
                            <td className="p-3 text-rose-700 font-mono">
                              Equipment installed, 0 medical staff deployed
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900">
                                Operational Gap
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: MP & District Map */}
              <TabsContent value="parliament" className="focus-visible:outline-none">
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="pb-4 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-950">
                          Constituency & MP Promise Heatmap
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-sm mt-1">
                          Holding elected representatives directly accountable to the constituencies that elected them.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="self-start sm:self-center border-purple-200 bg-purple-50 text-purple-800 font-mono text-xs">
                        275_CONSTITUENCIES
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">Kathmandu - 4</span>
                          <span className="font-mono text-slate-500">Bagmati</span>
                        </div>
                        <p className="text-xs text-slate-600">Tracked Commitments: 18</p>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                          <span className="text-emerald-600 font-bold">5 Done</span> •
                          <span className="text-blue-600 font-bold">7 Active</span> •
                          <span className="text-rose-600 font-bold">6 Stalled</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">Dhanusha - 3</span>
                          <span className="font-mono text-slate-500">Madhesh</span>
                        </div>
                        <p className="text-xs text-slate-600">Tracked Commitments: 12</p>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                          <span className="text-emerald-600 font-bold">2 Done</span> •
                          <span className="text-blue-600 font-bold">4 Active</span> •
                          <span className="text-rose-600 font-bold">6 Stalled</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">Chitwan - 2</span>
                          <span className="font-mono text-slate-500">Bagmati</span>
                        </div>
                        <p className="text-xs text-slate-600">Tracked Commitments: 22</p>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                          <span className="text-emerald-600 font-bold">8 Done</span> •
                          <span className="text-blue-600 font-bold">11 Active</span> •
                          <span className="text-rose-600 font-bold">3 Stalled</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Development Roadmap */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-800">
                DELIVERY SCHEDULE
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Roadmap to Public Launch
              </h2>
              <p className="text-slate-600">
                We are building deliberately to ensure every metric is legally sound, verifiable, and free of phantom
                data.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4 max-w-5xl mx-auto">
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-6 space-y-3 relative">
                <div className="h-2 w-full bg-emerald-600 rounded-full" />
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-emerald-800">
                  <span>PHASE 1</span>
                  <span className="bg-emerald-200 px-2 py-0.5 rounded text-[10px]">DONE</span>
                </div>
                <h3 className="font-bold text-slate-900">Foundation & Schema</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Neo4j ontology, typed budget contracts, agenda-promise linking pipelines, and consistency validation.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-300 bg-blue-50/50 p-6 space-y-3 relative">
                <div className="h-2 w-full bg-blue-600 rounded-full" />
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-blue-800">
                  <span>PHASE 2</span>
                  <span className="bg-blue-200 px-2 py-0.5 rounded text-[10px]">CURRENT</span>
                </div>
                <h3 className="font-bold text-slate-900">Red Book & Ingestion</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Extracting Federal Red Book budget lines, multi-party manifestos, and ministry project identifiers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-3 relative">
                <div className="h-2 w-full bg-slate-300 rounded-full" />
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-600">
                  <span>PHASE 3</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px]">Q2 2026</span>
                </div>
                <h3 className="font-bold text-slate-900">Public Beta Explorer</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interactive web graph, constituency filters, money flow visualizer, and exportable audit reports.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-3 relative">
                <div className="h-2 w-full bg-slate-300 rounded-full" />
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-600">
                  <span>PHASE 4</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px]">Q3 2026</span>
                </div>
                <h3 className="font-bold text-slate-900">Citizen Oracle Network</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Decentralized ground audits, geo-tagged photo proofs, community oversight bounty program, and open APIs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Volunteer & Early Access Callout */}
        <section className="py-16 sm:py-20 bg-emerald-950 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="rounded-3xl border border-emerald-800 bg-emerald-900/60 p-8 sm:p-12 text-center space-y-6 backdrop-blur">
              <Badge variant="outline" className="border-emerald-500 bg-emerald-800 text-emerald-200">
                JOIN THE ACCURACY EFFORT
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Help Us Verify Ground Truth Across Nepal
              </h2>
              <p className="text-emerald-200/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Whether you are an investigative journalist, data analyst, legal researcher, or active citizen in your
                district — you can join as a verified auditor.
              </p>

              <div className="grid gap-3 sm:grid-cols-3 pt-2 text-left">
                <div className="rounded-xl border border-emerald-800 bg-emerald-950/70 p-4">
                  <div className="text-sm font-semibold text-white">1. Ground Verification</div>
                  <p className="mt-1 text-xs text-emerald-300">
                    Verify local school, hospital, and road projects in your local municipality.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-800 bg-emerald-950/70 p-4">
                  <div className="text-sm font-semibold text-white">2. Budget Auditing</div>
                  <p className="mt-1 text-xs text-emerald-300">
                    Help dissect district expenditure notices and municipal procurement files.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-800 bg-emerald-950/70 p-4">
                  <div className="text-sm font-semibold text-white">3. Open Data APIs</div>
                  <p className="mt-1 text-xs text-emerald-300">
                    Access graph nodes programmatically for independent journalism and civic apps.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-emerald-950 hover:bg-emerald-100 font-semibold cursor-pointer"
                >
                  <Link href="/#agendas-section">
                    View 27 Agendas on Main Platform
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-emerald-700 text-emerald-100 hover:bg-emerald-800/80 bg-transparent cursor-pointer"
                >
                  <Link href="/create-opinion">
                    Submit Citizen Feedback
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Standard Platform Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <Image
                src="/nepal-flag-logo.png"
                alt="NepalReforms Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-lg font-semibold text-foreground">NepalReforms • Tracker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Public reform summaries for Nepal, with explicit handoff to deeper tracker evidence.
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <Link
                href="https://nexalaris.com/"
                target="_blank"
                className="font-medium text-primary hover:underline"
              >
                Nexalaris Tech Pvt. Ltd.
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
