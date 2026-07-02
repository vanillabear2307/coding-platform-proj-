const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false, // Optional for Google OAuth users
  },
  googleId: {
    type: String,
    required: false, // Optional for Traditional Auth users
  },
  photo: String,
  firstName: String,
  lastName: String,
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("user", userSchema);

module.exports = User;
