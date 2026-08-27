"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global platform error caught by root boundary:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans antialiased text-slate-900">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Application Error</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              A critical layout error occurred in the Nepal Reforms platform. Please reload the application.
            </p>
          </div>

          {error.digest && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-500 font-mono">
              Error ID: {error.digest}
            </div>
          )}

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Reload application
          </button>
        </div>
      </body>
    </html>
  )
}
