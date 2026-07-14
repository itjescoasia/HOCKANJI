const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /res\.status\(500\)\.json\(\{ error: error\.message \|\| 'Failed to generate vocabulary data' \}\);/g,
  `
      let errorMsg = error.message || 'Failed to generate vocabulary data';
      if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
        errorMsg = 'Hệ thống AI đang quá tải, vui lòng thử lại sau ít phút (503).';
      } else if (typeof errorMsg === 'string' && errorMsg.startsWith('{')) {
         try {
            const parsed = JSON.parse(errorMsg);
            if (parsed.error && parsed.error.message) {
               errorMsg = parsed.error.message;
            }
         } catch(e) {}
      }
      res.status(500).json({ error: errorMsg });
  `
);

fs.writeFileSync('server.ts', code);
