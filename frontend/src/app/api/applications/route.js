import { NextResponse } from "next/server"
import connectDB from "@/lib/dbConnect"
import Application from "@/models/Application"
import Job from "@/models/Job"
import User from "@/models/User"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import cloudinary from "@/lib/cloudinary"

export async function GET(request, { params }) {
  try {
    // Ensure params is awaited
    const { id } = await params

    await connectDB()

    console.log(`Fetching applications for job ID: ${id}`)

    // First, check if the job exists
    const job = await Job.findById(id)
    if (!job) {
      console.error(`Job not found with ID: ${id}`)
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    console.log(`Found job: ${job.title}`)

    // Fetch applications for this job
    const applications = await Application.find({ job: id }).sort({ createdAt: -1 }).lean()

    console.log(`Found ${applications.length} applications for job ID: ${id}`)

    return NextResponse.json({
      job,
      applications,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications", details: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    // Ensure params is awaited
    const { id } = params

    await connectDB()

    // Get current user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Validate jobId
    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Check if job exists and get company ID
    const job = await Job.findById(id)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Log the job data to debug
    console.log("Job data:", {
      _id: job._id,
      title: job.title,
      company: job.company,
    })

    // Ensure we have a company ID
    if (!job.company) {
      console.error("Job has no associated company:", id)
      return NextResponse.json({ error: "Job has no associated company" }, { status: 400 })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: id,
      user: userId,
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }

    // Process form data
    const formData = await request.formData()
    const applicationDataJson = formData.get("applicationData")

    if (!applicationDataJson) {
      return NextResponse.json({ error: "Application data is required" }, { status: 400 })
    }

    const applicationDataFromForm = JSON.parse(applicationDataJson)

    // Validate required fields
    if (!applicationDataFromForm.fullName || !applicationDataFromForm.email || !applicationDataFromForm.phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 })
    }

    // Process resume file if provided
    let resumeData = null
    const resumeFile = formData.get("resume")

    if (resumeFile) {
      try {
        console.log("Processing resume file:", resumeFile.name, resumeFile.type, resumeFile.size)

        // Check if Cloudinary is properly configured
        if (
          !process.env.CLOUDINARY_CLOUD_NAME ||
          !process.env.CLOUDINARY_API_KEY ||
          !process.env.CLOUDINARY_API_SECRET
        ) {
          console.error("Cloudinary configuration missing")
          return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
        }

        // Convert file to buffer
        const buffer = Buffer.from(await resumeFile.arrayBuffer())

        // Upload to Cloudinary with proper error handling
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "job-portal/resumes",
              public_id: `resume-${userId}-${Date.now()}`,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error)
                reject(error)
              } else {
                console.log("Cloudinary upload success:", result.secure_url)
                resolve(result)
              }
            },
          )

          uploadStream.write(buffer)
          uploadStream.end()
        })

        resumeData = {
          url: result.secure_url,
          publicId: result.public_id,
          filename: resumeFile.name,
          contentType: resumeFile.type,
        }

        console.log("Resume data:", resumeData)
      } catch (uploadError) {
        console.error("Error uploading resume:", uploadError)

        // If you want to fail the entire application on resume upload failure, uncomment this:
        return NextResponse.json({ error: "Failed to upload resume", details: uploadError.message }, { status: 500 })
      }
    }

    // Create application with explicit company field
    const applicationToCreate = {
      job: id,
      user: userId,
      company: job.company, // Use the company ID directly
      fullName: applicationDataFromForm.fullName,
      email: applicationDataFromForm.email,
      phone: applicationDataFromForm.phone,
      status: "pending",
    }

    // Add resume data if available
    if (resumeData) {
      applicationToCreate.resume = resumeData
    }

    console.log("Creating application with data:", applicationToCreate)

    const application = new Application(applicationToCreate)
    const savedApplication = await application.save()

    console.log("Application saved with ID:", savedApplication._id)

    // Update job's applications array
    await Job.findByIdAndUpdate(id, {
      $addToSet: { applications: savedApplication._id },
    })

    // Update user's applications list if the user model has this field
    if (user.applications) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { applications: savedApplication._id },
      })
    }

    return NextResponse.json({
      message: "Application submitted successfully",
      application: savedApplication,
    })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json({ error: "Failed to submit application", details: error.message }, { status: 500 })
  }
}

