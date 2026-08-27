import { createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { validateAndNormalizeAgendaId } from "@/lib/utils/uuid-helpers"
import { isAllowedOrigin } from "@/lib/security/origin"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { getOrCreateDeviceIdentity, attachDeviceCookie } from "@/lib/security/device-identity"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const svc = await createServiceClient()
    const { searchParams } = new URL(request.url)
    const agendaId = searchParams.get("agenda_id")

    if (!agendaId) {
      return NextResponse.json({ error: "agenda_id parameter is required" }, { status: 400 })
    }

    const validation = await validateAndNormalizeAgendaId(agendaId)
    if (!validation.isValid || !validation.agendaUUID) {
      return NextResponse.json({ error: validation.error || "Invalid agenda ID" }, { status: 400 })
    }

    const queryId = validation.agendaUUID

    const { data: suggestions, error } = await svc
      .from("suggestions")
      .select(`
        id,
        content,
        author_name,
        created_at
      `)
      .eq("agenda_id", queryId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching suggestions:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const response = NextResponse.json({
      suggestions: suggestions || [],
      agenda_id: queryId,
    })
    response.headers.set("Cache-Control", "public, max-age=15, s-maxage=30")
    return response
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const deviceIdentity = getOrCreateDeviceIdentity(request)
    const { deviceId, signedCookieValue, isNew } = deviceIdentity

    // Rate limit: submissions per device
    const rl = checkRateLimit(request, "suggestion-create", 5, 10 * 60 * 1000, deviceId)
    if (!("ok" in rl) || rl.ok === false) return rl.response

    const body = await request.json()
    const { agenda_id, content, author_name } = body

    if (!agenda_id) {
      return NextResponse.json({ error: "agenda_id is required" }, { status: 400 })
    }
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "content is required" }, { status: 400 })
    }
    if (!author_name || author_name.trim().length === 0) {
      return NextResponse.json({ error: "author_name is required" }, { status: 400 })
    }

    const validation = await validateAndNormalizeAgendaId(agenda_id)
    if (!validation.isValid || !validation.agendaUUID) {
      return NextResponse.json({ error: validation.error || "Invalid agenda ID" }, { status: 400 })
    }

    const queryId = validation.agendaUUID
    const svc = await createServiceClient()

    const { data: agendaData } = await svc.from("agendas").select("title").eq("id", queryId).maybeSingle()

    const { data: systemSettings } = await svc
      .from("system_settings")
      .select("auto_approve_suggestions")
      .maybeSingle()

    const autoApprove = systemSettings?.auto_approve_suggestions === true

    const { data: suggestion, error } = await svc
      .from("suggestions")
      .insert({
        agenda_id: queryId,
        device_id: deviceId,
        content: content.trim(),
        author_name: author_name.trim(),
        status: autoApprove ? "approved" : "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error creating suggestion:", error)
      return NextResponse.json({ error: "Failed to create suggestion" }, { status: 500 })
    }

    // Trigger asynchronous notification without blocking response
    setImmediate(async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-email-key": process.env.EMAIL_INTERNAL_SECRET || "",
          },
          body: JSON.stringify({
            type: "suggestion",
            data: {
              author_name: author_name.trim(),
              content: content.trim(),
              agenda_title: agendaData?.title || "Unknown Agenda",
            },
          }),
        })
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError)
      }
    })

    const confirmationMessage = autoApprove 
      ? "Thank you for your suggestion! Our team will review it and compile it in our next version of the manifesto."
      : "Thanks for the suggestion! It has been submitted to the team and will appear on the platform once reviewed."

    let response = NextResponse.json({
      success: true,
      suggestion,
      message: confirmationMessage,
      autoApproved: autoApprove,
    })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    if (isNew) {
      response = attachDeviceCookie(response, signedCookieValue)
    }

    return response
  } catch (error) {
    console.error("Error creating suggestion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}