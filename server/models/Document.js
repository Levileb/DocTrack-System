const mongoose = require("mongoose");

const DocSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Ensure this matches the exact model name used
    required: true,
  },
  title: String,
  sender: String, // This could be a String for the sender's email
  originating: String,
  recipient: String,
  destination: String,
  qrCode: String,
  codeNumber: String,
  remarks: String,
  status: {
    type: String,
    enum: [
      "Created",
      "Viewed",
      "Received",
      "Forwarded",
      "Completed",
      "Archived",
    ],
    default: "Created",
  },
});

const DocModel = mongoose.model("docs", DocSchema);
module.exports = DocModel;
