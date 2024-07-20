const express = require("express");
const router = express.Router();
const path = require("path");
const FileModel = require("../model/FileModel");
const fs = require("fs");


console.log("[Plugin Manager]: Initializing Extensions");
router.report = function() {
  return {
    name: "Plugin Manager",
    version: "1.0.0",
    description: "The plugin manager is a system that allows you to create and manage plugins for the cloud system.",
  } 
} 

let pluginCache = [];
cachePlugins();
function cachePlugins() {
  const way = path.join(__dirname + "/../../addons/");
  const files = fs.readdirSync(way);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if(file != "example") {
      const manifest = path.join(__dirname + "/../../addons/"+file+"/manifest.json");
      if(fs.existsSync(manifest)) {
        const configuration = JSON.parse(fs.readFileSync(manifest));
        pluginCache.push(
          configuration.meta
        );
      }
    }
  }
  console.debug(pluginCache);
} 


// File download route
router.get("/source/preload", async (req, res) => {
  const way = path.join(__dirname + "/../frontend/extensions/javascript/extension.js");
  try {
    res.sendFile(way);
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).json({ error: "Unable to load file" });
  }
});


// File download route
router.get("/api/:extension", async (req, res) => {
  const { extension } = req.params;
  const way = path.join(__dirname + "/../../addons/"+extension+"/manifest.json");
  try {
    if(!fs.existsSync(way)) return res.status(500).json({ error: "Unable to load file" });
    const configuration = JSON.parse(fs.readFileSync(way));

    res.status(200).json(configuration);
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).json({ error: "Unable to load file" });
  }
});

router.get("/open/files/:extension", async (req, res) => {
  const { extension } = req.params;
  try {
    const extensionInformation = pluginCache.find((element) => element.id == extension);
    console.log(extensionInformation);
    // Get every file with the correct file type ("text/*" means every text file)
    // const files = await FileModel.find({ type: { $in: specialFileTypes } });
    let files = [];
    console.log(extensionInformation.types.find((element) => element.split("/")[1] == "*"))
    if(extensionInformation.types.find((element) => element == "*")) {
      files = await FileModel.find();
    } else if (extensionInformation.types.find((element) => element.split("/")[1] == "*")) {
      const type = extensionInformation.types.find((element) => element.split("/")[1] == "*").split("/")[0];
      // type is now "text", "image", "video" or "audio", etc.
      files = await FileModel.find({ type: { $regex: type } });
    } else {
      files = await FileModel.find({ type: { $in: extensionInformation.types } });
    }
    res.status(200).json(getFiles(files, extension));
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

function getFiles(files, extension) {
  let filesnew = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
  
    filesnew.push({
      name: file.name,
      uuid: file.uuid,
      size: file.size,
      type: file.type,
      hasExpireDate: file.expirationDate ? true : false,
      downloadLink: `/files/${file.uuid}`,
      onClick: `/addons/${extension}/${file.uuid}`
    });
  }
    
  return ({ files: filesnew});
}

router.get("/open/:extension", async (req, res) => {
  try {
    res.sendFile(path.join(__dirname + "/../frontend/open_with.html"));
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// File download route
router.get("/api/:extension/:file_alias", async (req, res) => {
  const { extension, file_alias } = req.params;
  const way = path.join(__dirname + "/../../addons/"+extension+"/manifest.json");
  let path_to_file = path.join(__dirname + "/../../addons/"+extension+"/manifest.json");
  try {
    if(!fs.existsSync(way)) return res.status(500).json({ error: "Unable to load file" });
    const manifest = JSON.parse(fs.readFileSync(way));
    const serveFiles = manifest.content.serve;
    for (let i = 0; i < serveFiles.length; i++) {
      const element = serveFiles[i];
      if(element.as == file_alias) {
        return res.status(200).sendFile(path.join(__dirname + "/../../addons/"+extension+"/"+element.path));
      }
    }
    res.status(500).json({ error: "Unable to load file" });
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).json({ error: "Unable to load file" });
  }
});


router.get("/list", async (req, res) => {
  try {
    res.status(200).json(pluginCache);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});


router.post("/install", async (req, res) => {
  // Yet to be implemented
});

router.get("/", async (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname + "/../frontend/addons.html"));
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// File download route
router.get("/:extension/:uuid", async (req, res) => {
  const { extension , uuid} = req.params;
  const file = await FileModel.findOne({ uuid });

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }
  delete file;
  const way = path.join(__dirname + "/../../addons/"+extension+"/manifest.json");
  
  if(!fs.existsSync(way)) return res.status(500).json({ error: "Unable to load file" });
  res.sendFile(path.join(__dirname + "/../frontend/extensions/load.html"));
});


module.exports = router;