import multer from "multer"
import { NextResponse } from "next/server"

// Configure multer to use memory storage
const storage = multer.memoryStorage()
const upload = multer({ storage })

/**
 * Processes a file from FormData and converts it to a buffer
 * @param {FormData} formData - The form data from the request
 * @param {string} fieldName - The name of the file field
 * @returns {Promise<Object|null>} - The file object with buffer
 */
export async function processFormDataFile(formData, fieldName = "file") {
  const file = formData.get(fieldName)

  if (!file || !(file instanceof File)) {
    return null
  }

  // Create a file object similar to what multer would provide
  const fileObj = {
    originalname: file.name,
    mimetype: file.type,
    size: file.size,
    buffer: null, // Will be populated after arrayBuffer() is called
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer()
  fileObj.buffer = Buffer.from(bytes)

  return fileObj
}

/**
 * Example of how to use the processFormDataFile function in an API route
 * @param {Request} request - The incoming request
 * @returns {Promise<NextResponse>} - The response
 */
export async function handleFileUpload(request, fieldName = "file") {
  try {
    const formData = await request.formData()
    const file = await processFormDataFile(formData, fieldName)

    if (!file) {
      return NextResponse.json({ message: "No file uploaded", success: false }, { status: 400 })
    }

    return file
  } catch (error) {
    console.error("File upload error:", error)
    throw error
  }
}

