"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { use } from "react"
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building,
  ArrowLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function CreateJob({ params }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params)
  const companyId = unwrappedParams.id

  const { data: session, status } = useSession()
  const router = useRouter()

  const [company, setCompany] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    locationType: "On-site", // Default value
    employmentType: "Full-time", // Default value
    experienceLevel: "Mid Level", // Default value
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    salaryPeriod: "Yearly",
    skills: [],
    benefits: ["Health Insurance", "Paid Time Off", "Remote Work Options"], // Default common benefits
    applicationDeadline: "",
    isActive: true,
    isFeatured: false,
  })

  const [currentSkill, setCurrentSkill] = useState("")
  const [currentBenefit, setCurrentBenefit] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated or not an employer
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    } else if (status === "authenticated" && session?.user?.role !== "employer") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Fetch company details
  useEffect(() => {
    const fetchCompany = async () => {
      if (status === "authenticated" && companyId) {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/companies/${companyId}`)

          if (!response.ok) {
            throw new Error("Failed to fetch company")
          }

          const data = await response.json()

          // Check if user owns this company
          if (data.company.userId !== session.user.id) {
            router.push("/admin")
            return
          }

          setCompany(data.company)

          // Pre-fill location with company city and country
          if (data.company.city && data.company.country) {
            setFormData((prev) => ({
              ...prev,
              location: `${data.company.city}, ${data.company.country}`,
            }))
          }
        } catch (error) {
          console.error("Error fetching company:", error)
          setError("Failed to load company details. Please try again.")
          router.push("/admin")
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchCompany()
  }, [status, session, companyId, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Toggle function for checkboxes
  const toggleCheckbox = (name) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()],
      }))
      setCurrentSkill("")
    }
  }

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addBenefit = () => {
    if (currentBenefit.trim() && !formData.benefits.includes(currentBenefit.trim())) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()],
      }))
      setCurrentBenefit("")
    }
  }

  const removeBenefit = (benefit) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b !== benefit),
    }))
  }

  // Update the handleSubmit function to handle the new schema mapping
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Validate form data
      if (
        !formData.title ||
        !formData.description ||
        !formData.requirements ||
        !formData.responsibilities ||
        !formData.location ||
        !formData.locationType ||
        !formData.employmentType ||
        !formData.experienceLevel
      ) {
        throw new Error("Please fill in all required fields")
      }

      // Ensure salary is provided (required by the schema)
      if (!formData.salaryMin) {
        throw new Error("Minimum salary is required")
      }

      // Create job
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          companyId,
          salaryMin: formData.salaryMin ? Number(formData.salaryMin) : 0,
          salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
          applicationDeadline: formData.applicationDeadline || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          // Format validation errors for display
          const errorMessages = data.errors.map((err) => `${err.field}: ${err.message}`).join("\n")
          throw new Error(`Validation errors:\n${errorMessages}`)
        }
        throw new Error(data.message || "Failed to create job")
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to create job")
      }

      setSuccess("Job posted successfully!")

      // Redirect to job details page after a short delay
      setTimeout(() => {
        router.push(`/admin/companies/${companyId}/jobs/${data.job._id}`)
      }, 2000)
    } catch (error) {
      console.error("Error creating job:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking session or fetching company
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/admin/companies/${companyId}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-theme-1">Post a New Job</h1>
              <div className="flex items-center mt-2">
                <Building className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-gray-600">{company?.name}</p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card className="border-none shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-theme-2 via-theme-3 to-theme-8"></div>
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle>Job Details</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Required fields:</span>
                  <Badge className="bg-theme-2">5 fields</Badge>
                </div>
              </div>
              <CardDescription>
                Provide comprehensive information about the job to attract qualified candidates
              </CardDescription>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-4">
                <div
                  className="bg-gradient-to-r from-theme-2 to-theme-3 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Basic Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Frontend Developer"
                        required
                        className="focus-visible:ring-theme-2"
                      />
                      <p className="text-xs text-gray-500">Be specific to attract the right candidates</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">Employment Type *</Label>
                        <Select
                          value={formData.employmentType}
                          onValueChange={(value) => handleSelectChange("employmentType", value)}
                          required
                        >
                          <SelectTrigger className="focus:ring-theme-2">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experienceLevel">Experience Level *</Label>
                        <Select
                          value={formData.experienceLevel}
                          onValueChange={(value) => handleSelectChange("experienceLevel", value)}
                          required
                        >
                          <SelectTrigger className="focus:ring-theme-2">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                            <SelectItem value="Mid Level">Mid Level</SelectItem>
                            <SelectItem value="Senior Level">Senior Level</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="locationType">Location Type *</Label>
                        <Select
                          value={formData.locationType}
                          onValueChange={(value) => handleSelectChange("locationType", value)}
                          required
                        >
                          <SelectTrigger className="focus:ring-theme-2">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="On-site">On-site</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide a detailed description of the job..."
                        required
                        className="min-h-[120px] focus-visible:ring-theme-2"
                      />
                      <p className="text-xs text-gray-500">
                        Describe the role, responsibilities, and what makes this position unique
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location Information */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Location</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. New York, NY"
                      required
                      className="focus-visible:ring-theme-2"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.locationType === "Remote"
                        ? "For remote positions, you can specify 'Remote' or 'Remote - US Only', etc."
                        : "Specify the city and country/state where the job is located"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Requirements and Responsibilities */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Requirements & Responsibilities</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements *</Label>
                      <Textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="List the qualifications, skills, and experience required..."
                        required
                        className="min-h-[120px] focus-visible:ring-theme-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsibilities">Responsibilities *</Label>
                      <Textarea
                        id="responsibilities"
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleChange}
                        placeholder="Describe the key responsibilities and duties..."
                        required
                        className="min-h-[120px] focus-visible:ring-theme-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Template Selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-theme-2 mr-2" />
                      <h3 className="text-lg font-medium">Quick Templates</h3>
                    </div>
                    <p className="text-xs text-gray-500">Optional - Use these to save time</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto py-2 justify-start text-left"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          requirements:
                            "• Bachelor's degree in Computer Science or related field\n• 3+ years of experience in software development\n• Proficiency in JavaScript, React, and Node.js\n• Experience with RESTful APIs and database design\n• Strong problem-solving skills and attention to detail\n• Excellent communication and teamwork abilities",
                        }))
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Developer Requirements</span>
                        <span className="text-xs text-gray-500">Technical skills & qualifications</span>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto py-2 justify-start text-left"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          responsibilities:
                            "• Design and develop new features for our web application\n• Collaborate with cross-functional teams to define requirements\n• Write clean, maintainable, and efficient code\n• Troubleshoot and debug applications\n• Participate in code reviews and contribute to team standards\n• Stay up-to-date with emerging trends and technologies",
                        }))
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Developer Duties</span>
                        <span className="text-xs text-gray-500">Day-to-day responsibilities</span>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto py-2 justify-start text-left"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          benefits: [
                            ...prev.benefits,
                            "Flexible Working Hours",
                            "Professional Development",
                            "Health & Wellness Programs",
                            "401(k) Matching",
                          ],
                        }))
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Standard Benefits</span>
                        <span className="text-xs text-gray-500">Common employee perks</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Skills */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Skills</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="Add a required skill (e.g. React, JavaScript)"
                        className="focus-visible:ring-theme-2"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} className="bg-theme-2 hover:bg-theme-3 text-white">
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.skills.length === 0 ? (
                        <p className="text-sm text-gray-500">No skills added yet</p>
                      ) : (
                        formData.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-theme-2/10 text-theme-2 hover:bg-theme-2/20"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill}
                            <span className="ml-1 cursor-pointer">×</span>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Compensation */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Compensation</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Minimum Salary *</Label>
                      <Input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        placeholder="e.g. 50000"
                        className="focus-visible:ring-theme-2"
                        required
                      />
                      <p className="text-xs text-gray-500">Salary is required for job posting</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Maximum Salary</Label>
                      <Input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        placeholder="e.g. 70000"
                        className="focus-visible:ring-theme-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salaryCurrency">Currency</Label>
                      <Select
                        value={formData.salaryCurrency}
                        onValueChange={(value) => handleSelectChange("salaryCurrency", value)}
                      >
                        <SelectTrigger className="focus:ring-theme-2">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salaryPeriod">Period</Label>
                      <Select
                        value={formData.salaryPeriod}
                        onValueChange={(value) => handleSelectChange("salaryPeriod", value)}
                      >
                        <SelectTrigger className="focus:ring-theme-2">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hourly">Hourly</SelectItem>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Benefits */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Benefits</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={currentBenefit}
                        onChange={(e) => setCurrentBenefit(e.target.value)}
                        placeholder="Add a benefit (e.g. Health Insurance, 401k)"
                        className="focus-visible:ring-theme-2"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                      />
                      <Button type="button" onClick={addBenefit} className="bg-theme-2 hover:bg-theme-3 text-white">
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.length === 0 ? (
                        <p className="text-sm text-gray-500">No benefits added yet</p>
                      ) : (
                        formData.benefits.map((benefit, index) => (
                          <Badge
                            key={index}
                            className="bg-theme-9/10 text-theme-9 hover:bg-theme-9/20"
                            onClick={() => removeBenefit(benefit)}
                          >
                            {benefit}
                            <span className="ml-1 cursor-pointer">×</span>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Information */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Additional Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="applicationDeadline">Application Deadline</Label>
                      <Input
                        id="applicationDeadline"
                        name="applicationDeadline"
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="focus-visible:ring-theme-2"
                      />
                    </div>

                    {/* Job Status - Active/Inactive */}
                    <div
                      className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 cursor-pointer"
                      onClick={() => toggleCheckbox("isActive")}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${formData.isActive ? "bg-theme-2 text-white" : "border border-gray-300"}`}
                      >
                        {formData.isActive && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium cursor-pointer">Publish job immediately</Label>
                        <p className="text-xs text-gray-500">
                          {formData.isActive
                            ? "Job will be visible to job seekers once posted"
                            : "Job will be saved as inactive and can be activated later"}
                        </p>
                      </div>
                    </div>

                    {/* Featured Job */}
                    <div
                      className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 cursor-pointer"
                      onClick={() => toggleCheckbox("isFeatured")}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${formData.isFeatured ? "bg-theme-2 text-white" : "border border-gray-300"}`}
                      >
                        {formData.isFeatured && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium cursor-pointer">Feature this job</Label>
                        <p className="text-xs text-gray-500">
                          Featured jobs are highlighted in search results and get more visibility
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4 border-t p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/companies/${companyId}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-theme-2 to-theme-3 hover:from-theme-3 hover:to-theme-2 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

