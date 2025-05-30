import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/users - Get all users (admin only)
export async function GET(request) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Get users
    const users = await User.find({}).select("-password").limit(limit).skip(skip).sort({ createdAt: -1 })

    const total = await User.countDocuments({})

    return NextResponse.json(
      {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

