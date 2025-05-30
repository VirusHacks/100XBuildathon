"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  Plus,
  X,
  Upload,
  User,
  Briefcase,
  GraduationCap,
  LinkIcon,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export default function ProfileForm({ initialData = {} }) {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(1)
  const totalSteps = 4
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(initialData.profileImage?.url || null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(initialData.coverImage?.url || null)
  const [formProgress, setFormProgress] = useState(0)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const resumeFileRef = useRef(null)

  // Initialize form data from props or defaults
  const [formData, setFormData] = useState({
    prefix: initialData.prefix || "",
    firstName: initialData.firstName || "",
    middleName: initialData.middleName || "",
    lastName: initialData.lastName || "",
    gender: initialData.gender || "",
    email: initialData.email || "",
    phoneCountry: initialData.phoneCountry || "US",
    phoneNumber: initialData.phoneNumber || "",
    previousEmployee: initialData.previousEmployee || "no",
    birthMonth: initialData.birthMonth || "",
    birthDay: initialData.birthDay || "",
    username: initialData.username || "",
    allowPersonalization: initialData.allowPersonalization ? "yes" : "no",
    headline: initialData.headline || "",
    summary: initialData.summary || "",
    skills: initialData.skills || [],
    newSkill: "",
    education: initialData.education || [],
    experience: initialData.experience || [],
    languages: initialData.languages || [],
    socialLinks: initialData.socialLinks || {
      linkedin: "",
      github: "",
      twitter: "",
      portfolio: "",
    },
    resume: initialData.resume || null,
  })

  const [errors, setErrors] = useState({})

  // Calculate progress
  useEffect(() => {
    calculateProgress()
  }, [formData, activeStep])

  const calculateProgress = () => {
    let progress = 0
    const totalFields = 12 // Total number of important fields
    let filledFields = 0

    // Basic Info (Step 1)
    if (formData.firstName) filledFields++
    if (formData.lastName) filledFields++
    if (formData.email) filledFields++
    if (formData.phoneNumber) filledFields++

    // Resume & Profile (Step 2)
    if (formData.resume || resumeFileRef.current?.files[0]) filledFields++
    if (formData.headline) filledFields++
    if (formData.summary) filledFields++
    if (profileImage || profileImagePreview) filledFields++

    // Skills & Education (Step 3)
    if (formData.skills.length > 0) filledFields++
    if (formData.education.length > 0) filledFields++

    // Experience & Links (Step 4)
    if (formData.experience.length > 0) filledFields++
    if (Object.values(formData.socialLinks).some((link) => link)) filledFields++

    progress = Math.round((filledFields / totalFields) * 100)
    setFormProgress(progress)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSelectChange = (name, value) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (type === "profile") {
        setProfileImage(file)
        setProfileImagePreview(URL.createObjectURL(file))
      } else if (type === "cover") {
        setCoverImage(file)
        setCoverImagePreview(URL.createObjectURL(file))
      } else if (type === "resume") {
        setFormData((prev) => ({
          ...prev,
          resume: {
            filename: file.name,
            uploadDate: new Date(),
          },
        }))

        // Clear error when user uploads file
        if (errors.resume) {
          setErrors((prev) => ({ ...prev, resume: null }))
        }
      }
    }
  }

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: "",
      }))
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleAddEducation = (e) => {
    e.preventDefault()
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          school: "",
          degree: "",
          field: "",
          startYear: "",
          endYear: "",
          current: false,
        },
      ],
    }))
  }

  const handleEducationChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  const handleRemoveEducation = (id) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const handleAddExperience = (e) => {
    e.preventDefault()
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now(),
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }))
  }

  const handleExperienceChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  const handleRemoveExperience = (id) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!formData.email.trim()) newErrors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(activeStep)) return

    setIsSubmitting(true)

    try {
      // Create FormData object for file uploads
      const formDataToSend = new FormData()

      // Add profile image if changed
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage)
      }

      // Add cover image if changed
      if (coverImage) {
        formDataToSend.append("coverImage", coverImage)
      }

      // Add resume if changed
      if (resumeFileRef.current?.files[0]) {
        formDataToSend.append("resume", resumeFileRef.current.files[0])
      }

      // Prepare user data without file objects
      const userDataToSend = {
        ...formData,
        allowPersonalization: formData.allowPersonalization === "yes",
      }

      // Remove temporary fields
      delete userDataToSend.newSkill

      // Add user data as JSON
      formDataToSend.append("userData", JSON.stringify(userDataToSend))

      // Send data to API
      await axios.put("/api/users/profile", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Show success message
      setShowSuccessMessage(true)
      toast.success("Profile updated successfully")

      // Navigate to dashboard after delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step indicators component
  const StepIndicators = () => (
    <div className="flex justify-between relative mb-8">
      <div className="absolute top-1/2 h-0.5 transform -translate-y-1/2 bg-gray-200 w-full" />
      {[
        { step: 1, label: "Basic Info", icon: User },
        { step: 2, label: "Resume & Profile", icon: Upload },
        { step: 3, label: "Skills & Education", icon: GraduationCap },
        { step: 4, label: "Experience & Links", icon: Briefcase },
      ].map(({ step, label, icon: Icon }) => (
        <div key={step} className="relative flex flex-col items-center z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === activeStep
                ? "bg-primary text-primary-foreground"
                : step < activeStep
                  ? "bg-green-500 text-white"
                  : "bg-background border-2 border-muted text-muted-foreground"
            } transition-all duration-200`}
          >
            {step < activeStep ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
          </div>
          <span
            className={`mt-2 text-xs font-medium ${step === activeStep ? "text-primary" : "text-muted-foreground"}`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">{formProgress}% Complete</span>
            <span className="text-sm font-medium text-muted-foreground">
              Step {activeStep} of {totalSteps}
            </span>
          </div>
          <Progress value={formProgress} className="h-2" />
        </div>
      </div>

      {/* Main content */}
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StepIndicators />

        <Card className="overflow-hidden">
          {/* Cover photo section */}
          <div className="relative h-64 bg-muted">
            {coverImagePreview ? (
              <Image
                src={coverImagePreview || "/placeholder.svg"}
                alt="Cover"
                className="w-full h-full object-cover"
                width={1200}
                height={300}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <label className="px-4 py-2 bg-background/90 rounded-lg shadow-sm cursor-pointer hover:bg-background transition-all duration-200 flex items-center">
                  <Upload className="w-5 h-5 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">Upload Cover Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "cover")}
                  />
                </label>
              </div>
            )}
            {coverImagePreview && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <label className="px-4 py-2 bg-background rounded-lg shadow-sm cursor-pointer hover:bg-muted transition-colors duration-200 flex items-center">
                  <Upload className="w-5 h-5 text-muted-foreground mr-2" />
                  <span className="text-sm font-medium">Change Cover Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "cover")}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Profile photo */}
          <div className="relative -mt-20 ml-8">
            <div className="relative w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted shadow-lg">
              {profileImagePreview ? (
                <Image
                  src={profileImagePreview || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  width={128}
                  height={128}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <User className="w-12 h-12 text-primary/40" />
                </div>
              )}
              <label className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <div className="text-white text-sm font-medium">
                  {profileImagePreview ? "Change Photo" : "Add Photo"}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "profile")}
                />
              </label>
            </div>
          </div>

          {/* Form content */}
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Information */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="prefix">Prefix</Label>
                        <Select value={formData.prefix} onValueChange={(value) => handleSelectChange("prefix", value)}>
                          <SelectTrigger id="prefix" className={errors.prefix ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select a prefix" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr">Mr.</SelectItem>
                            <SelectItem value="Mrs">Mrs.</SelectItem>
                            <SelectItem value="Ms">Ms.</SelectItem>
                            <SelectItem value="Dr">Dr.</SelectItem>
                            <SelectItem value="Prof">Prof.</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.prefix && <p className="text-sm text-destructive">{errors.prefix}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                          <SelectTrigger id="gender" className={errors.gender ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={errors.firstName ? "border-destructive" : ""}
                        />
                        {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={errors.lastName ? "border-destructive" : ""}
                        />
                        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middleName">
                        Middle Name <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                      </Label>
                      <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex">
                        <Select
                          value={formData.phoneCountry}
                          onValueChange={(value) => handleSelectChange("phoneCountry", value)}
                        >
                          <SelectTrigger id="phoneCountry" className="rounded-r-none w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">🇺🇸 +1</SelectItem>
                            <SelectItem value="GB">🇬🇧 +44</SelectItem>
                            <SelectItem value="IN">🇮🇳 +91</SelectItem>
                            <SelectItem value="AU">🇦🇺 +61</SelectItem>
                            <SelectItem value="CA">🇨🇦 +1</SelectItem>
                            <SelectItem value="DE">🇩🇪 +49</SelectItem>
                            <SelectItem value="FR">🇫🇷 +33</SelectItem>
                            <SelectItem value="IT">🇮🇹 +39</SelectItem>
                            <SelectItem value="JP">🇯🇵 +81</SelectItem>
                            <SelectItem value="BR">🇧🇷 +55</SelectItem>
                            <SelectItem value="RU">🇷🇺 +7</SelectItem>
                            <SelectItem value="CN">🇨🇳 +86</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className={`rounded-l-none flex-1 ${errors.phoneNumber ? "border-destructive" : ""}`}
                          placeholder="(555) 555-5555"
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Resume & Profile */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-semibold">Resume & Professional Profile</h2>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Upload your résumé</CardTitle>
                      <CardDescription>
                        Upload your resume to help employers learn more about your qualifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 transition-all duration-200 hover:border-primary/50 bg-muted/30 hover:bg-primary/5">
                        <div className="flex flex-col items-center">
                          <Upload className="h-12 w-12 text-muted-foreground" />
                          <div className="mt-4 flex text-sm">
                            <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => handleFileChange(e, "resume")}
                                ref={resumeFileRef}
                              />
                            </label>
                            <p className="pl-1 text-muted-foreground">or drag and drop</p>
                          </div>
                          <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      </div>
                      {formData.resume && (
                        <div className="flex items-center p-3 mt-4 bg-primary/5 rounded-lg border border-primary/20">
                          <Upload className="w-5 h-5 text-primary mr-2" />
                          <span className="text-sm font-medium">
                            {formData.resume.filename || resumeFileRef.current?.files[0]?.name || "Resume uploaded"}
                          </span>
                        </div>
                      )}
                      {errors.resume && <p className="mt-1 text-sm text-destructive">{errors.resume}</p>}
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="headline">
                        Professional Headline <span className="text-destructive">*</span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        A short headline that describes your professional identity (e.g., "Senior Software Engineer with
                        5+ years of experience in AI")
                      </p>
                      <Input
                        id="headline"
                        name="headline"
                        value={formData.headline}
                        onChange={handleChange}
                        placeholder="Your professional headline"
                        className={errors.headline ? "border-destructive" : ""}
                      />
                      {errors.headline && <p className="text-sm text-destructive">{errors.headline}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        A brief summary of your professional background, skills, and career goals
                      </p>
                      <Textarea
                        id="summary"
                        name="summary"
                        rows={4}
                        value={formData.summary}
                        onChange={handleChange}
                        placeholder="Write a professional summary..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Skills & Education */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-semibold">Skills & Education</h2>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                      <CardDescription>
                        Add skills that showcase your expertise (e.g., "JavaScript", "Project Management", "Data
                        Analysis")
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1.5 gap-1.5">
                            <span>{skill}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveSkill(skill)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove {skill}</span>
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex">
                        <Input
                          id="newSkill"
                          name="newSkill"
                          value={formData.newSkill}
                          onChange={handleChange}
                          placeholder="Add a skill"
                          className="rounded-r-none"
                        />
                        <Button type="button" onClick={handleAddSkill} className="rounded-l-none">
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle>Education</CardTitle>
                        <CardDescription>Add your educational background</CardDescription>
                      </div>
                      <Button type="button" onClick={handleAddEducation} size="sm" className="h-8">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Education
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {formData.education.length === 0 ? (
                        <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-2 text-sm font-medium">No education added</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Add your educational background to enhance your profile
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.education.map((edu) => (
                            <Card key={edu.id} className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveEducation(edu.id)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove education</span>
                              </Button>
                              <CardContent className="p-4 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>School/University</Label>
                                    <Input
                                      value={edu.school}
                                      onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                                      placeholder="University name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Degree</Label>
                                    <Input
                                      value={edu.degree}
                                      onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                                      placeholder="Bachelor's, Master's, etc."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Field of Study</Label>
                                    <Input
                                      value={edu.field}
                                      onChange={(e) => handleEducationChange(edu.id, "field", e.target.value)}
                                      placeholder="Computer Science, Business, etc."
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                      <Label>Start Year</Label>
                                      <Input
                                        value={edu.startYear}
                                        onChange={(e) => handleEducationChange(edu.id, "startYear", e.target.value)}
                                        placeholder="2018"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>End Year</Label>
                                      <Input
                                        value={edu.endYear}
                                        onChange={(e) => handleEducationChange(edu.id, "endYear", e.target.value)}
                                        placeholder="2022"
                                        disabled={edu.current}
                                      />
                                    </div>
                                  </div>
                                  <div className="md:col-span-2 flex items-center space-x-2">
                                    <Checkbox
                                      id={`current-edu-${edu.id}`}
                                      checked={edu.current}
                                      onCheckedChange={(checked) =>
                                        handleEducationChange(edu.id, "current", checked === true)
                                      }
                                    />
                                    <Label htmlFor={`current-edu-${edu.id}`} className="text-sm font-normal">
                                      I am currently studying here
                                    </Label>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Experience & Links */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-in fade-in-50 duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-semibold">Work Experience & Social Links</h2>
                  </div>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>Add your professional experience</CardDescription>
                      </div>
                      <Button type="button" onClick={handleAddExperience} size="sm" className="h-8">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Experience
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {formData.experience.length === 0 ? (
                        <div className="text-center py-6 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
                          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-2 text-sm font-medium">No experience added</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Add your work experience to showcase your professional journey
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {formData.experience.map((exp) => (
                            <Card key={exp.id} className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveExperience(exp.id)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove experience</span>
                              </Button>
                              <CardContent className="p-4 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Job Title</Label>
                                    <Input
                                      value={exp.title}
                                      onChange={(e) => handleExperienceChange(exp.id, "title", e.target.value)}
                                      placeholder="Software Engineer"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input
                                      value={exp.company}
                                      onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                                      placeholder="Company name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input
                                      value={exp.location}
                                      onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                                      placeholder="City, Country or Remote"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                      <Label>Start Date</Label>
                                      <Input
                                        value={exp.startDate}
                                        onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                                        placeholder="MM/YYYY"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>End Date</Label>
                                      <Input
                                        value={exp.endDate}
                                        onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                                        placeholder="MM/YYYY"
                                        disabled={exp.current}
                                      />
                                    </div>
                                  </div>
                                  <div className="md:col-span-2 flex items-center space-x-2">
                                    <Checkbox
                                      id={`current-exp-${exp.id}`}
                                      checked={exp.current}
                                      onCheckedChange={(checked) =>
                                        handleExperienceChange(exp.id, "current", checked === true)
                                      }
                                    />
                                    <Label htmlFor={`current-exp-${exp.id}`} className="text-sm font-normal">
                                      I currently work here
                                    </Label>
                                  </div>
                                  <div className="md:col-span-2 space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                      value={exp.description}
                                      onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                                      rows={3}
                                      placeholder="Describe your responsibilities and achievements..."
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Social & Professional Links</CardTitle>
                      <CardDescription>Add your online presence</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>LinkedIn</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                              <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            </div>
                            <Input
                              name="socialLinks.linkedin"
                              value={formData.socialLinks.linkedin}
                              onChange={handleChange}
                              className="rounded-l-none"
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>GitHub</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                              <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </div>
                            <Input
                              name="socialLinks.github"
                              value={formData.socialLinks.github}
                              onChange={handleChange}
                              className="rounded-l-none"
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Twitter</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                              <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                              </svg>
                            </div>
                            <Input
                              name="socialLinks.twitter"
                              value={formData.socialLinks.twitter}
                              onChange={handleChange}
                              className="rounded-l-none"
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Portfolio Website</Label>
                          <div className="flex">
                            <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                              <LinkIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input
                              name="socialLinks.portfolio"
                              value={formData.socialLinks.portfolio}
                              onChange={handleChange}
                              className="rounded-l-none"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>
                            Personalize your profile with job recommendations and related content?{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <RadioGroup
                            value={formData.allowPersonalization}
                            onValueChange={(value) => handleSelectChange("allowPersonalization", value)}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="personalize-yes" />
                              <Label htmlFor="personalize-yes" className="font-normal">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="personalize-no" />
                              <Label htmlFor="personalize-no" className="font-normal">
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="rounded-md bg-primary/5 p-4 border border-primary/10">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            <p className="text-sm text-primary/80">
                              We securely store your personal work history to give you personalized job alerts and help
                              recruiters find the perfect job for you.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-8 border-t border-border">
                {activeStep > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePrevStep} className="gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                ) : (
                  <div></div> // Empty div to maintain flex spacing
                )}

                <Button
                  type={activeStep === totalSteps ? "submit" : "button"}
                  onClick={activeStep === totalSteps ? undefined : handleNextStep}
                  disabled={isSubmitting}
                  variant={activeStep === totalSteps ? "default" : "default"}
                  className={`gap-1 ${activeStep === totalSteps ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : activeStep === totalSteps ? (
                    <>
                      Save Profile
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <Card className="relative max-w-md w-full mx-4 animate-in fade-in-50 zoom-in-95 duration-300">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Profile Updated!</h3>
              <p className="text-center text-muted-foreground mb-6">
                Your professional profile has been successfully updated. Get ready to explore exciting opportunities!
              </p>
              <div className="animate-pulse text-center text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

