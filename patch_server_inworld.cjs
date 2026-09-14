const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `  app.post('/api/tts', async (req, res) => {
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
         // Create WAV header for the PCM 24kHz audio
         const pcmData = Buffer.from(base64Audio, 'base64');
         const sampleRate = 24000;
         const numChannels = 1;
         const bitsPerSample = 16;
         
         const wavHeader = Buffer.alloc(44);
         // "RIFF" chunk descriptor
         wavHeader.write('RIFF', 0);
         wavHeader.writeUInt32LE(36 + pcmData.length, 4); // Chunk size
         wavHeader.write('WAVE', 8);
         // "fmt " sub-chunk
         wavHeader.write('fmt ', 12);
         wavHeader.writeUInt32LE(16, 16); // Subchunk1Size
         wavHeader.writeUInt16LE(1, 20); // AudioFormat (PCM)
         wavHeader.writeUInt16LE(numChannels, 22);
         wavHeader.writeUInt32LE(sampleRate, 24);
         wavHeader.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
         wavHeader.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
         wavHeader.writeUInt16LE(bitsPerSample, 34);
         // "data" sub-chunk
         wavHeader.write('data', 36);
         wavHeader.writeUInt32LE(pcmData.length, 40);
         
         const wavBuffer = Buffer.concat([wavHeader, pcmData]);
         const wavBase64 = wavBuffer.toString('base64');
         
         res.json({ audioContent: wavBase64, mimeType: 'audio/wav' });
      } else {
         return res.status(500).json({ error: 'Failed to synthesize speech', details: 'No audio returned' });
      }
    } catch (error) {
      console.error('Error in /api/tts (Gemini):', error);
      res.status(500).json({ error: 'Internal server error', details: String(error) });
    }
  });`;

const r1 = `  app.post('/api/tts', async (req, res) => {
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

code = code.replace(t1, r1);
fs.writeFileSync('server.ts', code);
