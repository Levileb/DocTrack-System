const mongoose = require("mongoose");

const DocSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  title: String,
  sender: String,
  originating: String,
  recipient: String,
  destination: String,
  qrCode: String,
  codeNumber: String,
  remarks: String,
  status: {
    type: String,
    enum: ["Created", "Received", "Forwarded", "Completed", "Archived"],
    default: "Created",
  },
});

const DocModel = mongoose.model("docs", DocSchema);
module.exports = DocModel;
