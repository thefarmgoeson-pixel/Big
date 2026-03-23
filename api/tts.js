const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).end(); return; }
  const text = (req.body || {}).text;
  if (!text) { res.status(400).json({ error: 'no text' }); return; }
  const KEY = process.env.ELEVEN_API_KEY;
  const VOICE = 'pNInz6obpgDQGcFmaJgB';
  const payload = JSON.stringify({ text: text, model_id: 'eleven_turbo_v2', voice_settings: { stability: 0.30, similarity_boost: 0.90, style: 0.90, use_speaker_boost: true } });
  const chunks = [];
  const r = https.request({ hostname: 'api.elevenlabs.io', path: '/v1/text-to-speech/' + VOICE, method: 'POST', headers: { 'xi-api-key': KEY.trim(), 'Content-Type': 'application/json', 'Accept': 'audio/mpeg', 'Content-Length': Buffer.byteLength(payload) } }, function(resp) {
    if (resp.statusCode !== 200) { let e = ''; resp.on('data', function(d){ e+=d; }); resp.on('end', function(){ res.status(resp.statusCode).json({ error: e }); }); return; }
    resp.on('data', function(c){ chunks.push(c); });
    resp.on('end', function(){ res.setHeader('Content-Type','audio/mpeg'); res.send(Buffer.concat(chunks)); });
  });
  r.on('error', function(e){ res.status(500).json({ error: e.message }); });
  r.write(payload);
  r.end();
};
