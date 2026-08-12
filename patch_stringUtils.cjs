const fs = require('fs');
let content = fs.readFileSync('src/utils/stringUtils.ts', 'utf8');

content += `\n
export const cleanTextForSearch = (str: string) => {
    if (!str) return "";
    return str.normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "")
        .toLowerCase()
        .replace(/đ/g, "d")
        .replace(/[^\\p{L}\\p{N} ]/gu, " ")
        .replace(/\\s+/g, " ")
        .trim();
};
`;

fs.writeFileSync('src/utils/stringUtils.ts', content);
console.log("Patched stringUtils");
