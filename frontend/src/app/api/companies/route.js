import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Company from "@/models/Company"
import User from "@/models/User"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an employer
    if (session.user.role !== "employer") {
      return NextResponse.json({ message: "Only employers can create companies" }, { status: 403 })
    }

    // Connect to database
    await dbConnect()

    // Parse form data
    const formData = await request.formData()

    // Extract data from form
    const name = formData.get("name")
    const description = formData.get("description")
    const industry = formData.get("industry")
    const companyType = formData.get("companyType")
    const companySize = formData.get("companySize")
    const foundedYear = formData.get("foundedYear")
    const website = formData.get("website")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const address = formData.get("address")
    const city = formData.get("city")
    const state = formData.get("state")
    const zipCode = formData.get("zipCode")
    const country = formData.get("country")
    const userId = formData.get("userId")
    const logoFile = formData.get("logo")

    // Validate required fields
    if (!name || !description || !industry || !companyType || !companySize || !email || !city || !country || !userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify user exists and is an employer
    const user = await User.findById(userId)
    if (!user || user.role !== "employer") {
      return NextResponse.json({ message: "Invalid user or not an employer" }, { status: 400 })
    }

    // Check if company with same name already exists for this user
    const existingCompany = await Company.findOne({ userId, name })
    if (existingCompany) {
      return NextResponse.json({ message: "You already have a company with this name" }, { status: 409 })
    }

    // Handle logo upload if provided
    let logoUrl = null
    let logoPublicId = null

    if (logoFile && logoFile.size > 0) {
      try {
        console.log("Logo file received:", {
          name: logoFile.name,
          type: logoFile.type,
          size: logoFile.size,
        })

        // Convert file to buffer for Cloudinary upload
        const buffer = Buffer.from(await logoFile.arrayBuffer())

        // Upload to Cloudinary with company name in the public_id for better organization
        console.log("Uploading to Cloudinary...")
        const result = await uploadImage(buffer, {
          folder: `job-portal/logos/${name.toLowerCase().replace(/\s+/g, "-")}`,
          public_id: `logo-${Date.now()}`,
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
            { flags: "preserve_transparency" },
          ],
        })

        logoUrl = result.secure_url
        logoPublicId = result.public_id

        console.log("Cloudinary upload successful:", {
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          resource_type: result.resource_type,
        })
      } catch (error) {
        console.error("Logo upload error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        })
        // Continue without logo if upload fails
      }
    }

    // Create new company
    const company = new Company({
      name,
      description,
      industry,
      companyType,
      companySize,
      foundedYear: foundedYear || undefined,
      website: website || undefined,
      email,
      phone: phone || undefined,
      address: address || undefined,
      city,
      state: state || undefined,
      zipCode: zipCode || undefined,
      country,
      logo: logoUrl,
      logoPublicId: logoPublicId,
      userId,
    })

    await company.save()

    // After creating the company, log the saved data
    console.log("Company saved with logo:", {
      companyId: company._id.toString(),
      logoUrl: company.logo,
      logoPublicId: company.logoPublicId,
    })

    return NextResponse.json(
      {
        message: "Company created successfully",
        company: {
          _id: company._id,
          name: company.name,
          industry: company.industry,
          logo: company.logo,
        },
        success: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create company error:", error)

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "You already have a company with this name", success: false },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // If userId is provided, get companies for that user
    if (userId) {
      // Only allow users to see their own companies or admins to see any
      if (session.user.id !== userId && session.user.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
      }

      const companies = await Company.find({ userId })
        .select("name industry logo city country isVerified createdAt")
        .sort({ createdAt: -1 })

      return NextResponse.json({ companies, success: true })
    }

    // Otherwise, return all companies (with pagination)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const skip = (page - 1) * limit

    const companies = await Company.find({})
      .select("name industry logo city country isVerified createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Company.countDocuments({})

    return NextResponse.json({
      companies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      success: true,
    })
  } catch (error) {
    console.error("Get companies error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}

