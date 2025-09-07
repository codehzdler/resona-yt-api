import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to validate YouTube API key
async function validateYouTubeKey(apiKey) {
  try {
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=${apiKey}&maxResults=1`;
    const response = await fetch(testUrl);
    const data = await response.json();

    if (data.error) {
      return { valid: false, message: data.error.message };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, message: err.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing API key' });

  // Step 1: Validate key
  const { valid, message } = await validateYouTubeKey(apiKey);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid API key: ' + message });
  }

  // Step 2: Check if key already exists
  const { data: existingKeys } = await supabase
    .from('user_keys')
    .select('api_key')
    .eq('api_key', apiKey);

  if (existingKeys.length > 0) {
    return res.status(200).json({ message: 'API key already exists!' });
  }

  // Step 3: Insert key into Supabase
  const { data, error } = await supabase
    .from('user_keys')
    .insert([{ api_key: apiKey }]);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ message: 'API key submitted successfully!' });
}
