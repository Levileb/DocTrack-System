const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  position: String,
  office: String,
  role: { 
    type: String,
    default: "user",
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
  },
  resetToken: String,
  resetTokenExpires: Date,
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
