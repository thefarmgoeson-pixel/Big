module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    // "Marcus" - Deep, raspy, authoritative. Perfect for those avocado bars.
    const voiceId = 'XPpxO97N9mS9Vvdfz9uK'; 

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        // Using Turbo v2.5 for the lowest latency and best "human" flow
        model_id: 'eleven_turbo_v2_5', 
        voice_settings: {
          stability: 0.30,       // Lower = more emotive/variable (good for rap)
          similarity_boost: 0.85, // Keeps the character consistent
          style: 0.65,           // Adds more "attitude" to the delivery
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
