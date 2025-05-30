import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Job from "@/models/Job"
import Company from "@/models/Company"

export async function GET(request, { params }) {
  try {
    const { id } = params

    // Connect to database
    await dbConnect()

    // Find job by ID and populate company information
    const job = await Job.findById(id).populate("company", "name logo industry") // company field is populated

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      job,
      success: true,
    })
  } catch (error) {
    console.error("Get job error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}


export async function PUT(request, { params }) {
  try {
    const { id } = params

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Find job by ID
    const job = await Job.findById(id)

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Find company to verify ownership
    const company = await Company.findById(job.company)

    // Check if user is authorized to update this job
    if (company.userId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Parse request body as JSON
    const updates = await request.json()

    // Update job fields (excluding companyId)
    Object.keys(updates).forEach((key) => {
      // Don't allow updating companyId
      if (key !== "company" && updates[key] !== undefined) {
        job[key] = updates[key]
      }
    })

    // Save the updated job
    await job.save()

    return NextResponse.json({
      message: "Job updated successfully",
      job,
      success: true,
    })
  } catch (error) {
    console.error("Update job error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}


export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Find job by ID
    const job = await Job.findById(id)

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Find company to verify ownership
    const company = await Company.findById(job.company)

    // Check if user is authorized to delete this job
    if (company.userId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Delete the job
    await Job.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Job deleted successfully",
      success: true,
    })
  } catch (error) {
    console.error("Delete job error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}


