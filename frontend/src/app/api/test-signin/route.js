import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required", success: false }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials", success: false }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials", success: false }, { status: 401 })
    }

    // Create token (similar to what NextAuth would do)
    const tokenData = {
      userId: user._id,
      email: user.email,
      role: user.role,
    }

    const token = sign(tokenData, process.env.NEXTAUTH_SECRET, { expiresIn: "1d" })

    return NextResponse.json({
      message: "Authentication successful",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        profile: user.profile,
      },
      success: true,
    })
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}

