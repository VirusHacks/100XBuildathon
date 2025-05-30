import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { uploadToCloudinary } from "@/lib/uploadUtils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { processFormDataFile } from "@/lib/multer"

// POST /api/users/profile/update - Update user profile
export async function POST(request) {
  try {
    await dbConnect()

    // Get user from session
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized", success: false }, { status: 401 })
    }

    const userId = session.user.id

    // Parse form data
    const formData = await request.formData()
    const name = formData.get("name")
    const email = formData.get("email")
    const phoneNumber = formData.get("phoneNumber")
    const bio = formData.get("bio")
    const skills = formData.get("skills")
    const socials = formData.get("socials")

    // Process file upload (could be resume or profile photo)
    const resumeFile = await processFormDataFile(formData, "resume")
    const profilePhotoFile = await processFormDataFile(formData, "profilePhoto")

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: "User not found", success: false }, { status: 400 })
    }

    // Handle file uploads
    let resumeResponse = null
    let profilePhotoResponse = null

    if (resumeFile) {
      resumeResponse = await uploadToCloudinary(resumeFile)
    }

    if (profilePhotoFile) {
      profilePhotoResponse = await uploadToCloudinary(profilePhotoFile)
    }

    // Update user data
    if (name) user.name = name
    if (email) user.email = email
    if (phoneNumber) user.phoneNumber = phoneNumber

    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {}
    }

    if (bio) user.profile.bio = bio

    if (skills) {
      const skillsArray = skills.split(",").map((skill) => skill.trim())
      user.profile.skills = skillsArray
    }

    if (socials) {
      const socialsArray = socials.split(",").map((social) => social.trim())
      user.profile.socialLinks = socialsArray
    }

    if (resumeResponse) {
      user.profile.resume = resumeResponse.secure_url
      user.profile.resumeOriginalName = resumeFile.originalname
    }

    if (profilePhotoResponse) {
      user.profile.profilePhoto = profilePhotoResponse.secure_url
    }

    await user.save()

    // User data to return
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: userData,
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

