const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text' });

    const request = {
      input: { text: text },
      voice: { 
        // 'en-US-Studio-Q' is the deep, professional-grade male voice
        // 'en-US-Studio-O' is the alternative if you want a different grit
        name: 'en-US-Studio-Q', 
        languageCode: 'en-US' 
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.05, 
        pitch: -2.0, // Drop it low for that gangster rumble
      }
    };

    const [response] = await client.synthesizeSpeech(request);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(response.audioContent);

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: error.message });
  }
};
