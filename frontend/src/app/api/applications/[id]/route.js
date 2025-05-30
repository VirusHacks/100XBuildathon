import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/dbConnect"
import Application from "@/models/Application"

export async function GET(request, { params }) {
  try {
    await connectDB()
    const applicationId = params.id

    // Find the application with populated references
    const application = await Application.findById(applicationId)
      .populate({
        path: "job",
        select: "title company questions",
        populate: {
          path: "company",
          select: "name logo",
        },
      })
      .populate("user", "name email")

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "Failed to fetch application", details: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB()
    const applicationId = params.id

    // Get current user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow employers or admins to update applications
    if (!["employer", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // Get the application
    const application = await Application.findById(applicationId)
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Get update data
    const data = await request.json()

    // Update allowed fields
    const allowedFields = ["status", "notes"]
    const updateData = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    // Update the application
    const updatedApplication = await Application.findByIdAndUpdate(applicationId, { $set: updateData }, { new: true })

    return NextResponse.json({
      message: "Application updated successfully",
      application: updatedApplication,
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application", details: error.message }, { status: 500 })
  }
}

