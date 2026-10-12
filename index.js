
const express = require("express");
const path = require("path");
require("dotenv").config();

const {
  register,
  signIn,
  logout,
} = require("./controller/user.controller.js");

const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.model.js");

const {
  addGuardian,
  guardian,
  getGuardian,
  deleteGuardian,
} = require("./controller/guardian.controller.js");

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/login");
}

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGO_URI || !SESSION_SECRET) {
  console.error("Missing MONGO_URI or SESSION_SECRET in .env");
  process.exit(1);
}

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB session store
const store = MongoStore.create({
  mongoUrl: MONGO_URI,
  crypto: {
    secret: SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Passport authentication
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Website routes
app.get("/", (req, res) => {
  res.render("index.ejs", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("loginPage.ejs");
});

app.get("/register", (req, res) => {
  res.render("signUpPage.ejs");
});

app.get("/safetyalarm", (req, res) => {
  res.render("safetyalarm.ejs");
});

app.get("/navigation", (req, res) => {
  res.render("navigation.ejs");
});

// Authentication routes
app.post("/register", register);
app.post("/login", signIn);
app.get("/logout", logout);

// Guardian routes
app.get("/guardian", isAuthenticated, guardian);
app.get("/api/getGuardians", isAuthenticated, getGuardian);
app.post("/api/addGuardian", isAuthenticated, addGuardian);
app.delete("/api/deleteGuardian/:id", isAuthenticated, deleteGuardian);

// Connect to MongoDB before starting server
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`WomenGuardia server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
