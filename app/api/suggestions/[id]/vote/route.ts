import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { validateSuggestionUUID } from "@/lib/utils/uuid-helpers"
import { isAllowedOrigin } from "@/lib/security/origin"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { getOrCreateDeviceIdentity, attachDeviceCookie } from "@/lib/security/device-identity"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const deviceIdentity = getOrCreateDeviceIdentity(request)
    const { deviceId, signedCookieValue, isNew } = deviceIdentity

    // Rate limit per device
    const rl = checkRateLimit(request, "vote-suggestion", 60, 5 * 60 * 1000, deviceId)
    if (!("ok" in rl) || rl.ok === false) return rl.response

    const { id } = await params
    const body = await request.json()
    const { vote_type } = body

    if (!vote_type || !["like", "dislike"].includes(vote_type)) {
      return NextResponse.json({ error: "Invalid vote type. Must be 'like' or 'dislike'" }, { status: 400 })
    }

    const suggestion_id = id

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suggestion_id)) {
      return NextResponse.json({ error: "Invalid suggestion ID format" }, { status: 400 })
    }

    const svc = await createServiceClient()

    const { data: suggestionExists, error: checkError } = await svc
      .from("suggestions")
      .select("id")
      .eq("id", suggestion_id)
      .maybeSingle()

    if (checkError || !suggestionExists) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 })
    }

    const { data: existingVote } = await svc
      .from("suggestion_votes")
      .select("*")
      .eq("suggestion_id", suggestion_id)
      .eq("device_id", deviceId)
      .maybeSingle()

    let operation = "created"
    let userVote: "like" | "dislike" | null = null

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Toggle off / remove vote
        const { error } = await svc.from("suggestion_votes").delete().eq("id", existingVote.id)
        if (error) {
          console.error("Error removing vote:", error)
          return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 })
        }
        operation = "removed"
        userVote = null
      } else {
        // Update vote type
        const { error } = await svc.from("suggestion_votes").update({ vote_type }).eq("id", existingVote.id)
        if (error) {
          console.error("Error updating vote:", error)
          return NextResponse.json({ error: "Failed to update vote" }, { status: 500 })
        }
        operation = "updated"
        userVote = vote_type
      }
    } else {
      // Create new vote
      const { error } = await svc.from("suggestion_votes").insert({
        suggestion_id,
        device_id: deviceId,
        vote_type,
      })

      if (error) {
        console.error("Error creating vote:", error)
        return NextResponse.json({ error: "Failed to create vote" }, { status: 500 })
      }
      operation = "created"
      userVote = vote_type
    }

    const { data: voteCounts, error: countError } = await svc
      .from("suggestion_votes")
      .select("vote_type")
      .eq("suggestion_id", suggestion_id)

    if (countError) {
      console.error("Error fetching vote counts:", countError)
      return NextResponse.json({ error: "Failed to fetch vote counts" }, { status: 500 })
    }

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    let response = NextResponse.json({
      success: true,
      likes,
      dislikes,
      userVote,
      operation,
    })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    if (isNew) {
      response = attachDeviceCookie(response, signedCookieValue)
    }

    return response
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deviceIdentity = getOrCreateDeviceIdentity(request)
    const { deviceId, signedCookieValue, isNew } = deviceIdentity
    const suggestion_id = id

    // Validate suggestion UUID and check if it exists
    const validation = await validateSuggestionUUID(suggestion_id)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (!validation.exists) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 })
    }

    const svc = await createServiceClient()

    const { data: voteCounts } = await svc
      .from("suggestion_votes")
      .select("vote_type")
      .eq("suggestion_id", suggestion_id)

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    let userVote: "like" | "dislike" | null = null
    const { data: existingVote } = await svc
      .from("suggestion_votes")
      .select("vote_type")
      .eq("suggestion_id", suggestion_id)
      .eq("device_id", deviceId)
      .maybeSingle()

    if (existingVote) {
      userVote = existingVote.vote_type
    }

    let response = NextResponse.json({ likes, dislikes, userVote })
    response.headers.set("Cache-Control", "public, max-age=15, s-maxage=30")
    if (isNew) {
      response = attachDeviceCookie(response, signedCookieValue)
    }

    return response
  } catch (error) {
    console.error("Get votes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
