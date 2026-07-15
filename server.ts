import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/generate-vocab', async (req, res) => {
    try {
      const { word } = req.body;
      if (!word) {
        return res.status(400).json({ error: 'Word is required' });
      }

      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: 'GEMINI_API_KEY is missing. Vui lòng thiết lập API Key trong Settings.' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Bạn là một chuyên gia ngôn ngữ tiếng Nhật. Hãy phân tích từ vựng/ngữ pháp tiếng Nhật sau đây: "${word}".
Vui lòng trả về thông tin dưới dạng JSON hợp lệ, tuân thủ đúng cấu trúc sau:
{
  "kanji": "từ vựng gốc (chữ Hán nếu có, nếu không thì để hiragana/katakana gốc)",
  "reading": "cách đọc hiragana (chỉ hiragana, không chứa chữ Hán)",
  "romaji": "cách đọc romaji tương ứng",
  "sinoVietnamese": "âm Hán Việt của các chữ Hán (nếu có, ví dụ: THỰC, nếu không để chuỗi rỗng)",
  "meaning": "nghĩa tiếng Việt (ngắn gọn, chính xác)",
  "kanjiExplanation": "Giải thích cấu tạo Kanji hoặc cách nhớ (nếu có, không thì để trống)",
  "wordType": "loại từ (CHỌN 1 TRONG CÁC GIÁ TRỊ SAU: 'Danh từ', 'Động từ nhóm I', 'Động từ nhóm II', 'Động từ nhóm III', 'Tính từ đuôi-i', 'Tính từ đuôi-na', 'Ngữ pháp', 'Trạng từ (副詞)', 'Khác')",
  "examples": [
    {
      "sentence": "câu ví dụ tiếng Nhật chứa từ vựng",
      "reading": "cách đọc hiragana của cả câu ví dụ (cách nhau bởi khoảng trắng hoặc dấu phẩy)",
      "romaji": "cách đọc romaji của cả câu",
      "translation": "nghĩa tiếng Việt của câu ví dụ"
    }
  ]
}`;
      
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });
      } catch (error: any) {
        const errorMsg = error.message || '';
        if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
           console.log('gemini-3.5-flash is overloaded (503), falling back to gemini-3.1-flash-lite...');
           response = await ai.models.generateContent({
             model: 'gemini-3.1-flash-lite',
             contents: prompt,
             config: {
               responseMimeType: 'application/json',
             }
           });
        } else {
           throw error;
        }
      }

      const text = response.text || '';
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error('Error generating vocab:', error);
      
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
  
    }
  });

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

        const forms: { id: string; name: string; reading: string; value?: string }[] = [];
        
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
