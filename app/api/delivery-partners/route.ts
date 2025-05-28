import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const partners = db.deliveryPartners.findAll()
    return NextResponse.json(partners)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch delivery partners" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, vehicleType } = body

    const partner = db.deliveryPartners.create({
      name,
      email,
      role: "delivery",
      phone,
      vehicleType,
      isAvailable: true,
      rating: 5.0,
    })

    return NextResponse.json(partner, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create delivery partner" }, { status: 500 })
  }
}
