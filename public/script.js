// ===== DOM ELEMENTS =====
const toggleBtn = document.getElementById("toggleBtn");
const authForm = document.getElementById("authForm");
const matricInput = document.getElementById("Matric");
const passwordInput = document.getElementById("password");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const submitBtn = document.getElementById("submitBtn");
const switchText = document.getElementById("switchText");

// ===== STATE =====
let mode = "login";
let users = JSON.parse(localStorage.getItem("users")) || [];

// ===== TOGGLE LOGIN / SIGNUP =====
toggleBtn.addEventListener("click", () => {
  mode = mode === "login" ? "signup" : "login";

  title.textContent =
    mode === "login" ? "Welcome Back" : "Create Account";

  subtitle.textContent =
    mode === "login"
      ? "Login with your matric number"
      : "Sign up using your matric number";

  submitBtn.textContent = mode === "login" ? "Login" : "Sign Up";

  switchText.textContent =
    mode === "login"
      ? "Don’t have an account?"
      : "Already have an account?";

  toggleBtn.textContent = mode === "login" ? "Sign up" : "Login";
});

// ===== AUTH HANDLER =====
authForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const matric = matricInput.value.trim();
  const password = passwordInput.value.trim();

  if (!matric || !password) {
    alert("Matric number and password are required");
    return;
  }

  if (mode === "signup") {
    // Check if matric already exists
    const exists = users.find((u) => u.matric === matric);
    if (exists) {
      alert("This matric number is already registered");
      return;
    }

    // Create new account
    const newUser = {
      matric,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", matric);

    window.location.href = "dashboard.html";
  } else {
    // Login
    const user = users.find(
      (u) => u.matric === matric && u.password === password
    );

    if (!user) {
      alert("Invalid matric number or password");
      return;
    }

    localStorage.setItem("currentUser", matric);
    window.location.href = "dashboard.html";
  }
});
