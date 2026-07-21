const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('Type }')) {
  code = code.replace(/import \{ GoogleGenAI \} from '@google\/genai';/, "import { GoogleGenAI, Type } from '@google/genai';");
}

const schemaStr = `
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                kanji: { type: Type.STRING },
                reading: { type: Type.STRING },
                romaji: { type: Type.STRING },
                sinoVietnamese: { type: Type.STRING },
                meaning: { type: Type.STRING },
                kanjiExplanation: { type: Type.STRING },
                wordType: { type: Type.STRING },
                forms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      reading: { type: Type.STRING },
                      romaji: { type: Type.STRING },
                      meaning: { type: Type.STRING }
                    }
                  }
                },
                examples: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      sentence: { type: Type.STRING },
                      reading: { type: Type.STRING },
                      romaji: { type: Type.STRING },
                      translation: { type: Type.STRING }
                    }
                  }
                }
              }
            },
`;

code = code.replace(/responseMimeType:\s*'application\/json',/g, schemaStr);
fs.writeFileSync('server.ts', code);
