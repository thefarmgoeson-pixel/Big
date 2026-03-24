module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    // "Josh" - Deep, expressive male voice (free tier)
    const voiceId = 'TxGEqnHWrfWFTfGW9XjX';

    // Add rhythm pauses to push rap-style delivery
    const formatted = text
      .replace(/,/g, ', —')
      .replace(/\.\.\./g, '... ')
      .replace(/ (and|but|cause|now|when|til|with|from|like|on|in|at|for|to) /gi, ' $1, ');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVEN_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: formatted,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.05,
          similarity_boost: 0.70,
          style: 1.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
