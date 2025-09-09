import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const SUPABASE_URL = window.env?.SUPABASE_URL || "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = window.env?.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: hash password with SHA-256
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Register user
async function registerUser() {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const apiKey = document.getElementById("reg-apikey").value;
  const msg = document.getElementById("register-message");
  msg.textContent = "Registering...";

  const hashedPassword = await hashPassword(password);

  const { data, error } = await supabase
    .from("user_accounts")
    .insert([{ email, password: hashedPassword, api_key: apiKey }])
    .select();

  if (error) {
    if (error.code === "23505") {
      msg.textContent = "❌ Email already in use.";
    } else {
      msg.textContent = "❌ Error: " + error.message;
    }
  } else {
    msg.textContent = "✅ Registration successful!";
  }
}

// Reset password
async function resetPassword() {
  const email = document.getElementById("reset-email").value;
  const apiKey = document.getElementById("reset-apikey").value;
  const newPassword = document.getElementById("reset-password").value;
  const msg = document.getElementById("reset-message");
  msg.textContent = "Verifying...";

  const { data, error } = await supabase
    .from("user_accounts")
    .select("*")
    .eq("email", email)
    .eq("api_key", apiKey)
    .single();

  if (error || !data) {
    msg.textContent = "❌ Invalid email or API Key.";
    return;
  }

  const hashedNewPassword = await hashPassword(newPassword);

  const { error: updateError } = await supabase
    .from("user_accounts")
    .update({ password: hashedNewPassword })
    .eq("email", email);

  if (updateError) {
    msg.textContent = "❌ Error: " + updateError.message;
  } else {
    msg.textContent = "✅ Password updated successfully!";
  }
}

window.registerUser = registerUser;
window.resetPassword = resetPassword;
