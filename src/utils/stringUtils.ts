export const normalizeSentence = (sentence: string) => {
  if (!sentence) return '';
  return sentence
    .normalize('NFKC') // Chuyển đổi ký tự toàn giác (Zen-kaku) và bán giác về chuẩn chung
    // Loại bỏ cú pháp Furigana nếu có: vd: 情報[じょうほう] -> 情報, (じょうほう) -> bỏ
    .replace(/\[[^\]]*\]/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\([^\)]*\)/g, '')
    // Loại bỏ thẻ HTML/Ruby nếu có
    .replace(/<[^>]*>/g, '')
    // Loại bỏ tất cả dấu câu tiếng Nhật & phương Tây, ngoặc đơn/kép, dấu trích dẫn, khoảng trắng
    .replace(/[。\.・\,\、\!\?！？\s　\-\—\―\ー\~\～\…\:\：\;\；\「\」\『\』\【\】\［\］\[\]\(\)\（\）\"\'\“\”\‘\’\/\\]/g, '')
    // Loại bỏ các ký tự vô hình (Zero-width space, non-breaking space)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .toLowerCase()
    .trim();
};


export const cleanTextForSearch = (str: string) => {
    if (!str) return "";
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toLowerCase()
        .replace(/[^\p{L}\p{N} ]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
};

export function cleanMarkdownForDisplay(text: string | undefined | null) {
  if (!text) return text;
  // Remove markdown headers like ###, **, *
  return text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*/g, '').replace(/\*/g, '');
}

export function calculateSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  
  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}

export interface SentenceRelationResult {
  type: 'duplicate' | 'different_verb';
  badgeLabel: string;
  reason: string;
  commonPrefix?: string;
  tail1?: string;
  tail2?: string;
}

/**
 * Analyzes two Japanese sentences to distinguish between:
 * 1. 'duplicate' (CÂU TRÙNG LẶP): 100% exact match or identical reading/translation
 * 2. 'different_verb' (KHÁC ĐỘNG TỪ): Front part is the same ("phần ngoài trước giống nhau"), but the predicate/verb at the end is different ("động từ khác nhau").
 * 3. null: completely different sentences.
 */
