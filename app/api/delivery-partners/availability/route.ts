import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { deliveryPartnerId, isAvailable } = await request.json()

    const updatedPartner = db.deliveryPartners.update(deliveryPartnerId, { isAvailable })

    if (!updatedPartner) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    return NextResponse.json(updatedPartner)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
  }
}
