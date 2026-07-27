const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const targetStr = `                          {conv.dialogues
                            .filter(d => 
                              d.japanese.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (d.hiragana && d.hiragana.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (d.romaji && d.romaji.toLowerCase().includes(searchQuery.toLowerCase()))
                            )`;

const replaceStr = `                          {conv.dialogues
                            .filter(d => {
                              const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase() : "";
                              const query = removeAccents(searchQuery);
                              return removeAccents(d.japanese).includes(query) || 
                                     removeAccents(d.vietnamese).includes(query) ||
                                     removeAccents(d.hiragana).includes(query) ||
                                     removeAccents(d.romaji).includes(query);
                            })`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/ConversationView.tsx', content);
  console.log("Updated search filter");
} else {
  console.log("Could not find Target Content");
}
