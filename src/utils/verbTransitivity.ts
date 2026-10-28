/**
 * Japanese Verb Transitivity (Tha động từ - 他動詞 / Tự động từ - 自動詞)
 * Detection & Badge Styling Utility
 */

export type VerbTransitivity = 'transitive' | 'intransitive';

// Comprehensive dictionary of common Japanese transitive (Tha động từ) and intransitive (Tự động từ) verbs
const TRANSITIVE_VERBS = new Set([
  '乾かす', 'かわかす',
  '沸かす', 'わかす',
  '冷やす', 'ひやす',
  '溶かす', 'とかす',
  '起こす', 'おこす',
  '落とす', 'おとす',
  '動かす', 'うごかす',
  '壊す', 'こわす',
  '直す', 'なおす',
  '治す', 'なおす',
  '出す', 'だす',
  '入れる', 'いれる',
  '始める', 'はじめる',
  '止める', 'とめる',
  '閉める', 'しめる',
  '開ける', 'あける',
  'つける', '点ける',
  '消す', 'けす',
  '汚す', 'よごす',
  '残す', 'のこす',
  '倒す', 'たおす',
  '割る', 'わる',
  '折る', 'おる',
  '破る', 'やぶる',
  '助ける', 'たすける',
  '届ける', 'とどける',
  '戻す', 'もどす',
  '鳴らす', 'ならす',
  '見つける', 'みつける',
  '集める', 'あつめる',
  '変える', 'かえる',
  '決める', 'きめる',
  '続ける', 'つづける',
  '減らす', 'へらす',
  '増やす', 'ふやす',
  '並べる', 'ならべる',
  '育てる', 'そだてる',
  '濡らす', 'ぬらす',
  '散らかす', 'ちらかす',
  '片づける', 'かたづける',
  '片付ける', 'かたづける',
  '預ける', 'あずける',
  '驚かす', 'おどろかす',
  '剥がす', 'はがす',
  '散らす', 'ちらす',
  '転がす', 'ころがす',
  'こぼす', '零す', '溢す',
  '汚す', 'よごす',
  '切る', 'きる',
  '建てる', 'たてる',
  '起こす', 'おこす',
  '見せる', 'みせる',
  '掛ける', 'かける',
  '乗せる', 'のせる',
  '載せる', 'のせる',
  '渡す', 'わたす',
  '渡す', 'わたす',
  '下ろす', 'おろす',
  '降ろす', 'おろす',
  '汚す', 'よごす',
  '汚す', 'けがす',
  '外す', 'はずす',
  'なくす', '無くす', '亡くす',
  '見送る', 'みおくる',
]);

const INTRANSITIVE_VERBS = new Set([
  '乾く', 'かわく',
  '渇く', 'かわく',
  '沸く', 'わく',
  '冷える', 'ひえる',
  '溶ける', 'とける',
  '起きる', 'おきる',
  '落ちる', 'おちる',
  '動く', 'うごく',
  '壊れる', 'こわれる',
  '直る', 'なおる',
  '治る', 'なおる',
  '出る', 'でる',
  '入る', 'はいる',
  '始まる', 'はじまる',
  '始まります', 'はじまります',
  '止まる', 'とまる',
  '閉まる', 'しまる',
  '開く', 'あく',
  'つく', '点く',
  '消える', 'きえる',
  '汚れる', 'よごれる',
  '残る', 'のこる',
  '倒れる', 'たおれる',
  '割れる', 'われる',
  '折れる', 'おれる',
  '破れる', 'やぶれる',
  '助かる', 'たすかる',
  '届く', 'とどく',
  '戻る', 'もどる',
  '鳴る', 'なる',
  '見つかる', 'みつかる',
  '集まる', 'あつまる',
  '変わる', 'かわる',
  '決まる', 'きまる',
  '続く', 'つづく',
  '減る', 'へる',
  '増える', 'ふえる',
  '並ぶ', 'ならぶ',
  '育つ', 'そだつ',
  '濡れる', 'ぬれる',
  '散らかる', 'ちらかる',
  '片づく', 'かたづく',
  '片付く', 'かたづく',
  '預かる', 'あずかる',
  '驚く', 'おどろく',
  '剥がれる', 'はがれる',
  '散る', 'ちる',
  '転がる', 'ころがる',
  'こぼれる', '零れる', '溢れる',
  '切れる', 'きれる',
  '建つ', 'たつ',
  '見える', 'みえる',
  '掛かる', 'かかる',
  '乗る', 'のる',
  '載る', 'のる',
  '渡る', 'わたる',
  '下りる', 'おりる',
  '降りる', 'おりる',
  '外れる', 'はずれる',
  'なくなる', '無くなる', '亡くなる',
]);

