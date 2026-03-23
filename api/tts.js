const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const request = {
      input: { text: text },
      voice: { name: 'en-US-Gemini-1', languageCode: 'en-US' },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.05, // Slightly pushed for that rap flow
        pitch: -1.0         // Slightly deeper, authoritative tone
      },
      advancedOptions: {
        model: 'gemini-2.5-flash-tts',
        // This is the prompt that gives it the "Biggie" energy
        prompt: 'Speak like a 90s Brooklyn rapper. Deep voice, rhythmic cadence, confident and slightly gritty.'
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
