import { serverSupabase } from "../lib/serverSupabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  const { data: user, error: authError } = await serverSupabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ message: "API key required" });

  // Validate API key
  const testRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${apiKey}`);
  const data = await testRes.json();
  if (data.error) {
    return res.status(400).json({ message: "Invalid API key" });
  }

  const { error } = await serverSupabase.from("user_keys").insert({ user_id: user.user.id, api_key: apiKey });
  if (error) return res.status(500).json({ message: "Database error" });

  res.status(200).json({ message: "Thanks for contributing! Your API key is valid." });
}
