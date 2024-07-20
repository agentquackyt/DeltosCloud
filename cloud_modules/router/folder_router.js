const express = require("express");
const router = express.Router();
const path = require("path");
const FileModel = require("../model/FileModel");
const fs = require("fs");


// File download route
router.get("/:topic/api", async (req, res) => {
  try {
    // Retrieve all files from the database
    const files = await FileModel.find({ vLocation: "/" + req.params.topic });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.expirationDate && new Date() > file.expirationDate) {
        fs.rm(file.location, () => console.log("file deleted: " + file.name))
        await file.deleteOne();
      } else {
        var expire = false;
        if(file.expirationDate) expire = true;

        files[i] = {
          name: file.name,
          uuid: file.uuid,
          size: file.size,
          type: file.type,
          hasExpireDate: expire,
          downloadLink: `/files/${file.uuid}`
        }
      }
    }
    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// File download route
router.get("/:topic", async (req, res) => {
  // Serve the front-end HTML file
  res.sendFile(path.resolve(__dirname + "/../frontend/folder.html"));
});

module.exports = router;