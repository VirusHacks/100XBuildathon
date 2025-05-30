import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(request) {
  // Verify authentication
  const { authenticated, userId, error } = verifyAuth(request)

  if (!authenticated) {
    return NextResponse.json({ message: error, success: false }, { status: 401 })
  }

  // Proceed with the authenticated request
  // userId contains the ID of the authenticated user

  return NextResponse.json({ message: "Authenticated request successful", userId, success: true }, { status: 200 })
}

