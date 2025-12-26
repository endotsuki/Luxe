import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  // Sign out from Supabase
  await supabase.auth.signOut()

  // Delete custom auth cookie
  cookieStore.delete("admin_auth")
  return NextResponse.json({ success: true })
}
