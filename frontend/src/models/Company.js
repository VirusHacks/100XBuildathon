import mongoose from "mongoose"

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Company description is required"],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
    },
    companyType: {
      type: String,
      required: [true, "Company type is required"],
    },
    companySize: {
      type: String,
      required: [true, "Company size is required"],
    },
    foundedYear: {
      type: Number,
    },
    website: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    logo: {
      type: String, // URL to the logo image
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    socialMedia: {
      linkedin: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
    },
    benefits: [String],
    culture: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Create a compound index for userId and name to ensure uniqueness
CompanySchema.index({ userId: 1, name: 1 }, { unique: true })

export default mongoose.models.Company || mongoose.model("Company", CompanySchema)

