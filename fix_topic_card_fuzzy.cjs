const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `                      {searchQuery.trim() !== "" && (() => {
                        const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() : "";
                        const query = removeAccents(searchQuery);
                        const matchedDialogues = conv.dialogues.filter(d => 
                          removeAccents(d.japanese).includes(query) || 
                          removeAccents(d.vietnamese).includes(query) ||
                          removeAccents(d.hiragana).includes(query) ||
                          removeAccents(d.romaji).includes(query)
                        );
                        
                        if (matchedDialogues.length === 0) return null;`;

const replaceStr = `                      {searchQuery.trim() !== "" && (() => {
                        const dialogueFuse = new Fuse(conv.dialogues, {
                          keys: ["japanese", "vietnamese", "hiragana", "romaji"],
                          threshold: 0.4,
                          ignoreLocation: true,
                        });
                        
                        const matchedDialogues = dialogueFuse.search(searchQuery).map(r => r.item);
                        
                        if (matchedDialogues.length === 0) return null;`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Updated Topic Card to use Fuse for fuzzy matching");
} else {
  console.log("Could not find Target Content");
}
