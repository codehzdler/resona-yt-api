import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ success: false, step: "failed", message: 'API key required' });

  try {
    const testRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`
    );
    const testData = await testRes.json();

    if (testData.error) {
      const reason = testData.error.errors?.[0]?.reason;

      if (reason === 'keyInvalid') {
        return res.status(200).json({
          success: false,
          step: "failed",
          message: '❌ Invalid API Key. Please double-check and try again.'
        });
      }

      if (reason === 'quotaExceeded') {
        await supabase.from('user_keys').insert([{ api_key: apiKey }]);
        return res.status(200).json({
          success: true,
          step: "passed",
          activationKey: '1reso5na-6hzn9',
          message: '⚠️ Valid API key but quota exceeded. Key has been saved and will rotate with others.'
        });
      }

      return res.status(200).json({
        success: false,
        step: "failed",
        message: `YouTube API returned error: ${reason || 'unknown'}`
      });
    }

    await supabase.from('user_keys').insert([{ api_key: apiKey }]);

    return res.status(200).json({
      success: true,
      step: "passed",
      activationKey: '1reso5na-6hzn9',
      message: '✅ API key is valid! Thank you for contributing to Resona.'
    });

  } catch (error) {
    return res.status(500).json({ success: false, step: "failed", message: error.message });
  }
}
