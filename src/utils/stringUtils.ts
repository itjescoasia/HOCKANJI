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
