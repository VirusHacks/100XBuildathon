import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
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

    const jobId = params.id

    // Find job and populate applications
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
      },
    })

    if (!job) {
      return NextResponse.json({ message: "Job not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ job, success: true }, { status: 200 })
  } catch (error) {
    console.error("Get applicants error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

