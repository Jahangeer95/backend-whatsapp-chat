const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const whatsappStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "whatsapp-uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `whatsapp-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });
const whatsappUploads = multer({ storage: whatsappStorage });

module.exports = {
  upload,
  whatsappUploads,
};
