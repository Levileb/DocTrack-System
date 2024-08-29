const mongoose = require("mongoose");

const CompletedLogSchema = new mongoose.Schema({
  docId: { type: mongoose.Schema.Types.ObjectId, ref: "docs", required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  // receivingLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReceivingLog' }],
  //forwardingLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForwardingLog' }],
  completedAt: { type: Date, default: Date.now },
  remarks: String,
});

const CompletedLogModel = mongoose.model("CompletedLog", CompletedLogSchema);

module.exports = CompletedLogModel;
