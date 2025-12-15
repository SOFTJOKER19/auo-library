// DOM elements
const toggleBtn = document.getElementById('toggleBtn');
const authForm = document.getElementById('authForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const submitBtn = document.getElementById('submitBtn');
const switchText = document.getElementById('switchText');

let mode = 'login';
let users = JSON.parse(localStorage.getItem('users')) || [];

// Toggle Login / Signup
toggleBtn.addEventListener('click', () => {
  mode = mode === 'login' ? 'signup' : 'login';

  nameInput.classList.toggle('hidden');
  title.textContent = mode === 'login' ? 'Welcome Back' : 'Create Account';
  subtitle.textContent = mode === 'login' ? 'Login to continue' : 'Sign up to get started';
  submitBtn.textContent = mode === 'login' ? 'Login' : 'Sign Up';
  switchText.textContent = mode === 'login' ? 'Don’t have an account?' : 'Already have an account?';
  toggleBtn.textContent = mode === 'login' ? 'Sign up' : 'Login';
});

// Handle Auth
authForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const name = nameInput.value.trim();

  if (mode === 'signup') {
    if (!name) return alert('Enter your name');
    if (users.find(u => u.email === email)) return alert('Account already exists');

    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', email);
    location.href = 'dashboard.html';
  } else {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return alert('Invalid credentials');

    localStorage.setItem('currentUser', email);
    location.href = 'dashboard.html';
  }
});
