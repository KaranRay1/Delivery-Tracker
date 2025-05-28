import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { orderId, deliveryPartnerId, location } = await request.json()

    const locationUpdate = {
      orderId,
      deliveryPartnerId,
      ...location,
    }

    db.locations.create(locationUpdate)

    // Update order status to in_transit if it's picked_up
    const order = db.orders.findById(orderId)
    if (order && order.status === "picked_up") {
      db.orders.update(orderId, { status: "in_transit" })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
