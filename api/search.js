import { createClient } from "@supabase/supabase-js";

// Supabase anon key (safe for serverless)
const SUPABASE_URL = "https://wsekbfojaqfumpkmzefu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZWtiZm9qYXFmdW1wa216ZWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNTE4OTgsImV4cCI6MjA3MjgyNzg5OH0.nmOOPd-1fw-78iIgbWtLUdy5O_g9Q8YxwKNEH1d6TzU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*"); // restrict in production
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ success: false, error: "Method not allowed" });

  const { email, password, query } = req.body;

  if (!email || !password || !query)
    return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    // 1️⃣ Authenticate user
    const { data: user, error: authError } = await supabase
      .from("user_accounts")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (authError || !user)
      return res.status(401).json({ success: false, error: "Invalid email or password" });

    // 2️⃣ Get all API keys
    const { data: keys, error: keysError } = await supabase
      .from("user_accounts")
      .select("api_key");

    if (keysError || !keys || keys.length === 0)
      return res.status(500).json({ success: false, error: "No API keys available" });

    // 3️⃣ Pick a random API key
    const randomKey = keys[Math.floor(Math.random() * keys.length)].api_key;

    // 4️⃣ Call YouTube Search API
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
        query
      )}&key=${randomKey}`
    );
    const searchData = await searchRes.json();

    if (searchData.error)
      return res.status(403).json({ success: false, error: searchData.error.message });

    // 5️⃣ Return results safely
    return res.status(200).json({
      success: true,
      results: searchData.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
      })),
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
