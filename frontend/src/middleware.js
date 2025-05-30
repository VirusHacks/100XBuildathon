import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"

export async function middleware(request) {
  const path = request.nextUrl.pathname

  // Check if this is an API route
  const isApiRoute = path.startsWith("/api/")

  // Define public paths that don't require authentication
  const isPublicPath = path === "/signin" || path === "/signup" || path === "/"

  // Define protected API paths
  const isProtectedApiPath =
    path.startsWith("/api/jobs") ||
    path.startsWith("/api/applications") ||
    path.startsWith("/api/companies") ||
    path.startsWith("/api/users/profile")

  // Handle API routes differently
  if (isApiRoute) {
    // Skip middleware for non-protected API paths
    if (!isProtectedApiPath) {
      return NextResponse.next()
    }

    // For API routes, first try to get the token from NextAuth
    const nextAuthToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (nextAuthToken) {
      // Add the user ID and role to the request headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", nextAuthToken.id || nextAuthToken.userId)
      requestHeaders.set("x-user-role", nextAuthToken.role)

      // Return the modified request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    // If no NextAuth token, try to get the token from cookies (for custom JWT)
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "User not authenticated", success: false }, { status: 401 })
    }

    try {
      // Verify the token
      const decoded = verify(token, process.env.NEXTAUTH_SECRET)

      if (!decoded) {
        return NextResponse.json({ message: "Invalid token", success: false }, { status: 401 })
      }

      // Add the user ID to the request headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", decoded.userId)
      requestHeaders.set("x-user-role", decoded.role || "user")

      // Return the modified request
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ message: "Authentication error", success: false }, { status: 401 })
    }
  }

  // For page routes, use the existing NextAuth logic
  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect logic for public paths
  if (isPublicPath && token) {
    // If user is already logged in and tries to access public path
    if (token.role === "employer") {
      return NextResponse.redirect(new URL("/admin", request.url))
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Redirect logic for protected paths
  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected path
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  // Role-based access control
  if (path.startsWith("/admin") && token?.role !== "employer") {
    // If user is not an admin and tries to access admin path
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which paths Middleware will run on
export const config = {
  matcher: [
    // Page routes
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    // API routes
    "/api/jobs/:path*",
    "/api/applications/:path*",
    "/api/companies/:path*",
    "/api/users/:path*",
    "/api/ai/:path*",
  ],
}

