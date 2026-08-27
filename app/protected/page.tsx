import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProtectedPage() {
  const supabase = await createClient()

  if (process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co") {
    return <div>Building...</div>
  }

  const { data } = await supabase.auth.getUser()
  if (data?.user) {
    redirect("/admin")
  }

  redirect("/")
}
