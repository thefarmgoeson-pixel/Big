const textToSpeech = require('@google-cloud/text-to-speech');

// Initialize the client with credentials from your Env Var
const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    const request = {
      input: { text: text },
      // Gemini-TTS specific configuration
      voice: { 
        // Using the Gemini-optimized voice model
        name: 'en-US-Gemini-1', 
        languageCode: 'en-US' 
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.1 // Slightly faster for energy
      },
      // This is the "Gemini" magic: natural language prompting for the voice
      advancedOptions: {
        model: 'gemini-2.5-flash-tts',
        prompt: 'Speak in an urgent, loud, and shouting tone as if there is an emergency.'
      }
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(response.audioContent);

  } catch (error) {
    console.error('GCP Error:', error);
    res.status(500).json({ error: error.message });
  }
};
