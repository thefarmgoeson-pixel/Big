const textToSpeech = require('@google-cloud/text-to-speech');

// Initialize the boss—using the Gemini 3.0 Flash logic
const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});

module.exports = async function handler(req, res) {
  // Respect the hustle (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Keep it moving, POST only.' });

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No bars, no audio.' });

    const request = {
      input: { text: text },
      // Switching to the Gemini-1 voice—it’s got that authoritative, deep grit
      voice: { name: 'en-US-Gemini-1', languageCode: 'en-US' },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.05, // Speed it up just a touch for that flow
        pitch: -1.5,        // Drop the octave for that gravelly Biggie rumble
      },
      advancedOptions: {
        model: 'gemini-2.5-flash-tts',
        // This is the prompt that makes Gemini act like a legend
        prompt: 'Speak like a legendary 90s gangster rapper from Brooklyn. Deep, rhythmic, slightly raspy, and full of swagger.'
      }
    };

    // Make the call to the cloud
    const [response] = await client.synthesizeSpeech(request);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(response.audioContent);

  } catch (error) {
    console.error('TTS Error on the Hillside:', error);
    res.status(500).json({ error: error.message });
  }
};
