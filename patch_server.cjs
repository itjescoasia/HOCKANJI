const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import OpenAI")) {
  content = content.replace("import { GoogleGenAI, Type } from '@google/genai';", "import { GoogleGenAI, Type } from '@google/genai';\nimport OpenAI from 'openai';\nimport Groq from 'groq-sdk';");
  fs.writeFileSync(file, content);
  console.log("Patched server.ts imports successfully");
}
