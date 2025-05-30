import { OpenAI } from "openai"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { extractedText } = body

    if (!extractedText) {
      return NextResponse.json({ error: "Missing extractedText" }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const systemMessage = `
      You are an AI assistant trained to parse and structure resumes into a standardized JSON format.
      Given an unstructured resume text, your task is to accurately extract relevant information and format it into a well-structured JSON object.
      Ensure the output is properly formatted, complete, and syntactically valid JSON.
      If some details are missing, infer reasonable placeholders instead of leaving fields empty.
      The JSON format must strictly match the following structure:

      {
        "jobDescription": "Software Engineer",
        "user": {
          "personalDetails": {
            "name": "Full Name",
            "email": "Email",
            "phone": "Phone Number",
            "portfolio": "Portfolio URL",
            "summary": "Short professional summary"
          },
          "socialLinks": {
            "LinkedIn": "LinkedIn URL",
            "GitHub": "GitHub URL",
            "Leetcode": "Leetcode URL"
          },
          "education": [
            "Degree from University (Year, GPA)",
            "High School Education (Year, Percentage)"
          ],
          "experience": [
            {
              "company": "Company Name",
              "role": "Job Title",
              "duration": "Start Date - End Date",
              "description": "Key responsibilities and achievements"
            }
          ],
          "projects": [
            {
              "name": "Project Name",
              "description": "Project Description",
              "link": "Project Link"
            }
          ],
          "skills": ["Skill1", "Skill2", "Skill3"],
          "achievements": [
            "Achievement 1",
            "Achievement 2"
          ],
          "certifications": [
            "Certification Name (Provider) - Certificate Link"
          ],
          "otherDetails": "Languages, volunteering, additional relevant info"
        }
      }

      The output must always be valid JSON.
      If some sections are missing in the resume, infer missing details or return an empty list for that section.
    `

    const userMessage = `Resume Text:\n${extractedText}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    })

    const structuredResume = JSON.parse(response.choices[0].message.content)

    return NextResponse.json(structuredResume)
  } catch (error) {
    console.error("Error processing resume:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

