const fs = require('fs');
const file = 'src/components/IntensiveStudy.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('onStartTopicReview')) {
    content = content.replace(
        `interface IntensiveStudyProps {`,
        `interface IntensiveStudyProps {
  onStartTopicReview?: (topicDeck: IntensiveWord[]) => void;`
    );

    content = content.replace(
        `  onRemoveWord,
  onNavigateHome,
}: IntensiveStudyProps) => {`,
        `  onRemoveWord,
  onNavigateHome,
  onStartTopicReview,
}: IntensiveStudyProps) => {`
    );

    const buttonHtml = `
            {/* Main Visual */}
            <div className="w-32 min-h-[8rem] sm:w-40 sm:min-h-[10rem] shrink-0 bg-theme-base-alt flex flex-col items-center justify-center rounded border border-theme-subtle shadow-inner mb-4 sm:mb-0 p-4 mx-auto sm:mx-0 relative group/speaker">
              <span className="text-2xl sm:text-4xl font-serif text-theme-primary text-center break-words mb-2">
                {word.word}
              </span>
              {onStartTopicReview && word.examples.length > 0 && (
                <button
                  onClick={() => onStartTopicReview([word])}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary text-theme-base rounded-md text-xs font-bold uppercase tracking-wider hover:bg-theme-accent transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ôn câu</span>
                </button>
              )}
              <button`;

    content = content.replace(
        `            {/* Main Visual */}
            <div className="w-32 min-h-[8rem] sm:w-40 sm:min-h-[10rem] shrink-0 bg-theme-base-alt flex items-center justify-center rounded border border-theme-subtle shadow-inner mb-4 sm:mb-0 p-4 mx-auto sm:mx-0 relative group/speaker">
              <span className="text-2xl sm:text-4xl font-serif text-theme-primary text-center break-words">
                {word.word}
              </span>
              <button`,
        buttonHtml
    );
    
    fs.writeFileSync(file, content);
    console.log('Patched IntensiveStudy.tsx');
} else {
    console.log('Already patched IntensiveStudy.tsx');
}
