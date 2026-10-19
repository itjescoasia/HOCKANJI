import { KanjiCard } from '../types';

/**
 * Removes Vietnamese diacritical marks (tones and accents) and returns clean lowercase ASCII.
 * Handles đ/Đ -> d, and removes all Unicode combining diacritics.
 */
export const removeVietnameseDiacritics = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Normalizes Vietnamese text while strictly PRESERVING all tones and accents.
 * Converts to Unicode NFC, lowercase, and collapses punctuation/spaces.
 */
export const normalizeWithDiacritics = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if a string contains any Vietnamese-specific diacritical marks or letters.
 */
export const hasVietnameseDiacritics = (str: string | undefined | null): boolean => {
  if (!str) return false;
  return /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ]/i.test(str);
};

/**
 * Normalizes Romaji with long vowel macrons (e.g. tōkyō -> tokyo / toukyou)
 */
export const normalizeRomaji = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ā/g, 'aa')
    .replace(/ē/g, 'ee')
    .replace(/ī/g, 'ii')
    .replace(/ō/g, 'ou')
    .replace(/ū/g, 'uu')
    .replace(/[^\w\s]/g, '')
    .trim();
};

/**
 * Core text-matching logic for Vietnamese and Japanese search.
 * Enforces whole-word / syllable boundaries for short Vietnamese queries to eliminate false positives
 * (such as 'ăn' matching 'khăn', 'bàn', 'căn', or 'học' matching 'khóc').
 */
export const matchTextScore = (
  target: string | undefined | null,
  rawQuery: string,
  queryHasDiacritics: boolean
): number => {
  if (!target || !rawQuery) return 0;

  // 1. Direct raw check (case-insensitive)
  const rawTargetLower = target.toLowerCase();
  const rawQueryLower = rawQuery.toLowerCase();
  if (rawTargetLower === rawQueryLower) return 1000;
  if (rawTargetLower.startsWith(rawQueryLower)) return 850;

  // 2. Toned match if query has diacritics
  if (queryHasDiacritics) {
    const tonedTarget = normalizeWithDiacritics(target);
    const tonedQuery = normalizeWithDiacritics(rawQuery);
    if (!tonedTarget || !tonedQuery) return 0;

    if (tonedTarget === tonedQuery) return 1000;
    
    const targetWords = tonedTarget.split(/\s+/).filter(Boolean);
    const queryWords = tonedQuery.split(/\s+/).filter(Boolean);

    // Exact full phrase in target
    if (tonedTarget.includes(tonedQuery)) {
      // Check if surrounded by word boundaries
      const regex = new RegExp(`(^|\\s)${escapeRegex(tonedQuery)}(\\s|$)`, 'i');
      if (regex.test(tonedTarget)) return 900;
      return 750;
    }

    // Single-word query: MUST match as a whole syllable or prefix of a syllable!
    if (queryWords.length === 1) {
      const qw = queryWords[0];
      if (targetWords.includes(qw)) return 800; // Whole word match (e.g. 'ăn' in 'thức ăn')
      if (targetWords.some(tw => tw.startsWith(qw))) return 600; // Prefix match (e.g. 'học' in 'học sinh')
      return 0; // Prevent false substring matches inside different syllables
    }

    // Multi-word query: all words must be present as whole words or prefixes
    const allWordsPresent = queryWords.every(qw =>
      targetWords.includes(qw) || targetWords.some(tw => tw.startsWith(qw))
    );
    if (allWordsPresent) return 700;

    // Partial word match if > 2 words (at least 70%)
    if (queryWords.length > 2) {
      const matchCount = queryWords.filter(qw =>
        targetWords.includes(qw) || targetWords.some(tw => tw.startsWith(qw))
      ).length;
      if (matchCount / queryWords.length >= 0.7) return 400;
    }

    return 0;
  }

  // 3. Untoned match (user typed without accents, e.g. 'hoc sinh', 'an', 'nhat ban')
  const untonedTarget = removeVietnameseDiacritics(target);
  const untonedQuery = removeVietnameseDiacritics(rawQuery);
  if (!untonedTarget || !untonedQuery) return 0;

  if (untonedTarget === untonedQuery) return 950;

  const targetWords = untonedTarget.split(/\s+/).filter(Boolean);
  const queryWords = untonedQuery.split(/\s+/).filter(Boolean);

  // Exact phrase match
  if (untonedTarget.includes(untonedQuery)) {
    const regex = new RegExp(`(^|\\s)${escapeRegex(untonedQuery)}(\\s|$)`, 'i');
    if (regex.test(untonedTarget)) return 850;
    return 700;
  }

  // Single-word query: MUST match as a whole syllable or word prefix
  if (queryWords.length === 1) {
    const qw = queryWords[0];
    if (targetWords.includes(qw)) return 750; // Whole syllable match (e.g. 'an' in 'an toan' or 'thuc an')
    if (targetWords.some(tw => tw.startsWith(qw))) return 550; // Prefix match
    // For queries >= 4 chars, allow substring (e.g. 'nguyen' in 'tai nguyen')
    if (qw.length >= 4 && untonedTarget.includes(qw)) return 300;
    return 0; // Strictly disallow 'an' matching 'khan', 'ban', etc.
  }

  // Multi-word untoned query
  const allWordsPresent = queryWords.every(qw =>
    targetWords.includes(qw) || targetWords.some(tw => tw.startsWith(qw))
  );
  if (allWordsPresent) return 650;

  if (queryWords.length > 2) {
    const matchCount = queryWords.filter(qw =>
      targetWords.includes(qw) || targetWords.some(tw => tw.startsWith(qw))
    ).length;
    if (matchCount / queryWords.length >= 0.7) return 350;
  }

  return 0;
};

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface CardMatchResult {
  matched: boolean;
  score: number;
}

