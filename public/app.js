const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  let { error } = await sb.auth.signUp({ email, password });
  document.getElementById("auth-message").innerText = error
    ? "Error: " + error.message
    : "Check your email for verification link";
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  let { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById("auth-message").innerText = "Error: " + error.message;
  } else {
    document.getElementById("auth-message").innerText = "Logged in!";
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("form-section").style.display = "block";
  }
}

async function submitKey() {
  const apiKey = document.getElementById("apiKeyInput").value;
  const { data: session } = await sb.auth.getSession();
  const token = session?.session?.access_token;

  const res = await fetch("/api/add-key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ apiKey })
  });
  const result = await res.json();
  document.getElementById("form-message").innerText = result.message;
}
