const SUPABASE_URL = "https://sdpdtlatzvlhrtmeexit.supabase.co";
const SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkcGR0bGF0enZsaHJ0bWVleGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDQ5NTIsImV4cCI6MjA3MDA4MDk1Mn0.D1Iiqo5EVRLAAd2jcYHUo5I59VzPZnbfsd8jg4RNYwU ;

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function toggleForms() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
  registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
}

async function register() {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Registro exitoso.");
    toggleForms();
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Sesión iniciada.");
    localStorage.setItem("token", data.session.access_token);

     window.location.href = "dashboard.html"; //Registro Estudiantes
  }
}