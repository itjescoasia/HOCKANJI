const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr1 = `  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const cleanText = (str) => {
      if (!str) return "";
      return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9 ]/g, " ").replace(/\\s+/g, " ").trim();
    };
    
    const query = cleanText(searchQuery);
    const queryWords = query.split(/\\s+/).filter(Boolean);
    if (queryWords.length === 0) return conversations;

    return conversations.filter(conv => {
      const titleMatch = cleanText(conv.title).includes(query);
      const descMatch = cleanText(conv.description).includes(query);
      if (titleMatch || descMatch) return true;
      
      return conv.dialogues.some(d => {
        const j = cleanText(d.japanese);
        const v = cleanText(d.vietnamese);
        const h = cleanText(d.hiragana);
        const r = cleanText(d.romaji);
        const textToSearch = \`\${j} \${v} \${h} \${r}\`;
        
        // Match if exact phrase
        if (textToSearch.includes(query)) return true;
        
        // Or if most of the words (>= 60%) match
        const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
        return (matchCount / queryWords.length) >= 0.6;
      });
    });
  }, [conversations, searchQuery]);`;

const replaceStr1 = `  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const cleanText = (str) => {
      if (!str) return "";
      return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9 ]/g, " ").replace(/\\s+/g, " ").trim();
    };
    
    const query = cleanText(searchQuery);
    const queryWords = query.split(/\\s+/).filter(Boolean);
    if (queryWords.length === 0) return null;
    
    const results = [];
    
    conversations.forEach(conv => {
      const titleMatch = cleanText(conv.title).includes(query);
      const descMatch = cleanText(conv.description).includes(query);
      
      let matchedAnyDialogue = false;
      
      conv.dialogues.forEach(d => {
        const j = cleanText(d.japanese);
        const v = cleanText(d.vietnamese);
        const h = cleanText(d.hiragana);
        const r = cleanText(d.romaji);
        const textToSearch = \`\${j} \${v} \${h} \${r}\`;
        
        let isMatch = false;
        let score = 0;
        
        if (textToSearch.includes(query)) {
          isMatch = true;
          score = 100;
        } else {
          const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
          if (matchCount > 0 && (matchCount / queryWords.length) >= 0.5) {
            isMatch = true;
            score = Math.round((matchCount / queryWords.length) * 100);
          }
        }
        
        if (isMatch) {
          matchedAnyDialogue = true;
          results.push({
            type: 'dialogue',
            dialogue: d,
            conversation: conv,
            score
          });
        }
      });
      
      if ((titleMatch || descMatch) && !matchedAnyDialogue) {
        results.push({
          type: 'conversation',
          conversation: conv,
          score: titleMatch ? 100 : 80
        });
      }
    });
    
    return results.sort((a, b) => b.score - a.score);
  }, [conversations, searchQuery]);`;

if (content.includes(targetStr1)) {
  content = content.replace(targetStr1, replaceStr1);
  console.log("Updated search logic top");
} else {
  console.log("Could not find Target Content 1");
}

fs.writeFileSync('src/components/ConversationView.tsx', content);
