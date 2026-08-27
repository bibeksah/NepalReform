import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TrackerHandoffCardProps {
  trackerUrl: string | null
  trackerAvailable: boolean
  compact?: boolean
}

export function TrackerHandoffCard({ trackerUrl, trackerAvailable, compact = false }: TrackerHandoffCardProps) {
  return (
    <Card className="border-slate-200 bg-slate-50/80">
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Need deeper evidence?</p>
            <p className="text-sm text-slate-600">
              This public page shows a static graph-backed summary snapshot. Open the tracker when you want deeper records,
              provenance, and accountability detail.
            </p>
          </div>
          {trackerAvailable && trackerUrl ? (
            <Button asChild className="sm:self-start">
              <Link href={trackerUrl} target="_blank" rel="noreferrer">
                Open tracker
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600 sm:self-start">
              Tracker detail link is not available for this agenda yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
