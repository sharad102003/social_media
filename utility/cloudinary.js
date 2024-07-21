const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error('File path is not provided');

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Auto-detects the file type (image, video, etc.)
    });

    console.log('Cloudinary upload result:', response);

    // Remove the local file after successful upload
    fs.unlinkSync(localFilePath);

    // Return the secure URL of the uploaded file
    return response.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);

    // Ensure local file is removed in case of an error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // Re-throw the error to handle it upstream
    throw error;
  }
};

module.exports = uploadOnCloudinary;
