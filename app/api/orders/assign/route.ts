import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { orderId, deliveryPartnerId } = await request.json()

    const order = db.orders.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const partner = db.deliveryPartners.findById(deliveryPartnerId)
    if (!partner) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 })
    }

    const updatedOrder = db.orders.update(orderId, {
      deliveryPartnerId,
      status: "assigned",
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    return NextResponse.json({ error: "Failed to assign delivery partner" }, { status: 500 })
  }
}