export function compareSentenceRelation(
  sentence1: string,
  sentence2: string,
  translation1?: string,
  translation2?: string,
  reading1?: string,
  reading2?: string
): SentenceRelationResult | null {
  const norm1 = normalizeSentence(sentence1);
  const norm2 = normalizeSentence(sentence2);
  if (!norm1 || !norm2) return null;

  // 1. 100% exact match in Japanese
  if (norm1 === norm2) {
    return {
      type: 'duplicate',
      badgeLabel: 'CÂU TRÙNG LẶP',
      reason: 'Trùng 100% câu tiếng Nhật',
    };
  }

  // 2. Reading 100% match (when both provided and long enough)
  const normR1 = normalizeSentence(reading1 || '');
  const normR2 = normalizeSentence(reading2 || '');
  if (normR1 && normR2 && normR1 === normR2 && normR1.length >= 3) {
    return {
      type: 'duplicate',
      badgeLabel: 'CÂU TRÙNG LẶP',
      reason: 'Trùng cách đọc phiên âm',
    };
  }

  // 3. Find Longest Common Prefix (phần ngoài trước giống nhau)
  let commonLen = 0;
  const minLen = Math.min(norm1.length, norm2.length);
  while (commonLen < minLen && norm1[commonLen] === norm2[commonLen]) {
    commonLen++;
  }

  const commonPrefix = norm1.slice(0, commonLen);
  const tail1 = norm1.slice(commonLen);
  const tail2 = norm2.slice(commonLen);

  const maxLen = Math.max(norm1.length, norm2.length);
  const prefixRatio = commonLen / maxLen;

  // Also check reading common prefix if available
  let commonRLen = 0;
  if (normR1 && normR2) {
    const minRLen = Math.min(normR1.length, normR2.length);
    while (commonRLen < minRLen && normR1[commonRLen] === normR2[commonRLen]) {
      commonRLen++;
    }
  }

  // If the front part is the same (commonLen >= 2 with ratio >= 0.3, or commonLen >= 3, or reading commonLen >= 4)
  // and the tails differ:
  const hasCommonFront =
    commonLen >= 3 ||
    (commonLen >= 2 && prefixRatio >= 0.28) ||
    commonRLen >= 4;

  if (hasCommonFront && tail1 !== tail2) {
    // Check if the tail is simply a question/sentence-ending particle on the same verb
    const isOnlyParticle =
      (tail1 === '' && (tail2 === 'か' || tail2 === 'ね' || tail2 === 'よ' || tail2 === 'の' || tail2 === 'わ')) ||
      (tail2 === '' && (tail1 === 'か' || tail1 === 'ね' || tail1 === 'よ' || tail1 === 'の' || tail1 === 'わ')) ||
      ((tail1 === 'か' || tail1 === 'ね' || tail1 === 'よ') && (tail2 === 'か' || tail2 === 'ね' || tail2 === 'よ'));

    if (!isOnlyParticle) {
      // The verbs/predicates at the end are different!
      const verbDetail = tail1 && tail2 ? ` (${tail1} ↔ ${tail2})` : '';
      return {
        type: 'different_verb',
        badgeLabel: 'KHÁC ĐỘNG TỪ',
        reason: `Khác động từ / vị ngữ${verbDetail}`,
        commonPrefix: commonPrefix || (normR1 ? normR1.slice(0, commonRLen) : ''),
        tail1,
        tail2,
      };
    }
  }

  // 4. Check high Levenshtein similarity
  const sim = (norm1.length >= 5 && norm2.length >= 5) ? calculateSimilarity(norm1, norm2) : 0;
  if (sim >= 0.70) {
    // If tails differ at all, it's a different verb / ending!
    if (tail1 !== tail2) {
      const verbDetail = tail1 && tail2 ? ` (${tail1} ↔ ${tail2})` : '';
      return {
        type: 'different_verb',
        badgeLabel: 'KHÁC ĐỘNG TỪ',
        reason: `Khác động từ${verbDetail}`,
        commonPrefix,
        tail1,
        tail2,
      };
    }
    // If similarity is extremely high (>= 95%) and tails are identical:
    if (sim >= 0.95) {
      return {
        type: 'duplicate',
        badgeLabel: 'CÂU TRÙNG LẶP',
        reason: `Tương đồng ${Math.round(sim * 100)}% tiếng Nhật`,
      };
    }
  }

  // 5. Exact match on Vietnamese translation
  const normVi1 = cleanTextForSearch(translation1 || '');
  const normVi2 = cleanTextForSearch(translation2 || '');
  if (normVi1 && normVi2 && normVi1 === normVi2 && normVi1.length >= 6) {
    // If Japanese has different verbs
    if (tail1 !== tail2) {
      return {
        type: 'different_verb',
        badgeLabel: 'KHÁC ĐỘNG TỪ',
        reason: 'Khác động từ (cùng nghĩa dịch)',
        commonPrefix,
        tail1,
        tail2,
      };
    }
    if (norm1 === norm2 || sim >= 0.92) {
      return {
        type: 'duplicate',
        badgeLabel: 'CÂU TRÙNG LẶP',
        reason: 'Trùng bản dịch tiếng Việt',
      };
    }
  }

  return null;
}

/**
 * Checks if a conjugation form is genuinely the Dictionary form (Thể từ điển / Thể る / Thể nguyên mẫu).
 * Strictly EXCLUDES any other forms:
 * - Thể phủ định (negative / nai / không / masen / nakatta)
 * - Thể quá khứ (past / ta / đã / mashita)
 * - Thể lịch sự (polite / masu)
 * - Thể て (te)
 * - Thể khả năng (potential)
 * - Thể sai khiến (causative)
 * - Thể bị động (passive)
 * - Thể mệnh lệnh (imperative)
 * - Thể cấm chỉ (prohibitive)
 * - Thể ý chí (volitional)
 * - Thể điều kiện (conditional)
 */
