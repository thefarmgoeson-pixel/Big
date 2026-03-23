const https = require(‘https’);

module.exports = function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) { res.status(200).end(); return; }
if (req.method !== ‘POST’) { res.status(405).json({ error: ‘Method not allowed’ }); return; }

const text = (req.body || {}).text;
if (!text) { res.status(400).json({ error: ‘No text’ }); return; }

const API_KEY = process.env.ELEVEN_API_KEY;
if (!API_KEY) { res.status(500).json({ error: ‘Missing ELEVEN_API_KEY’ }); return; }

const VOICE_ID = ‘ErXwobaYiN019PkySvjV’;
const body = JSON.stringify({
text: text,
model_id: ‘eleven_turbo_v2’,
voice_settings: { stability: 0.35, similarity_boost: 0.85, style: 0.45, use_speaker_boost: true }
});

const options = {
hostname: ‘api.elevenlabs.io’,
path: ‘/v1/text-to-speech/’ + VOICE_ID,
method: ‘POST’,
headers: {
‘xi-api-key’: API_KEY,
‘Content-Type’: ‘application/json’,
‘Accept’: ‘audio/mpeg’,
‘Content-Length’: Buffer.byteLength(body)
}
};

const chunks = [];
const request = https.request(options, function(response) {
if (response.statusCode !== 200) {
let err = ‘’;
response.on(‘data’, function(d) { err += d.toString(); });
response.on(‘end’, function() { res.status(response.statusCode).json({ error: err }); });
return;
}
response.on(‘data’, function(chunk) { chunks.push(chunk); });
response.on(‘end’, function() {
const audio = Buffer.concat(chunks);
res.setHeader(‘Content-Type’, ‘audio/mpeg’);
res.setHeader(‘Cache-Control’, ‘s-maxage=86400’);
res.send(audio);
});
});

request.on(‘error’, function(e) { res.status(500).json({ error: e.message }); });
request.write(body);
request.end();
};
