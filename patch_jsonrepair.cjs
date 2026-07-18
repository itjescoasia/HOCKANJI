const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const importStatement = "import { jsonrepair } from 'jsonrepair';\n";
if (!file.includes('jsonrepair')) {
  file = file.replace("import { GoogleGenAI } from '@google/genai';", "import { GoogleGenAI } from '@google/genai';\n" + importStatement);
}

const oldLogic = `      let text = response.text || '';
      text = text.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\s*\\\`\\\`\\\`\\s*$/i, '').trim();
      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          parsedData = JSON.parse(text.substring(start, end + 1));
        } else {
          throw e;
        }
      }
      res.json(parsedData);`;

const newLogic = `      let text = response.text || '';
      text = text.replace(/^\\s*\\\`\\\`\\\`json\\s*/i, '').replace(/\\s*\\\`\\\`\\\`\\s*$/i, '').trim();
      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        try {
          parsedData = JSON.parse(jsonrepair(text));
        } catch (err2) {
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start !== -1 && end !== -1) {
            try {
              parsedData = JSON.parse(jsonrepair(text.substring(start, end + 1)));
            } catch (err3) {
               throw e;
            }
          } else {
            throw e;
          }
        }
      }
      res.json(parsedData);`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('server.ts', file);
console.log('Patched with jsonrepair');
