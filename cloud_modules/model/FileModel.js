// FileModel.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  location: { type: String, required: true },
  vLocation: { type: String, required: true },
  uploadDate: { type: Date, default: new Date() },
  type: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  expirationDate: { type: Date }
});

module.exports = mongoose.model("File", fileSchema);
