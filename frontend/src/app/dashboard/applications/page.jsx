"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2, FileText, ExternalLink, Building } from "lucide-react"

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchApplications = async () => {
      if (status === "loading") return

      if (!session) {
        setError("You must be signed in to view your applications")
        setLoading(false)
        return
      }

      try {
        const response = await axios.get("/api/applications")
        setApplications(response.data)
      } catch (err) {
        console.error("Error fetching applications:", err)
        setError("Failed to load your applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [session, status])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link
          href="/signin"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-yellow-100 text-yellow-800"
      case "Reviewing":
        return "bg-blue-100 text-blue-800"
      case "Interview":
        return "bg-purple-100 text-purple-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Hired":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-sm font-medium text-blue-600 truncate">{application.company}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}
                      >
                        {application.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <span className="truncate">{application.job?.title || "Job position"}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Applied {format(new Date(application.appliedAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex space-x-4">
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Resume
                    </a>
                    {application.job && (
                      <Link
                        href={`/jobs/${application.job._id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Job
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

