import pdfParse from "pdf-parse"

/**
 * Parse a PDF file and extract its text content
 * @param {Buffer} pdfBuffer - The PDF file as a buffer
 * @returns {Promise<Object>} - Parsed PDF data in JSON format
 */
export async function parsePdfToJson(pdfBuffer) {
  try {
    const pdfData = await pdfParse(pdfBuffer)

    // Basic extraction of text content
    const content = pdfData.text

    // Create a simple JSON structure with the extracted data
    const result = {
      text: content,
      info: {
        pageCount: pdfData.numpages,
        author: pdfData.info?.Author || null,
        creationDate: pdfData.info?.CreationDate || null,
        creator: pdfData.info?.Creator || null,
        keywords: pdfData.info?.Keywords || null,
        producer: pdfData.info?.Producer || null,
        subject: pdfData.info?.Subject || null,
        title: pdfData.info?.Title || null,
      },
      metadata: pdfData.metadata,
      version: pdfData.version,
    }

    return result
  } catch (error) {
    console.error("Error parsing PDF:", error)
    throw new Error("Failed to parse PDF file")
  }
}

/**
 * Extract structured information from resume text
 * This is a basic implementation - for production, consider using NLP or AI
 * @param {string} text - The extracted text from the PDF
 * @returns {Object} - Structured resume data
 */
export function extractResumeData(text) {
  // Basic extraction of common resume sections
  // This is a simplified approach - a production version would use more sophisticated NLP

  const sections = {
    contact: {},
    education: [],
    experience: [],
    skills: [],
  }

  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const emails = text.match(emailRegex)
  if (emails) sections.contact.email = emails[0]

  // Extract phone
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex)
  if (phones) sections.contact.phone = phones[0]

  // Extract skills (look for common skill section headers and grab text after)
  const skillsRegex = /skills:?.*?([\s\S]*?)(?:\n\n|\n[A-Z])/i
  const skillsMatch = text.match(skillsRegex)
  if (skillsMatch && skillsMatch[1]) {
    sections.skills = skillsMatch[1]
      .split(/[,\n]/)
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
  }

  // This is a basic implementation
  // A more robust solution would use NLP or AI to better extract structured data

  return {
    rawText: text,
    structured: sections,
  }
}

