import { NextRequest, NextResponse } from "next/server"

function getTrackerBases(): string[] {
  const candidates = [
    process.env.TRACKER_API_BASE,
    process.env.NEXT_PUBLIC_TRACKER_API_BASE,
    "http://127.0.0.1:8000",
    "https://tracker.nepalreforms.com",
  ].filter((value): value is string => Boolean(value && value.trim()))

  return Array.from(new Set(candidates.map((value) => value.replace(/\/$/, ""))))
}

export async function GET(request: NextRequest) {
  const ids = Array.from(
    new Set(
      request.nextUrl.searchParams
        .getAll("ids")
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )

  const params = new URLSearchParams()
  if (ids.length) params.set("ids", ids.join(","))

  let lastError = "tracker_unavailable"

  for (const base of getTrackerBases()) {
    const url = `${base}/api/public/agendas/graph-status/${params.toString() ? `?${params.toString()}` : ""}`

    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: { accept: "application/json" },
      })

      if (!response.ok) {
        lastError = `upstream_${response.status}`
        continue
      }

      const payload = await response.json()
      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Tracker-Upstream": base,
        },
      })
    } catch (error) {
      lastError = error instanceof Error ? error.message : "tracker_fetch_failed"
    }
  }

  return NextResponse.json(
    {
      data: [],
      count: 0,
      ids,
      source: "unavailable",
      error: lastError,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  )
}