export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

const { text } = req.body || {};
if (!text) return res.status(400).json({ error: ‘No text provided’ });

const API_KEY = process.env.ELEVEN_API_KEY;
if (!API_KEY) return res.status(500).json({ error: ‘Missing ELEVEN_API_KEY’ });

const VOICE_ID = ‘ErXwobaYiN019PkySvjV’;

try {
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
method: ‘POST’,
headers: {
‘xi-api-key’: API_KEY,
‘Content-Type’: ‘application/json’,
‘Accept’: ‘audio/mpeg’,
},
body: JSON.stringify({
text,
model_id: ‘eleven_turbo_v2’,
voice_settings: {
stability: 0.35,
similarity_boost: 0.85,
style: 0.45,
use_speaker_boost: true,
},
}),
});

```
console.log('ElevenLabs status:', response.status);

if (!response.ok) {
  const errText = await response.text();
  console.error('ElevenLabs error:', errText);
  return res.status(response.status).json({ error: errText });
}

const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
console.log('Audio bytes returned:', buffer.length);

res.setHeader('Content-Type', 'audio/mpeg');
res.setHeader('Cache-Control', 's-maxage=86400');
return res.send(buffer);
```

} catch (e) {
console.error(‘Handler error:’, e.message);
return res.status(500).json({ error: e.message });
}
}
