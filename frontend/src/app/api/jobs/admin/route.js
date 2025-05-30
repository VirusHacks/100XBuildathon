import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Job from "@/models/Job"
import { getToken } from "next-auth/jwt"

export async function GET(request) {
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

    const adminId = token.userId

    // Find jobs created by admin
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      options: { sort: { createdAt: -1 } },
    })

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: "Jobs not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ jobs, success: true }, { status: 200 })
  } catch (error) {
    console.error("Get admin jobs error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

