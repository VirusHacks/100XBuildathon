"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "react-hot-toast"
import { X, Paperclip, CheckCircle, Upload, Info } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

import * as pdfjs from "pdfjs-dist/build/pdf"
// import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf"

// Set the worker source
// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function ApplicationModal({ job, userProfile, onClose }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorDetails, setErrorDetails] = useState(null)
  const [formData, setFormData] = useState({
    fullName: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    resume: userProfile?.resume || null,
  })
  const [errors, setErrors] = useState({})
  const [resumeFile, setResumeFile] = useState(null)
  const [Data, setData] = useState(null);
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)
  const [extractedResumeText, setExtractedResumeText] = useState("")

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: "File size should be less than 5MB" }))
        return
      }

      if (
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type)
      ) {
        setErrors((prev) => ({ ...prev, resume: "Please upload a PDF or Word document" }))
        return
      }

      setResumeFile(file)
      setErrors((prev) => ({ ...prev, resume: null }))

      // Extract text if it's a PDF
      if (file.type === "application/pdf") {
        extractTextFromPDF(file)
      } else {
        // Clear extracted text for non-PDF files
        setExtractedResumeText("")
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!resumeFile && !formData.resume) newErrors.resume = "Resume is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const extractTextFromPDF = async (file) => {
    setLoading(true)
    try {
      if (file.type !== "application/pdf") {
        console.log("Not a PDF file, skipping text extraction")
        return
      }

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load the PDF document
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

      // Extract text from each page
      let fullText = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item) => item.str).join(" ")
        fullText += pageText + "\n\n"
      }

      console.log("Extracted text from PDF:", fullText.substring(0, 100) + "...")
      setExtractedResumeText(fullText)
      

      const response = await fetch("/api/parseResume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedText: fullText }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch parsed resume");
      }

      const data = await response.json();
      // console.log(data)
      console.log("job id", job._id);
      console.log("job description", job.description)
      setData(data);

      


    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      toast.error("Failed to extract text from PDF")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorDetails(null);
  
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      console.log("Starting application submission process");
      console.log("Job data:", job);
  
      // Make parallel API calls:
      const [aiResponse, cosineResponse] = await Promise.all([
        fetch("https://hirexdelhi.app.n8n.cloud/webhook/cf1ebf23-56d4-40bb-b5e2-0aa82de2fed7", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: Data, job_description: job.description }),
        }).then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch parsed resume");
          }
          return res.json();
        }),
        fetch("https://cosine-backend.vercel.app/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_description: job.description,
            resume_text: extractedResumeText,
          }),
        }).then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch cosine similarity");
          }
          return res.json();
        }),
      ]);
  
      console.log("AI Response:", aiResponse);
      console.log("Cosine Similarity Response:", cosineResponse);
  
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
  
      // Add resume file if available
      if (resumeFile) {
        formDataToSend.append("resume", resumeFile);
        console.log("Resume file added to form data:", resumeFile.name);
      }
  
      // Build application data including both AI analysis and cosine similarity score
      const applicationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        resumeText: extractedResumeText, // extracted resume text
        aiAnalysis: aiResponse.output,    // AI analysis result
        cosine: cosineResponse.similarity_score, // cosine similarity score
      };
  
      formDataToSend.append("applicationData", JSON.stringify(applicationData));
      console.log("Application data added to form data");
  
      // Send application data to your API
      console.log("Sending application to API...");
      const response = await axios.post(`/api/jobs/${job._id}/applications`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Application submitted successfully:", response.data);
      setSuccess(true);
      toast.success("Application submitted successfully!");
  
      // Redirect to applications page after a delay
      setTimeout(() => {
        router.push("/jobs");
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error submitting application:", error);
  
      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to submit application";
  
      // Store detailed error information for debugging
      setErrorDetails({
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
      });
  
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  

  // Determine company name and logo
  const companyName = job.company?.name || "Company"
  const companyLogo = job.company?.logo || null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div ref={modalRef} className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b sticky top-0 bg-background z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold">{success ? "Application Submitted" : `Apply for ${job.title}`}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Your application for <span className="font-medium">{job.title}</span> at{" "}
              <span className="font-medium">{companyName}</span> has been submitted successfully.
            </p>
            <p className="text-muted-foreground mb-6">
              You can track the status of your application in your dashboard.
            </p>
            <Button
              onClick={() => {
                router.push("/dashboard/applications")
                onClose()
              }}
            >
              Go to My Applications
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Error details for debugging */}
            {errorDetails && (
              <Alert variant="destructive" className="m-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-2">Error Details</h4>
                    <p className="mb-2">Message: {errorDetails.message}</p>
                    <p className="mb-2">Status: {errorDetails.status}</p>
                    {errorDetails.data && (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(errorDetails.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            {/* Job summary */}
            <div className="px-6 py-4 bg-muted/50">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 bg-background rounded-md overflow-hidden flex items-center justify-center border">
                    {companyLogo ? (
                      <Image
                        src={companyLogo || "/placeholder.svg"}
                        alt={`${companyName} logo`}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded-full" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {companyName} • {job.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
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
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Resume <span className="text-destructive">*</span>
                    </Label>
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <div className="flex flex-col items-center text-center">
                        <Label
                          htmlFor="resume-upload"
                          className="text-primary hover:text-primary/90 cursor-pointer font-medium"
                        >
                          Click to upload
                        </Label>
                        <Input
                          id="resume-upload"
                          name="resume-upload"
                          type="file"
                          className="sr-only"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx"
                        />
                        <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF or Word up to 5MB</p>
                      </div>
                    </div>
                    {resumeFile && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <Paperclip className="h-4 w-4 mr-1.5" />
                        <span>{resumeFile.name}</span>
                      </div>
                    )}
                    {formData.resume && !resumeFile && (
                      <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <Paperclip className="h-4 w-4 mr-1.5" />
                        <span>Current resume: {formData.resume.filename}</span>
                      </div>
                    )}
                    {errors.resume && <p className="text-sm text-destructive">{errors.resume}</p>}
                  </div>
                </div>
              </div>

              {/* {resumeFile && resumeFile.type === "application/pdf" && (
                <div className="mt-4 space-y-2">
                  <Label>Extracted Resume Content</Label>
                  <div className="border rounded-md p-3 bg-muted/30 max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner className="mr-2" />
                        <span className="text-sm text-muted-foreground">Extracting text...</span>
                      </div>
                    ) : extractedResumeText ? (
                      <pre className="text-xs whitespace-pre-wrap">{extractedResumeText}</pre>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No text extracted</p>
                    )}
                  </div>
                </div>
              )} */}

              <Alert className="bg-primary/10 border-primary/20">
                <AlertDescription>
                  By submitting this application, you confirm that all information provided is accurate and complete.
                </AlertDescription>
              </Alert>
            </div>

            {/* Submit button */}
            <div className="px-6 py-4 bg-muted/30 border-t flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Loading...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

