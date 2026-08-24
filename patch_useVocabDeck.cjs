const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');

const targetStr = `  const addCard = async (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, example?: string, exampleTranslation?: string, wordType?: string, kanjiExplanation?: string, romaji?: string, examples?: any[], forms?: { id: string, name: string, value: string, reading?: string, romaji?: string }[]) => {
    const newCard: KanjiCard = {
      id: crypto.randomUUID(),
      kanji: kanji || '',
      reading: reading || '',
      romaji: romaji || '',
      sinoVietnamese: sinoVietnamese || '',
      kanjiExplanation: kanjiExplanation || '',
      meaning: meaning || '',
      example: example || '',
      exampleTranslation: exampleTranslation || '',
      examples: examples || [],
      forms: forms || [],
      wordType: wordType || '',`;

const replacementStr = `  const addCard = async (kanji: string, reading: string, meaning: string, sinoVietnamese?: string, example?: string, exampleTranslation?: string, wordType?: string, kanjiExplanation?: string, romaji?: string, examples?: any[], forms?: any[], audioUrl?: string | null, hasAudio?: boolean) => {
    const newCard: KanjiCard = {
      id: crypto.randomUUID(),
      kanji: kanji || '',
      reading: reading || '',
      romaji: romaji || '',
      sinoVietnamese: sinoVietnamese || '',
      kanjiExplanation: kanjiExplanation || '',
      meaning: meaning || '',
      example: example || '',
      exampleTranslation: exampleTranslation || '',
      examples: examples || [],
      forms: forms || [],
      wordType: wordType || '',
      audioUrl: audioUrl || null,
      hasAudio: hasAudio || false,`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/hooks/useVocabDeck.ts', code);
