const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Error"],
    required: true,
  },
  passedCases: {
    type: Number,
    required: true,
  },
  totalCases: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
