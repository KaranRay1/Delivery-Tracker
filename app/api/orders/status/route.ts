import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json()

    const order = db.orders.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updatedOrder = db.orders.update(orderId, { status })
    return NextResponse.json(updatedOrder)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
