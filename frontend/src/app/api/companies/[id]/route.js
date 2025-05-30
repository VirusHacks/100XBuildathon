import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/dbConnect"
import Company from "@/models/Company"
import { uploadImage, deleteImage } from "@/lib/cloudinary"

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Connect to database
    await dbConnect()

    // Find company by ID
    const company = await Company.findById(id)

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ company, success: true })
  } catch (error) {
    console.error("Get company error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Find company by ID
    const company = await Company.findById(id)

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 })
    }

    // Check if user is authorized to update this company
    if (company.userId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Check if the request is multipart/form-data (has files)
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      // Handle form data with file upload
      const formData = await request.formData()

      // Extract data from form
      const updates = Object.fromEntries(
        Array.from(formData.entries()).filter(([key]) => key !== "logo" && key !== "userId"),
      )

      // Update company fields
      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          company[key] = updates[key]
        }
      })

      // Handle logo upload if provided
      const logoFile = formData.get("logo")
      if (logoFile && logoFile.size > 0) {
        try {
          // Delete old logo if exists
          if (company.logoPublicId) {
            await deleteImage(company.logoPublicId)
          }

          // Convert file to buffer for Cloudinary upload
          const buffer = Buffer.from(await logoFile.arrayBuffer())

          // Upload to Cloudinary
          const result = await uploadImage(buffer, {
            folder: `job-portal/logos/${company.name.toLowerCase().replace(/\s+/g, "-")}`,
            public_id: `logo-${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
          })

          company.logo = result.secure_url
          company.logoPublicId = result.public_id
        } catch (error) {
          console.error("Logo upload error:", error)
          // Continue without updating logo if upload fails
        }
      }
    } else {
      // Handle JSON request (no file upload)
      const updates = await request.json()

      // Update company fields
      Object.keys(updates).forEach((key) => {
        // Don't allow updating userId or logo directly via JSON
        if (key !== "userId" && key !== "logo" && key !== "logoPublicId" && updates[key] !== undefined) {
          company[key] = updates[key]
        }
      })
    }

    await company.save()

    return NextResponse.json({
      message: "Company updated successfully",
      company,
      success: true,
    })
  } catch (error) {
    console.error("Update company error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Find company by ID
    const company = await Company.findById(id)

    if (!company) {
      return NextResponse.json({ message: "Company not found" }, { status: 404 })
    }

    // Check if user is authorized to delete this company
    if (company.userId.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    // Delete logo from Cloudinary if exists
    if (company.logoPublicId) {
      try {
        await deleteImage(company.logoPublicId)
      } catch (error) {
        console.error("Error deleting logo from Cloudinary:", error)
        // Continue with company deletion even if logo deletion fails
      }
    }

    // Delete company
    await Company.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Company deleted successfully",
      success: true,
    })
  } catch (error) {
    console.error("Delete company error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error.message, success: false },
      { status: 500 },
    )
  }
}

