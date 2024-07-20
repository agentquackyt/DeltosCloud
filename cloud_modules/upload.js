// upload.js
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a folder with a UUID as the folder name
    const folderPath = path.join(__dirname, "/../data_storage");
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const filename = uuidv4() + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({ storage });

module.exports = upload;
