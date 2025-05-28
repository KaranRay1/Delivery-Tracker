import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const vendors = db.vendors.findAll()
    return NextResponse.json(vendors)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessName, name, email, address, phone } = body

    const vendor = db.vendors.create({
      businessName,
      name,
      email,
      role: "vendor",
      address,
      phone,
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}
