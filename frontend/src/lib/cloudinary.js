import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary


console.log("Cloudinary configured with cloud name:", process.env.CLOUDINARY_CLOUD_NAME)

/**
 * Uploads an image to Cloudinary
 * @param {File|Buffer|string} file - The file to upload (can be a file object, buffer, or base64 string)
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - The upload result with URL and other details
 */
export async function uploadImage(file, options = {}) {
  try {
    // Default options
    const defaultOptions = {
      folder: "job-portal/logos",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
        { flags: "preserve_transparency" },
      ],
    }

    // Merge default options with provided options
    const uploadOptions = { ...defaultOptions, ...options }

    console.log("Cloudinary upload options:", JSON.stringify(uploadOptions, null, 2))

    let result

    // If file is a File object from browser (for client-side uploads)
    if (typeof file === "object" && file instanceof File) {
      // Convert File to base64
      const base64Data = await fileToBase64(file)
      console.log("Converting File to base64 for upload")
      result = await cloudinary.uploader.upload(base64Data, uploadOptions)
    } else if (Buffer.isBuffer(file)) {
      // If file is a Buffer (for server-side uploads)
      console.log("Uploading buffer to Cloudinary, size:", file.length)
      result = await cloudinary.uploader.upload(`data:image/png;base64,${file.toString("base64")}`, uploadOptions)
    } else {
      // If file is already a base64 string or URL
      console.log("Uploading string/URL to Cloudinary")
      result = await cloudinary.uploader.upload(file, uploadOptions)
    }

    console.log("Cloudinary upload successful:", {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    })

    return result
  } catch (error) {
    console.error("Cloudinary upload error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    })
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

/**
 * Converts a File object to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - The base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - The deletion result
 */
export async function deleteImage(publicId) {
  try {
    console.log("Deleting image from Cloudinary:", publicId)
    const result = await cloudinary.uploader.destroy(publicId)
    console.log("Cloudinary delete result:", result)
    return result
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

