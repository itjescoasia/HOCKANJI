export const normalizeSentence = (sentence: string) => {
  if (!sentence) return '';
  return sentence
    .replace(/[。\.\,\、\!\?\s　]/g, '')
    .toLowerCase();
};


export const cleanTextForSearch = (str: string) => {
    if (!str) return "";
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/đ/g, "d")
        .replace(/[^\p{L}\p{N} ]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
};

export function cleanMarkdownForDisplay(text: string | undefined | null) {
  if (!text) return text;
  // Remove markdown headers like ###, **, *
  return text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*/g, '').replace(/\*/g, '');
}
