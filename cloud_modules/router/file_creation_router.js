const express = require("express");
const router = express.Router();
const path = require("path");
const FileModel = require("./../model/FileModel");
const fs = require("fs");

router.get("/create", (req, res) => { 
    res.sendFile(path.join(__dirname + "/../frontend/file_creation/create_menue.html")); 
});


module.exports = router;