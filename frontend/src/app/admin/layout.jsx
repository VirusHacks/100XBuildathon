"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import AdminNavbar from "@/components/admin-navbar"

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Protect admin routes
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    } else if (status === "authenticated" && session?.user?.role !== "employer") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-theme-2 border-t-transparent animate-spin"></div>
          <div className="mt-4 text-theme-1 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  // If authenticated and is an employer, render the layout
  if (status === "authenticated" && session?.user?.role === "employer") {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="pt-16">{children}</div>
      </div>
    )
  }

  // Return null while redirecting
  return null
}

