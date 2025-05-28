import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deliveryPartnerId = searchParams.get("deliveryPartnerId")

    if (!deliveryPartnerId) {
      return NextResponse.json({ error: "Delivery partner ID is required" }, { status: 400 })
    }

    const orders = db.orders.findByDeliveryPartnerId(deliveryPartnerId)
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
