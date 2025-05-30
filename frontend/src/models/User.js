import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  // Core fields (NextAuth compatible)
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "employer"],
    default: "user",
  },
  provider: {
    type: String,
    default: "credentials",
  },

  // Profile fields (from Express model)
  profile: {
    bio: { type: String },
    skills: [{ type: String }],
    resume: { type: String }, // URL to resume file
    resumeOriginalName: { type: String },
    socialLinks: [{ type: String }],
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    profilePhoto: {
      type: String,
      default: "",
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.User || mongoose.model("User", UserSchema)