/**
 * Evaluates whether a KanjiCard matches a user search query and assigns a relevance score.
 */
export const scoreKanjiCardMatch = (card: KanjiCard, rawQuery: string): CardMatchResult => {
  const q = rawQuery.trim();
  if (!q) return { matched: true, score: 0 };

  const queryHasDiacritics = hasVietnameseDiacritics(q);
  const qLower = q.toLowerCase();
  const qClean = removeVietnameseDiacritics(q);

  let bestScore = 0;

  // ==========================================
  // 1. Japanese exact / prefix matches
  // ==========================================
  if (card.kanji) {
    const k = card.kanji.trim();
    if (k === q) bestScore = Math.max(bestScore, 1500);
    else if (k.startsWith(q)) bestScore = Math.max(bestScore, 1200);
    else if (k.includes(q)) bestScore = Math.max(bestScore, 900);
  }

  if (card.reading) {
    const r = card.reading.trim();
    if (r === q) bestScore = Math.max(bestScore, 1400);
    else if (r.startsWith(q)) bestScore = Math.max(bestScore, 1100);
    else if (r.includes(q)) bestScore = Math.max(bestScore, 800);
  }

  if (card.romaji) {
    const ro = card.romaji.toLowerCase().trim();
    const roClean = normalizeRomaji(card.romaji);
    const qRo = normalizeRomaji(q);
    if (ro === qLower || roClean === qRo) bestScore = Math.max(bestScore, 1100);
    else if (ro.startsWith(qLower) || roClean.startsWith(qRo)) bestScore = Math.max(bestScore, 850);
    else if (ro.includes(qLower) || roClean.includes(qRo)) bestScore = Math.max(bestScore, 600);
  }

  // ==========================================
  // 2. Sino-Vietnamese (Hán Việt) - High Priority!
  // ==========================================
  if (card.sinoVietnamese) {
    const score = matchTextScore(card.sinoVietnamese, q, queryHasDiacritics);
    if (score > 0) {
      bestScore = Math.max(bestScore, score * 1.5);
    }
  }

  // ==========================================
  // 3. Primary Meaning (Nghĩa chính tiếng Việt) - Top Priority!
  // ==========================================
  if (card.meaning) {
    const score = matchTextScore(card.meaning, q, queryHasDiacritics);
    if (score > 0) {
      bestScore = Math.max(bestScore, score * 1.4);
    }
  }

  // ==========================================
  // 4. Kanji Explanation (Giải thích tiếng Việt)
  // ==========================================
  if (card.kanjiExplanation) {
    const score = matchTextScore(card.kanjiExplanation, q, queryHasDiacritics);
    if (score > 0) {
      bestScore = Math.max(bestScore, score * 1.1);
    }
  }

  // ==========================================
  // 5. Word Type (Loại từ: Danh từ, Động từ...)
  // ==========================================
  if (card.wordType) {
    const score = matchTextScore(card.wordType, q, queryHasDiacritics);
    if (score > 0) {
      bestScore = Math.max(bestScore, score * 0.9);
    }
  }

  // ==========================================
  // 6. Verb Forms & Variations (Thể chia & Nghĩa của thể)
  // ==========================================
  if (card.forms && card.forms.length > 0) {
    for (const f of card.forms) {
      // Check form value (Japanese)
      if (f.value && f.value.includes(q)) {
        bestScore = Math.max(bestScore, 650);
      }
      // Check form meaning (Vietnamese)
      if (f.meaning) {
        const score = matchTextScore(f.meaning, q, queryHasDiacritics);
        if (score > 0) {
          bestScore = Math.max(bestScore, score * 1.1);
        }
      }
      // Check form name (e.g. 'Thể bị động', 'Thể sai khiến')
      if (f.name) {
        const score = matchTextScore(f.name, q, queryHasDiacritics);
        if (score > 0) {
          bestScore = Math.max(bestScore, score * 0.9);
        }
      }
    }
  }

  // ==========================================
  // 7. Examples & Translations (Ví dụ & Bản dịch tiếng Việt)
  // ==========================================
  if (card.examples && card.examples.length > 0) {
    for (const ex of card.examples) {
      if (ex.sentence && ex.sentence.includes(q)) {
        bestScore = Math.max(bestScore, 500);
      }
      if (ex.translation) {
        const score = matchTextScore(ex.translation, q, queryHasDiacritics);
        if (score > 0) {
          bestScore = Math.max(bestScore, score * 1.0);
        }
      }
    }
  }

  // Legacy example
  if (card.example && card.example.includes(q)) {
    bestScore = Math.max(bestScore, 450);
  }
  if (card.exampleTranslation) {
    const score = matchTextScore(card.exampleTranslation, q, queryHasDiacritics);
    if (score > 0) {
      bestScore = Math.max(bestScore, score * 0.95);
    }
  }

  return {
    matched: bestScore > 0,
    score: bestScore
  };
};

/**
 * Filter and sort a deck by relevance to query.
 */
export const filterAndRankDeck = <T extends KanjiCard>(deck: T[], query: string): T[] => {
  if (!query || !query.trim()) return deck;

  const scoredCards: { card: T; score: number }[] = [];

  for (const card of deck) {
    const res = scoreKanjiCardMatch(card, query);
    if (res.matched) {
      scoredCards.push({ card, score: res.score });
    }
  }

  // Sort descending by score
  scoredCards.sort((a, b) => b.score - a.score);

  return scoredCards.map(item => item.card);
};
