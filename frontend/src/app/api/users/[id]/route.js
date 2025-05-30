import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    await dbConnect()

    const userId = params.id

    // Get user
    const user = await User.findById(userId).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 })
    }

    // Only allow admin or the user themselves to view the profile
    if (session.user.role !== "employer" && session.user.id !== userId) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt,
        },
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user (admin only)
export async function PUT(request, { params }) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    await dbConnect()

    const userId = params.id
    const { name, email, phoneNumber, role } = await request.json()

    // Get user
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 })
    }

    // Update user data
    if (name) user.name = name
    if (email) user.email = email
    if (phoneNumber) user.phoneNumber = phoneNumber
    if (role && (role === "user" || role === "employer")) user.role = role

    await user.save()

    return NextResponse.json(
      {
        message: "User updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(request, { params }) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "employer") {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    await dbConnect()

    const userId = params.id

    // Don't allow deleting yourself
    if (session.user.id === userId) {
      return NextResponse.json({ message: "You cannot delete your own account", success: false }, { status: 400 })
    }

    // Delete user
    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully", success: true }, { status: 200 })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

