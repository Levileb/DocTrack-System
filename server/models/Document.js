const mongoose = require('mongoose');

const DocSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now }, // Add date field
    title: String,
    sender: String,
    originating: String,
    recipient: String,
    destination: String,
    qrCode: String, // Add field for storing QR code data or URL
    codeNumber: String, // Add field for storing the code number
    status: {
        type: String,
        enum: ['Created', 'Received', 'Forwarded', 'Completed'],
        default: 'Created' // Default status is 'created'
    }
});

const DocModel = mongoose.model("docs", DocSchema);
module.exports = DocModel;
