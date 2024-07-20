const express = require("express");
const router = express.Router();
const path = require("path")
const fs = require("fs");

router.get("/style/googlesans.woff", (req, res) => { res.sendFile(path.join(__dirname + "/../style/GoogleSans.woff")); });
router.get("/style/main", (req, res) => { res.setHeader('Content-Type', 'text/css');  res.sendFile(path.join(__dirname + "/../style/main.css")); });
router.get("/style/index", (req, res) => { res.setHeader('Content-Type', 'text/css');res.sendFile(path.join(__dirname + "/../style/index.css")); });
router.get("/style/create_file", (req, res) => { res.setHeader('Content-Type', 'text/css');res.sendFile(path.join(__dirname + "/style/create_file.css")); });
router.get("/icon", (req, res) => { res.sendFile(path.join(__dirname + "/../frontend/cloud.svg")); });
router.get("/style/icons", (req, res) => { res.sendFile(path.join(__dirname + "/../style/icons.woff2")); });

module.exports = router;