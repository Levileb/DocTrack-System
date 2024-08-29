const mongoose = require("mongoose");

const ForwardingLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Ensure this matches the exact model name used
    required: true,
  },
  doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "docs", // Ensure this matches the exact model name used
    required: true,
  },
  forwardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Assuming forwardedTo is also a User
    required: true,
  },
  forwardedAt: {
    type: Date,
    default: Date.now,
  },
  remarks: String,
});

const ForwardingLogModel = mongoose.model("ForwardingLog", ForwardingLogSchema);
module.exports = ForwardingLogModel;
