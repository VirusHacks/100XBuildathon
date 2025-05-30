import mongoose from "mongoose"

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    resume: {
      url: String,
      publicId: String,
      filename: String,
      contentType: String,
    },
    coverLetter: String,
    portfolioUrl: String,
    linkedinUrl: String,
    githubUrl: String,
    referral: String,
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    questions: {
      type: Map,
      of: String,
      default: {},
    },
    // New AI analysis fields
    aiAnalysis: {
      cumulative_ranking_score: {
        type: Number,
      },
      section_scores: {
        experience_projects: {
          type: Number,
        },
        skills: {
          type: Number,
        },
        education_certifications: {
          type: Number,
        },
        achievements: {
          type: Number,
        },
        social_validation: {
          type: Number,
        },
      },
      grouped_summary: {
        type: String,
      },
      key_observations: {
        type: [String],
      },
    },
    cosine: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Create a compound index for user and job to prevent duplicate applications



const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema)

export default Application

