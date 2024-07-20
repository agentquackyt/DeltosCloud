const express = require("express");
const router = express.Router();
const path = require("path");
const FileModel = require("./../model/FileModel");
const fs = require("fs");
const bodyParser = require("body-parser");

// File download route
router.get("/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;

    // Find the file in the database by UUID
    const file = await FileModel.findOne({ uuid });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    if (file.expirationDate && new Date() > file.expirationDate) {
      fs.rm(file.location, () => console.log("file deleted: " + file.name))
      await file.deleteOne();
      return res.status(404).json({ error: "File has been deleted: expired" });
    } else {
      return res.sendFile(file.location);
    }


  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).json({ error: "Failed to retrieve file" });
  }
});

router.get("/", async (req, res) => {
  try {
    // Retrieve all files from the database
    const files = await FileModel.find();
    let folders = [];
    let filesnew = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.expirationDate && new Date() > file.expirationDate) {
        fs.rm(file.location, () => console.log("file deleted: " + file.name))
        await file.deleteOne();
      } else {
        if (file.vLocation && file.vLocation.substring(1) != "/") {
          let hasAlready = false;
          for (let x = 0; x < folders.length; x++) {
            if (file.vLocation == folders[x]) hasAlready = true;
          }
          if (!hasAlready && file.vLocation != '') folders.push(file.vLocation.substring(1));
        }
        if (!file.vLocation || file.vLocation == "/") {
          filesnew.push({
            name: file.name,
            uuid: file.uuid,
            size: file.size,
            type: file.type,
            hasExpireDate: file.expirationDate ? true : false,
            downloadLink: `/files/${file.uuid}`
          });
        }
      }
    }
    const filteredArray = folders.filter((ele, pos) => folders.indexOf(ele) == pos);
    res.status(200).json({ files: filesnew, folders: filteredArray });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// File deletion route
router.get("/:uuid/del", async (req, res) => {
  try {
    const { uuid } = req.params;

    // Find the file in the database by UUID
    const file = await FileModel.findOne({ uuid });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    fs.rm(file.location, () => console.log("file deleted: " + file.name))
    // Delete the file document from the database
    await file.deleteOne();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});


// File deletion route
router.post("/:uuid/update",  async (req, res) => {
  try {
    const { uuid } = req.params;

    // Find the file in the database by UUID
    const file = await FileModel.findOne({ uuid });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    if(!file.type.startsWith("text") || file.type === "application/json") return res.status(404).json({ error: "File is not a text file" });
    // Write the new file content to the file location
    console.log(req.body);
    let realFile = await fs.writeFileSync(file.location, req.body.content);

    res.status(200).json({ message: "File updated successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

// File deletion route
router.post("/:uuid/expire", async (req, res) => {

  const { uuid } = req.params;

  // Find the file in the database by UUID
  const file = await FileModel.findOne({ uuid });
  console.log(req.body.deleteOn)
  if (!file) {
    return res.status(404).json({ error: "File not found" });
  } else if (!req.body.deleteOn) {
    return res.status(404).json({ error: "No argument given: deleteOn" });
  }
  if (new Date() > new Date(req.body.deleteOn)) {
    return res.status(404).json({ error: "Wrong argument given: deleteOn is already over" });
  }

  if(new Date(req.body.deleteOn) == "Invalid Date") {
    return res.status(404).json({ error: "Wrong argument given: deleteOn is not a date" });
  }
  file.expirationDate = new Date(req.body.deleteOn);
  file.save();

  return res.status(200).json({ message: "File expiring date updated successfully" });

});

module.exports = router;