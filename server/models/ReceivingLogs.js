const mongoose = require("mongoose");

const ReceivingLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", // Ensure this matches the name used in UserModel registration
    required: true,
  },
  doc_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "docs", // Ensure this matches the name used in DocModel registration
    required: true,
  },
  receivedAt: {
    type: Date,
    default: Date.now,
  },
  remarks: String,
});

const ReceivingLogModel = mongoose.model("ReceivingLog", ReceivingLogSchema);
module.exports = ReceivingLogModel;
