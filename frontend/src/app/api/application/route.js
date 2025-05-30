import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Application from "@/models/Application"
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

    const userId = token.userId

    // Find applications by user
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company",
          options: { sort: { createdAt: -1 } },
        },
      })

    if (!applications || applications.length === 0) {
      return NextResponse.json({ message: "No Applications", success: false }, { status: 404 })
    }

    return NextResponse.json({ applications, success: true }, { status: 200 })
  } catch (error) {
    console.error("Get applications error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

