const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // This regex looks for className="... markdown-body" and adds whitespace-pre-wrap if missing
  content = content.replace(/className="([^"]*?markdown-body[^"]*?)"/g, (match, classNames) => {
    if (!classNames.includes('whitespace-pre-wrap')) {
      return `className="${classNames} whitespace-pre-wrap"`;
    }
    return match;
  });

  fs.writeFileSync(filepath, content);
}

patchFile('src/components/ConversationView.tsx');
patchFile('src/components/SentenceReview.tsx');
patchFile('src/components/ReviewSession.tsx');
patchFile('src/components/VocabList.tsx');
patchFile('src/components/IntensiveStudy.tsx');

console.log("Patched all markdown-body containers");
