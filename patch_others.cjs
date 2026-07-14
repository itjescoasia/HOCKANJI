const fs = require('fs');

function fixBackface(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /style={{ backfaceVisibility: ['"]hidden['"] }}/g,
    `style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}`
  );
  code = code.replace(
    /style={{ backfaceVisibility: ['"]hidden['"], transform: ['"]rotateY\(180deg\)['"] }}/g,
    `style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}`
  );
  fs.writeFileSync(file, code);
}

fixBackface('src/components/ReviewSession.tsx');
fixBackface('src/components/SentenceReview.tsx');
