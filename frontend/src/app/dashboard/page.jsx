import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-lg">
            Welcome, <span className="font-semibold">{session.user.name}</span>!
          </p>
          <p className="text-sm text-gray-600">You are logged in as a regular user.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-4 border rounded-lg shadow-sm">
            <h2 className="font-semibold mb-2">Your Profile</h2>
            <p>Email: {session.user.email}</p>
            <p>Role: {session.user.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

