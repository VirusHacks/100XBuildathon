import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Application from "@/models/Application"
import Job from "@/models/Job"
import { getToken } from "next-auth/jwt"

export async function GET(request, { params }) {
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

    const userId = token.userId
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ message: "Job ID is required", success: false }, { status: 400 })
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    })

    if (existingApplication) {
      return NextResponse.json({ message: "You have already applied for this job", success: false }, { status: 400 })
    }

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ message: "Job not found", success: false }, { status: 404 })
    }

    // Create application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    })

    // Update job with new application
    job.applications.push(newApplication._id)
    await job.save()

    return NextResponse.json({ message: "Job applied successfully", success: true }, { status: 201 })
  } catch (error) {
    console.error("Apply job error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

