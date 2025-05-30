"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Building, MapPin, Mail, Upload, CheckCircle, AlertCircle, Loader2, X, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const companyTypes = [
  "Startup",
  "Small Business",
  "Medium Enterprise",
  "Large Corporation",
  "Non-Profit",
  "Educational",
  "Government",
  "Freelancer",
]

const companySizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Media",
  "Transportation",
  "Construction",
  "Energy",
  "Other",
]

export default function RegisterCompany() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "Technology", // Default value
    companyType: "Small Business", // Default value
    companySize: "1-10", // Default value
    foundedYear: new Date().getFullYear(),
    website: "",
    email: session?.user?.email || "", // Pre-fill with user's email
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    logo: null,
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Redirect if not authenticated or not an employer
  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  if (status === "authenticated" && session?.user?.role !== "employer") {
    router.push("/dashboard")
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, GIF, or WEBP)")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setFormData((prev) => ({ ...prev, logo: file }))

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }))
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData()

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "logo" && formData[key]) {
          formDataToSend.append("logo", formData[key])
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key])
        }
      })

      // Add user ID from session
      formDataToSend.append("userId", session.user.id)

      // Send request to API
      const response = await fetch("/api/companies", {
        method: "POST",
        body: formDataToSend,
        // Don't set Content-Type header when sending FormData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create company")
      }

      setSuccess("Company registered successfully!")

      // Redirect to company dashboard after a short delay
      setTimeout(() => {
        router.push(`/admin/companies/${data.company._id}`)
      }, 2000)
    } catch (error) {
      console.error("Error creating company:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-theme-1">Register Your Company</h1>
            <p className="text-gray-600 mt-2">Complete your company profile to start posting jobs and finding talent</p>
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
                <CardTitle>Company Information</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Required fields:</span>
                  <Badge className="bg-theme-2">4 fields</Badge>
                </div>
              </div>
              <CardDescription>
                Provide details about your company to help job seekers learn more about you
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
                    <Building className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Basic Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corporation"
                        required
                        className="focus-visible:ring-theme-2"
                      />
                      <p className="text-xs text-gray-500">This is how your company will appear to job seekers</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => handleSelectChange("industry", value)}
                        required
                      >
                        <SelectTrigger className="focus:ring-theme-2">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Select
                        value={formData.foundedYear.toString()}
                        onValueChange={(value) => handleSelectChange("foundedYear", Number.parseInt(value))}
                      >
                        <SelectTrigger className="focus:ring-theme-2">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyType">Company Type *</Label>
                      <Select
                        value={formData.companyType}
                        onValueChange={(value) => handleSelectChange("companyType", value)}
                        required
                      >
                        <SelectTrigger className="focus:ring-theme-2">
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          {companyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size *</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => handleSelectChange("companySize", value)}
                        required
                      >
                        <SelectTrigger className="focus:ring-theme-2">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size} employees
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Company Description *</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us about your company, mission, values, and culture..."
                        required
                        className="min-h-[120px] focus-visible:ring-theme-2"
                      />
                      <p className="text-xs text-gray-500">
                        This will be displayed on your company profile and job listings
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Contact Information</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. careers@company.com"
                        required
                        className="focus-visible:ring-theme-2"
                      />
                      <p className="text-xs text-gray-500">Job applicants will contact you at this email</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +1 (555) 123-4567"
                        className="focus-visible:ring-theme-2"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="e.g. https://company.com"
                        className="focus-visible:ring-theme-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Location</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. San Francisco"
                        required
                        className="focus-visible:ring-theme-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleSelectChange("country", value)}
                        required
                      >
                        <SelectTrigger className="focus:ring-theme-2">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="China">China</SelectItem>
                          <SelectItem value="Brazil">Brazil</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address" className="flex items-center">
                        <span>Full Address</span>
                        <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your full address if you want it to appear on your company profile"
                        className="focus-visible:ring-theme-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Company Logo */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-theme-2 mr-2" />
                    <h3 className="text-lg font-medium">Company Logo</h3>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Logo Preview */}
                    <div
                      className={`w-32 h-32 rounded-lg flex items-center justify-center overflow-hidden border-2 ${
                        logoPreview ? "border-theme-2 border-solid" : "border-dashed border-gray-300"
                      } relative`}
                    >
                      {logoPreview ? (
                        <>
                          <Image
                            src={logoPreview || "/placeholder.svg"}
                            alt="Company logo preview"
                            width={128}
                            height={128}
                            className="object-contain"
                          />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                            title="Remove logo"
                          >
                            <X className="h-4 w-4 text-gray-600" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <ImageIcon className="h-12 w-12 mb-2" />
                          <span className="text-xs text-center">No logo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="logo">Upload Logo</Label>
                        <div className="flex flex-col gap-2">
                          <input
                            ref={fileInputRef}
                            id="logo"
                            name="logo"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={triggerFileInput}
                            className="w-full justify-center"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {logoPreview ? "Change Logo" : "Upload Logo"}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Upload a square logo in JPG, PNG, or WEBP format (max 5MB)
                        </p>
                        <p className="text-xs text-gray-500">
                          A professional logo helps your company stand out to job seekers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4 border-t p-6">
                <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-theme-2 to-theme-3 hover:from-theme-3 hover:to-theme-2 text-white bg-gray-900"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Complete Registration & Continue"
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

