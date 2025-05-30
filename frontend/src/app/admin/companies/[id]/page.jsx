"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { use } from "react"
import Image from "next/image"
import {
  Building,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  Briefcase,
  Edit,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CustomTabs, CustomTabsContent } from "@/components/custom-tabs"

export default function CompanyDetails({ params }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params)
  const companyId = unwrappedParams.id

  const { data: session, status } = useSession()
  const router = useRouter()
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [jobStats, setJobStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
  })

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    } else if (status === "authenticated" && session?.user?.role !== "employer") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Fetch company and jobs data
  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          setIsLoading(true)

          // Fetch company details
          const companyResponse = await fetch(`/api/companies/${companyId}`)
          if (!companyResponse.ok) {
            const errorData = await companyResponse.json()
            throw new Error(errorData.message || "Failed to fetch company")
          }
          const companyData = await companyResponse.json()

          // Check if user owns this company
          if (companyData.company.userId.toString() !== session.user.id) {
            router.push("/admin")
            return
          }

          setCompany(companyData.company)

          // Fetch company jobs
          const jobsResponse = await fetch(`/api/jobs?companyId=${companyId}`)
          if (!jobsResponse.ok) {
            const errorData = await jobsResponse.json()
            throw new Error(errorData.message || "Failed to fetch jobs")
          }
          const jobsData = await jobsResponse.json()

          const jobsList = jobsData.jobs || []
          setJobs(jobsList)

          // Calculate job statistics
          const activeJobsCount = jobsList.filter((job) => job.isActive).length
          let totalApplicationsCount = 0

          // Fetch application counts for each job
          await Promise.all(
            jobsList.map(async (job) => {
              try {
                const appResponse = await fetch(`/api/jobs/${job._id}/applications`)
                if (appResponse.ok) {
                  const appData = await appResponse.json()
                  // Add the length of the applications array to the total count
                  totalApplicationsCount += appData.applications.length
                  // Update the job object with the correct count for display in the UI
                  job.applicationsCount = appData.applications.length
                }
              } catch (error) {
                console.error(`Error fetching applications for job ${job._id}:`, error)
              }
            }),
          )

          setJobStats({
            activeJobs: activeJobsCount,
            totalApplications: totalApplicationsCount,
          })
        } catch (error) {
          console.error("Error fetching data:", error)
          setError(error.message || "Failed to load company data")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [status, session, companyId, router])

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-theme-2 animate-spin" />
          <div className="mt-4 text-theme-1 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!company) return null

  // Job Card Component
  const JobCard = ({ job }) => (
    <Card className={`hover:shadow-md transition-shadow ${!job.isActive ? "opacity-75" : ""}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location} • {job.locationType}
            </div>
          </div>
          <div className="flex gap-2">
            {job.isFeatured && <Badge className="bg-amber-100 text-amber-700">Featured</Badge>}
            {!job.isActive && <Badge variant="secondary">Inactive</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{job.employmentType}</Badge>
          <Badge variant="outline">{job.experienceLevel}</Badge>
          {job.salaryMin && job.salaryMax && (
            <Badge variant="outline">
              {job.salaryCurrency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} /{" "}
              {job.salaryPeriod}
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {job.applicationsCount || 0} Applications
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push(`/admin/companies/${companyId}/jobs/${job._id}`)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const tabsConfig = [
    { value: "all", label: "All Jobs" },
    { value: "active", label: "Active Jobs" },
    { value: "inactive", label: "Inactive Jobs" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-theme-1">{company.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{company.industry}</Badge>
                  {company.isVerified && (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push(`/admin/companies/${companyId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Company
              </Button>
              <Button
                onClick={() => router.push(`/admin/companies/${companyId}/jobs/new`)}
                className="bg-theme-2 hover:bg-theme-3 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Company Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {company.logo ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={company.logo || "/placeholder.svg"}
                          alt={`${company.name} logo`}
                          fill
                          className="object-contain p-2"
                          unoptimized
                          onError={(e) => {
                            console.error("Image failed to load:")
                          }}
                        />
                        {/* Add a fallback in case the image fails to load */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0">
                          <Building className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <Building className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <CardTitle className="text-center">{company.name}</CardTitle>
                  <CardDescription className="text-center">{company.industry}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {company.city}, {company.country}
                    </span>
                  </div>
                  {company.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-2 hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{company.email}</span>
                  </div>
                  {company.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{company.companySize} employees</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Founded in {company.foundedYear}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{company.companyType}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Briefcase className="h-6 w-6 mx-auto mb-2 text-theme-2" />
                    <div className="text-2xl font-bold">{jobStats.activeJobs}</div>
                    <div className="text-sm text-gray-500">Active Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-theme-9" />
                    <div className="text-2xl font-bold">{jobStats.totalApplications}</div>
                    <div className="text-sm text-gray-500">Total Applications</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Job Listings</CardTitle>
                    <Button
                      onClick={() => router.push(`/admin/companies/${companyId}/jobs/new`)}
                      className="bg-theme-2 hover:bg-theme-3 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Post New Job
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CustomTabs defaultTab="all" tabs={tabsConfig}>
                    <CustomTabsContent value="all">
                      <div className="space-y-4">
                        {jobs.length === 0 ? (
                          <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Jobs Posted</h3>
                            <p className="text-gray-500">Start posting jobs to find the perfect candidates.</p>
                          </div>
                        ) : (
                          jobs.map((job) => <JobCard key={job._id} job={job} />)
                        )}
                      </div>
                    </CustomTabsContent>

                    <CustomTabsContent value="active">
                      <div className="space-y-4">
                        {jobs.filter((job) => job.isActive).length === 0 ? (
                          <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Jobs</h3>
                            <p className="text-gray-500">All your job postings are currently inactive.</p>
                          </div>
                        ) : (
                          jobs.filter((job) => job.isActive).map((job) => <JobCard key={job._id} job={job} />)
                        )}
                      </div>
                    </CustomTabsContent>

                    <CustomTabsContent value="inactive">
                      <div className="space-y-4">
                        {jobs.filter((job) => !job.isActive).length === 0 ? (
                          <div className="text-center py-8">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Inactive Jobs</h3>
                            <p className="text-gray-500">All your job postings are currently active.</p>
                          </div>
                        ) : (
                          jobs.filter((job) => !job.isActive).map((job) => <JobCard key={job._id} job={job} />)
                        )}
                      </div>
                    </CustomTabsContent>
                  </CustomTabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

