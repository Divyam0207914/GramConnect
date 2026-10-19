import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

// Function to configure Cloudinary when needed
export const configureCloudinary = () => {
  // Check if environment variables are available
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary environment variables not found. Please check your .env file.');
    return null;
  }
  
  if (!isConfigured) {
    console.log('Configuring Cloudinary with environment variables...');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    isConfigured = true;
    console.log('Cloudinary configured successfully');
  }
  return cloudinary;
};

export default cloudinary;