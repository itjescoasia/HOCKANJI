import { getApiEndpoint } from './playTTS';
import { KanjiCard } from '../types';

export interface FuriganaToken {
  text: string;
  ruby?: string;
}

const STORAGE_KEY = 'furigana_cache_v1';
let memoryCache: Map<string, string> | null = null;

function getCache(): Map<string, string> {
  if (memoryCache) return memoryCache;
  memoryCache = new Map<string, string>();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.entries(parsed).forEach(([k, v]) => {
        if (typeof v === 'string') memoryCache?.set(k, v);
      });
    }
  } catch (e) {
    console.warn('Failed to load furigana cache from localStorage', e);
  }
  return memoryCache;
}

function persistCache() {
  if (!memoryCache) return;
  try {
    const obj: Record<string, string> = {};
    // Keep up to 3000 entries to prevent localStorage quota overflow
    let count = 0;
    for (const [k, v] of memoryCache.entries()) {
      if (count++ > 3000) break;
      obj[k] = v;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to persist furigana cache', e);
  }
}

/**
 * Parses bracketed furigana text into tokens for <ruby> rendering.
 * Format: "今朝[けさ]、公園[こうえん]へ行[い]きました。"
 */
export function parseFurigana(text: string): FuriganaToken[] {
  if (!text) return [];

  // If text does not contain brackets, return as single token
  if (!text.includes('[') || !text.includes(']')) {
    return [{ text }];
  }

  const tokens: FuriganaToken[] = [];
  // Regex to match: Any sequence of non-bracket chars followed by [reading]
  // e.g. 漢字[かんじ] or 食[た] or この情報[じょうほう]
  const regex = /([^\[\]\s]+)\[([ぁ-んァ-ヶー\s]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;

    // Any text between lastIndex and matchStart is plain text
    if (matchStart > lastIndex) {
      tokens.push({ text: text.substring(lastIndex, matchStart) });
    }

    const rawBase = match[1];
    const rubyPart = match[2].trim();

    // Check if rawBase contains non-Kanji characters at the beginning (e.g. "この情報" -> "この" + "情報")
    // Kanji characters: \u4e00-\u9faf, \u3400-\u4dbf, 々, ヶ
    const kanjiMatch = rawBase.match(/^(.*?)([\u4e00-\u9faf\u3400-\u4dbf々ヶ0-9A-Za-z]+)$/);
    if (kanjiMatch && kanjiMatch[1]) {
      // Separated: prefix is plain text, kanji part gets the ruby
      tokens.push({ text: kanjiMatch[1] });
      tokens.push({ text: kanjiMatch[2], ruby: rubyPart });
    } else {
      tokens.push({ text: rawBase, ruby: rubyPart });
    }

    lastIndex = matchEnd;
  }

  // Any remaining text after the last match
  if (lastIndex < text.length) {
    tokens.push({ text: text.substring(lastIndex) });
  }

  return tokens;
}

/**
 * Strips bracketed furigana from text.
 * e.g. "私[わたし]は" -> "私は"
 */
export function stripFurigana(text: string): string {
  if (!text) return '';
  return text.replace(/\[[^\]]+\]/g, '');
}

/**
 * Check if the sentence has any Kanji characters.
 */
export function hasKanji(text: string): boolean {
  return /[\u4e00-\u9faf々]/.test(text);
}

/**
 * Gets cached furigana for a sentence if available.
 */
export function getFuriganaFromCache(sentence: string): string | null {
  const clean = String(sentence || '').trim();
  if (!clean) return null;
  return getCache().get(clean) || null;
}

/**
 * Saves furigana into cache.
 */
export function saveFuriganaToCache(sentence: string, furigana: string) {
  const clean = String(sentence || '').trim();
  if (!clean || !furigana) return;
  getCache().set(clean, furigana.trim());
  persistCache();
}

/**
 * Quick local fallback: matches known KanjiCard words in the main deck
 * and inserts [reading] without hitting the server.
 */
export function generateLocalFurigana(sentence: string, deck?: KanjiCard[]): string {
  if (!sentence || !deck || deck.length === 0) return sentence;
  if (sentence.includes('[') && sentence.includes(']')) return sentence; // already formatted

  // Sort words by length descending so longer compound words match first
  const sortedDeck = [...deck]
    .filter(c => c.kanji && hasKanji(c.kanji) && c.reading && !c.kanji.includes(' '))
    .sort((a, b) => b.kanji.length - a.kanji.length);

  let result = sentence;
  for (const card of sortedDeck) {
    if (result.includes(card.kanji)) {
      // Only replace if not already inside brackets
      const safeKanji = card.kanji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<!\\[)${safeKanji}(?!\\])`, 'g');
      result = result.replace(regex, `${card.kanji}[${card.reading}]`);
    }
  }
  return result;
}

/**
 * Calls Gemini AI (/api/generate-furigana) to get context-accurate Furigana.
 */
export async function fetchFuriganaWithGemini(
  sentence: string
): Promise<{ furigana: string; reading?: string }> {
  const cleanSentence = String(sentence || '').trim();
  if (!cleanSentence) return { furigana: '' };

  // 1. Check local cache
  const cached = getFuriganaFromCache(cleanSentence);
  if (cached) {
    return { furigana: cached };
  }

  // 2. Fetch from API
  try {
    const res = await fetch(getApiEndpoint('/api/generate-furigana'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: cleanSentence }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    const furigana = data.furigana || cleanSentence;
    saveFuriganaToCache(cleanSentence, furigana);
    return {
      furigana,
      reading: data.reading,
    };
  } catch (error) {
    console.warn('Failed to fetch Furigana from Gemini:', error);
    throw error;
  }
}
