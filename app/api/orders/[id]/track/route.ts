import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    const order = db.orders.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const currentLocation = db.locations.getLatest(orderId)

    return NextResponse.json({
      order,
      currentLocation,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 })
  }
}
