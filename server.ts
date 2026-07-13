import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API to fetch verb forms from OJAD
  app.get('/api/ojad', async (req, res) => {
    try {
      const word = req.query.word as string;
      if (!word) {
        return res.status(400).json({ error: 'Word is required' });
      }

      // Fetch from OJAD
      const url = `https://www.gavo.t.u-tokyo.ac.jp/ojad/search/index/word:${encodeURIComponent(word)}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const results: any[] = [];

      $('#word_table tr').each((i, el) => {
        const midashi = $(el).find('.midashi_word').text();
        if (!midashi) return; // Not a word row

        const forms: { name: string; reading: string; value?: string }[] = [];
        
        // Extract all td cells which contain the forms
        const tds = $(el).find('td');
        
        const extractText = (tdIndex: number) => {
           let text = '';
           $(tds[tdIndex]).find('.char').each((_, charEl) => {
             text += $(charEl).text();
           });
           return text;
        };

        const jisho = extractText(2);
        const masu = extractText(3);
        const te = extractText(4);
        const ta = extractText(5);
        const nai = extractText(6);
        const nakatta = extractText(7);
        const ba = extractText(8);
        const shieki = extractText(9);
        const ukemi = extractText(10);
        const meirei = extractText(11);
        const kanou = extractText(12);
        const ishi = extractText(13);

        const idPrefix = Date.now().toString();
        let formCounter = 0;
        const addForm = (name: string, reading: string) => {
           if (reading) {
               forms.push({ id: `${idPrefix}-${formCounter++}`, name, reading });
           }
        };

        addForm('Thể từ điển (thể る)', jisho);
        addForm('Thể lịch sự (thể ます)', masu);
        addForm('Thể て', te);
        addForm('Thể quá khứ (thể た)', ta);
        addForm('Thể phủ định (thể ない)', nai);
        addForm('Thể điều kiện (thể ば)', ba);
        addForm('Thể sai khiến', shieki);
        addForm('Thể bị động', ukemi);
        addForm('Thể mệnh lệnh', meirei);
        addForm('Thể khả năng', kanou);
        addForm('Thể ý chí (thể よう)', ishi);

        // Simple Kanji mapping attempt
        const kanjiMatch = midashi.split('・')[0]; // e.g. 食べる
        if (kanjiMatch && jisho) {
          // find the common prefix between kanjiMatch and jisho
          // Actually, kanjiMatch is 食べる, jisho is たべる.
          // The suffix is 'べる', so the stem kanji is 食 and hiragana is た.
          let suffixLen = 0;
          while (
            suffixLen < kanjiMatch.length && 
            suffixLen < jisho.length && 
            kanjiMatch[kanjiMatch.length - 1 - suffixLen] === jisho[jisho.length - 1 - suffixLen]
          ) {
            suffixLen++;
          }
          
          if (suffixLen > 0) {
            const kanjiStem = kanjiMatch.slice(0, kanjiMatch.length - suffixLen);
            const hiraStem = jisho.slice(0, jisho.length - suffixLen);
            
            if (kanjiStem && hiraStem) {
              // Apply this stem replacement to all forms
              forms.forEach(f => {
                if (f.reading.startsWith(hiraStem)) {
                  f.value = kanjiStem + f.reading.slice(hiraStem.length);
                } else {
                  f.value = f.reading;
                }
              });
            } else {
               forms.forEach(f => f.value = f.reading);
            }
          } else {
             forms.forEach(f => f.value = f.reading);
          }
        } else {
          forms.forEach(f => f.value = f.reading);
        }

        results.push({
          midashi,
          jisho,
          kanji: kanjiMatch,
          forms
        });
      });

      res.json({ results });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch from OJAD' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
