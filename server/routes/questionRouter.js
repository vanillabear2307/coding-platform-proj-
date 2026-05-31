const express = require("express");
const Question = require("../model/question");
const router = express.Router();

router.get("/id/:id", async (req, res) => {
  try {
    let questions = await Question.find({ _id: req.query.id });
    if (questions && questions.length > 0) {
      return res.status(200).json(questions);
    }
    res.send({ err: "No Questions Found" });
  } catch (err) {
    console.error("Error finding question:", err);
    res.status(400).send({ err: "Invalid Question ID" });
  }
});

router.get("/:info", async (req, res) => {
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
    
    let questions = await Question.find(query);
    if (questions) {
      return res.status(200).json(questions);
    }
    res.send({ err: "No Questions Found" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ err: "Server Error" });
  }
});
router.post("/add", async (req, res) => {
  try {
    let testCasesVal = req.body.testCases;
    if (typeof testCasesVal === "string") {
      testCasesVal = JSON.parse(testCasesVal);
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
});
module.exports = router;
