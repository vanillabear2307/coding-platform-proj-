const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const questionRouter = require("./server/routes/questionRouter");
require("dotenv").config();
const cookieSession = require("cookie-session");
const passport = require("passport");
const passportSetup = require("./server/config/passport-setup");
// express-session removed — app uses cookie-session instead
const authRoutes = require("./server/routes/auth-routes");
const userRoutes = require("./server/routes/user");
const User = require("./server/model/user-model");
const keys = require("./server/config/keys");
const cookieParser = require("cookie-parser"); // parse cookie header
const app = express();

// Trust proxies (Cloudflare Tunnel) so secure cookies work
app.set('trust proxy', 1);

// Middleware
app.use(bodyParser.json());
mongoose.connect(process.env.DB_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex removed — deprecated and removed in Mongoose 6+
});



// PORT
const PORT = process.env.PORT || 5000;

app.use(
  cookieSession({
    name: "session",
    keys: [keys.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
);

// parse cookies
app.use(cookieParser());
// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());
// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: process.env.REACT_APP_WEBSITE_URL || "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);





// set up routes
app.use("/question", questionRouter);
app.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // ✅ fixed: was req.query.id
    if (user) {
      return res.status(200).json([user]); // wrap in array to match client expectation
    }
    res.send({ err: "No User Found" });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(400).send({ err: "Invalid User ID" });
  }
});
app.use("/auth", authRoutes);
app.use("/user", userRoutes);


if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}






const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated",
    });
  } else {
    next();
  }
};

// if it's already login, send the profile response,
// otherwise, send a 401 response that the user is not authenticated
// authCheck before navigating to home page
app.get("/", authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user,
    cookies: req.cookies,
  });
});

app.listen(PORT, () => {
  console.log(`Express server started at PORT ${PORT}`);
});
