const https = require(‘https’);

export default async function handler(req, res) {
if (req.method !== ‘POST’) return res.status(405).end();

const { text } = req.body;
if (!text) return res.status(400).json({ error: ‘No text provided’ });

const VOICE_ID = ‘ErXwobaYiN019PkySvjV’; // Antoni
const API_KEY = process.env.ELEVEN_API_KEY;

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
const req2 = https.request(options, (resp) => {
  if (resp.statusCode !== 200) {
    let err = '';
    resp.on('data', d => err += d);
    resp.on('end', () => {
      res.status(resp.statusCode).json({ error: err });
      resolve();
    });
    return;
  }
  resp.on('data', chunk => chunks.push(chunk));
  resp.on('end', () => {
    const audio = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.send(audio);
    resolve();
  });
});

req2.on('error', (e) => {
  res.status(500).json({ error: e.message });
  resolve();
});

req2.write(body);
req2.end();
```

});
}
