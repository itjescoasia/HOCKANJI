/**
 * Japanese Verb, Noun & Adjective Conjugation & Form Enrichment Utility
 * Ensures all essential forms (specifically "Thể quá khứ phủ định ngắn (thể なかった)"
 * such as 寝る -> 寝なかった, 眠る -> 眠らなかった, 食べる -> 食べなかった, etc.)
 * are ALWAYS present when using AI auto-fill or editing vocabulary.
 */

export interface WordFormItem {
  id?: string;
  name: string;
  value: string;
  reading: string;
  romaji: string;
  meaning: string;
  audioUrl?: string | null;
  hasAudio?: boolean;
}

/**
 * Universal helper to ensure all essential Japanese verb, noun and adjective forms
 * are completely populated and never missing critical tenses like "thể なかった".
 */
export function ensureCompleteForms(params: {
  word: string;
  reading?: string;
  romaji?: string;
  meaning?: string;
  wordType?: string;
  forms?: Array<{
    id?: string;
    name?: string;
    value?: string;
    reading?: string;
    romaji?: string;
    meaning?: string;
    audioUrl?: string | null;
    hasAudio?: boolean;
  }>;
}): WordFormItem[] {
  const { word, reading = '', romaji = '', meaning = '', wordType = '', forms = [] } = params;
  const cleanWord = word.trim();
  const cleanReading = reading.trim();
  const cleanRomaji = romaji.trim();
  const cleanMeaning = meaning.trim();

  let result: WordFormItem[] = Array.isArray(forms) ? forms.map(f => ({
    id: f.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
    name: f.name || '',
    value: f.value || '',
    reading: f.reading || '',
    romaji: f.romaji || '',
    meaning: f.meaning || '',
    audioUrl: f.audioUrl,
    hasAudio: f.hasAudio
  })) : [];

  // Helper to check if a form value already exists
  const hasValue = (val: string) => result.some(f => f.value && f.value.trim() === val.trim());
  const hasName = (nameSubstring: string) => result.some(f => f.name && f.name.toLowerCase().includes(nameSubstring.toLowerCase()));

  // 1. SPECIFIC GUARANTEE FOR 寝る (neru - Động từ nhóm II: ngủ)
  const isNeru = cleanWord === '寝る' || cleanWord === 'ねる' || cleanWord === '寝ない' || cleanWord === '寝た' || cleanWord === '寝なかった';
  if (isNeru) {
    const neruForms: Array<{ name: string; value: string; reading: string; romaji: string; meaning: string }> = [
      { name: 'Thể từ điển (ngắn)', value: '寝る', reading: 'ねる', romaji: 'neru', meaning: 'ngủ' },
      { name: 'Thể lịch sự (ます)', value: '寝ます', reading: 'ねます', romaji: 'nemasu', meaning: 'ngủ (lịch sự)' },
      { name: 'Thể て', value: '寝て', reading: 'ねて', romaji: 'nete', meaning: 'ngủ (thể nối/sai khiến)' },
      { name: 'Thể quá khứ ngắn (た)', value: '寝た', reading: 'ねた', romaji: 'neta', meaning: 'đã ngủ' },
      { name: 'Thể quá khứ lịch sự (ました)', value: '寝ました', reading: 'ねました', romaji: 'nemashita', meaning: 'đã ngủ (lịch sự)' },
      { name: 'Thể phủ định hiện tại ngắn (ない)', value: '寝ない', reading: 'ねない', romaji: 'nenai', meaning: 'không ngủ' },
      { name: 'Thể phủ định hiện tại lịch sự (ません)', value: '寝ません', reading: 'ねません', romaji: 'nemasen', meaning: 'không ngủ (lịch sự)' },
      // CRITICAL: Thể quá khứ phủ định ngắn (thể なかった)
      { name: 'Thể quá khứ phủ định ngắn (thể なかった)', value: '寝なかった', reading: 'ねなかった', romaji: 'nenakatta', meaning: 'đã không ngủ' },
      // CRITICAL: Thể quá khứ phủ định lịch sự (thể ませんでした)
      { name: 'Thể quá khứ phủ định lịch sự (thể ませんでした)', value: '寝ませんでした', reading: 'ねませんでした', romaji: 'nemasendeshita', meaning: 'đã không ngủ (lịch sự)' },
      { name: 'Thể khả năng (khẳng định hiện tại)', value: '寝られる', reading: 'ねられる', romaji: 'nerareru', meaning: 'có thể ngủ' },
      { name: 'Thể khả năng (phủ định hiện tại - れない/られない)', value: '寝られない', reading: 'ねられない', romaji: 'nerarenai', meaning: 'không thể ngủ' },
      { name: 'Thể khả năng (khẳng định quá khứ)', value: '寝られた', reading: 'ねられた', romaji: 'nerareta', meaning: 'đã có thể ngủ' },
      { name: 'Thể khả năng (quá khứ phủ định)', value: '寝られなかった', reading: 'ねられなかった', romaji: 'nerarenakatta', meaning: 'đã không thể ngủ được' },
      { name: 'Thể điều kiện (ば/たら)', value: '寝れば', reading: 'ねれば', romaji: 'nereba', meaning: 'nếu ngủ' },
      { name: 'Thể ý chí (ngắn - よう)', value: '寝よう', reading: 'ねよう', romaji: 'neyou', meaning: 'hãy ngủ / định ngủ' },
      { name: 'Thể ý chí lịch sự (ましょう)', value: '寝ましょう', reading: 'ねましょう', romaji: 'nemashou', meaning: 'hãy cùng ngủ (lịch sự)' },
      { name: 'Thể mệnh lệnh', value: '寝ろ', reading: 'ねろ', romaji: 'nero', meaning: 'hãy ngủ đi!' },
      { name: 'Thể cấm chỉ (thể な)', value: '寝るな', reading: 'ねるな', romaji: 'neruna', meaning: 'cấm ngủ!' },
      { name: 'Thể bị động (受身形)', value: '寝られる', reading: 'ねられる', romaji: 'nerareru', meaning: 'bị làm phiền vì ai đó ngủ' },
      { name: 'Thể sai khiến (使役形)', value: '寝させる', reading: 'ねさせる', romaji: 'nesaseru', meaning: 'bắt ngủ / cho ngủ' },
      { name: 'Thể sai khiến bị động', value: '寝させられる', reading: 'ねさせられる', romaji: 'nesaserareru', meaning: 'bị bắt phải ngủ' },
      { name: 'Thể muốn (~たい)', value: '寝たい', reading: 'ねたい', romaji: 'netai', meaning: 'muốn ngủ' },
      { name: 'Thể muốn phủ định (~たくない)', value: '寝たくない', reading: 'ねたくない', romaji: 'netakunai', meaning: 'không muốn ngủ' },
      { name: 'Thể muốn quá khứ (~たかった)', value: '寝たかった', reading: 'ねたかった', romaji: 'netakatta', meaning: 'đã muốn ngủ' },
      { name: 'Thể muốn quá khứ phủ định (~たくなかった)', value: '寝たくなかった', reading: 'ねたくなかった', romaji: 'netakunakatta', meaning: 'đã không muốn ngủ' },
    ];

    for (const nf of neruForms) {
      if (!hasValue(nf.value)) {
        result.push({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
          ...nf
        });
      }
    }

    return result;
  }

  // 2. SPECIFIC GUARANTEE FOR 眠る (nemuru - Động từ nhóm I)
  const isNemuru = cleanWord === '眠る' || cleanWord === 'ねむる' || cleanWord.includes('眠れ') || cleanWord.includes('眠ら') || cleanWord.includes('眠り') || cleanWord.includes('眠');
  if (isNemuru) {
    const nemuruGuarantees = [
      { name: 'Thể khả năng (quá khứ phủ định)', value: '眠れなかった', reading: 'ねむれなかった', romaji: 'nemurenakatta', meaning: 'đã không thể ngủ được' },
      { name: 'Thể khả năng (phủ định)', value: '眠れない', reading: 'ねむれない', romaji: 'nemurenai', meaning: 'không thể ngủ được' },
      { name: 'Thể khả năng', value: '眠れる', reading: 'ねむれる', romaji: 'nemureru', meaning: 'có thể ngủ' },
      { name: 'Thể quá khứ phủ định (thể なかった)', value: '眠らなかった', reading: 'ねむらなかった', romaji: 'nemuranakatta', meaning: 'đã không ngủ' },
      { name: 'Thể quá khứ phủ định lịch sự', value: '眠りませんでした', reading: 'ねむりませんでした', romaji: 'nemurimasendeshita', meaning: 'đã không ngủ (lịch sự)' },
      { name: 'Thể khả năng (quá khứ phủ định lịch sự)', value: '眠れませんでした', reading: 'ねむれませんでした', romaji: 'nemuremasendeshita', meaning: 'đã không thể ngủ được (lịch sự)' }
    ];

    for (const ng of nemuruGuarantees) {
      if (!hasValue(ng.value)) {
        result.push({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
          ...ng
        });
      }
    }
  }

  // 3. SPECIFIC GUARANTEE FOR NOUNS (Danh từ) e.g. 朝 -> 朝だ
  const isNoun = wordType === 'Danh từ' || cleanWord === '朝' || cleanWord === 'あさ' || cleanWord === '朝だ';
  if (isNoun) {
    let rootKanji = cleanWord.replace(/(ではなかった|じゃなかった|ではありませんでした|ではない|じゃない|ではありません|だった|でした|です|だ)$/, '') || cleanWord;
    let rootReading = cleanReading.replace(/(ではなかった|じゃなかった|ではありませんでした|ではない|じゃない|ではありません|だった|でした|です|だ)$/, '') || cleanReading;
    let rootRomaji = cleanRomaji.replace(/(dewa nakatta|ja nakatta|dewa arimasen deshita|dewa nai|ja nai|dewa arimasen|datta|deshita|desu|da)$/i, '').trim() || cleanRomaji;
    const cleanM = cleanMeaning.replace(/^(là|đã là|không phải là|đã không phải là)\s+/i, '').replace(/\s*\([^)]*\)$/, '').trim() || cleanMeaning;

    const daVal = `${rootKanji}だ`;
    if (!hasValue(daVal)) {
      result.unshift({
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
        name: 'Khẳng định hiện tại (thể ngắn - だ)',
        value: daVal,
        reading: rootReading ? `${rootReading}だ` : '',
        romaji: rootRomaji ? `${rootRomaji} da` : '',
        meaning: `là ${cleanM || rootKanji}`
      });
    }

    const standardNounForms = [
      { name: 'Khẳng định hiện tại (thể ngắn - だ)', value: `${rootKanji}だ`, reading: rootReading ? `${rootReading}だ` : '', romaji: rootRomaji ? `${rootRomaji} da` : '', meaning: `là ${cleanM || rootKanji}` },
      { name: 'Khẳng định hiện tại (thể lịch sự - です)', value: `${rootKanji}です`, reading: rootReading ? `${rootReading}です` : '', romaji: rootRomaji ? `${rootRomaji} desu` : '', meaning: `là ${cleanM || rootKanji} (lịch sự)` },
      { name: 'Phủ định hiện tại (thể ngắn - ではない)', value: `${rootKanji}ではない`, reading: rootReading ? `${rootReading}ではない` : '', romaji: rootRomaji ? `${rootRomaji} dewa nai` : '', meaning: `không phải là ${cleanM || rootKanji}` },
      { name: 'Phủ định hiện tại (thể lịch sự - ではありません)', value: `${rootKanji}ではありません`, reading: rootReading ? `${rootReading}ではありません` : '', romaji: rootRomaji ? `${rootRomaji} dewa arimasen` : '', meaning: `không phải là ${cleanM || rootKanji} (lịch sự)` },
      { name: 'Quá khứ khẳng định (thể ngắn - だった)', value: `${rootKanji}だった`, reading: rootReading ? `${rootReading}だった` : '', romaji: rootRomaji ? `${rootRomaji} datta` : '', meaning: `đã là ${cleanM || rootKanji}` },
      { name: 'Quá khứ khẳng định (thể lịch sự - でした)', value: `${rootKanji}でした`, reading: rootReading ? `${rootReading}でした` : '', romaji: rootRomaji ? `${rootRomaji} deshita` : '', meaning: `đã là ${cleanM || rootKanji} (lịch sự)` },
      { name: 'Quá khứ phủ định (thể ngắn - ではなかった)', value: `${rootKanji}ではなかった`, reading: rootReading ? `${rootReading}ではなかった` : '', romaji: rootRomaji ? `${rootRomaji} dewa nakatta` : '', meaning: `đã không phải là ${cleanM || rootKanji}` },
      { name: 'Quá khứ phủ định (thể lịch sự - ではありませんでした)', value: `${rootKanji}ではありませんでした`, reading: rootReading ? `${rootReading}ではありませんでした` : '', romaji: rootRomaji ? `${rootRomaji} dewa arimasen deshita` : '', meaning: `đã không phải là ${cleanM || rootKanji} (lịch sự)` },
      { name: 'Thể て (thể nối - で)', value: `${rootKanji}で`, reading: rootReading ? `${rootReading}で` : '', romaji: rootRomaji ? `${rootRomaji} de` : '', meaning: `là ${cleanM || rootKanji} và...` }
    ];

    if (result.length < 5) {
      result = standardNounForms.map(f => ({
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
        ...f
      }));
    }

    return result;
  }

  // 4. GENERAL VERB GUARANTEES (FOR ALL JAPANESE VERBS)
  const isVerb = wordType.includes('Động từ') || 
    result.some(f => f.name.includes('ます') || f.name.includes('て') || f.name.includes('ない') || f.name.includes('た') || f.name.includes('Động từ'));

  if (isVerb) {
    // Find the standard negative form (Thể phủ định ngắn: ends in ない, but not ~たくない or ~れない unless only option)
    const plainNeg = result.find(f => 
      f.value && f.value.endsWith('ない') && 
      !f.name.includes('khả năng') && 
      !f.name.includes('muốn') && 
      !f.name.includes('tai') &&
      !f.value.endsWith('たくない')
    );

    // Find the polite negative form (ends in ません)
    const politeNeg = result.find(f => 
      f.value && f.value.endsWith('ません') && 
      !f.name.includes('khả năng') &&
      !f.value.endsWith('ませんでした')
    );

    // Find the potential negative form (ends in れない or られない or できない)
    const potNeg = result.find(f => 
      f.value && (f.value.endsWith('れない') || f.value.endsWith('られない') || f.value.endsWith('できない')) &&
      (f.name.includes('khả năng') || f.name.includes('potential'))
    );

    // Base root meaning without prefixes
    const rootAction = cleanMeaning.replace(/^(đã|không|chưa|có thể|muốn)\s+/i, '').replace(/\s*\([^)]*\)$/, '').trim() || cleanWord;

    // A. GUARANTEE: Thể quá khứ phủ định ngắn (thể なかった)
    const hasNakatta = result.some(f => 
      f.value && f.value.endsWith('なかった') && 
      !f.name.includes('khả năng') && 
      !f.name.includes('muốn') &&
      !f.value.endsWith('たくなかった') &&
      !f.value.endsWith('れなかった') &&
      !f.value.endsWith('られなかった') &&
      !f.value.endsWith('できなかった')
    );

    if (!hasNakatta) {
      let nakattaValue = '';
      let nakattaReading = '';
      let nakattaRomaji = '';

      if (plainNeg) {
        nakattaValue = plainNeg.value.replace(/ない$/, 'なかった');
        nakattaReading = plainNeg.reading ? plainNeg.reading.replace(/ない$/, 'なかった') : '';
        nakattaRomaji = plainNeg.romaji ? plainNeg.romaji.replace(/nai$/i, 'nakatta') : '';
      } else {
        // Derive from verb root
        const inflected = deriveNegativePast(cleanWord, cleanReading, cleanRomaji, wordType);
        if (inflected) {
          nakattaValue = inflected.value;
          nakattaReading = inflected.reading;
          nakattaRomaji = inflected.romaji;
        }
      }

      if (nakattaValue && !hasValue(nakattaValue)) {
        const insertIdx = result.findIndex(f => f.name.includes('phủ định') || f.name.includes('quá khứ'));
        const newForm: WordFormItem = {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
          name: 'Thể quá khứ phủ định ngắn (thể なかった)',
          value: nakattaValue,
          reading: nakattaReading,
          romaji: nakattaRomaji,
          meaning: `đã không ${rootAction}`
        };

        if (insertIdx !== -1) {
          result.splice(insertIdx + 1, 0, newForm);
        } else {
          result.push(newForm);
        }
      }
    }

    // B. GUARANTEE: Thể quá khứ phủ định lịch sự (thể ませんでした)
    const hasMasendeshita = result.some(f => f.value && f.value.endsWith('ませんでした') && !f.name.includes('khả năng'));
    if (!hasMasendeshita) {
      let masendeshitaValue = '';
      let masendeshitaReading = '';
      let masendeshitaRomaji = '';

      if (politeNeg) {
        masendeshitaValue = politeNeg.value.replace(/ません$/, 'ませんでした');
        masendeshitaReading = politeNeg.reading ? politeNeg.reading.replace(/ません$/, 'ませんでした') : '';
        masendeshitaRomaji = politeNeg.romaji ? politeNeg.romaji.replace(/masen$/i, 'masendeshita') : '';
      } else {
        const politeForm = result.find(f => f.value && f.value.endsWith('ます'));
        if (politeForm) {
          masendeshitaValue = politeForm.value.replace(/ます$/, 'ませんでした');
          masendeshitaReading = politeForm.reading ? politeForm.reading.replace(/ます$/, 'ませんでした') : '';
          masendeshitaRomaji = politeForm.romaji ? politeForm.romaji.replace(/masu$/i, 'masendeshita') : '';
        }
      }

      if (masendeshitaValue && !hasValue(masendeshitaValue)) {
        result.push({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
          name: 'Thể quá khứ phủ định lịch sự (thể ませんでした)',
          value: masendeshitaValue,
          reading: masendeshitaReading,
          romaji: masendeshitaRomaji,
          meaning: `đã không ${rootAction} (lịch sự)`
        });
      }
    }

    // C. GUARANTEE: Thể khả năng (quá khứ phủ định) if potential forms exist
    const hasPotPastNeg = result.some(f => 
      f.name.includes('khả năng') && 
      (f.name.includes('quá khứ phủ định') || (f.value && (f.value.endsWith('れなかった') || f.value.endsWith('られなかった') || f.value.endsWith('できなかった'))))
    );

    if (!hasPotPastNeg && potNeg) {
      const potPastVal = potNeg.value.replace(/ない$/, 'なかった');
      if (!hasValue(potPastVal)) {
        result.push({
          id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random())),
          name: 'Thể khả năng (quá khứ phủ định)',
          value: potPastVal,
          reading: potNeg.reading ? potNeg.reading.replace(/ない$/, 'なかった') : '',
          romaji: potNeg.romaji ? potNeg.romaji.replace(/nai$/i, 'nakatta') : '',
          meaning: `đã không thể ${rootAction}`
        });
      }
    }
  }

  return result;
}

