const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Add imports
if (!content.includes("import OpenAI")) {
  content = content.replace("import { GoogleGenAI } from '@google/genai';", "import { GoogleGenAI } from '@google/genai';\nimport OpenAI from 'openai';\nimport Groq from 'groq-sdk';");
}

// Fix top check
content = content.replace(/if \(\!process\.env\.GEMINI_API_KEY\) \{[\s\S]*?\}/, 
`      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
         return res.status(500).json({ error: 'API_KEY is missing. Vui lòng thiết lập GEMINI_API_KEY, OPENAI_API_KEY hoặc GROQ_API_KEY trong Settings.' });
      }`);

// Add provider blocks
const fallbackRegex = /      if \(\!success\) \{/;
const providerBlocks = `      if (process.env.OPENAI_API_KEY && !success) {
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
      if (!success) {`;

content = content.replace(fallbackRegex, providerBlocks);

// Fix error handling
const errorBlockRegex = /if \(errorMsg\.includes\('429'\) \|\| errorMsg\.includes\('Quota exceeded'\) \|\| errorMsg\.includes\('rate limit'\)\) \{[\s\S]*?\} else if \(error\.status === 503/;

const newErrorBlock = `if (errorMsg.includes('429') || errorMsg.includes('Quota exceeded') || errorMsg.includes('rate limit')) {
        if (error.provider === 'OpenAI') {
          errorMsg = 'Lỗi OpenAI (ChatGPT): Tài khoản đã hết hạn mức hoặc quá nhiều yêu cầu. Vui lòng nạp tiền vào OpenAI, hoặc đổi API Key khác.';
        } else if (error.provider === 'Gemini') {
          errorMsg = 'Lỗi Gemini: Quá nhiều yêu cầu hoặc hệ thống đang quá tải. Vui lòng thử lại sau ít phút.';
        } else if (error.provider === 'Groq') {
          errorMsg = 'Lỗi Groq: Tài khoản đã hết hạn mức hoặc quá nhiều yêu cầu.';
        } else {
          errorMsg = 'Lỗi AI: Quá nhiều yêu cầu hoặc hết hạn mức. Vui lòng thử lại sau ít phút, hoặc gỡ bỏ API key trong menu Settings.';
        }
      } else if (error.status === 503`;

content = content.replace(errorBlockRegex, newErrorBlock);

fs.writeFileSync('server.ts', content);
console.log("Successfully fixed providers");
