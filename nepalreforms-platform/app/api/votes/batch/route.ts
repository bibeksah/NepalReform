import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { isAllowedOrigin } from "@/lib/security/origin"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { getOrCreateDeviceIdentity, attachDeviceCookie } from "@/lib/security/device-identity"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const deviceIdentity = getOrCreateDeviceIdentity(request)
    const { deviceId, signedCookieValue, isNew } = deviceIdentity

    // Rate limit: batch fetches per device/IP
    const rl = checkRateLimit(request, "vote-batch", 120, 5 * 60 * 1000, deviceId)
    if (!("ok" in rl) || rl.ok === false) return rl.response

    const { itemIds, table } = await request.json()

    if (!itemIds || !Array.isArray(itemIds) || !table) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    if (!["agenda_votes", "suggestion_votes"].includes(table)) {
      return NextResponse.json({ error: "Invalid table specified" }, { status: 400 })
    }

    if (itemIds.length > 100) {
      return NextResponse.json({ error: "Too many items requested (max 100)" }, { status: 400 })
    }

    const itemIdColumn = table === "agenda_votes" ? "agenda_id" : "suggestion_id"
    const svc = await createServiceClient()

    const { data: votes, error } = await svc
      .from(table)
      .select(`${itemIdColumn}, vote_type, device_id`)
      .in(itemIdColumn, itemIds)

    if (error) {
      console.error("Error fetching batch votes:", error)
      throw error
    }

    // Process vote counts and device votes
    const voteCounts: Record<string, { likes: number; dislikes: number }> = {}
    const userVotes: Record<string, string> = {}

    itemIds.forEach((id) => {
      voteCounts[id] = { likes: 0, dislikes: 0 }
    })

    interface VoteRow {
      [key: string]: string | null
      vote_type: string
      device_id: string | null
    }

    votes?.forEach((vote: VoteRow) => {
      const itemId = vote[itemIdColumn]
      if (!itemId) return

      if (!voteCounts[itemId]) {
        voteCounts[itemId] = { likes: 0, dislikes: 0 }
      }

      if (vote.vote_type === "like") {
        voteCounts[itemId].likes++
      } else if (vote.vote_type === "dislike") {
        voteCounts[itemId].dislikes++
      }

      if (vote.device_id && vote.device_id === deviceId) {
        userVotes[itemId] = vote.vote_type
      }
    })

    let response = NextResponse.json({ voteCounts, userVotes })
    response.headers.set("Cache-Control", "public, max-age=30, s-maxage=60")
    if (isNew) {
      response = attachDeviceCookie(response, signedCookieValue)
    }

    return response
  } catch (error) {
    console.error("Batch vote fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
