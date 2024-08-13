const mongoose = require('mongoose');

const OfficeSchema = new mongoose.Schema({
    office: String,
    isArchived: { type: Boolean, default: false }  // Add this field
});

const OfficeModel = mongoose.model("office", OfficeSchema);
module.exports = OfficeModel;
