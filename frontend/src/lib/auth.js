import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

/**
 * Gets the authenticated user ID from the request
 * @param {Request} request - The incoming request
 * @returns {string|null} - The user ID or null if not authenticated
 */
export function getUserIdFromRequest(request) {
  // First check if the user ID was added by middleware
  const userId = request.headers.get("x-user-id")
  if (userId) {
    return userId
  }

  // If not, try to get it from the token
  return getUserIdFromToken()
}

/**
 * Gets the authenticated user role from the request
 * @param {Request} request - The incoming request
 * @returns {string|null} - The user role or null if not authenticated
 */
export function getUserRoleFromRequest(request) {
  // First check if the user role was added by middleware
  const userRole = request.headers.get("x-user-role")
  if (userRole) {
    return userRole
  }

  // If not, try to get it from the session
  return null // This would require additional session fetching
}

/**
 * Gets the authenticated user ID from the token in cookies
 * @returns {string|null} - The user ID or null if not authenticated
 */
export function getUserIdFromToken() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET)
    return decoded.userId || null
  } catch (error) {
    console.error("Error getting user ID from token:", error)
    return null
  }
}

/**
 * Gets the authenticated user from the session
 * @returns {Promise<Object|null>} - The user object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions)
    return session?.user || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Verifies that a request is authenticated
 * @param {Request} request - The incoming request
 * @returns {Object} - The result of the authentication check
 */
export function verifyAuth(request) {
  const userId = getUserIdFromRequest(request)
  const userRole = getUserRoleFromRequest(request)

  if (!userId) {
    return {
      authenticated: false,
      userId: null,
      role: null,
      error: "User not authenticated",
    }
  }

  return {
    authenticated: true,
    userId,
    role: userRole,
    error: null,
  }
}

/**
 * Verifies that a user has the required role
 * @param {Request} request - The incoming request
 * @param {string|string[]} requiredRoles - The required role(s)
 * @returns {Object} - The result of the role check
 */
export function verifyRole(request, requiredRoles) {
  const { authenticated, userId, role, error } = verifyAuth(request)

  if (!authenticated) {
    return {
      authorized: false,
      userId: null,
      role: null,
      error,
    }
  }

  // Convert to array if string
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!roles.includes(role)) {
    return {
      authorized: false,
      userId,
      role,
      error: "User does not have the required role",
    }
  }

  return {
    authorized: true,
    userId,
    role,
    error: null,
  }
}

