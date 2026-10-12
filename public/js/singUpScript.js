document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const mobile = document.getElementById("mobile_number").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      alert("Passwords don't match. Please try again.");
      return;
    }

    // Send data to backend
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          mobile_number: mobile,
          password,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Sign up successful!");
        window.location.href = "/login"; // Redirect to login page
      } else {
        alert(result.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to sign up. Please try again later.");
    }
  });
