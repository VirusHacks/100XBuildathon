import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/dbConnect"
import Job from "@/models/Job"
import Application from "@/models/Application"
import User from "@/models/User"

export async function POST(request, { params }) {
  console.log("Job application API route called")

  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log("Unauthorized: No session found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", session.user.email)

    // 2. Connect to database
    try {
      await connectDB()
      console.log("Connected to database")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          message: "Database connection error",
          error: dbError.message,
        },
        { status: 500 },
      )
    }

    // 3. Get job ID and find job
    const jobId = params.id
    console.log("Job ID:", jobId)

    let job
    try {
      // Populate the company field to make sure we have the company data
      job = await Job.findById(jobId).populate("companyId")

      if (!job) {
        console.log("Job not found")
        return NextResponse.json({ message: "Job not found" }, { status: 404 })
      }

      console.log("Job found:", job.title)
      console.log(
        "Company data:",
        job.companyId ? `ID: ${job.companyId._id}, Name: ${job.companyId.name}` : "No company data",
      )

      // If job exists but has no company, this is a data integrity issue
      if (!job.companyId) {
        console.error("Job exists but has no associated company")
        return NextResponse.json(
          {
            message: "Invalid job data: missing company reference",
          },
          { status: 400 },
        )
      }
    } catch (jobError) {
      console.error("Error finding job:", jobError)
      return NextResponse.json(
        {
          message: "Error finding job",
          error: jobError.message,
        },
        { status: 500 },
      )
    }

    // 4. Parse form data
    let formData
    let applicationData

    try {
      formData = await request.formData()
      console.log("Form data keys:", [...formData.keys()])

      const applicationDataJson = formData.get("applicationData")

      if (!applicationDataJson) {
        console.log("Application data is missing")
        return NextResponse.json({ message: "Application data is required" }, { status: 400 })
      }

      applicationData = JSON.parse(applicationDataJson)
      console.log("Application data parsed successfully")
    } catch (formError) {
      console.error("Error parsing form data:", formError)
      return NextResponse.json(
        {
          message: "Error parsing form data",
          error: formError.message,
        },
        { status: 400 },
      )
    }

    // 5. Get user
    let user
    try {
      user = await User.findOne({ email: session.user.email })

      if (!user) {
        console.log("User not found")
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }

      console.log("User found:", user._id)
    } catch (userError) {
      console.error("Error finding user:", userError)
      return NextResponse.json(
        {
          message: "Error finding user",
          error: userError.message,
        },
        { status: 500 },
      )
    }

    // 6. Create application
    try {
      // Prepare resume data
      const resumeData = user.resume // Default to user's existing resume

      // Log the job object to see what we're working with
      console.log(
        "Job object:",
        JSON.stringify({
          id: job._id,
          title: job.title,
          companyId: job.companyId._id,
        }),
      )

      // Create the application with the correct company reference
      const application = new Application({
        job: jobId,
        user: user._id,
        company: job.companyId._id, // Use companyId from the job
        fullName: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone,
        coverLetter: applicationData.coverLetter || "",
        resume: resumeData,
        portfolioUrl: applicationData.portfolioUrl || "",
        linkedinUrl: applicationData.linkedinUrl || "",
        githubUrl: applicationData.githubUrl || "",
        referral: applicationData.referral || "",
        questions: Object.entries(applicationData.questions || {}).map(([questionId, answer]) => ({
          question: questionId,
          answer: answer || "",
        })),
      })

      console.log("Application created, about to save")
      await application.save()
      console.log("Application saved successfully")

      // Update user's applications
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { applications: application._id },
      })
      console.log("User applications updated")

      // Update job's applications count
      await Job.findByIdAndUpdate(jobId, {
        $inc: { applicationsCount: 1 },
      })
      console.log("Job applications count updated")

      return NextResponse.json({
        message: "Application submitted successfully",
        applicationId: application._id,
      })
    } catch (saveError) {
      console.error("Error saving application:", saveError)
      return NextResponse.json(
        {
          message: "Error saving application",
          error: saveError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unhandled error in job application API:", error)
    return NextResponse.json(
      {
        message: "Server error processing application",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

