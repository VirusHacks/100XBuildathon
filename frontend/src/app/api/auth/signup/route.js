import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function POST(request) {
  try {
    const { name, email, password, phoneNumber, role } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields", success: false }, { status: 400 })
    }

    // Connect to database
    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists", success: false }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user with role and phone number
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || "", // Handle optional phone number
      role: role || "user", // Default to "user" if not provided
    })

    await newUser.save()

    // Return success response (without sensitive data)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phoneNumber: newUser.phoneNumber,
        },
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}

