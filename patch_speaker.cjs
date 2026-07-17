const fs = require('fs');
let file = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

file = file.replace(
  'import { X, ArrowRight, ArrowLeft, Eye, Pen, Lightbulb } from "lucide-react";',
  'import { X, ArrowRight, ArrowLeft, Eye, Pen, Lightbulb, Volume2 } from "lucide-react";'
);

if (!file.includes('handleTTS')) {
  file = file.replace(
    '  const [isEditMode, setIsEditMode] = useState(false);',
    `  const [isEditMode, setIsEditMode] = useState(false);

  const handleTTS = (text: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };`
  );
}

const backfaceContent = 
`            <p
              className={\`font-serif leading-relaxed whitespace-pre-wrap \${mode === "VI_TO_JA" ? "text-theme-japanese text-2xl sm:text-3xl" : "text-theme-accent text-xl sm:text-2xl"}\`}
            >
              {mode === "VI_TO_JA"
                ? renderExampleHighlight(
                    currentExample.sentence,
                    currentExample.word,
                    mainDeck,
                  )
                : <HighlightVietnamese text={answerText} />}
            </p>`;

const backfaceContentReplaced =
`            <div className="flex flex-col items-center gap-3">
              <p
                className={\`font-serif leading-relaxed whitespace-pre-wrap \${mode === "VI_TO_JA" ? "text-theme-japanese text-2xl sm:text-3xl" : "text-theme-accent text-xl sm:text-2xl"}\`}
              >
                {mode === "VI_TO_JA"
                  ? renderExampleHighlight(
                      currentExample.sentence,
                      currentExample.word,
                      mainDeck,
                    )
                  : <HighlightVietnamese text={answerText} />}
              </p>
              {mode === "VI_TO_JA" && (
                <button
                  type="button"
                  onClick={(e) => handleTTS(currentExample.sentence, e)}
                  className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors mt-2"
                  title="Phát âm"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>`;

file = file.replace(backfaceContent, backfaceContentReplaced);

fs.writeFileSync('src/components/SentenceReview.tsx', file);
