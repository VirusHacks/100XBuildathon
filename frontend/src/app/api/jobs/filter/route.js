import { NextResponse } from "next/server"
import connectDB from "@/lib/dbConnect"
import Job from "@/models/Job"
import Company from "@/models/Company"

export async function GET() {
  try {
    await connectDB()

    // Get unique job types
    const jobTypes = await Job.distinct("type")

    // Get unique skills (flatten and deduplicate)
    const allJobs = await Job.find({}, "skills")
    const skills = [...new Set(allJobs.flatMap((job) => job.skills || []))]

    // Get unique education levels
    const educationLevels = await Job.distinct("education.level")

    // Get organizations (companies)
    const companies = await Company.find({}, "name logo")
    const organizations = companies.map((company) => ({
      id: company._id,
      name: company.name,
      logo: company.logo,
    }))

    // Get salary ranges
    const salaryRanges = await Job.aggregate([
      {
        $group: {
          _id: null,
          minSalary: { $min: "$salary.min" },
          maxSalary: { $max: "$salary.max" },
        },
      },
    ])

    // Sort options
    const sortOptions = [
      { id: "relevance", label: "Relevance" },
      { id: "recent", label: "Most Recent" },
      { id: "salary-high", label: "Salary (High to Low)" },
      { id: "salary-low", label: "Salary (Low to High)" },
    ]

    return NextResponse.json({
      jobTypes,
      skills,
      educationLevels,
      organizations,
      salaryRanges: salaryRanges[0] || { minSalary: 0, maxSalary: 0 },
      sortOptions,
    })
  } catch (error) {
    console.error("Error fetching filter options:", error)
    return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 })
  }
}

