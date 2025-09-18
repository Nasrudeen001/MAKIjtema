import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const supabase = createClient()

    const calculateAge = (dateOfBirth: string): number => {
      if (!dateOfBirth) return 0
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
    }

    const age = calculateAge(data.dateOfBirth)

    const { data: result, error } = await supabase
      .from("participants")
      .insert({
        full_name: data.fullName,
        islamic_names: data.islamicNames,
        date_of_birth: data.dateOfBirth,
        years: Number.parseInt(data.years) || age, // Use calculated age as fallback
        age: age, // Added missing age field
        category: data.category,
        mobile_number: data.mobileNumber,
        region: data.region,
        majlis: data.majlis,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        dietary_requirements: data.dietaryRequirements,
        medical_conditions: data.medicalConditions,
      })
      .select("registration_number, id")
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      registrationNumber: result.registration_number,
      participantId: result.id,
    })
  } catch (error) {
    console.error("Error creating participant:", error)
    return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient()

    const { data: participants, error } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
    }

    return NextResponse.json(participants)
  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
  }
}
