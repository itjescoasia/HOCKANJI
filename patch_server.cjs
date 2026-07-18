const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const oldLogic = `      let parsedData;
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
      }`;

const newLogic = `      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        try {
          parsedData = JSON.parse(jsonrepair(text));
        } catch (e2) {
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start !== -1 && end !== -1) {
            try {
              parsedData = JSON.parse(jsonrepair(text.substring(start, end + 1)));
            } catch (e3) {
              throw e2;
            }
          } else {
            throw e2;
          }
        }
      }`;

file = file.replace(oldLogic, newLogic);
fs.writeFileSync('server.ts', file);
console.log('Patched server.ts');
