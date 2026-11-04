import dotenv from 'dotenv';
dotenv.config();

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
import * as wanakana from 'wanakana';
import { ensureCompleteForms } from './src/utils/verbConjugation.ts';


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

  const modelCooldownMap = new Map<string, number>();

  async function generateGeminiContentWithFallback(ai: GoogleGenAI, promptText: string): Promise<string> {
    // Multi-tier model candidates to withstand regional cluster overloads (503) or rate limits (429)
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
    ];
    let lastErr: any = null;
    const now = Date.now();

    for (const model of candidateModels) {
      const cooldownUntil = modelCooldownMap.get(model) || 0;
      if (now < cooldownUntil) {
        console.warn(`Skipping model ${model} (in cooldown due to recent quota/overload until ${new Date(cooldownUntil).toLocaleTimeString()})`);
        continue;
      }

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: promptText,
            config: { responseMimeType: 'application/json' }
          });
          if (response && response.text) {
            // Success: clear cooldown for this model
            modelCooldownMap.delete(model);
            return response.text;
          }
        } catch (err: any) {
          lastErr = err;
          const errMsg = err?.message || String(err);
          const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded') || errMsg.includes('rate limit');
          const is503 = err?.status === 503 || errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE') || errMsg.includes('overloaded');
          
          console.warn(`Gemini model ${model} (attempt ${attempt + 1}) warning: ${errMsg.slice(0, 160)}`);
          
          if (isQuota) {
            // Temporary 60s cooldown, immediately fail over to next model pool
            modelCooldownMap.set(model, Date.now() + 60 * 1000);
            break;
          }

          if (is503) {
            // Cluster overloaded: cooldown for 30s and immediately fail over to next model
            modelCooldownMap.set(model, Date.now() + 30 * 1000);
            break;
          }

          // If network glitch (ECONNRESET, ETIMEDOUT, fetch failed), wait briefly before retry
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 600));
          }
        }
      }
    }
    throw lastErr || new Error('All Gemini candidate models failed');
  }

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
3. ĐỐI VỚI BẢNG CHIA CÁC THỂ / CÁC THÌ TRONG MẢNG "forms" (BẮT BUỘC PHẢI ĐẦY ĐỦ CẢ THỂ LỊCH SỰ VÀ THỂ NGẮN):
   - NẾU LÀ ĐỘNG TỪ:
     + "Thể từ điển (ngắn)" (ví dụ: 眠る, 食べる)
     + "Thể lịch sự (ます)" (ví dụ: 眠ります, 食べます)
     + "Thể て" (ví dụ: 眠って, 食べて)
     + "Thể quá khứ khẳng định ngắn (た)" (ví dụ: 眠った, 食べた)
     + "Thể quá khứ khẳng định lịch sự (ました)" (ví dụ: 眠りました, 食べました)
     + "Thể phủ định hiện tại ngắn (ない)" (ví dụ: 眠らない, 食べない)
     + "Thể phủ định hiện tại lịch sự (ません)" (ví dụ: 眠りません, 食べません)
     + "Thể quá khứ phủ định ngắn (thể なかった)" (BẮT BUỘC ĐỐI VỚI MỌI ĐỘNG TỪ, ví dụ: 寝る -> 寝なかった, 眠る -> 眠らなかった, 食べる -> 食べなかった, 行く -> 行かなかった, 飲む -> 飲まなかった, する -> しなかった, 来る -> 来なかった)
     + "Thể quá khứ phủ định lịch sự (thể ませんでした)" (ví dụ: 寝ませんでした, 眠りませんでした, 食べませんでした)
     + "Thể điều kiện (ば/たら)" (ví dụ: 眠れば/眠ったら, 食べれば/食べたら)
     + "Thể ý chí (ngắn - よう)" (ví dụ: 眠ろう, 食べよう)
     + "Thể ý chí lịch sự (ましょう)" (ví dụ: 眠りましょう, 食べましょう)
     + "Thể mệnh lệnh" (ví dụ: 眠れ, 食べろ)
     + "Thể cấm chỉ (thể な)" (ví dụ: 眠るな, 食べるな)
     + "Thể khả năng (khẳng định hiện tại)" (ví dụ: 眠れる, 食べられる)
     + "Thể khả năng (phủ định hiện tại - れない/られない)" (ví dụ: 眠れない, 食べられない)
     + "Thể khả năng (khẳng định quá khứ - れた/られた)" (ví dụ: 眠れた, 食べられた)
     + "Thể khả năng (quá khứ phủ định ngắn - れなかった/られなかった)" (ví dụ: 眠れなかった, 食べられなかった) -> CỰC KỲ QUAN TRỌNG!
     + "Thể khả năng (quá khứ phủ định lịch sự)" (ví dụ: 眠れませんでした, 食べられませんでした)
     + "Thể bị động (受身形 - Ukemi)" (ví dụ: 眠られる, 食べられる)
     + "Thể sai khiến (使役形)" (ví dụ: 眠らせる, 食べさせる)
     + "Thể sai khiến bị động" (ví dụ: 眠らせられる, 食べさせられる)
     + 4 dạng của thể muốn (~たい) nếu có: Khẳng định hiện tại (眠りたい), Phủ định hiện tại (眠りたくない), Khẳng định quá khứ (眠りたかった), Phủ định quá khứ (眠りたくなかった). LƯU Ý: TRỪ TRƯỜNG HỢP CÁC ĐỘNG TỪ KHÔNG TỒN TẠI THỂ ~たい (NHƯ くれる, ある...) THÌ BỎ QUA.
   - NẾU LÀ DANH TỪ (BẮT BUỘC ĐẦY ĐỦ 9 THÌ SAU, ĐẶC BIỆT THỂ THÔNG THƯỜNG / THỂ NGẮN LÀ [TỪ]だ):
     + "Khẳng định hiện tại (thể ngắn - だ)" (ví dụ với 朝: 朝だ, đọc: あさだ, romaji: asa da, nghĩa: là buổi sáng) -> CỰC KỲ QUAN TRỌNG, BẮT BUỘC PHẢI CÓ [TỪ]だ!
     + "Khẳng định hiện tại (thể lịch sự - です)" (ví dụ: 朝です, đọc: あさです, romaji: asa desu, nghĩa: là buổi sáng (lịch sự))
     + "Phủ định hiện tại (thể ngắn - ではない)" (ví dụ: 朝ではない, đọc: あさではない, romaji: asa dewa nai, nghĩa: không phải là buổi sáng)
     + "Phủ định hiện tại (thể lịch sự - ではありません)" (ví dụ: 朝ではありません, đọc: あさではありません, romaji: asa dewa arimasen, nghĩa: không phải là buổi sáng (lịch sự))
     + "Quá khứ khẳng định (thể ngắn - だった)" (ví dụ: 朝だった, đọc: あさだった, romaji: asa datta, nghĩa: đã là buổi sáng)
     + "Quá khứ khẳng định (thể lịch sự - でした)" (ví dụ: 朝でした, đọc: あさでした, romaji: asa deshita, nghĩa: đã là buổi sáng (lịch sự))
     + "Quá khứ phủ định (thể ngắn - ではなかった)" (ví dụ: 朝ではなかった, đọc: あさではなかった, romaji: asa dewa nakatta, nghĩa: đã không phải là buổi sáng)
     + "Quá khứ phủ định (thể lịch sự - ではありませんでした)" (ví dụ: 朝ではありませんでした, đọc: あさではありませんでした, romaji: asa dewa arimasen deshita, nghĩa: đã không phải là buổi sáng (lịch sự))
     + "Thể て (thể nối - で)" (ví dụ: 朝で, đọc: あさで, romaji: asa de, nghĩa: là buổi sáng và...)
   - NẾU LÀ TÍNH TỪ NA:
     + "Khẳng định hiện tại (thể ngắn - だ)" (ví dụ: 静かだ)
     + "Khẳng định hiện tại (thể lịch sự - です)" (ví dụ: 静かです)
     + "Bổ nghĩa danh từ (thể な)" (ví dụ: 静かな)
     + "Phủ định hiện tại (thể ngắn - ではない)" (ví dụ: 静かではない)
     + "Phủ định hiện tại (thể lịch sự - ではありません)" (ví dụ: 静かではありません)
     + "Quá khứ khẳng định (thể ngắn - だった)" (ví dụ: 静かだった)
     + "Quá khứ khẳng định (thể lịch sự - でした)" (ví dụ: 静かでした)
     + "Quá khứ phủ định (thể ngắn - ではなかった)" (ví dụ: 静かではなかった)
     + "Quá khứ phủ định (thể lịch sự - ではありませんでした)" (ví dụ: 静かではありませんでした)
     + "Thể て (thể nối - で)" (ví dụ: 静かで)
   - NẾU LÀ TÍNH TỪ I:
     + "Khẳng định hiện tại (thể ngắn)" (ví dụ: 寒い)
     + "Khẳng định hiện tại (thể lịch sự - です)" (ví dụ: 寒いです)
     + "Phủ định hiện tại (thể ngắn - くない)" (ví dụ: 寒くない)
     + "Phủ định hiện tại (thể lịch sự - くないです)" (ví dụ: 寒くないです)
     + "Quá khứ khẳng định (thể ngắn - かった)" (ví dụ: 寒かった)
     + "Quá khứ khẳng định (thể lịch sự - かったです)" (ví dụ: 寒かったです)
     + "Quá khứ phủ định (thể ngắn - くなかった)" (ví dụ: 寒くなかった)
     + "Quá khứ phủ định (thể lịch sự - くなかったです)" (ví dụ: 寒くなかったです)
     + "Thể て (thể nối - くて)" (ví dụ: 寒くて)
