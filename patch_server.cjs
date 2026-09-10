const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const ttsEndpoint = `
  app.post('/api/tts', async (req, res) => {
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
  });
`;

code = code.replace("app.get('/api/ojad', async (req, res) => {", ttsEndpoint + "\n  app.get('/api/ojad', async (req, res) => {");

fs.writeFileSync('server.ts', code);