/**
 * Detects whether a verb is a Transitive (Tha động từ) or Intransitive (Tự động từ) verb.
 */
export function getVerbTransitivity(
  kanji?: string,
  reading?: string,
  meaning?: string,
  wordType?: string
): VerbTransitivity | null {
  const combined = `${wordType || ''} ${meaning || ''}`.toLowerCase();

  // 1. Explicit mention in wordType or meaning
  if (
    combined.includes('tha động từ') ||
    combined.includes('tha đt') ||
    combined.includes('tha động') ||
    combined.includes('他動詞') ||
    combined.includes('(tha)')
  ) {
    return 'transitive';
  }

  if (
    combined.includes('tự động từ') ||
    combined.includes('tự đt') ||
    combined.includes('tự động') ||
    combined.includes('自動詞') ||
    combined.includes('(tự)')
  ) {
    return 'intransitive';
  }

  // 2. Dictionary lookup by kanji or reading
  const cleanKanji = (kanji || '').trim();
  const cleanReading = (reading || '').trim();

  if (cleanKanji && TRANSITIVE_VERBS.has(cleanKanji)) return 'transitive';
  if (cleanReading && TRANSITIVE_VERBS.has(cleanReading)) return 'transitive';

  if (cleanKanji && INTRANSITIVE_VERBS.has(cleanKanji)) return 'intransitive';
  if (cleanReading && INTRANSITIVE_VERBS.has(cleanReading)) return 'intransitive';

  // 3. Morphological heuristics for Japanese verb pairs
  // Verbs ending in -かす / -やす / -おす / -わす / -がす (e.g. 乾かす, 冷やす, 沸かす) are overwhelmingly transitive
  if (cleanKanji.endsWith('かす') || cleanReading.endsWith('かす') ||
      cleanKanji.endsWith('わかす') || cleanReading.endsWith('わかす') ||
      cleanKanji.endsWith('やす') || cleanReading.endsWith('やす') ||
      cleanKanji.endsWith('おす') || cleanReading.endsWith('おす')) {
    if ((wordType || '').includes('Động từ') || !wordType) {
      return 'transitive';
    }
  }

  return null;
}

/**
 * Extracts the base group name (e.g. "Động từ nhóm I") from wordType
 * even if it contains "(Tha động từ)" or "(Tự động từ)".
 */
export function getBaseWordType(wordType?: string): string {
  if (!wordType) return '';
  return wordType.replace(/\s*\([^)]*(tha|tự|động từ|transitive|intransitive)[^)]*\)/gi, '').trim();
}

/**
 * Badge styling for Transitivity
 */
export function getTransitivityBadgeStyle(transitivity: VerbTransitivity): string {
  if (transitivity === 'transitive') {
    return 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/35 whitespace-nowrap shadow-2xs';
  }
  return 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/35 whitespace-nowrap shadow-2xs';
}

/**
 * Badge label for Transitivity
 */
export function getTransitivityBadgeLabel(transitivity: VerbTransitivity): string {
  return transitivity === 'transitive' ? 'Tha động từ' : 'Tự động từ';
}
