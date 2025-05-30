"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye } from "lucide-react"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  reviewing: "bg-blue-100 text-blue-800 border-blue-200",
  interview: "bg-purple-100 text-purple-800 border-purple-200",
  offer: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
}

export default function ApplicationsList({ companyId, jobId }) {
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch applications for this job
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/jobs/${jobId}/applications`)
        setApplications(response.data.applications || [])
        setError(null)
      } catch (err) {
        setError("Failed to load applications")
        toast.error("Failed to load applications")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [jobId])

  // Filter applications by status
  const filteredApplications =
    statusFilter === "all" ? applications : applications.filter((app) => app.status === statusFilter)

  // View applicant details
  const viewApplicantDetails = (applicationId) => {
    router.push(`/admin/companies/${companyId}/jobs/${jobId}/applications/${applicationId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Applications</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center text-red-500">{error}</CardContent>
        </Card>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Applications Yet</h3>
              <p className="text-gray-500">You haven't received any applications for this job yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>All Applicants ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>
                      <div className="font-medium">{application.fullName}</div>
                      <div className="text-sm text-gray-500">{application.email}</div>
                    </TableCell>
                    <TableCell>{format(new Date(application.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[application.status] || "bg-gray-100"}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => viewApplicantDetails(application._id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

