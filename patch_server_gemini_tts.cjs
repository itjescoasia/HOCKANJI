const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the Inworld TTS API route and replace it
const t1 = `  app.post('/api/tts', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      const apiKey = process.env.INWORLD_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'INWORLD_API_KEY is not set' });
      }

      // We use the non-streaming endpoint as it is simpler for short text
      // and returns a single base64 string that can be easily played in browser.
      const response = await fetch('https://api.inworld.ai/tts/v1/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Basic \${apiKey}\`
        },
        body: JSON.stringify({
          text: text,
          voiceId: "Hina",
          modelId: "inworld-tts-1.5-max",
          audioConfig: {
            speakingRate: 0.85
          },
          temperature: 1
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Inworld TTS API Error:', response.status, errText);
        return res.status(response.status).json({ error: 'Failed to synthesize speech', details: errText });
      }

      const data = await response.json();
      res.json({ audioContent: data.audioContent });
    } catch (error) {
      console.error('Error in /api/tts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });`;

const r1 = `  app.post('/api/tts', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
         res.json({ audioContent: base64Audio });
      } else {
         return res.status(500).json({ error: 'Failed to synthesize speech', details: 'No audio returned' });
      }
    } catch (error) {
      console.error('Error in /api/tts (Gemini):', error);
      res.status(500).json({ error: 'Internal server error', details: String(error) });
    }
  });`;

code = code.replace(t1, r1);
fs.writeFileSync('server.ts', code);
