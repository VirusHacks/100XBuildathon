"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function AuthStatus() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <div className="flex gap-2">
        <Link href="/signin" className="text-blue-600 hover:text-blue-800">
          Sign In
        </Link>
        <Link href="/signup" className="text-blue-600 hover:text-blue-800">
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <p>
        <span className="font-medium">{session.user.name}</span>
        <span className="text-gray-500 ml-1">({session.user.role})</span>
      </p>
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 hover:text-red-800">
        Sign Out
      </button>
    </div>
  )
}
