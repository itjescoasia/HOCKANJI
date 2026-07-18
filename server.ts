import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import { jsonrepair } from 'jsonrepair';


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
TUYỆT ĐỐI KHÔNG sử dụng Markdown (như **in đậm**, *in nghiêng*, ### tiêu đề, v.v.) trong bất kỳ giá trị nào. Chỉ sử dụng văn bản thuần túy.

Vui lòng trả về thông tin dưới dạng JSON hợp lệ, tuân thủ đúng cấu trúc sau:
{
  "kanji": "từ vựng gốc (chữ Hán nếu có, nếu không thì để hiragana/katakana gốc)",
  "reading": "cách đọc hiragana (chỉ hiragana, không chứa chữ Hán)",
  "romaji": "cách đọc romaji tương ứng",
  "sinoVietnamese": "âm Hán Việt của các chữ Hán (nếu có, ví dụ: THỰC, nếu không để chuỗi rỗng)",
  "meaning": "nghĩa tiếng Việt (ngắn gọn, chính xác)",
  "kanjiExplanation": "Giải thích cấu tạo Kanji hoặc cách nhớ (nếu có, không thì để trống)",
  "wordType": "loại từ (CHỌN 1 TRONG CÁC GIÁ TRỊ SAU: 'Danh từ', 'Động từ nhóm I', 'Động từ nhóm II', 'Động từ nhóm III', 'Tính từ đuôi-i', 'Tính từ đuôi-na', 'Ngữ pháp', 'Trạng từ (副詞)', 'Khác')",
  "forms": [
    // BẮT BUỘC TRẢ VỀ ĐẦY ĐỦ CÁC THỂ LỊCH SỰ VÀ THỂ NGẮN đối với Danh từ, Tính từ (đuôi-i, đuôi-na) và Động từ (nhóm I, II, III).
    // Động từ gồm: "Thể từ điển (ngắn)", "Thể lịch sự (ます)", "Thể て", "Thể quá khứ ngắn (た)", "Thể quá khứ lịch sự (ました)", "Thể phủ định ngắn (ない)", "Thể phủ định lịch sự (ません)", "Thể điều kiện (ば/たら)", "Thể sai khiến", "Thể bị động", "Thể mệnh lệnh", "Thể khả năng", "Thể ý chí (ngắn - よう)", "Thể ý chí lịch sự (ましょう)".
    // Danh từ/Tính từ gồm: "Hiện tại khẳng định (lịch sự)", "Hiện tại phủ định (lịch sự)", "Quá khứ khẳng định (lịch sự)", "Quá khứ phủ định (lịch sự)", "Hiện tại khẳng định (ngắn)", "Hiện tại phủ định (ngắn)", "Quá khứ khẳng định (ngắn)", "Quá khứ phủ định (ngắn)".
    {
      "name": "Tên thể (ví dụ: Thể quá khứ (た))",
      "value": "cách viết của thể này (bằng Kanji/Kana giống từ gốc)",
      "reading": "cách đọc hiragana của thể này",
      "romaji": "cách đọc romaji",
      "meaning": "nghĩa tiếng Việt"
    }
  ],
  "examples": [
    // BẮT BUỘC TẠO TỪ 3 ĐẾN 5 VÍ DỤ ĐA DẠNG CHO TỪ VỰNG NÀY (Bao gồm từ gốc và một số thể thường gặp).
    {
      "sentence": "câu ví dụ tiếng Nhật chứa từ vựng hoặc thể của từ",
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

      let text = response.text || '';
      text = text.replace(/^\s*```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      let parsedData;
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
      }
      res.json(parsedData);
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
