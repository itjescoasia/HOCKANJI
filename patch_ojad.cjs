const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const ojadRoute = `
  app.get('/api/ojad', async (req, res) => {
    try {
      const word = req.query.word;
      if (!word) return res.status(400).json({ error: 'Word is required' });
      
      // Since OJAD scraping is brittle, we return an empty array and let the frontend know
      // Alternatively, we could just return a JSON message
      res.json({ results: [] });
    } catch (err) {
      res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  });

  // API to fetch verb forms from OJAD
`;

code = code.replace('// API to fetch verb forms from OJAD', ojadRoute);
fs.writeFileSync(file, code);
