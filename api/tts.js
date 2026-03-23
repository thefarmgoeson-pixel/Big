export default async function handler(req, res) {
if (req.method !== ‘POST’) return res.status(405).end();

const { text } = req.body;
if (!text) return res.status(400).json({ error: ‘No text provided’ });

const VOICE_ID = ‘ErXwobaYiN019PkySvjV’; // Antoni - deep warm male

try {
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
method: ‘POST’,
headers: {
‘xi-api-key’: process.env.ELEVEN_API_KEY,
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
if (!response.ok) {
  const err = await response.text();
  return res.status(response.status).json({ error: err });
}

const audioBuffer = await response.arrayBuffer();
res.setHeader('Content-Type', 'audio/mpeg');
res.setHeader('Cache-Control', 's-maxage=86400');
res.send(Buffer.from(audioBuffer));
```

} catch (e) {
console.error(e);
res.status(500).json({ error: e.message });
}
}
