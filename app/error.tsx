"use client"
 
import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
 
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Platform runtime error caught by boundary:", error)
  }, [error])
 
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Something went wrong</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            An unexpected error occurred while loading this reform view. You can try refreshing the section or return to the main explorer.
          </p>
        </div>
 
        {error.digest && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-500 font-mono">
            Error ID: {error.digest}
          </div>
        )}
 
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            className="flex-1 gap-2 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
          <Button 
            asChild 
            variant="outline" 
            className="flex-1 gap-2 bg-transparent border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <Link href="/">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
