import { NextResponse } from "next/server"
import connectDB from "@/lib/dbConnect"
import Application from "@/models/Application"
import Company from "@/models/Company"


export async function GET(request, { params }) {
  try {
    // Ensure params is awaited
    const { id } = await params

    await connectDB()

    console.log(`Fetching applications for job ID: ${id}`)

    // First, check if the job exists
    const company = await Company.findById(id)
    if (!company) {
      console.error(`company not found with ID: ${id}`)
      return NextResponse.json({ error: "company not found" }, { status: 404 })
    }

    console.log(`Found company: ${company.title}`)

    // Fetch applications for this job
    const applications = await Application.find({ company: id }).sort({ createdAt: -1 }).lean()

    console.log(`Found ${applications.length} applications for job ID: ${id}`)

    return NextResponse.json({
      company,
      applications,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications", details: error.message }, { status: 500 })
  }
}