4. NẾU NGƯỜI DÙNG NHẬP VÀO MỘT DẠNG ĐÃ CHIA (ví dụ: "眠れなかった", "食べた", "行かない", "飲みたい", hoặc "朝だ", "朝だった"):
   - Nhận diện chính xác từ gốc (ví dụ: "眠れなかった" là dạng Thể khả năng quá khứ phủ định của "眠る"; "朝だ" là thể ngắn khẳng định hiện tại của danh từ "朝").
   - "meaning": Giải thích chuẩn xác nghĩa của dạng từ đó.
   - "forms": BẮT BUỘC cung cấp đầy đủ bảng chia thể của từ gốc, và ĐẶC BIỆT PHẢI CÓ CHÍNH XÁC dạng người dùng đã nhập (ví dụ: "眠れなかった" hoặc "朝だ").
5. CÁC CÂU VÍ DỤ PHẢI CHÍNH XÁC 100% VỀ NGỮ PHÁP VÀ NGỮ NGHĨA. Phải có chủ ngữ rõ ràng, văn cảnh cụ thể, không được viết câu cụt lủn gây hiểu nhầm.
6. Trường "kanjiExplanation" giải thích Kanji như ví dụ trong JSON mẫu, chú ý nếu từ có Hán tự thì phải giải thích gốc rễ cấu tạo từ các bộ.

