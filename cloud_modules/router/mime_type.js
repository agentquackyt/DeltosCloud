const express = require("express");
const router = express.Router();
const path = require("path")

router.get("/audio", (req, res) => { res.sendFile(path.join(__dirname + "/../frontend/symbol/sound.jpg")); });
router.get("/video", (req, res) => { res.sendFile(path.join(__dirname + "/../frontend/symbol/video.jpg")); });
router.get("/application", (req, res) => { res.sendFile(path.join(__dirname + "/../frontend/symbol/exe.png")); });
router.get("/pdf", (req, res) => { res.sendFile(path.join(__dirname + "/../frontend/symbol/pdf.png")); });
router.get("/docx", (req, res) => { res.sendFile(path.join(__dirname + "/../frontend/symbol/word.png")); });

module.exports = router;