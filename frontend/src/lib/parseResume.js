import axios from "axios"

// Dynamically import pdf-parse to prevent build-time errors
let pdfParse;
const loadPdfParser = async () => {
  if (!pdfParse) {
    try {
      const module = await import("pdf-parse");
      pdfParse = module.default;
    } catch (error) {
      console.error("Error loading pdf-parse:", error);
      return null;
    }
  }
  return pdfParse;
};

export async function fetchResumeText(resumeUrl) {
  try {
    // Skip processing during build time
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return "Resume text unavailable during build";
    }
    
    if (!resumeUrl) return ""

    // Download the resume file
    const response = await axios.get(resumeUrl, {
      responseType: "arraybuffer",
    })

    // Check file type
    const fileExtension = resumeUrl.split(".").pop().toLowerCase()

    if (fileExtension === "pdf") {
      // Dynamically load the PDF parser
      const pdfParser = await loadPdfParser();
      if (!pdfParser) {
        return "PDF parsing unavailable";
      }
      
      // Parse PDF
      const data = await pdfParser(response.data)
      return data.text
    } else if (fileExtension === "docx" || fileExtension === "doc") {
      // For Word documents, you would need a different parser
      // This is a simplified version
      return "Word document parsing not implemented"
    } else {
      return "Unsupported file format"
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    return "Error parsing resume"
  }
}