Vui lòng trả về thông tin dưới dạng JSON hợp lệ, tuân thủ đúng cấu trúc sau:
{
  "kanji": "GIỮ NGUYÊN TOÀN BỘ TỪ VỰNG GỐC mà người dùng nhập vào (chữ Hán, Hiragana, Katakana, ví dụ: 眠る, 朝, hoặc 眠れなかった, 朝だ)",
  "reading": "cách đọc hiragana của từ vựng gốc (chỉ hiragana, ví dụ: ねむる hoặc あさ)",
  "romaji": "cách đọc romaji tương ứng của từ vựng gốc",
  "sinoVietnamese": "âm Hán Việt của TẤT CẢ các chữ Hán có trong từ (BẮT BUỘC, ví dụ: 眠る có chữ 眠 âm Hán Việt là Miên, 朝 là Triều). Nếu không có Kanji thì để trống.",
  "meaning": "nghĩa tiếng Việt (ngắn gọn, chính xác)",
  "wordType": "loại từ (CHỌN 1 TRONG CÁC GIÁ TRỊ: 'Danh từ', 'Động từ nhóm I (Tha động từ)', 'Động từ nhóm I (Tự động từ)', 'Động từ nhóm I', 'Động từ nhóm II (Tha động từ)', 'Động từ nhóm II (Tự động từ)', 'Động từ nhóm II', 'Động từ nhóm III (Tha động từ)', 'Động từ nhóm III (Tự động từ)', 'Động từ nhóm III', 'Tính từ i', 'Tính từ na', 'Trạng từ', 'Ngữ pháp', 'Khác'). Nếu là động từ, BẮT BUỘC chỉ rõ là Tha động từ hay Tự động từ (ví dụ: 乾かす là 'Động từ nhóm I (Tha động từ)', 乾く là 'Động từ nhóm I (Tự động từ)').",
  "forms": [
    // BẮT BUỘC TRẢ VỀ ĐẦY ĐỦ CÁC THỂ LỊCH SỰ VÀ THỂ NGẮN.
    // Đối với Động từ: "Thể từ điển (ngắn)", "Thể lịch sự (ます)", "Thể て", "Thể quá khứ ngắn (た)", "Thể quá khứ lịch sự (ました)", "Thể phủ định ngắn (ない)", "Thể phủ định lịch sự (ません)", "Thể quá khứ phủ định ngắn (thể なかった)", "Thể quá khứ phủ định lịch sự (thể ませんでした)", "Thể khả năng", "Thể khả năng (phủ định)", "Thể khả năng (quá khứ phủ định)" (ĐẶC BIỆT: 眠れなかった), "Thể điều kiện", "Thể ý chí", "Thể mệnh lệnh", "Thể cấm chỉ", "Thể bị động", "Thể sai khiến", "Thể sai khiến bị động", và 4 dạng của thể muốn (~たい).
    // Đối với Danh từ: "Khẳng định hiện tại (thể ngắn - だ)" (ví dụ: 朝だ), "Khẳng định hiện tại (thể lịch sự - です)" (ví dụ: 朝です), "Phủ định hiện tại (thể ngắn - ではない)", "Phủ định hiện tại (thể lịch sự - ではありません)", "Quá khứ khẳng định (thể ngắn - だった)", "Quá khứ khẳng định (thể lịch sự - でした)", "Quá khứ phủ định (thể ngắn - ではなかった)", "Quá khứ phủ định (thể lịch sự - ではありませんでした)", "Thể て (thể nối - で)".
    // Đối với Tính từ na/i: Đầy đủ các thì khẳng định, phủ định, quá khứ ngắn và lịch sự.
    {
      "name": "Tên thể (ví dụ: Khẳng định hiện tại (thể ngắn - だ) hoặc Thể khả năng (quá khứ phủ định))",
      "value": "cách viết của thể này (ví dụ: 朝だ hoặc 眠れなかった)",
      "reading": "cách đọc hiragana của thể này (ví dụ: あさだ hoặc ねむれなかった)",
      "romaji": "cách đọc romaji (ví dụ: asa da hoặc nemurenakatta)",
      "meaning": "nghĩa tiếng Việt (ví dụ: là buổi sáng hoặc đã không thể ngủ được)"
    }
  ],
  "examples": [
    // BẮT BUỘC TẠO CHÍNH XÁC 10 VÍ DỤ ĐA DẠNG CHO TỪ VỰNG NÀY, ĐI TỪ DỄ ĐẾN KHÓ.
    {
      "sentence": "câu ví dụ tiếng Nhật chứa từ vựng hoặc thể của từ",
      "furigana": "câu ví dụ tiếng Nhật gắn Furigana cho chữ Hán dạng 漢字[かんじ], vd: 食[た]べる",
      "reading": "cách đọc hiragana của cả câu ví dụ",
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
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });
          text = await generateGeminiContentWithFallback(ai, prompt);
          success = true;
        } catch (e: any) {
          e.provider = 'Gemini';
          lastError = e;
          console.error('Gemini generate-vocab failed:', e.message);
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

      let parsedData: any = null;

      if (!success) {
        console.warn('[AI] All AI providers failed or busy. Generating resilient fallback vocab data for word:', word, lastError?.message);
        const cleanWord = String(word || '').trim();
        let detectedType = 'Danh từ';
        if (cleanWord.endsWith('る') || cleanWord.endsWith('う') || cleanWord.endsWith('く') || cleanWord.endsWith('ぐ') || cleanWord.endsWith('す') || cleanWord.endsWith('つ') || cleanWord.endsWith('ぬ') || cleanWord.endsWith('ぶ') || cleanWord.endsWith('む')) {
          if (cleanWord.endsWith('かす') || cleanWord === '乾かす' || cleanWord === '沸かす' || cleanWord === '冷やす') {
            detectedType = 'Động từ nhóm I (Tha động từ)';
          } else if (cleanWord.endsWith('く') || cleanWord === '乾く' || cleanWord === '沸く') {
            detectedType = 'Động từ nhóm I (Tự động từ)';
          } else if (cleanWord === '寝る') {
            detectedType = 'Động từ nhóm II (Tự động từ)';
          } else {
            detectedType = 'Động từ';
          }
        } else if (cleanWord.endsWith('い')) {
          detectedType = 'Tính từ i';
        }

        const reading = wanakana.isKana(cleanWord) ? cleanWord : wanakana.toHiragana(cleanWord);
        const romaji = wanakana.toRomaji(cleanWord);
        const forms = ensureCompleteForms({
          word: cleanWord,
          reading,
          romaji,
          wordType: detectedType,
          meaning: cleanWord,
          forms: []
        });

        parsedData = {
          kanji: cleanWord,
          reading: reading || cleanWord,
          romaji: romaji || cleanWord,
          sinoVietnamese: '',
          kanjiExplanation: '',
          meaning: `(Từ vựng: ${cleanWord})`,
          wordType: detectedType,
          forms,
          examples: [
            {
              id: crypto.randomUUID(),
              sentence: `${cleanWord}を練習しましょう。`,
              furigana: `${cleanWord}を練習[れんしゅう]しましょう。`,
              reading: `${reading || cleanWord}をれんしゅうしましょう。`,
              romaji: `${romaji || cleanWord} o renshuu shimashou.`,
              translation: `Chúng ta hãy cùng luyện tập từ ${cleanWord}.`
            }
          ],
          isFallback: true
        };
      } else {
        text = text.replace(/^\s*```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
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
      }

      if (parsedData) {
        // Guarantee UUIDs for forms
        if (Array.isArray(parsedData.forms)) {
          parsedData.forms = parsedData.forms.map((f: any) => ({
            id: f.id || crypto.randomUUID(),
            name: f.name || '',
            value: f.value || '',
            reading: f.reading || '',
            romaji: f.romaji || '',
            meaning: f.meaning || ''
          }));
        } else {
          parsedData.forms = [];
        }

        // Guarantee UUIDs for examples
        if (Array.isArray(parsedData.examples)) {
          parsedData.examples = parsedData.examples.map((ex: any) => ({
            id: ex.id || crypto.randomUUID(),
            sentence: ex.sentence || '',
            furigana: ex.furigana || '',
            reading: ex.reading || '',
            romaji: ex.romaji || '',
            translation: ex.translation || ''
          }));
        }

        // Specific guarantee for transitivity and complete forms (including 寝なかった, 眠らなかった, 朝だ, etc.)
        const cleanWord = String(word || '').trim();

        // Guarantee transitivity detection for verbs (especially 乾かす, 乾く, 寝る, etc.)
        const checkKanji = String(parsedData.kanji || cleanWord).trim();
        const checkReading = String(parsedData.reading || '').trim();
        if (checkKanji === '乾かす' || checkReading === 'かわかす' || checkKanji.endsWith('かす') || checkKanji === '沸かす' || checkKanji === '冷やす') {
          if (parsedData.wordType?.startsWith('Động từ')) {
            if (!parsedData.wordType.includes('Tha động từ') && !parsedData.wordType.includes('Tự động từ')) {
              parsedData.wordType = `${parsedData.wordType} (Tha động từ)`;
            }
          } else if (!parsedData.wordType) {
            parsedData.wordType = 'Động từ nhóm I (Tha động từ)';
          }
        } else if (checkKanji === '乾く' || checkReading === 'かわく' || checkKanji === '沸く') {
          if (parsedData.wordType?.startsWith('Động từ')) {
            if (!parsedData.wordType.includes('Tha động từ') && !parsedData.wordType.includes('Tự động từ')) {
              parsedData.wordType = `${parsedData.wordType} (Tự động từ)`;
            }
          } else if (!parsedData.wordType) {
            parsedData.wordType = 'Động từ nhóm I (Tự động từ)';
          }
        } else if (checkKanji === '寝る' || checkReading === 'ねる') {
          if (!parsedData.wordType || parsedData.wordType === 'Động từ') {
            parsedData.wordType = 'Động từ nhóm II (Tự động từ)';
          } else if (!parsedData.wordType.includes('Tha động từ') && !parsedData.wordType.includes('Tự động từ')) {
            parsedData.wordType = `${parsedData.wordType} (Tự động từ)`;
          }
        }

        // Comprehensive & robust guarantee for ALL forms (especially 寝なかった for 寝る, 眠らなかった for 眠る, 朝だ for 朝, etc.)
        parsedData.forms = ensureCompleteForms({
          word: parsedData.kanji || cleanWord,
          reading: parsedData.reading,
          romaji: parsedData.romaji,
          meaning: parsedData.meaning,
          wordType: parsedData.wordType,
          forms: parsedData.forms
        });
      }

      res.json(parsedData);
    } catch (error: any) {
      console.error('Error generating vocab:', error);

      // If word was provided, synthesize a resilient vocab object so the user is never blocked by external AI outages
      if (req.body && req.body.word) {
        try {
          const cleanWord = String(req.body.word).trim();
          const reading = wanakana.isKana(cleanWord) ? cleanWord : wanakana.toHiragana(cleanWord);
          const romaji = wanakana.toRomaji(cleanWord);
          const forms = ensureCompleteForms({
            word: cleanWord,
            reading: reading || cleanWord,
            romaji: romaji || cleanWord,
            meaning: cleanWord,
            wordType: 'Từ vựng',
            forms: []
          });

          return res.json({
            kanji: cleanWord,
            reading: reading || cleanWord,
            romaji: romaji || cleanWord,
            sinoVietnamese: '',
            kanjiExplanation: '',
            meaning: `(Từ vựng: ${cleanWord})`,
            wordType: 'Từ vựng',
            forms,
            examples: [
              {
                id: crypto.randomUUID(),
                sentence: `${cleanWord}を勉強しましょう。`,
                furigana: `${cleanWord}を勉強[べんきょう]しましょう。`,
                reading: `${reading || cleanWord}をべんきょうしましょう。`,
                romaji: `${romaji || cleanWord} o benkyou shimashou.`,
                translation: `Hãy cùng học từ ${cleanWord}.`
              }
            ],
            isFallback: true
          });
        } catch (innerErr) {
          console.error('Fallback generation error:', innerErr);
        }
      }
      
      let errorMsg = error.message || 'Failed to generate vocabulary data';
      if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
        errorMsg = 'Hệ thống AI đang quá tải, vui lòng thử lại sau ít phút (503).';
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  // Furigana In-memory Cache
  const furiganaCache = new Map<string, string>();

  app.post('/api/generate-furigana', async (req, res) => {
    try {
      const { sentence } = req.body;
      if (!sentence || !String(sentence).trim()) {
        return res.status(400).json({ error: 'Sentence is required' });
      }

      const cleanSentence = String(sentence).trim();
      
      // If there are no Kanji characters, return immediately
      if (!/[\u4e00-\u9faf々]/.test(cleanSentence)) {
        return res.json({ furigana: cleanSentence, reading: cleanSentence });
      }

      if (furiganaCache.has(cleanSentence)) {
        return res.json({ furigana: furiganaCache.get(cleanSentence) });
      }

      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: 'Chưa cấu hình API Key trên server.' });
      }

      const prompt = `Bạn là chuyên gia ngôn ngữ tiếng Nhật. Nhiệm vụ của bạn là thêm Furigana (cách đọc Hiragana) chính xác 100% theo ngữ cảnh cho các chữ Hán (Kanji) trong câu tiếng Nhật sau.

Câu tiếng Nhật:
"${cleanSentence}"

QUY TẮC BẮT BUỘC:
1. Giữ nguyên toàn bộ câu gốc (kể cả trợ từ は, が, を, dấu câu, số, chữ Katakana, Hiragana).
2. Với mỗi chữ Hán (Kanji) hoặc cụm từ Hán ghép, gắn cách đọc Hiragana ngay sau chữ Hán đó trong cặp ngoặc vuông [ ]. Ví dụ: 漢字[かんじ], 勉強[べんきょう]する, 散歩[さんぽ]する.
3. Đối với động từ, tính từ có okurigana, CHỈ đặt Furigana cho chữ Hán:
   - 食[た]べる (thay vì 食べる[たべる])
   - 行[い]く (thay vì 行く[いく])
   - 新[あたら]しい (thay vì 新しい[あたらしい])
   - 楽[たの]しい (thay vì 楽しい[たのしい])
4. Đảm bảo cách đọc CHÍNH XÁC theo ngữ cảnh câu:
   - Phân biệt âm Kun/On và từ nhiều cách đọc (Ví dụ: 行く là 行[い]く hay 行[おこな]う; 一日 là 一日[ついたち] hay 一日[いちにち]; 方 là 方[かた] hay 方[ほう]; 今朝 là 今朝[けさ]; 明日 là 明日[あした] hay 明日[あす]).
5. Trả về đúng định dạng JSON:
{
  "furigana": "câu hoàn chỉnh dạng 漢字[かんじ]",
  "reading": "cách đọc hiragana của toàn bộ câu"
}`;

      let text = '';
      let success = false;
      let lastError: any = null;

      if (process.env.GEMINI_API_KEY && !success) {
        try {
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build'
              }
            }
          });
          text = await generateGeminiContentWithFallback(ai, prompt);
          success = true;
        } catch (e: any) {
          e.provider = 'Gemini';
          lastError = e;
          console.error('Gemini furigana failed:', e.message);
        }
      }

      if (process.env.OPENAI_API_KEY && !success) {
        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          });
          text = response.choices[0].message.content || '';
          success = true;
        } catch (e: any) {
          e.provider = 'OpenAI';
          lastError = e;
        }
      }

      if (process.env.GROQ_API_KEY && !success) {
        try {
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
          const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          });
          text = response.choices[0].message.content || '';
          success = true;
        } catch (e: any) {
          e.provider = 'Groq';
          lastError = e;
        }
      }

      if (!success) {
        throw lastError || new Error('Không thể tạo Furigana bằng AI.');
      }

      const parsed = JSON.parse(text);
      const furiganaResult = parsed.furigana || cleanSentence;
      furiganaCache.set(cleanSentence, furiganaResult);

      res.json({
        furigana: furiganaResult,
        reading: parsed.reading || ''
      });
    } catch (error: any) {
      console.error('Error generating furigana:', error);
      res.status(500).json({ error: error.message || 'Lỗi khi tạo Furigana từ AI' });
    }
  });

  
  
  // Track if Inworld TTS is out of credits to avoid unnecessary failed calls and noisy error logs
  // When exhausted, will automatically test again after 10 minutes to see if credits are replenished.
  let inworldQuotaExhaustedUntil = 0;
  const isServerInworldAvailable = () => Date.now() > inworldQuotaExhaustedUntil;

  // Helper function to synthesize audio via Google Translate TTS
  async function synthesizeGoogleTTS(text: string): Promise<Buffer> {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=ja&client=tw-ob';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Google TTS failed with status: ${response.status}`);
    }
    const arrayBuf = await response.arrayBuffer();
    return Buffer.from(arrayBuf);
  }

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

      // Try Inworld TTS only if not temporarily suspended due to credit exhaustion
      const apiKey = process.env.INWORLD_API_KEY;
      let audioBuffer: Buffer | null = null;

      if (apiKey && isServerInworldAvailable()) {
        try {
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

          if (response.ok) {
            const data = await response.json();
            if (data.audioContent) {
              audioBuffer = Buffer.from(data.audioContent, 'base64');
              inworldQuotaExhaustedUntil = 0; // successfully recovered!
            }
          } else {
            if (response.status === 402 || response.status === 429) {
              // Pause Inworld attempts for 10 minutes, then auto-retry
              inworldQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
            }
          }
        } catch (inworldErr) {
          // silently fallback
        }
      }

      // Fallback: Google TTS
      if (!audioBuffer) {
        try {
          audioBuffer = await synthesizeGoogleTTS(cleanText);
        } catch (fallbackErr) {
          console.error('Google TTS fallback also failed:', fallbackErr);
        }
      }

      if (!audioBuffer) {
        return res.status(500).json({ error: 'Không thể tạo âm thanh AI vào lúc này.' });
      }

      // Save to disk cache
      try {
        fs.writeFileSync(audioFilePath, audioBuffer);
      } catch (writeErr) {
        console.warn("Failed to write audio cache file to disk:", writeErr);
      }

      return res.json({ 
        audioContent: audioBuffer.toString('base64'),
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
      let audioBuffer: Buffer | null = null;

      if (apiKey && isServerInworldAvailable()) {
        try {
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

          if (response.ok) {
            const data = await response.json();
            if (data.audioContent) {
              audioBuffer = Buffer.from(data.audioContent, 'base64');
              inworldQuotaExhaustedUntil = 0;
            }
          } else {
            if (response.status === 402 || response.status === 429) {
              inworldQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
            }
          }
        } catch (e) {
          // ignore and fallback
        }
      }

      if (!audioBuffer) {
        try {
          audioBuffer = await synthesizeGoogleTTS(text);
        } catch (e) {}
      }

      if (audioBuffer) {
        try {
          fs.writeFileSync(audioFilePath, audioBuffer);
        } catch (writeErr) {}
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
