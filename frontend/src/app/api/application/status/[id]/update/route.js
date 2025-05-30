import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Application from "@/models/Application"
import { getToken } from "next-auth/jwt"

export async function POST(request, { params }) {
  try {
    await dbConnect()

    // Get user ID from token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    const applicationId = params.id
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ message: "Status is required", success: false }, { status: 400 })
    }

    // Find application
    const application = await Application.findById(applicationId)
    if (!application) {
      return NextResponse.json({ message: "Application not found", success: false }, { status: 404 })
    }

    // Update status
    application.status = status.toLowerCase()
    await application.save()

    return NextResponse.json({ message: "Status updated successfully", success: true }, { status: 200 })
  } catch (error) {
    console.error("Update status error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

