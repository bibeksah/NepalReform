import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()

  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co") {
    return <div>Building...</div>
  }

  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()
    if (profile?.role === "admin" || profile?.role === "moderator") {
      redirect("/admin")
    }
  }

  redirect("/")
}
