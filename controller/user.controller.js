const User = require("../model/user.model.js");

// Registration function with alerts
module.exports.register = async (req, res) => {
  try {
    const { username, mobile_number, password } = req.body;
    const newUser = new User({ username, mobile_number });

    await User.register(newUser, password);

    // Log in the user after registration
    req.logIn(newUser, (err) => {
      if (err) {
        console.error("Login error after registration:", err);
        return res.json({
          success: false,
          error: "Login failed after registration.",
        });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.json({
      success: false,
      error: error.message || "Registration failed.",
    });
  }
};

// Login function with alerts
module.exports.signIn = async (req, res, next) => {
  try {
    const { mobile_number, password } = req.body;
    const user = await User.findOne({ mobile_number });
    if (!user) return res.redirect("/login?error=true");

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/?loggedIn=true");
    });
  } catch (e) {
    return res.redirect("/login?error=true");
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/"); // Redirect to the homepage after logging out
  });
};
