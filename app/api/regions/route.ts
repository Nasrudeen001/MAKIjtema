import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    const { data: regions, error: regionsError } = await supabase.from("regions").select("*").order("name")

    if (regionsError) {
      console.error("Supabase regions error:", regionsError)
      return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 })
    }

    const { data: majlis, error: majlisError } = await supabase.from("majlis").select("*")

    if (majlisError) {
      console.error("Supabase majlis error:", majlisError)
      return NextResponse.json({ error: "Failed to fetch majlis" }, { status: 500 })
    }

    // Group majlis by region
    const regionsWithMajlis = regions.map((region) => ({
      ...region,
      majlis: majlis.filter((m) => m.region_id === region.id),
    }))

    return NextResponse.json(regionsWithMajlis)
  } catch (error) {
    console.error("Error fetching regions:", error)
    return NextResponse.json({ error: "Failed to fetch regions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const supabase = createClient()

    const { data: result, error } = await supabase
      .from("regions")
      .insert({
        name: data.name,
        code: data.code || data.name.substring(0, 3).toUpperCase(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create region" }, { status: 500 })
    }

    return NextResponse.json({ success: true, region: result })
  } catch (error) {
    console.error("Error creating region:", error)
    return NextResponse.json({ error: "Failed to create region" }, { status: 500 })
  }
}
