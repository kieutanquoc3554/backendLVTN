const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadImage = async (req, res) => {
  try {
    const filePath = req.file.path;
    const uploadOptions = req.file.mimetype.startsWith("video/")
      ? { resource_type: "video", folder: "productVideos" }
      : { folder: "productImage" };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: "Upload successful!",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra! Vui lòng thử lại sau" });
  }
};

module.exports = { uploadImage };
