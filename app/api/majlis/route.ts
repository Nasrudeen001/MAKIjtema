import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const supabase = createClient()

    const { data: result, error } = await supabase
      .from("majlis")
      .insert({
        name: data.name,
        region_id: data.regionId,
        code: data.code || data.name.substring(0, 3).toUpperCase(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create majlis" }, { status: 500 })
    }

    return NextResponse.json({ success: true, majlis: result })
  } catch (error) {
    console.error("Error creating majlis:", error)
    return NextResponse.json({ error: "Failed to create majlis" }, { status: 500 })
  }
}
