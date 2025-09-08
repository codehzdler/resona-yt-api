import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Fetch all keys
    const { data, error } = await supabase.from('user_keys').select('api_key');
    if (error) throw error;

    if (!data || data.length === 0) {
      // fallback key if no user-contributed keys exist
      return res.status(200).json({ apiKey: process.env.FALLBACK_KEY || null });
    }

    // Randomly pick one
    const randomIndex = Math.floor(Math.random() * data.length);
    const key = data[randomIndex].api_key;

    res.status(200).json({ apiKey: key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
