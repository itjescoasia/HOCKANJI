const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetSort = `    const sorted = shuffled.sort((a, b) => {
      const isRedA = a.interval <= 1 || a.repetition === 0;
      const isRedB = b.interval <= 1 || b.repetition === 0;
        
      const scoreA = scores[a.id] || 0;
      const scoreB = scores[b.id] || 0;
        
      const isUnrememberedA = isRedA || scoreA < 0 ? 1 : 0;
      const isUnrememberedB = isRedB || scoreB < 0 ? 1 : 0;
        
      return isUnrememberedB - isUnrememberedA;
    });`;

const replacementSort = `    const sorted = shuffled.sort((a, b) => {
      const isRedA = a.interval <= 1 || a.repetition === 0;
      const isRedB = b.interval <= 1 || b.repetition === 0;
        
      const scoreA = scores[a.id] || 0;
      const scoreB = scores[b.id] || 0;
        
      const priorityA = isRedA ? 2 : (scoreA < 0 ? 1 : 0);
      const priorityB = isRedB ? 2 : (scoreB < 0 ? 1 : 0);
        
      return priorityB - priorityA;
    });`;

content = content.replace(targetSort, replacementSort);
fs.writeFileSync('src/components/ConversationView.tsx', content);
