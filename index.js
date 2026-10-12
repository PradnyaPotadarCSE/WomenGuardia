const express = require("express");
const path = require("path");
require("dotenv").config();
const { register, signIn, logout } = require("./controller/user.controller.js");
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
    return next(); // Proceed to the next middleware or route handler if authenticated
  }
  res.redirect("/login"); // Redirect to login if not authenticated
}

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/guardia");
}

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));

const store = MongoStore.create({
  mongoUrl: "mongodb://127.0.0.1:27017/guardia",
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.post("/register", register);
app.post("/login", signIn);
app.get("/logout", logout);

app.get("/guardian", isAuthenticated, guardian);

// API route to get guardians in JSON format
app.get("/api/getGuardians", isAuthenticated, getGuardian);

// API route to add a guardian
app.post("/api/addGuardian", isAuthenticated, addGuardian);

// API route to delete a guardian
app.delete("/api/deleteGuardian/:id", isAuthenticated, deleteGuardian);

app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
  main().catch((err) => console.log(err));
});
