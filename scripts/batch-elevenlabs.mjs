#!/usr/bin/env node

/**
 * ElevenLabs Batch Audio Generator CLI
 * 
 * Cách sử dụng:
 * 1. Chạy với 1 từ vựng:
 *    node scripts/batch-elevenlabs.mjs --word "食べる"
 * 
 * 2. Chạy với danh sách các câu / các thể từ file JSON:
 *    node scripts/batch-elevenlabs.mjs --file ./words.json
 * 
 * 3. Tùy chọn giọng đọc:
 *    node scripts/batch-elevenlabs.mjs --word "勉強する" --voice "pFZP5JQG7iQjIQuC4Bku"
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'MXKtCrra8fvlDUbfKUT1';
const DEFAULT_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
const OUTPUT_DIR = path.join(process.cwd(), 'uploads', 'audio');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function synthesizeText(text, voiceId = DEFAULT_VOICE_ID, modelId = DEFAULT_MODEL_ID) {
  const clean = text.trim();
  if (!clean) return null;

  const hash = crypto.createHash('md5').update(`eleven_${clean}_${voiceId}_${modelId}`).digest('hex');
  const filename = `eleven_${hash}.mp3`;
  const filePath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.log(`[Cache Hit] "${clean}" -> ${filename}`);
    return { filename, path: filePath, cached: true };
  }

  if (!ELEVENLABS_API_KEY) {
    throw new Error('Vui lòng thiết lập biến môi trường ELEVENLABS_API_KEY trong file .env');
  }

  console.log(`[Generating] "${clean}" bằng ElevenLabs (${voiceId})...`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: clean,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs API Error (${response.status}): ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);

  console.log(`[Saved] "${clean}" -> ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return { filename, path: filePath, cached: false };
}

async function run() {
  const args = process.argv.slice(2);
  const wordArgIdx = args.indexOf('--word');
  const targetWord = wordArgIdx !== -1 ? args[wordArgIdx + 1] : null;

  console.log('==============================================');
  console.log(' ElevenLabs Batch Audio Generator');
  console.log('==============================================');

  if (!ELEVENLABS_API_KEY) {
    console.warn('CẢNH BÁO: Chưa tìm thấy ELEVENLABS_API_KEY trong .env');
    console.log('Vui lòng thêm: ELEVENLABS_API_KEY="xi-api-key-cua-ban" vào .env');
    process.exit(1);
  }

  if (targetWord) {
    console.log(`Đang xử lý tạo âm thanh cho từ: ${targetWord}`);
    try {
      const res = await synthesizeText(targetWord);
      console.log('Thành công:', res);
    } catch (e) {
      console.error('Thất bại:', e.message);
    }
  } else {
    console.log('Hướng dẫn:');
    console.log('  node scripts/batch-elevenlabs.mjs --word "食べる"');
    console.log('  node scripts/batch-elevenlabs.mjs --word "毎朝パンを食べます。"');
  }
}

run().catch(console.error);
