const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    let text;
    try { text = JSON.parse(body).text; } catch(e) { return res.status(400).json({ error: 'bad json' }); }
    if (!text) return res.status(400).json({ error: 'no text' });

    const KEY = process.env.ELEVEN_API_KEY;
    if (!KEY) return res.status(500).json({ error: 'missing key' });

    const VOICE = '21m00Tcm4TlvDq8ikWAM';
    const payload = JSON.stringify({
      text: '[shouting] ' + text,
      model_id: 'eleven_v3',
      voice_settings: { stability: 0.25, similarity_boost: 0.90, style: 1.0, use_speaker_boost: true }
    });

    const chunks = [];
    const r = https.request({
      hostname: 'api.elevenlabs.io',
      path: '/v1/text-to-speech/' + VOICE,
      method: 'POST',
      headers: { 'xi-api-key': KEY.trim(), 'Content-Type': 'application/json', 'Accept': 'audio/mpeg', 'Content-Length': Buffer.byteLength(payload) }
    }, function(resp) {
      if (resp.statusCode !== 200) { let e = ''; resp.on('data', d => e += d); resp.on('end', () => res.status(resp.statusCode).json({ error: e })); return; }
      resp.on('data', c => chunks.push(c));
      resp.on('end', () => { res.setHeader('Content-Type', 'audio/mpeg'); res.send(Buffer.concat(chunks)); });
    });
    r.on('error', e => res.status(500).json({ error: e.message }));
    r.write(payload);
    r.end();
  });
};