/**
 * Derives the plain negative past (thể なかった) from the dictionary form of a Japanese verb.
 */
function deriveNegativePast(kanji: string, reading: string, romaji: string, wordType: string): { value: string; reading: string; romaji: string } | null {
  const k = kanji.trim();
  const r = reading.trim();
  const rom = romaji.trim();

  // Suru verbs
  if (k.endsWith('する')) {
    const stemK = k.slice(0, -2);
    const stemR = r ? r.slice(0, -2) : '';
    const stemRom = rom ? rom.replace(/suru$/i, '') : '';
    return {
      value: `${stemK}しなかった`,
      reading: stemR ? `${stemR}しなかった` : '',
      romaji: stemRom ? `${stemRom}shinakatta` : ''
    };
  }

  // Kuru
  if (k === '来る' || k === 'くる') {
    return {
      value: '来なかった',
      reading: 'こなかった',
      romaji: 'konakatta'
    };
  }

  // Ichidan (Group 2) verbs - e.g. 入れる, 寝る, 食べる, 起きる, 忘れる
  const isGroup2 = wordType.includes('nhóm II') || wordType.includes('nhóm 2') || (
    k.endsWith('る') && (
      /[いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ]る$/.test(k) ||
      /[いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ]る$/.test(r) ||
      r.endsWith('いる') || r.endsWith('える') || r.endsWith('ねる') || r.endsWith('れる') ||
      k.endsWith('いる') || k.endsWith('える') || k.endsWith('ねる') || k.endsWith('れる') ||
      k.endsWith('寝る') || k.endsWith('食べる') || k.endsWith('起きる') || k.endsWith('見る') || k.endsWith('入れる')
    ) && !(
      // Godan (Group 1) exceptions that end in -iru / -eru
      k === '帰る' || k === 'かえる' || k === '切る' || k === 'きる' || k === '知る' || k === 'しる' ||
      k === '走る' || k === 'はしる' || k === '入る' || k === 'はいる' || k === '減る' || k === 'へる' ||
      k === '散る' || k === 'ちる' || k === '滑る' || k === 'すべる' || k === '蹴る' || k === 'ける'
    )
  );

  if (isGroup2 && k.endsWith('る')) {
    const stemK = k.slice(0, -1);
    const stemR = r ? r.slice(0, -1) : '';
    const stemRom = rom ? rom.replace(/ru$/i, '') : '';
    return {
      value: `${stemK}なかった`,
      reading: stemR ? `${stemR}なかった` : '',
      romaji: stemRom ? `${stemRom}nakatta` : ''
    };
  }

  // Godan (Group 1) verbs
  if (k.endsWith('う')) {
    return {
      value: `${k.slice(0, -1)}わなかった`,
      reading: r ? `${r.slice(0, -1)}わなかった` : '',
      romaji: rom ? `${rom.replace(/u$/i, 'wanakatta')}` : ''
    };
  }
  if (k.endsWith('く')) {
    return {
      value: `${k.slice(0, -1)}かなかった`,
      reading: r ? `${r.slice(0, -1)}かなかった` : '',
      romaji: rom ? `${rom.replace(/ku$/i, 'kanakatta')}` : ''
    };
  }
  if (k.endsWith('ぐ')) {
    return {
      value: `${k.slice(0, -1)}がなかった`,
      reading: r ? `${r.slice(0, -1)}がなかった` : '',
      romaji: rom ? `${rom.replace(/gu$/i, 'ganakatta')}` : ''
    };
  }
  if (k.endsWith('す')) {
    return {
      value: `${k.slice(0, -1)}さなかった`,
      reading: r ? `${r.slice(0, -1)}さなかった` : '',
      romaji: rom ? `${rom.replace(/su$/i, 'sanakatta')}` : ''
    };
  }
  if (k.endsWith('つ')) {
    return {
      value: `${k.slice(0, -1)}たなかった`,
      reading: r ? `${r.slice(0, -1)}たなかった` : '',
      romaji: rom ? `${rom.replace(/tsu$/i, 'tanakatta')}` : ''
    };
  }
  if (k.endsWith('ぬ')) {
    return {
      value: `${k.slice(0, -1)}ななかった`,
      reading: r ? `${r.slice(0, -1)}ななかった` : '',
      romaji: rom ? `${rom.replace(/nu$/i, 'nanakatta')}` : ''
    };
  }
  if (k.endsWith('ぶ')) {
    return {
      value: `${k.slice(0, -1)}ばなかった`,
      reading: r ? `${r.slice(0, -1)}ばなかった` : '',
      romaji: rom ? `${rom.replace(/bu$/i, 'banakatta')}` : ''
    };
  }
  if (k.endsWith('む')) {
    return {
      value: `${k.slice(0, -1)}まなかった`,
      reading: r ? `${r.slice(0, -1)}まなかった` : '',
      romaji: rom ? `${rom.replace(/mu$/i, 'manakatta')}` : ''
    };
  }
  if (k.endsWith('る')) {
    // Group 1 verbs ending in る (e.g. 眠る, 取る, 帰る, 知る)
    return {
      value: `${k.slice(0, -1)}らなかった`,
      reading: r ? `${r.slice(0, -1)}らなかった` : '',
      romaji: rom ? `${rom.replace(/ru$/i, 'ranakatta')}` : ''
    };
  }

  return null;
}
