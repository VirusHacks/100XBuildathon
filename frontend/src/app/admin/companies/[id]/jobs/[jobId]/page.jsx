"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { ArrowLeft, Edit, Trash2, Users, Circle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatSalary, formatDate } from "@/lib/utils"

export default function JobDetailsPage() {
  // Use useParams hook instead of directly accessing params
  const params = useParams()
  const jobId = params.jobId
  const companyId = params.id // Note: the folder is [id] not [companyId]

  const router = useRouter()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`/api/jobs/${jobId}`)
        setJob(data.job) // Assuming job data is in 'data.job'
      } catch (err) {
        console.error("Error fetching job:", err)
        setError("Failed to load job details")
        toast.error("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return

    try {
      setDeleteLoading(true)
      await axios.delete(`/api/jobs/${jobId}`)
      toast.success("Job deleted successfully")
      router.push(`/admin/companies/${companyId}`)
    } catch (err) {
      console.error("Error deleting job:", err)
      toast.error("Failed to delete job")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-lg">Loading job details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Job not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Job header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">{job.title}</h1>
            <div className="flex items-center text-muted-foreground text-sm">
              <span>{job.company?.name}</span>
              <span className="mx-2">•</span>
              <span>{job.location}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="h-9">
              <Link href={`/admin/companies/${companyId}/jobs/${jobId}/applications`}>
                <Users className="mr-2 h-4 w-4" />
                View Applications
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-9">
              <Link href={`/admin/companies/${companyId}/jobs/${jobId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading} className="h-9 text-white ">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize">
            {job.status}
          </Badge>
          <span className="text-sm text-muted-foreground">Posted {formatDate(job.createdAt)}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - 2/3 width */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Description */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.requirements }} />
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.benefits }} />
              </CardContent>
            </Card>
          )}

          {/* Application Questions */}
          {job.questions && job.questions.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Application Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.questions.map((question, index) => (
                    <li key={question._id || index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <div>
                        <p>{question.text}</p>
                        {question.required && <span className="text-sm text-muted-foreground">(Required)</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="text-sm text-muted-foreground">Job Type</span>
                <span>{job.jobType}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="text-sm text-muted-foreground">Location</span>
                <span>{job.location}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="text-sm text-muted-foreground">Salary</span>
                <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="text-sm text-muted-foreground">Experience</span>
                <span>{job.experienceLevel}</span>
              </div>

              {job.education && (
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-sm text-muted-foreground">Education</span>
                  <span>{job.education.level}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills && job.skills.length > 0 ? (
                  job.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="bg-muted/50">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Circle
                  className={`h-3 w-3 mr-2 fill-current ${
                    job.status === "active" ? "text-green-500" : "text-amber-500"
                  }`}
                />
                <span className="text-sm">
                  {job.status === "active"
                    ? "This job is visible to candidates"
                    : "This job is not visible to candidates"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

