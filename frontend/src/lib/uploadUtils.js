import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to upload to
 * @returns {Promise<Object>} - The upload result
 */
export const uploadFile = async (file, folder = 'resumes') => {
  try {
    // Convert file to base64
    const fileStr = await readFileAsDataURL(file);
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: 'auto',
    });
    
    return {
      url: uploadResult.secure_url,
      filename: uploadResult.public_id,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed');
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('File deletion failed');
  }
};

/**
 * Read a file as a data URL
 * @param {File} file - The file to read
 * @returns {Promise<string>} - The data URL
 */
const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
