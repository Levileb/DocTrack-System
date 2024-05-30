const mongoose = require('mongoose');

const ForwardingLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Ensure this matches the name used in UserModel registration
        required: true
    },
    doc_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'docs', // Ensure this matches the name used in DocModel registration
        required: true
    },
    forwardedTo: {
        type: String,
        required: true
    },
    forwardedAt: {
        type: Date,
        default: Date.now
    }
});

const ForwardingLogModel = mongoose.model("ForwardingLog", ForwardingLogSchema);
module.exports = ForwardingLogModel;
