import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { FileQuestion, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <FileQuestion className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Page Not Found</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              The reform agenda, document, or page you are looking for doesn&apos;t exist or has moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild className="flex-1 gap-2">
              <Link href="/#agendas-section">
                <ArrowLeft className="h-4 w-4" /> Explorer
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 gap-2 bg-transparent border-slate-200">
              <Link href="/">
                <Home className="h-4 w-4" /> Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
