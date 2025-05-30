import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Job from "@/models/Job"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { LLMChain } from "langchain/chains"
import { PromptTemplate } from "@langchain/core/prompts"
import { getJson } from "serpapi"
import { careerPathwayTemplate } from "@/lib/prompt.templates"

// Initialize Gemini
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-pro",
  maxOutputTokens: 2048,
})

// Parse AI response to JSON
function parseToJson(input) {
  const sections = input.split(/\n(?=\*\*)/).filter(Boolean)
  const result = {}

  sections.forEach((section) => {
    const [headerLine, ...contentLines] = section.split("\n").filter(Boolean)
    const header = headerLine.replace(/\*\*/g, "").trim() // Extract the header
    const content = contentLines.map((line) => {
      if (line.startsWith("- **")) {
        // For Timeline key-value items
        const [key, value] = line
          .slice(2)
          .split(":")
          .map((str) => str.trim())
        return { [key]: value }
      }
      return line.replace(/^- /, "").trim() // For regular list items
    })

    result[header] = content.flat()
  })

  return result
}

// Career pathway prompt template
// const careerPathwayTemplate = `
// You are a career advisor specializing in tech careers. Create a detailed career pathway for someone interested in the following job:

// Title: {title}
// Description: {description}
// Requirements: {requirements}

// Please structure your response as follows:

// **Skills Required**
// - List the technical skills needed for this role
// - List the soft skills needed for this role

// **Learning Path**
// - Recommend specific courses, resources, or learning paths
// - Include both free and paid options

// **Career Timeline**
// - **Entry Level**: What positions can lead to this role
// - **Mid-Level**: What this current role entails
// - **Senior Level**: Where this role can lead to in the future

// **Industry Insights**
// - Current trends in this field
// - Future outlook for this role
// - Average salary range

// Format your response in markdown with bullet points for easy readability.
// `

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const jobId = params.id

    // Step 1: Fetch Job Details
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ message: "Job not found", success: false }, { status: 404 })
    }

    // Step 2: Generate Career Pathway using LangChain
    const prompt = new PromptTemplate({
      template: careerPathwayTemplate,
      inputVariables: ["title", "description", "requirements"],
    })

    const chain = new LLMChain({ llm, prompt })
    const initialPathway = await chain.call({
      title: job.title,
      description: job.description,
      requirements: job.requirements.join(", "),
    })

    // Step 3: Fetch Live Certifications using SerpAPI
    const query = `Top certifications or courses for ${job.title}`
    const searchResults = await getJson({
      engine: "google",
      q: query,
      api_key: process.env.SERP_API_KEY,
    })

    const certifications = searchResults?.organic_results?.map((result) => ({
      title: result.title,
      link: result.link,
    }))

    const properPathWay = parseToJson(initialPathway.text.trim())

    // Step 4: Combine and Return Results
    return NextResponse.json(
      {
        pathway: {
          status: "success",
          job: {
            id: job._id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
          },
          pathStr: initialPathway.text.trim(),
          pathJson: properPathWay,
          certifications,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Generate job pathway error:", error)
    return NextResponse.json(
      {
        pathway: {
          status: "error",
          message: error.message,
        },
      },
      { status: 500 },
    )
  }
}

