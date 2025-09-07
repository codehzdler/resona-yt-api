import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const fallbackKey = process.env.YOUR_FALLBACK_KEY; // Your own key

const supabase = createClient(supabaseUrl, supabaseKey);

async function getRandomKey() {
  const { data: keys } = await supabase.from('user_keys').select('api_key');
  if (!keys || keys.length === 0) return fallbackKey;
  const randomKey = keys[Math.floor(Math.random() * keys.length)].api_key;
  return randomKey || fallbackKey;
}

export default async function handler(req, res) {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const key = await getRandomKey();
    const youtubeURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${key}&maxResults=10`;

    const response = await fetch(youtubeURL);
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
