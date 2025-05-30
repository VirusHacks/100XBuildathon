import { NextRequest } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import dbConnect from "@/lib/dbConnect";
import Job from "@/models/Job";
import Application from "@/models/Application";

export async function POST(req) {
  try {
    const { messages, jobId, applicationId } = await req.json();
    
    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];
    
    if (!lastUserMessage || lastUserMessage.role !== "user") {
      return Response.json(
        { error: "Invalid request: No user message found" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();
    
    // Fetch job data with populated company
    const job = jobId 
      ? await Job.findById(jobId).populate('company', 'name').lean()
      : null;
    
    // Fetch application data
    let applicationData = null;
    let allApplications = [];
    
    if (jobId) {
      // Fetch all applications for this job
      allApplications = await Application.find({ job: jobId })
        .sort({ "aiAnalysis.cumulative_ranking_score": -1 })
        .limit(20)
        .lean();
      
      // If applicationId is provided, find the specific application
      if (applicationId) {
        applicationData = allApplications.find(app => app._id.toString() === applicationId);
      }
    }
    
    // Prepare context for the AI
    const jobContext = job 
      ? `
        Job Title: ${job.title}
        Company: ${job.company?.name || 'Not specified'}
        Location: ${job.location} (${job.locationType})
        Employment Type: ${job.employmentType}
        Experience Level: ${job.experienceLevel}
        Salary Range: ${job.salaryMin}-${job.salaryMax} ${job.salaryCurrency} (${job.salaryPeriod})
        
        Description: ${job.description}
        
        Requirements: ${job.requirements}
        
        Responsibilities: ${job.responsibilities}
        
        Required Skills: ${job.skills?.join(", ") || "Not specified"}
        
        Benefits: ${job.benefits?.join(", ") || "Not specified"}
      ` 
      : "No specific job context provided.";
    
    const applicationContext = applicationData 
      ? `
        Candidate: ${applicationData.fullName}
        Email: ${applicationData.email}
        Phone: ${applicationData.phone}
        
        AI Score: ${applicationData.aiAnalysis?.cumulative_ranking_score || "Not scored"}
        Match Percentage: ${applicationData.cosine ? (applicationData.cosine * 100).toFixed(1) + "%" : "Not calculated"}
        Status: ${applicationData.status || "pending"}
        
        Portfolio: ${applicationData.portfolioUrl || "Not provided"}
        LinkedIn: ${applicationData.linkedinUrl || "Not provided"}
        GitHub: ${applicationData.githubUrl || "Not provided"}
        
        Cover Letter: ${applicationData.coverLetter ? "Provided" : "Not provided"}
        Resume: ${applicationData.resume?.url ? "Provided" : "Not provided"}
        
        AI Analysis:
        ${applicationData.aiAnalysis?.grouped_summary || "No summary available"}
        
        Key Observations:
        ${applicationData.aiAnalysis?.key_observations?.join("\n") || "No observations available"}
        
        Section Scores:
        - Experience & Projects: ${applicationData.aiAnalysis?.section_scores?.experience_projects || "Not scored"}
        - Skills: ${applicationData.aiAnalysis?.section_scores?.skills || "Not scored"}
        - Education & Certifications: ${applicationData.aiAnalysis?.section_scores?.education_certifications || "Not scored"}
        - Achievements: ${applicationData.aiAnalysis?.section_scores?.achievements || "Not scored"}
        - Social Validation: ${applicationData.aiAnalysis?.section_scores?.social_validation || "Not scored"}
      ` 
      : "No specific candidate selected.";
    
    const applicationsContext = allApplications.length > 0 
      ? `
        Top Candidates (${Math.min(5, allApplications.length)}):
        ${allApplications.slice(0, 5).map((app, index) => `
          ${index + 1}. ${app.fullName}
          - AI Score: ${app.aiAnalysis?.cumulative_ranking_score || "Not scored"}
          - Match: ${app.cosine ? (app.cosine * 100).toFixed(1) + "%" : "Not calculated"}
          - Status: ${app.status || "pending"}
          - Portfolio: ${app.portfolioUrl ? "Provided" : "Not provided"}
          - LinkedIn: ${app.linkedinUrl ? "Provided" : "Not provided"}
          - GitHub: ${app.githubUrl ? "Provided" : "Not provided"}
          ${app.aiAnalysis?.key_observations ? 
            `- Key Observations: ${app.aiAnalysis.key_observations.slice(0, 2).join(", ")}` : 
            "- No key observations available"}
        `).join("\n")}
      ` 
      : "No applications data available.";
    
    // System prompt for the AI
    const systemPrompt = `
      You are an AI recruitment assistant that helps explain candidate selection decisions and provides insights about job applicants.
      
      Your role is to:
      1. Explain why candidates were selected or rejected based on their data
      2. Compare candidates objectively using their scores and qualifications
      3. Answer questions about specific candidate data
      4. Provide insights about the recruitment process
      
      When responding:
      - Be concise and factual
      - Cite specific data points from the candidate profiles
      - Explain the AI scoring system when relevant (scores are from 0-100)
      - If you don't have enough information, say so clearly
      - If the query is unrelated to recruitment or candidates, politely redirect
      
      Current Context:
      ${jobContext}
      
      ${applicationContext}
      
      ${applicationsContext}
      
      Remember to be helpful, factual, and objective in your explanations.
    `;
    
    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: lastUserMessage.content,
    });
    
    return Response.json({ 
      role: "assistant", 
      content: text 
    });
    
  } catch (error) {
    console.error("Recruitment agent error:", error);
    return Response.json(
      { error: "Failed to process your request. Please check the server logs for more details." },
      { status: 500 }
    );
  }
}
