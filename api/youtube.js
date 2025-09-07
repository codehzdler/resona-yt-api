import fetch from 'node-fetch';
import { supabase } from '../lib/supabase.js';

const fallbackKey = process.env.YOUR_FALLBACK_KEY;

// Simple in-memory cache
let cachedValidKeys = [];
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function isKeyValid(key) {
  try {
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=id&q=test&maxResults=1&key=${key}`;
    const response = await fetch(testUrl);
    const data = await response.json();
    return !data.error;
  } catch {
    return false;
  }
}

async function getValidKeys() {
  const now = Date.now();
  if (cachedValidKeys.length && now - cacheTime < CACHE_DURATION) return cachedValidKeys;

  const { data: keys } = await supabase.from('user_keys').select('api_key');
  const validKeys = [];

  if (keys) {
    for (const k of keys) {
      const valid = await isKeyValid(k.api_key);
      if (valid) validKeys.push(k.api_key);
      else await supabase.from('user_keys').delete().eq('api_key', k.api_key); // Remove invalid
    }
  }

  if (await isKeyValid(fallbackKey)) validKeys.push(fallbackKey);

  cachedValidKeys = validKeys;
  cacheTime = now;

  return validKeys;
}

export default async function handler(req, res) {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const validKeys = await getValidKeys();
    if (!validKeys.length) return res.status(500).json({ error: 'No valid YouTube API keys available' });

    const key = validKeys[Math.floor(Math.random() * validKeys.length)];
    const youtubeURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${key}&maxResults=10`;

    const response = await fetch(youtubeURL);
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
