const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const KEY = process.env.ELEVEN_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'API Key missing' });

  const payload = JSON.stringify({
    model_id: 'eleven_v3', // Or 'eleven_turbo_v3'
    inputs: [{ 
      text: `[shouting] ${text}`, 
      voice_id: '21m00Tcm4TlvDq8ikWAM' 
    }]
  });

  const options = {
    hostname: 'api.elevenlabs.io',
    path: '/v1/text-to-dialogue',
    method: 'POST',
    headers: {
      'xi-api-key': KEY.trim(),
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    }
  };

  const r = https.request(options, (resp) => {
    // Check for ElevenLabs specific errors
    if (resp.statusCode !== 200) {
      let errorData = '';
      resp.on('data', (d) => { errorData += d; });
      resp.on('end', () => res.status(resp.statusCode).send(errorData));
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    // Stream the response directly to the client instead of buffering in 'chunks'
    // This is much faster and more memory efficient
    resp.pipe(res);
  });

  r.on('error', (e) => res.status(500).json({ error: e.message }));
  r.write(payload);
  r.end();
};