export const isDictionaryForm = (
  name: string | undefined | null,
  formValue?: string | null,
  cardKanji?: string | null,
  cardReading?: string | null
): boolean => {
  if (!name) return false;
  const n = name.toLowerCase().normalize('NFC').trim();

  // STRICT EXCLUSIONS: If name mentions any other conjugation, it is NEVER the dictionary form!
  const cleanN = cleanTextForSearch(name);

  const hasExclusion =
    // Negative (phủ định, ない, nai, không, masen, nakatta)
    n.includes('phủ định') ||
    n.includes('phu dinh') ||
    cleanN.includes('phu dinh') ||
    n.includes('không') ||
    n.includes('khong') ||
    cleanN.includes('khong') ||
    n.includes('negative') ||
    n.includes('ない') ||
    n.includes('nai') ||
    n.includes('ません') ||
    n.includes('masen') ||
    n.includes('なかった') ||
    n.includes('nakatta') ||
    // Past (quá khứ, た, ta, だ, da, mashita, đã)
    n.includes('quá khứ') ||
    n.includes('qua khu') ||
    cleanN.includes('qua khu') ||
    n.includes('past') ||
    n.includes('thể た') ||
    n.includes('the ta') ||
    cleanN.includes('the ta') ||
    n.includes('thể だ') ||
    n.includes('the da') ||
    cleanN.includes('the da') ||
    n.includes('ました') ||
    n.includes('mashita') ||
    n.includes('từng') ||
    cleanN.includes('tung') ||
    n.includes('đã') ||
    cleanN.includes('da ') ||
    // Polite (lịch sự, masu)
    n.includes('lịch sự') ||
    n.includes('lich su') ||
    cleanN.includes('lich su') ||
    n.includes('ます') ||
    n.includes('masu') ||
    // Te form
    n.includes('thể て') ||
    n.includes('the te') ||
    cleanN.includes('the te') ||
    n.includes('te-form') ||
    // Potential (khả năng)
    n.includes('khả năng') ||
    n.includes('kha nang') ||
    cleanN.includes('kha nang') ||
    n.includes('potential') ||
    // Causative (sai khiến)
    n.includes('sai khiến') ||
    n.includes('sai khien') ||
    cleanN.includes('sai khien') ||
    n.includes('causative') ||
    // Passive (bị động)
    n.includes('bị động') ||
    n.includes('bi dong') ||
    cleanN.includes('bi dong') ||
    n.includes('passive') ||
    // Imperative & Prohibitive (mệnh lệnh, cấm chỉ)
    n.includes('mệnh lệnh') ||
    n.includes('menh lenh') ||
    cleanN.includes('menh lenh') ||
    n.includes('imperative') ||
    n.includes('cấm chỉ') ||
    n.includes('cam chi') ||
    cleanN.includes('cam chi') ||
    n.includes('prohibitive') ||
    // Volitional (ý chí)
    n.includes('ý chí') ||
    n.includes('y chi') ||
    cleanN.includes('y chi') ||
    n.includes('volitional') ||
    n.includes('よう') ||
    n.includes('ましょう') ||
    // Conditional (điều kiện)
    n.includes('điều kiện') ||
    n.includes('dieu kien') ||
    cleanN.includes('dieu kien') ||
    n.includes('conditional') ||
    n.includes('thể ば') ||
    n.includes('thể たら') ||
    // Desire / Want (thể muốn ~たい)
    n.includes('muốn') ||
    cleanN.includes('muon') ||
    n.includes('たい') ||
    n.includes('tai');

  if (hasExclusion) return false;

  // If formValue and cardKanji/reading are provided:
  // If the form's Japanese value is different from cardKanji and cardReading, it cannot be the dictionary form!
  if (formValue && formValue.trim() && (cardKanji || cardReading)) {
    const fv = normalizeSentence(formValue.trim());
    const ck = cardKanji ? normalizeSentence(cardKanji.trim()) : '';
    const cr = cardReading ? normalizeSentence(cardReading.trim()) : '';
    if (ck && fv !== ck && cr && fv !== cr) {
      return false;
    }
  }

  // POSITIVE INCLUSIONS: Must specifically be the Dictionary / Base / Ru / Nguyên mẫu form
  const isDict =
    n.includes('từ điển') ||
    n.includes('tu dien') ||
    cleanN.includes('tu dien') ||
    n.includes('thể る') ||
    n.includes('the ru') ||
    cleanN.includes('the ru') ||
    n.includes('nguyên mẫu') ||
    n.includes('nguyen mau') ||
    cleanN.includes('nguyen mau') ||
    n.includes('辞書') ||
    n.includes('jisho') ||
    n.includes('dictionary') ||
    n === 'thể ngắn' ||
    n === 'the ngan' ||
    cleanN === 'the ngan' ||
    n === 'ngắn' ||
    cleanN === 'ngan' ||
    n === 'thể ngắn (thể từ điển)' ||
    n === 'thể từ điển (thể ngắn)' ||
    n === 'thể từ điển (ngắn)' ||
    n === 'thể ngắn (khẳng định)';

  return isDict;
};

