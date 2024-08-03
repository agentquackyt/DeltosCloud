// index.js
const express = require("express");
const fs = require("fs");
const upload = require("./cloud_modules/upload");
const db = require("./cloud_modules/db");
const FileModel = require("./cloud_modules/model/FileModel");
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Serve the front-end HTML file
app.get("/legacy", (req, res) => {
  res.sendFile(__dirname + "/cloud_modules/frontend/upload.html");
});
  
// Serve the front-end HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/cloud_modules/frontend/index.html");
});

const mime_router = require("./cloud_modules/router/mime_type");
const files_router = require("./cloud_modules/router/files_router");
const folder_router = require("./cloud_modules/router/folder_router");
const res_router = require("./cloud_modules/router/res_router");
const file_action_router = require("./cloud_modules/router/file_creation_router");
const extensions_router = require("./cloud_modules/router/extension_router");

app.use("/res/mime", mime_router);
app.use("/file", file_action_router);
app.use("/folder", folder_router);
app.use("/res", res_router);
app.use("/files", files_router);
app.use("/addons", extensions_router);

// File upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Create a new file document using the FileModel
    console.log(req.params)
    const file = new FileModel({
      uuid: req.file.filename,
      location: req.file.path,
      size: req.file.size,
      type: req.file.mimetype,
      name: req.file.originalname,
      vLocation: req.body.folder ? "/"+req.body.folder : "/",
    });

    // Save the file document
    await file.save();

    res.status(200).json({ message: "File uploaded successfully" });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});


// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
