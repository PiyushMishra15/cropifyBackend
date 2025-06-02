const cloudinary = require("cloudinary").v2;

// Configure Cloudinary once (outside function)
cloudinary.config({
  cloud_name: "dveqjb2e7",
  api_key: "867724896837487",
  api_secret: "xNnvrL8PLb1uOUXL2a0uO_X4zeo",
});

const uploadImageToCloudinary = async (buffer) => {
  try {
    const base64Str = buffer.toString("base64");
    const dataURI = `data:image/jpeg;base64,${base64Str}`; // change mime type if needed

    const result = await cloudinary.uploader.upload(dataURI);
    return result; // contains secure_url and other info
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Image upload failed");
  }
};

module.exports = uploadImageToCloudinary;