/**
 * Resolves the effective audio URL for a card's main word.
 * If card.audioUrl is present, returns it.
 * Otherwise, falls back to any Dictionary form in card.forms that has an audioUrl.
 */
export const getEffectiveCardAudioUrl = (
  card?: { kanji?: string; reading?: string; audioUrl?: string | null; forms?: Array<{ name?: string; value?: string; audioUrl?: string | null }> } | null
): string | undefined => {
  if (!card) return undefined;
  if (card.audioUrl && card.audioUrl.trim()) return card.audioUrl.trim();
  const dictForm = card.forms?.find(f => isDictionaryForm(f.name, f.value, card.kanji, card.reading) && f.audioUrl && f.audioUrl.trim());
  return dictForm?.audioUrl?.trim() || undefined;
};

/**
 * Resolves the effective audio URL for a conjugation form.
 * If form is the Dictionary form, it can share with card.audioUrl or other dictionary form.
 * For any other conjugation (such as Thể phủ định, Thể quá khứ), it NEVER shares with the card's audioUrl.
 */
export const getEffectiveFormAudioUrl = (
  form?: { name?: string; value?: string; audioUrl?: string | null } | null,
  cardAudioUrl?: string | null,
  allForms?: Array<{ name?: string; value?: string; audioUrl?: string | null }> | null,
  cardKanji?: string | null,
  cardReading?: string | null
): string | undefined => {
  if (!form) return undefined;
  
  const isDict = isDictionaryForm(form.name, form.value, cardKanji, cardReading);
  
  if (isDict) {
    if (form.audioUrl && form.audioUrl.trim()) return form.audioUrl.trim();
    if (cardAudioUrl && cardAudioUrl.trim()) return cardAudioUrl.trim();
    const otherDict = allForms?.find(f => isDictionaryForm(f.name, f.value, cardKanji, cardReading) && f.audioUrl && f.audioUrl.trim());
    if (otherDict?.audioUrl && otherDict.audioUrl.trim()) return otherDict.audioUrl.trim();
    return undefined;
  }
  
  // For non-dictionary forms (Thể phủ định, Thể quá khứ, v.v.):
  // Strictly DO NOT use cardAudioUrl or any dictionary form's audio!
  if (form.audioUrl && form.audioUrl.trim()) {
    const trimmed = form.audioUrl.trim();
    // If it matches cardAudioUrl, it was accidentally synced in the past -> ignore it!
    if (cardAudioUrl && trimmed === cardAudioUrl.trim()) {
      return undefined;
    }
    // If it matches any dictionary form's audio, ignore it!
    const dictAudio = allForms?.find(f => isDictionaryForm(f.name, f.value, cardKanji, cardReading) && f.audioUrl)?.audioUrl?.trim();
    if (dictAudio && trimmed === dictAudio) {
      return undefined;
    }
    return trimmed;
  }
  
  return undefined;
};

/**
 * Cleans up any non-dictionary forms (phủ định, quá khứ, lịch sự, v.v.) that mistakenly
 * acquired the card's audioUrl or a dictionary form's audioUrl.
 */
