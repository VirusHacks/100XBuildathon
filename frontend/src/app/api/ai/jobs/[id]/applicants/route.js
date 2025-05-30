import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Job from "@/models/Job"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { LLMChain } from "langchain/chains"
import { PromptTemplate } from "@langchain/core/prompts"
import { fetchResumeText } from "@/lib/parseResume"
import { applicationPromptTemplate, rankingPromptTemplate } from "@/lib/prompt.templates"

// Initialize Gemini
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-pro",
  maxOutputTokens: 2048,
})

// Application prompt template
// const applicationPromptTemplate = `
// You are an AI recruitment assistant. Analyze the fit between a job candidate and a position based on the following information:

// Job Requirements: {jobRequirements}
// Candidate Skills: {skills}
// Resume Text: {resumeText}
// Social Profiles: {socialProfiles}

// Please provide a detailed analysis covering:
// 1. Skills match (which skills align with the job requirements)
// 2. Experience relevance
// 3. Education fit
// 4. Potential strengths and weaknesses
// 5. Overall assessment of candidate suitability

// Be specific and reference details from the resume and social profiles.
// `

// Ranking prompt template
// const rankingPromptTemplate = `
// Based on the following candidate analysis, provide a numerical score from 1-100 that represents how well this candidate matches the job requirements:

// {aiInsights}

// Return only the numerical score without any additional text.
// `

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const jobId = params.id

    // Fetch job and applicants
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
      },
    })

    if (!job) {
      return NextResponse.json({ message: "Job not found", success: false }, { status: 404 })
    }

    // Extract job details for matching
    const jobRequirements = job.requirements

    // Process each applicant with AI
    const processedApplicants = await Promise.all(
      job.applications.map(async (application) => {
        const applicant = application.applicant
        const socials = applicant.profile.socialLinks

        // Parse resume
        const resumeText = await fetchResumeText(applicant.profile.resume)

        // Step 1: Generate AI insights
        const insightsChain = new LLMChain({
          llm,
          prompt: new PromptTemplate({
            template: applicationPromptTemplate,
            inputVariables: ["jobRequirements", "skills", "resumeText", "socialProfiles"],
          }),
        })

        const insightsResponse = await insightsChain.call({
          jobRequirements: jobRequirements.join(", "),
          skills: applicant.profile.skills.join(", "),
          resumeText: resumeText,
          socialProfiles: socials.join(", "),
        })

        const aiInsights = insightsResponse.text.trim()

        // Step 2: Generate ranking score
        const rankingChain = new LLMChain({
          llm,
          prompt: new PromptTemplate({
            template: rankingPromptTemplate,
            inputVariables: ["aiInsights"],
          }),
        })

        const rankingResponse = await rankingChain.call({
          aiInsights: aiInsights,
        })

        const rankingScore = rankingResponse.text.trim()

        // Return the structured output
        return {
          applicant: {
            id: applicant._id,
            fullname: applicant.fullname,
            email: applicant.email,
            skills: applicant.profile.skills,
          },
          insights: aiInsights,
          rankingScore: rankingScore,
        }
      }),
    )

    // Sort applicants by ranking score in descending order
    processedApplicants.sort((a, b) => b.rankingScore - a.rankingScore)

    return NextResponse.json(
      {
        job: {
          id: job._id,
          title: job.title,
          description: job.description,
        },
        applicants: processedApplicants,
        success: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("AI-enhanced applicants error:", error)
    return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 })
  }
}

