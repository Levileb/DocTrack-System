const mongoose = require('mongoose')

const OfficeSchema = new mongoose.Schema({
    office: String
})

const OfficeModel = mongoose.model("office", OfficeSchema)
module.exports = OfficeModel  