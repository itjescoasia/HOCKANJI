export const normalizeSentence = (sentence: string) => {
  if (!sentence) return '';
  return sentence
    .replace(/[。\.\,\、\!\?\s　]/g, '')
    .toLowerCase();
};
