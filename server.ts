import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { jsonrepair } from 'jsonrepair';


async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for external hosts (e.g. Cloudflare Workers, custom domains)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Setup uploads/audio directory
  const AUDIO_DIR = path.join(process.cwd(), 'uploads', 'audio');
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve static audio files
  app.use('/api/audio', express.static(AUDIO_DIR, {
    maxAge: '30d',
    setHeaders: (res) => {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }));

  app.post('/api/generate-vocab', async (req, res) => {
    try {
      const { word } = req.body;
      if (!word) {
        return res.status(400).json({ error: 'Word is required' });
      }

            if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
         return res.status(500).json({ error: 'API_KEY is missing. Vui lòng thiết lập GEMINI_API_KEY, OPENAI_API_KEY hoặc GROQ_API_KEY trong Settings.' });
      }

      const prompt = `Bạn là một chuyên gia ngôn ngữ tiếng Nhật. Hãy phân tích từ vựng/ngữ pháp tiếng Nhật sau đây: "${word}".
TUYỆT ĐỐI KHÔNG sử dụng Markdown (như **in đậm**, *in nghiêng*, ### tiêu đề, v.v.) trong bất kỳ giá trị nào. Chỉ sử dụng văn bản thuần túy.
CHÚ Ý CÁC YÊU CẦU QUAN TRỌNG SAU:
1. Trường "sinoVietnamese" (âm Hán Việt) BẮT BUỘC phải điền nếu từ có chứa Kanji. (Ví dụ: 立つ có chữ 立 âm Hán Việt là "Lập", 勉強 có chữ 勉 là "Miễn", 強 là "Cường"). Nếu từ hoàn toàn bằng Hiragana/Katakana thì để trống.
2. Mảng "examples" BẮT BUỘC PHẢI CÓ CHÍNH XÁC 10 CÂU VÍ DỤ (KHÔNG ÍT HƠN, KHÔNG NHIỀU HƠN), ĐƯỢC XẾP TỪ DỄ ĐẾN KHÓ.
3. Trong mảng "forms", nếu từ là Động từ, BẮT BUỘC phải tạo 4 dạng "muốn" (~たい): Khẳng định hiện tại, Phủ định hiện tại, Khẳng định quá khứ, Phủ định quá khứ. TUY NHIÊN, nếu động từ về mặt ngữ nghĩa hoặc ngữ pháp KHÔNG TỒN TẠI thể ~たい (như くれる, ある, v.v.) hoặc các thể khác, thì TUYỆT ĐỐI KHÔNG được tạo ra các dạng vô lý (không tạo くれたい, v.v.). Chỉ điền những thể thực sự tồn tại và đúng 100%.
5. CÁC CÂU VÍ DỤ PHẢI CHÍNH XÁC 100% VỀ NGỮ PHÁP VÀ NGỮ NGHĨA. Phải có chủ ngữ rõ ràng, văn cảnh cụ thể, không được viết câu cụt lủn gây hiểu nhầm (Ví dụ: ĐỪNG viết "本をくれました", mà PHẢI viết rõ "林さんが(私に)本をくれました").
4. Trường "kanjiExplanation" giải thích Kanji như ví dụ trong JSON mẫu, chú ý nếu từ có Hán tự thì phải giải thích gốc rễ cấu tạo từ các bộ.

Vui lòng trả về thông tin dưới dạng JSON hợp lệ, tuân thủ đúng cấu trúc sau:
{
  "kanji": "GIỮ NGUYÊN TOÀN BỘ TỪ VỰNG GỐC mà người dùng nhập vào (chữ Hán, Hiragana, Katakana, ví dụ: 日本での生活)",
  "reading": "cách đọc hiragana của TOÀN BỘ từ vựng gốc (chỉ hiragana, ví dụ: にほんでのせいかつ)",
  "romaji": "cách đọc romaji tương ứng của TOÀN BỘ từ vựng gốc",
  "sinoVietnamese": "âm Hán Việt của TẤT CẢ các chữ Hán có trong từ (BẮT BUỘC, ví dụ: 立つ có chữ 立 âm Hán Việt là Lập, 勉強 có chữ 勉 là Miễn, 強 là Cường). Nếu không có Kanji thì để trống.",
  "meaning": "nghĩa tiếng Việt (ngắn gọn, chính xác)",
  "kanjiExplanation": "Giải thích Kanji có trong từ vựng. Trình bày ĐÚNG THEO ĐỊNH DẠNG SAU:\n[Kanji 1]（[Âm Hán Việt 1]）= [Thành phần 1] + [Thành phần 2] → [Giải thích cấu tạo 1].\n[Kanji 2]（[Âm Hán Việt 2]）= [Thành phần 1] + [Thành phần 2] → [Giải thích cấu tạo 2].\n→ [Từ ghép] = [Ý nghĩa từ ghép] → [Ý nghĩa tổng quát].\nVí dụ: 勉（Miễn）= 免 + 力 → dùng sức để cố gắng. 強（Cường）= 弓 + 厶 + 虫 → tượng trưng cho sức mạnh, sự kiên cường. → 勉強 = nỗ lực mạnh mẽ → học tập.\nNếu từ không có kanji thì không cần giải thích (để trống). Nếu là từ katakana (từ mượn tiếng Anh/nước ngoài) thì giải thích nguồn gốc từ đó.",
  "wordType": "loại từ (CHỌN 1 TRONG CÁC GIÁ TRỊ SAU: 'Danh từ', 'Động từ nhóm I', 'Động từ nhóm II', 'Động từ nhóm III', 'Tính từ i', 'Tính từ na', 'Trạng từ', 'Ngữ pháp', 'Khác')",
  "forms": [
    // BẮT BUỘC TRẢ VỀ ĐẦY ĐỦ CÁC THỂ LỊCH SỰ VÀ THỂ NGẮN đối với Danh từ, Tính từ (i, na) và Động từ (nhóm I, II, III).
    // Động từ gồm: "Thể từ điển (ngắn)", "Thể lịch sự (ます)", "Thể て", "Thể quá khứ ngắn (た)", "Thể quá khứ lịch sự (ました)", "Thể phủ định ngắn (ない)", "Thể phủ định lịch sự (ません)", "Thể điều kiện (ば/たら)", "Thể sai khiến (使役形)", "Thể bị động (受身形 - Ukemi)", "Thể sai khiến bị động", "Thể mệnh lệnh", "Thể khả năng", "Thể ý chí (ngắn - よう)", "Thể ý chí lịch sự (ましょう)".
    // CỰC KỲ QUAN TRỌNG VỚI ĐỘNG TỪ: Thêm 4 dạng của thể muốn (~たい) vào danh sách "forms". LƯU Ý: TRỪ TRƯỜNG HỢP CÁC ĐỘNG TỪ KHÔNG TỒN TẠI THỂ ~たい (NHƯ くれる, ある...) THÌ BỎ QUA ĐỂ ĐẢM BẢO CHÍNH XÁC 100% KIẾN THỨC.
    // Danh từ/Tính từ gồm: "Hiện tại khẳng định (lịch sự)", "Hiện tại phủ định (lịch sự)", "Quá khứ khẳng định (lịch sự)", "Quá khứ phủ định (lịch sự)", "Hiện tại khẳng định (ngắn)", "Hiện tại phủ định (ngắn)", "Quá khứ khẳng định (ngắn)", "Quá khứ phủ định (ngắn)". ĐẶC BIỆT NẾU LÀ TÍNH TỪ ĐUÔI い (i) BẮT BUỘC PHẢI THÊM "Tính từ đuôi い chia ở thể て".
    {
      "name": "Tên thể (ví dụ: Thể quá khứ (た))",
      "value": "cách viết của thể này (bằng Kanji/Kana giống từ gốc)",
      "reading": "cách đọc hiragana của thể này",
      "romaji": "cách đọc romaji",
      "meaning": "nghĩa tiếng Việt"
    }
  ],
  "examples": [
    // BẮT BUỘC TẠO CHÍNH XÁC 10 VÍ DỤ ĐA DẠNG CHO TỪ VỰNG NÀY, ĐI TỪ DỄ ĐẾN KHÓ (Bao gồm từ gốc và một số thể thường gặp). ĐẶC BIỆT NẾU LÀ TÍNH TỪ ĐUÔI い (i) THÌ PHẢI CÓ 1 VÍ DỤ SỬ DỤNG "thể て". ĐỐI VỚI ĐỘNG TỪ THÌ CẦN 1 VÍ DỤ THỂ MUỐN (~たい) NẾU CÓ. CHÚ Ý: CÂU VÍ DỤ PHẢI CÓ CHỦ NGỮ RÕ RÀNG VÀ CHÍNH XÁC 100% (vd: 林さんが本をくれました thay vì 本をくれました).
    {
      "sentence": "câu ví dụ tiếng Nhật chứa từ vựng hoặc thể của từ",
      "reading": "cách đọc hiragana của cả câu ví dụ (cách nhau bởi khoảng trắng hoặc dấu phẩy)",
      "romaji": "cách đọc romaji của cả câu",
      "translation": "nghĩa tiếng Việt của câu ví dụ"
    }
  ]
}`;
      
      let text = '';
      let success = false;
      let lastError = null;
      if (process.env.GEMINI_API_KEY && !success) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          let response;
          try {
            response = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            });
          } catch (error: any) {
            const errorMsg = error.message || '';
            if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE') || error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
               response = await ai.models.generateContent({
                 model: 'gemini-3.5-flash-lite',
                 contents: prompt,
                 config: { responseMimeType: 'application/json' }
            });
            } else {
               throw error;
            }
          }
          text = response.text || '';
          success = true;
        } catch (e: any) {
          e.provider = 'Gemini';
          lastError = e;
          if (!e.message.includes('429') && !e.message.includes('503')) console.error('Gemini failed:', e.message);
        }
      }

      if (process.env.OPENAI_API_KEY && !success) {
        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
          });
          text = chatCompletion.choices[0]?.message?.content || '';
          success = true;
        } catch (e: any) {
          e.provider = 'OpenAI';
          lastError = e;
          if (!e.message.includes('429')) console.error('OpenAI failed:', e.message);
        }
      }
      if (process.env.GROQ_API_KEY && !success) {
        try {
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
          const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
          });
          text = chatCompletion.choices[0]?.message?.content || '';
          success = true;
        } catch (e: any) {
          e.provider = 'Groq';
          lastError = e;
          if (!e.message.includes('429')) console.error('Groq failed:', e.message);
        }
      }
      if (!success) {
        throw lastError || new Error('All AI providers failed');
      }
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
            }  catch (e3) {
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
      
      if (errorMsg.includes('429') || errorMsg.includes('Quota exceeded') || errorMsg.includes('rate limit')) {
        if (error.provider === 'OpenAI') {
          errorMsg = 'Lỗi OpenAI (ChatGPT): Tài khoản đã hết hạn mức hoặc quá nhiều yêu cầu. Vui lòng nạp tiền vào OpenAI, hoặc đổi API Key khác.';
        } else if (error.provider === 'Gemini') {
          errorMsg = 'Lỗi Gemini: Quá nhiều yêu cầu hoặc hệ thống đang quá tải. Vui lòng thử lại sau ít phút.';
        } else if (error.provider === 'Groq') {
          errorMsg = 'Lỗi Groq: Tài khoản đã hết hạn mức hoặc quá nhiều yêu cầu.';
        } else {
          errorMsg = 'Lỗi AI: Quá nhiều yêu cầu hoặc hết hạn mức. Vui lòng thử lại sau ít phút, hoặc gỡ bỏ API key trong menu Settings.';
        }
      } else if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
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

  
  
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voiceId = "Hina", speakingRate = 0.85 } = req.body;
      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      const cleanText = String(text).trim();
      const hash = crypto.createHash('md5').update(`${cleanText}_${voiceId}_${speakingRate}`).digest('hex');
      const audioFilename = `tts_${hash}.mp3`;
      const audioFilePath = path.join(AUDIO_DIR, audioFilename);
      const audioUrl = `/api/audio/${audioFilename}`;

      // Check server disk cache first
      if (fs.existsSync(audioFilePath)) {
        try {
          const fileBuffer = fs.readFileSync(audioFilePath);
          return res.json({ 
            audioContent: fileBuffer.toString('base64'),
            audioUrl,
            cached: true 
          });
        } catch (readErr) {
          console.warn("Could not read cached audio file, regenerating:", readErr);
        }
      }

      const apiKey = process.env.INWORLD_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'INWORLD_API_KEY is not set' });
      }

      const response = await fetch('https://api.inworld.ai/tts/v1/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiKey}`
        },
        body: JSON.stringify({
          text: cleanText,
          voiceId: voiceId,
          modelId: "inworld-tts-1.5-max",
          audioConfig: {
            speakingRate: speakingRate
          },
          temperature: 1
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Inworld TTS API Error:', response.status, errText);
        return res.status(response.status).json({ error: 'Failed to synthesize speech', details: errText });
      }

      const data = await response.json();
      if (data.audioContent) {
        try {
          const audioBuffer = Buffer.from(data.audioContent, 'base64');
          fs.writeFileSync(audioFilePath, audioBuffer);
        } catch (writeErr) {
          console.warn("Failed to write audio cache file to disk:", writeErr);
        }
      }

      res.json({ 
        audioContent: data.audioContent,
        audioUrl 
      });
    } catch (error: any) {
      console.error('Error in /api/tts:', error);
      res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  });

  // Direct audio streaming for any browser or HTML5 audio
  app.get('/api/tts', async (req, res) => {
    try {
      const text = String(req.query.text || '').trim();
      if (!text) return res.status(400).send('Text is required');
      
      const voiceId = String(req.query.voiceId || 'Hina');
      const speakingRate = 0.85;
      const hash = crypto.createHash('md5').update(`${text}_${voiceId}_${speakingRate}`).digest('hex');
      const audioFilename = `tts_${hash}.mp3`;
      const audioFilePath = path.join(AUDIO_DIR, audioFilename);

      if (fs.existsSync(audioFilePath)) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=2592000');
        return fs.createReadStream(audioFilePath).pipe(res);
      }

      const apiKey = process.env.INWORLD_API_KEY;
      if (!apiKey) return res.status(500).send('INWORLD_API_KEY is not set');

      const response = await fetch('https://api.inworld.ai/tts/v1/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiKey}`
        },
        body: JSON.stringify({
          text,
          voiceId,
          modelId: "inworld-tts-1.5-max",
          audioConfig: { speakingRate },
          temperature: 1
        })
      });

      if (!response.ok) {
        return res.status(response.status).send('TTS API error');
      }

      const data = await response.json();
      if (data.audioContent) {
        const audioBuffer = Buffer.from(data.audioContent, 'base64');
        fs.writeFileSync(audioFilePath, audioBuffer);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=2592000');
        return res.send(audioBuffer);
      }
      res.status(500).send('No audio content');
    } catch (err: any) {
      res.status(500).send('Server error: ' + err.message);
    }
  });

  // Endpoint to upload custom user audio files
  app.post('/api/upload-audio', async (req, res) => {
    try {
      const { base64Data, filename } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: 'base64Data is required' });
      }
      const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const buffer = Buffer.from(cleanBase64, 'base64');
      const safeName = (filename || 'custom_audio').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
      const uniqueFilename = `custom_${Date.now()}_${safeName}.mp3`;
      const filePath = path.join(AUDIO_DIR, uniqueFilename);
      fs.writeFileSync(filePath, buffer);
      
      const audioUrl = `/api/audio/${uniqueFilename}`;
      res.json({ audioUrl });
    } catch (err: any) {
      console.error('Error in /api/upload-audio:', err);
      res.status(500).json({ error: 'Failed to upload audio: ' + err.message });
    }
  });

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
