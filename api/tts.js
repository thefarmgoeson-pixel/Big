const https = require(‘https’);

module.exports = async function handler(req, res) {
// Allow CORS
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const { text } = req.body || {};
if (!text) return res.status(400).json({ error: ‘No text provided’ });

const API_KEY = process.env.ELEVEN_API_KEY;
if (!API_KEY) return res.status(500).json({ error: ‘Missing ELEVEN_API_KEY env var’ });

const VOICE_ID = ‘ErXwobaYiN019PkySvjV’;

const body = JSON.stringify({
text,
model_id: ‘eleven_turbo_v2’,
voice_settings: {
stability: 0.35,
similarity_boost: 0.85,
style: 0.45,
use_speaker_boost: true,
},
});

return new Promise((resolve) => {
const options = {
hostname: ‘api.elevenlabs.io’,
path: `/v1/text-to-speech/${VOICE_ID}`,
method: ‘POST’,
headers: {
‘xi-api-key’: API_KEY,
‘Content-Type’: ‘application/json’,
‘Accept’: ‘audio/mpeg’,
‘Content-Length’: Buffer.byteLength(body),
},
};

```
const chunks = [];

const request = https.request(options, (response) => {
  console.log('ElevenLabs status:', response.statusCode);

  if (response.statusCode !== 200) {
    let errBody = '';
    response.on('data', d => errBody += d.toString());
    response.on('end', () => {
      console.error('ElevenLabs error body:', errBody);
      res.status(response.statusCode).json({ error: errBody });
      resolve();
    });
    return;
  }

  response.on('data', chunk => chunks.push(chunk));
  response.on('end', () => {
    const audio = Buffer.concat(chunks);
    console.log('Audio bytes:', audio.length);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.send(audio);
    resolve();
  });
});

request.on('error', (e) => {
  console.error('Request error:', e.message);
  res.status(500).json({ error: e.message });
  resolve();
});

request.setTimeout(10000, () => {
  console.error('Request timed out');
  request.destroy();
  res.status(504).json({ error: 'ElevenLabs request timed out' });
  resolve();
});

request.write(body);
request.end();
```

});
};
