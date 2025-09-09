import { serverSupabase } from "../lib/serverSupabase.js";

export default async function handler(req, res) {
  const { data, error } = await serverSupabase.from("user_keys").select("api_key");
  if (error) return res.status(500).json({ error });

  if (!data || data.length === 0) {
    return res.status(200).json({ apiKey: process.env.FALLBACK_KEY });
  }

  const randomKey = data[Math.floor(Math.random() * data.length)].api_key;
  res.status(200).json({ apiKey: randomKey });
}
