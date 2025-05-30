import mongoose from "mongoose";

// Define the Job Schema
const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Assuming title is required
    },
    description: {
      type: String,
      required: true, // Assuming description is required
    },
    requirements: {
      type: String,
      required: true, // Assuming requirements are required
    },
    responsibilities: {
      type: String,
      required: true, // Assuming responsibilities are required
    },
    location: {
      type: String,
      required: true, // Assuming location is required
    },
    locationType: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"], // Possible values for location type
      default: "On-site",
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract"], // Possible employment types
      default: "Full-time",
    },
    experienceLevel: {
      type: String,
      enum: ["Junior", "Mid Level", "Senior", "Lead"], // Possible experience levels
      default: "Mid Level",
    },
    salaryMin: {
      type: Number,
      required: true, // Assuming salary min is required
    },
    salaryMax: {
      type: Number,
      required: true, // Assuming salary max is required
    },
    salaryCurrency: {
      type: String,
      default: "USD", // Default currency is USD
    },
    salaryPeriod: {
      type: String,
      enum: ["Daily","Hourly", "Weekly", "Yearly", "Monthly"], // Possible salary periods
      default: "Yearly",
    },
    skills: {
      type: [String], // Array of skill strings
      default: [],
    },
    benefits: {
      type: [String], // Array of strings for benefits
      default: ["Health Insurance", "Paid Time Off", "Remote Work Options"],
    },
    applicationDeadline: {
      type: Date, // Deadline date for application
      required: false, // Optional, assuming it may not always be provided
    },
    isActive: {
      type: Boolean,
      default: true, // Job is active by default
    },
    isFeatured: {
      type: Boolean,
      default: false, // Job is not featured by default
    },
    company: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
          required: true,
        },
    employer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

// Create indexes for searching
// JobSchema.index({ title: "text", description: "text", skills: "text" }) // Full-text search for title, description, and skills
// JobSchema.index({ isActive: 1, title: 1 }) // Index for active jobs, ordered by title
// JobSchema.index({ location: 1, isActive: 1 }) // Index for location and active status
// JobSchema.index({ employmentType: 1, isActive: 1 }) // Index for employment type and active status
// JobSchema.index({ experienceLevel: 1, isActive: 1 }) // Index for experience level and active status


export default mongoose.models.Job || mongoose.model("Job", JobSchema)

