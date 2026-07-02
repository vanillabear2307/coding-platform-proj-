// Filename : user.js

const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const combinedAuth = require("../middleware/combined-auth");
const User = require("../model/user-model");
const Submission = require("../model/submission");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
  "/signup",
  [
    check("username", "Please Enter a Valid Username").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;
    try {
      let user = await User.findOne({
        email,
      });
      if (user) {
        return res.status(400).json({
          message: "User Already Exists",
        });
      }

      user = new User({
        username,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET, // ✅ fixed: was hardcoded "randomString"
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (err) {
      res.status(500).send("Error in Saving");
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({
        email,
      });
      if (!user)
        return res.status(400).json({
          message: "User Does Not Exist! Create a new account",
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password ! Enter valid password",
        });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET, // ✅ fixed: was hardcoded "randomString"
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (e) {
      res.status(500).json({
        message: "Server Error",
      });
    }
  }
);
/**
 * @method - GET
 * @description - Get LoggedIn User
 * @param - /user/me
 */

router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

router.post("/solved/:questionId", combinedAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ err: "User not found" });

    if (!user.solvedProblems.includes(req.params.questionId)) {
      user.solvedProblems.push(req.params.questionId);
      await user.save();
    }
    res.status(200).json({ message: "Solved state updated", solvedProblems: user.solvedProblems });
  } catch (err) {
    console.error("Error updating solved problems:", err);
    res.status(500).json({ err: "Server Error" });
  }
});

router.post("/submission", combinedAuth, async (req, res) => {
  try {
    const { questionId, language, code, status, passedCases, totalCases } = req.body;
    
    if (!questionId || !language || !code || !status || passedCases === undefined || !totalCases) {
      return res.status(400).json({ err: "Missing submission fields" });
    }

    const submission = new Submission({
      user: req.user.id,
      question: questionId,
      language,
      code,
      status,
      passedCases,
      totalCases
    });

    await submission.save();
    res.status(200).json({ message: "Submission recorded successfully", submission });
  } catch (err) {
    console.error("Error creating submission:", err);
    res.status(500).json({ err: "Server Error" });
  }
});

router.get("/submissions/:userId", combinedAuth, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.params.userId })
      .populate("question", "title")
      .sort({ submittedAt: -1 })
      .limit(50);
    res.status(200).json(submissions);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ err: "Server Error" });
  }
});

module.exports = router;
