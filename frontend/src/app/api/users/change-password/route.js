import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import bcrypt from "bcryptjs"

// POST /api/users/change-password - Change user password
export async function POST(request) {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    await dbConnect()

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required", success: false },
        { status: 400 },
      )
    }

    // Get user
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect", success: false }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ message: "Password changed successfully", success: true }, { status: 200 })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

