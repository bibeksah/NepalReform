import { createClient, createServiceClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { isAllowedOrigin } from "@/lib/security/origin"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { getOrCreateDeviceIdentity, attachDeviceCookie } from "@/lib/security/device-identity"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 50) // Max 50 items
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from("agendas")
      .select(
        `
        id, title, description, problem_statement, key_points, 
        category, priority_level, status, created_at
      `,
        { count: "exact" },
      )
      .range(from, to)
      .order("created_at", { ascending: false })

    if (category) {
      query = query.eq("category", category)
    }

    if (priority) {
      query = query.eq("priority_level", priority)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,problem_statement.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    const response = NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })

    const cacheTime = search ? 60 : 300
    response.headers.set(
      "Cache-Control",
      `public, max-age=${cacheTime}, s-maxage=${cacheTime * 2}, stale-while-revalidate=600`,
    )
    return response
  } catch (error) {
    console.error("Agenda fetch error:", error)
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

    // Rate limit: 3 opinions per 10 minutes per device
    const rl = checkRateLimit(request, "opinion-create", 3, 10 * 60 * 1000, deviceId)
    if (!("ok" in rl) || rl.ok === false) return rl.response

    const body = await request.json()
    const {
      title,
      description,
      problem_statement,
      category,
      priority_level = "Medium",
      implementation_timeline,
      key_points = [],
      proposed_solutions = [],
      expected_outcomes = [],
      stakeholders = [],
      references = [],
      tags = [],
    } = body

    if (!title || !description || !problem_statement || !category) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    const svc = await createServiceClient()

    const cleanedData = {
      title: title.trim(),
      description: description.trim(),
      problem_statement: problem_statement.trim(),
      category: category.trim(),
      priority_level,
      implementation_timeline: implementation_timeline?.trim() || null,
      key_points: key_points.filter((p: string) => p && p.trim()),
      proposed_solutions: proposed_solutions.filter((s: string) => s && s.trim()),
      expected_outcomes: expected_outcomes.filter((o: string) => o && o.trim()),
      stakeholders: stakeholders.filter((s: string) => s && s.trim()),
      references: references.filter((r: string) => r && r.trim()),
      tags: tags || [],
      status: "Draft",
      device_id: deviceId,
    }

    const { data: agenda, error } = await svc
      .from("agendas")
      .insert(cleanedData)
      .select()
      .single()

    if (error) {
      console.error("Database error creating opinion:", error)
      return NextResponse.json({ error: "Failed to submit opinion" }, { status: 500 })
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
            type: "opinion",
            data: cleanedData,
          }),
        })
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError)
      }
    })

    let response = NextResponse.json({
      success: true,
      agenda,
      message: "Your opinion has been submitted and is pending review by the moderation team.",
    })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    if (isNew) {
      response = attachDeviceCookie(response, signedCookieValue)
    }

    return response
  } catch (error) {
    console.error("Error creating opinion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
