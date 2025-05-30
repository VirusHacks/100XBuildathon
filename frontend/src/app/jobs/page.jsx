"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import JobSidebar from "@/components/jobs/JobSidebar"
import JobCard from "@/components/jobs/JobCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ApplicationModal from "@/components/jobs/ApplicationModal"
import Navbar from "@/components/Navbar"
import AdminNavbar from "@/components/admin-navbar"

export default function JobsPage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeFilters, setActiveFilters] = useState(null)

  useEffect(() => {
    fetchJobs()
    fetchUserProfile()
  }, [searchParams, activeFilters, currentPage])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams(window.location.search)
      queryParams.set("page", currentPage)

      const { data } = await axios.get(`/api/jobs?${queryParams.toString()}`)
      setJobs(data.jobs || [x])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get("/api/users/profile")
      setUserProfile(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const handleApplyClick = (job) => {
    setSelectedJob(job)
    setShowApplicationModal(true)
  }

  const handleCloseModal = () => {
    setShowApplicationModal(false)
    setSelectedJob(null)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleFiltersChange = (newFilters) => {
    setActiveFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
    fetchJobs()
  }

  return (
    <>
    <AdminNavbar />
    
    <div className="container mx-auto py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8">Find Your Next Opportunity</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64">
          <JobSidebar onFiltersChange={handleFiltersChange} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-muted-foreground">Showing {jobs.length} jobs</p>
              </div>

              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onApplyClick={() => handleApplyClick(job)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search filters or check back later for new opportunities.
              </p>
              <Button onClick={() => (window.location.href = "/jobs")}>Clear Filters</Button>
            </div>
          )}
        </main>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <ApplicationModal job={selectedJob} userProfile={userProfile} onClose={handleCloseModal} />
      )}
    </div>
    </>
  )
}

