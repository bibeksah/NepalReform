import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { validateAndNormalizeAgendaId } from "@/lib/utils/uuid-helpers"
import { isAllowedOrigin } from "@/lib/security/origin"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { getOrCreateDeviceIdentity, attachDeviceCookie } from "@/lib/security/device-identity"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // CSRF: require same-origin for state-changing request
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const deviceIdentity = getOrCreateDeviceIdentity(request)
    const { deviceId, signedCookieValue, isNew } = deviceIdentity

    // Rate limit per device
    const rl = checkRateLimit(request, "vote-agenda", 60, 5 * 60 * 1000, deviceId)
    if (!("ok" in rl) || rl.ok === false) return rl.response

    const { id } = await params
    const { vote_type } = await request.json()

    if (!vote_type || !["like", "dislike"].includes(vote_type)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    const validation = await validateAndNormalizeAgendaId(id)
    if (!validation.isValid || !validation.agendaUUID) {
      return NextResponse.json({ error: validation.error || "Invalid agenda ID" }, { status: 400 })
    }

    const agenda_id = validation.agendaUUID
    const svc = await createServiceClient()

    // Check if device already voted
    const { data: existingVote } = await svc
      .from("agenda_votes")
      .select("*")
      .eq("agenda_id", agenda_id)
      .eq("device_id", deviceId)
      .maybeSingle()

    let finalUserVote: "like" | "dislike" | null = null

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Toggle off / remove vote
        const { error } = await svc.from("agenda_votes").delete().eq("id", existingVote.id)
        if (error) throw error
        finalUserVote = null
      } else {
        // Update vote type
        const { error } = await svc.from("agenda_votes").update({ vote_type }).eq("id", existingVote.id)
        if (error) throw error
        finalUserVote = vote_type
      }
    } else {
      // Create new vote
      const { error } = await svc.from("agenda_votes").insert({
        agenda_id,
        device_id: deviceId,
        vote_type,
      })
      if (error) throw error
      finalUserVote = vote_type
    }

    // Get updated vote counts
    const { data: voteCounts } = await svc
      .from("agenda_votes")
      .select("vote_type")
      .eq("agenda_id", agenda_id)

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    let response = NextResponse.json({
      success: true,
      likes,
      dislikes,
      userVote: finalUserVote,
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

    const validation = await validateAndNormalizeAgendaId(id)
    if (!validation.isValid || !validation.agendaUUID) {
      return NextResponse.json({ error: validation.error || "Invalid agenda ID" }, { status: 400 })
    }

    const agenda_id = validation.agendaUUID
    const svc = await createServiceClient()

    // Get vote counts
    const { data: voteCounts, error: voteCountsError } = await svc
      .from("agenda_votes")
      .select("vote_type")
      .eq("agenda_id", agenda_id)

    if (voteCountsError) {
      console.error("[votes GET] Error fetching counts:", voteCountsError)
      throw voteCountsError
    }

    const likes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "like").length || 0
    const dislikes = voteCounts?.filter((v: { vote_type: string }) => v.vote_type === "dislike").length || 0

    // Get device's current vote
    let userVote: "like" | "dislike" | null = null
    const { data: existingVote } = await svc
      .from("agenda_votes")
      .select("vote_type")
      .eq("agenda_id", agenda_id)
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
