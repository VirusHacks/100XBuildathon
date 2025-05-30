"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  Building,
  Plus,
  Search,
  MapPin,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  Edit,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteCompanyId, setDeleteCompanyId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [applicationsNumber, setApplicationsNumber] = useState(0)

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    } else if (status === "authenticated" && session?.user?.role !== "employer") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/companies?userId=${session.user.id}`)
          const data = await response.json()

          // Fetch application counts for each company
          await Promise.all(
            data.companies.map(async (company) => {
              try {
                const appResponse = await fetch(`/api/companies/${company._id}/applications`)
                if (appResponse.ok) {
                  const appData = await appResponse.json()
                  // Add applications count to the company object
                  company.applicationsCount = appData.applications.length
                } else {
                  company.applicationsCount = 0
                }
              } catch (error) {
                console.error(`Error fetching applications for company ${company._id}:`, error)
                company.applicationsCount = 0
              }
            }),
          )

          // Calculate total applications
          const totalApplicationsCount = data.companies.reduce(
            (total, company) => total + (company.applicationsCount || 0),
            0,
          )
          setApplicationsNumber(totalApplicationsCount)

          if (!response.ok) {
            throw new Error("Failed to fetch companies")
          }
          setCompanies(data.companies || [])
        } catch (error) {
          console.error("Error fetching companies:", error)
          setError("Failed to load companies. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchCompanies()
  }, [status, session])

  // Filter companies based on search query
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle company deletion
  const handleDeleteCompany = async () => {
    if (!deleteCompanyId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/companies/${deleteCompanyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete company")
      }

      // Remove company from state
      setCompanies(companies.filter((company) => company._id !== deleteCompanyId))
      setDeleteCompanyId(null)
    } catch (error) {
      console.error("Error deleting company:", error)
      setError("Failed to delete company. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Show loading state while checking session
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-theme-1">Employer Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your companies and job postings</p>
            </div>

            <Button
              onClick={() => router.push("/admin/register-company")}
              className="bg-gradient-to-r from-theme-2 to-theme-3 hover:from-theme-3 hover:to-theme-2 text-white group bg-gray-900"
            >
              <Plus className="mr-2 h-4 w-4" />
              Register New Company
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search companies by name or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 focus-visible:ring-theme-2"
              />
            </div>
          </div>

          {companies.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Companies Yet</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  You haven't registered any companies yet. Register your first company to start posting jobs and
                  finding talent.
                </p>
                <Button
                  onClick={() => router.push("/admin/register-company")}
                  className="bg-gradient-to-r from-theme-2 to-theme-3 hover:from-theme-3 hover:to-theme-2 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Register Your First Company
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Card key={company._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-2 bg-gradient-to-r from-theme-2 via-theme-3 to-theme-8"></div>
                  <CardHeader className="pb-2 relative">
                    <div className="absolute right-6 top-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <svg
                              width="15"
                              height="3"
                              viewBox="0 0 15 3"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M1.5 1.5H13.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company._id}`)}>
                            <Building className="mr-2 h-4 w-4" />
                            View Company
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company._id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Company
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/companies/${company._id}/jobs/new`)}>
                            <Briefcase className="mr-2 h-4 w-4" />
                            Post New Job
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteCompanyId(company._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {company.logo ? (
                          <img
                            src={company.logo || "/placeholder.svg"}
                            alt={`${company.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{company.name}</CardTitle>
                        <CardDescription>{company.industry}</CardDescription>
                      </div>
                    </div>

                    {company.isVerified && (
                      <Badge className="absolute top-4 left-6 bg-green-100 text-green-700 hover:bg-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.city}, {company.country}
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      Registered {new Date(company.createdAt).toLocaleDateString()}
                    </div>

                    <Separator className="mb-4" />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <Briefcase className="h-5 w-5 text-theme-2 mb-1" />
                        <span className="font-semibold">0</span>
                        <span className="text-gray-500">Active Jobs</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 text-theme-9 mb-1" />
                        <span className="font-semibold">{company.applicationsCount || 0}</span>
                        <span className="text-gray-500">Applications</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Button
                      className="w-full bg-theme-2 hover:bg-theme-3 text-white"
                      onClick={() => router.push(`/admin/companies/${company._id}/jobs/new`)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Post a Job
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCompanyId} onOpenChange={(open) => !open && setDeleteCompanyId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot be undone and will remove all associated
              jobs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCompanyId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Company"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

