import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Job from "@/models/Job"
import Company from "@/models/Company"

// Update the POST function to match the actual schema requirements
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    // Check if user is an employer
    if (session.user.role !== "employer") {
      return NextResponse.json(
        { message: "Only employers can create jobs", success: false },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Parse request body
    const jobData = await request.json();

    // Map the jobData to make sure it aligns with your field names
    const mappedJobData = {
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      responsibilities: jobData.responsibilities,
      location: jobData.location,
      locationType: jobData.locationType || "On-site", // Default "On-site" if not provided
      employmentType: jobData.employmentType || "Full-time", // Default "Full-time"
      experienceLevel: jobData.experienceLevel || "Mid Level", // Default "Mid Level"
      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
      salaryCurrency: jobData.salaryCurrency || "USD", // Default "USD"
      salaryPeriod: jobData.salaryPeriod || "Yearly", // Default "Yearly"
      skills: jobData.skills || [], // Default empty array
      benefits: jobData.benefits || ["Health Insurance", "Paid Time Off", "Remote Work Options"], // Default benefits
      applicationDeadline: jobData.applicationDeadline,
      company: jobData.companyId, // Assuming companyId is passed in the job data
    };

    // Validate required fields
    const requiredFields = [
      "title",
      "company",
      "location",
      "employmentType",
      "experienceLevel",
      "salaryMin",
      "salaryMax",
      "description",
      "requirements",
      "responsibilities",
    ];

    const missingFields = requiredFields.filter((field) => !mappedJobData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          success: false,
        },
        { status: 400 }
      );
    }

    // Create the new job entry in the database
    const newJob = new Job({
      ...mappedJobData,
      employer: session.user.id,  // Assume user ID is from session (employer)
    });

    console.log(newJob);

    // Save the job document to the database
    await newJob.save();

    // Return a success response
    return NextResponse.json(
      { message: "Job created successfully", success: true, job: newJob },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
    

// Helper function to map experience level string to number
function mapExperienceLevelToNumber(level) {
  const levelMap = {
    "Entry Level": 1,
    "Mid Level": 2,
    "Senior Level": 3,
    Executive: 4,
    Internship: 0,
  }

  return levelMap[level] || 2 // Default to Mid Level (2) if not found
}

// Keep the GET function as is
export async function GET(request) {
  try {
    // Connect to database
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10) // Default to 10 jobs per page
    const skip = (page - 1) * limit

    // Build query
    const query = {}

    if (companyId) {
      query.company = companyId
    }

    // Get jobs with pagination and error handling
    try {
      // Fetch jobs from the database with pagination
      const jobs = await Job.find(query)
        .sort({ createdAt: -1 }) // Sort by created date, descending
        .skip(skip)
        .limit(limit)
        .populate("company", "name logo") // Populate company information (name and logo)

      // Get the total number of jobs matching the query (for pagination)
      const total = await Job.countDocuments(query)

      return NextResponse.json({
        jobs, // Send the jobs data
        pagination: {
          total, // Total number of jobs
          page, // Current page
          limit, // Number of jobs per page
          pages: Math.ceil(total / limit), // Total number of pages
        },
        success: true,
      })
    } catch (dbError) {
      console.error("Database query error:", dbError)
      return NextResponse.json(
        { message: "Error retrieving jobs", error: dbError.message, success: false },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Get jobs error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}
