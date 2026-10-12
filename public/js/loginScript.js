// Check URL for success or error alerts
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("registered") === "true") {
  alert("Registration successful! Welcome!");
} else if (urlParams.get("loggedIn") === "true") {
  alert("Login successful! Welcome back!");
} else if (urlParams.get("error") === "true") {
  alert("An error occurred. Please try again.");
}