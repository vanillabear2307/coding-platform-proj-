const express = require("express");
const { check, validationResult } = require("express-validator");
const Question = require("../model/question");
const router = express.Router();

router.get("/id/:id", async (req, res) => {
  try {
    const questions = await Question.find({ _id: req.params.id }); // ✅ fixed: was req.query.id
    if (questions && questions.length > 0) {
      return res.status(200).json(questions);
    }
    res.send({ err: "No Questions Found" });
  } catch (err) {
    console.error("Error finding question:", err);
    res.status(400).send({ err: "Invalid Question ID" });
  }
});

// ✅ fixed: was /:info wildcard (malformed client URLs used "/:?language=...")
// Now uses a stable /all route that the client calls with proper query params
router.get("/all", async (req, res) => {
  try {
    let query = {};
    if (req.query.language && req.query.language !== "all") {
      query.language = req.query.language;
    }
    if (req.query.medium && req.query.medium !== "all") {
      query.medium = req.query.medium;
    }
    if (req.query.tag && req.query.tag !== "all" && req.query.tag !== "none") {
      query.tag = req.query.tag;
    }
    
    const questions = await Question.find(query);
    if (questions) {
      return res.status(200).json(questions);
    }
    res.send({ err: "No Questions Found" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Server Error" });
  }
});
router.get("/count", async (req, res) => {
  try {
    const count = await Question.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error fetching question count:", err);
    res.status(500).send({ err: "Server Error" });
  }
});

// ✅ auth guard using Passport session (Google OAuth) — matches how the AddQuestion form authenticates
const requireSessionAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ err: "Authentication required" });
  }
  next();
};

router.post(
  "/add",
  requireSessionAuth,
  [
    check("title", "Title is required").not().isEmpty(),
    check("language", "Language is required").not().isEmpty(),
    check("tag", "Tag is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("instruction", "Instruction is required").not().isEmpty(),
    check("medium", "Medium is required").not().isEmpty(),
    check("solution", "Solution is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array().map(e => e.msg).join(", ") });
    }

    try {
      let testCasesVal = req.body.testCases;
      if (typeof testCasesVal === "string") {
        testCasesVal = JSON.parse(testCasesVal);
      }

      if (!testCasesVal || !Array.isArray(testCasesVal) || testCasesVal.length === 0) {
        return res.status(400).json({ err: "At least one test case is required" });
      }

      let question = new Question({
        title: req.body.title,
        language: req.body.language,
        tag: req.body.tag,
        description: req.body.description,
        instruction: req.body.instruction,
        medium: req.body.medium,
        solution: req.body.solution,
        testCases: testCasesVal,
      });

      await question.save();
      res.status(200).json({ message: "Saved Successfully" });
    } catch (e) {
      console.error("Error adding question:", e);
      res.status(400).json({ err: e.message || "Something Went Wrong" });
    }
  }
);
module.exports = router;