export const sanitizeCardFormsAudio = <T extends { kanji?: string; reading?: string; audioUrl?: string | null; forms?: Array<any> }>(card: T): T => {
  if (!card || !card.forms || card.forms.length === 0) return card;
  const dictAudio = getEffectiveCardAudioUrl(card);
  let changed = false;

  const forms = card.forms.map(f => {
    const isDict = isDictionaryForm(f.name, f.value, card.kanji, card.reading);
    if (!isDict && f.audioUrl) {
      const trimmed = f.audioUrl.trim();
      if ((card.audioUrl && trimmed === card.audioUrl.trim()) || (dictAudio && trimmed === dictAudio.trim())) {
        changed = true;
        const { audioUrl, hasAudio, ...rest } = f;
        return rest;
      }
    }
    return f;
  });

  return changed ? { ...card, forms } : card;
};

/**
 * Synchronizes uploaded audio for the main card ("từ vựng lớn") with ONLY the Dictionary form(s) in card.forms.
 * Non-dictionary forms (such as Thể phủ định, Thể quá khứ) are untouched.
 */
export const syncDictionaryAudioOnCardUpload = <T extends { kanji?: string; reading?: string; audioUrl?: string | null; hasAudio?: boolean; forms?: Array<any> }>(
  card: T,
  newAudioUrl: string
): T => {
  const updatedForms = card.forms
    ? card.forms.map(f => {
        const isDict = isDictionaryForm(f.name, f.value, card.kanji, card.reading);
        if (isDict) {
          return { ...f, audioUrl: newAudioUrl, hasAudio: true };
        }
        // If a non-dictionary form previously had card.audioUrl mistakenly set, clean it!
        if (f.audioUrl === card.audioUrl || f.audioUrl === newAudioUrl) {
          const { audioUrl, hasAudio, ...rest } = f;
          return rest;
        }
        return f;
      })
    : card.forms;

  return {
    ...card,
    audioUrl: newAudioUrl,
    hasAudio: true,
    forms: updatedForms,
  };
};

/**
 * Synchronizes uploaded audio for a form.
 * If and ONLY IF that form is genuinely the Dictionary form ("Thể từ điển"),
 * it synchronizes with the main card ("từ vựng lớn").
 * For other forms (such as Thể phủ định, Thể quá khứ), ONLY that specific form is updated!
 */
export const syncDictionaryAudioOnFormUpload = <T extends { kanji?: string; reading?: string; audioUrl?: string | null; hasAudio?: boolean; forms?: Array<any> }>(
  card: T,
  targetFormIndexOrName: number | string,
  newAudioUrl: string
): { updatedCard: T; isDictionary: boolean } => {
  const forms = card.forms ? [...card.forms] : [];
  let isDict = false;

  let targetForm: any = null;
  if (typeof targetFormIndexOrName === 'number') {
    targetForm = forms[targetFormIndexOrName];
  } else {
    targetForm = forms.find(f => f.name === targetFormIndexOrName || f.id === targetFormIndexOrName);
  }

  if (targetForm) {
    isDict = isDictionaryForm(targetForm.name, targetForm.value, card.kanji, card.reading);
  }

  if (typeof targetFormIndexOrName === 'number') {
    if (forms[targetFormIndexOrName]) {
      forms[targetFormIndexOrName] = {
        ...forms[targetFormIndexOrName],
        audioUrl: newAudioUrl,
        hasAudio: true,
      };
    }
  } else {
    const idx = forms.findIndex(f => f.name === targetFormIndexOrName || f.id === targetFormIndexOrName);
    if (idx !== -1) {
      forms[idx] = {
        ...forms[idx],
        audioUrl: newAudioUrl,
        hasAudio: true,
      };
    }
  }

  if (isDict) {
    for (let i = 0; i < forms.length; i++) {
      if (isDictionaryForm(forms[i].name, forms[i].value, card.kanji, card.reading)) {
        forms[i] = { ...forms[i], audioUrl: newAudioUrl, hasAudio: true };
      }
    }
    return {
      updatedCard: {
        ...card,
        audioUrl: newAudioUrl,
        hasAudio: true,
        forms,
      },
      isDictionary: true,
    };
  }

  return {
    updatedCard: {
      ...card,
      forms,
    },
    isDictionary: false,
  };
};


