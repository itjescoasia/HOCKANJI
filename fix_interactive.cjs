const fs = require('fs');
let code = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

const replacement = `
          {card.reading && card.kanji && (
            <span className="text-sm text-theme-primary/70">{card.reading} {card.romaji ? \`(\${card.romaji})\` : ''}</span>
          )}
          <span className="text-sm text-theme-primary mt-1 border-t border-theme-subtle/50 pt-1">{card.meaning}</span>
          {(card.wordType || card.kanjiExplanation) && (
             <span className="text-xs text-theme-primary mt-1 border-t border-theme-subtle/50 pt-1 flex flex-col gap-1">
               {card.wordType && <span className="font-semibold text-theme-accent">Loại từ: {card.wordType}</span>}
               {card.kanjiExplanation && <span className="opacity-80 italic whitespace-pre-wrap">{card.kanjiExplanation}</span>}
             </span>
          )}
        </span>
`;

code = code.replace(/\{card\.reading && card\.kanji && \([\s\S]*?\{card\.meaning\}<\/span>\n\s*<\/span>\n/g, replacement);

fs.writeFileSync('src/utils/highlight.tsx', code);
