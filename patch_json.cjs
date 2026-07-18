const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const oldLogic = `      const text = response.text || '';
      res.json(JSON.parse(text));`;

const newLogic = `      let text = response.text || '';
      text = text.replace(/^\\s*\`\`\`json\\s*/i, '').replace(/\\s*\`\`\`\\s*$/i, '').trim();
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

if (file.includes('const text = response.text || \'\';')) {
  file = file.replace(oldLogic, newLogic);
  fs.writeFileSync('server.ts', file);
  console.log('Patched JSON parse logic');
} else {
  console.log('Could not find old logic in server.ts');
}
