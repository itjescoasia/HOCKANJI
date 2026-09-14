const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
         res.json({ audioContent: base64Audio });
      }`;

const r1 = `      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
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
      }`;

code = code.replace(t1, r1);
fs.writeFileSync('server.ts', code);
