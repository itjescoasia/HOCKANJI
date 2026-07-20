const fs = require('fs');

function fix(file, typeName, funcName) {
    let content = fs.readFileSync(file, 'utf8');
    const badStr = `const ${funcName} = async (id: string, updates: Partial<any>) => {
    if (!id) return;
 Partial<${typeName}>) => {`;
    const goodStr = `const ${funcName} = async (id: string, updates: Partial<${typeName}>) => {\n    if (!id) return;`;
    content = content.replace(badStr, goodStr);
    
    // Also fix the id injection fix that I did previously but maybe didn't verify
    content = content.replace(`loadedDeck.push(docSnap.data() as ${typeName});`, `loadedDeck.push({ id: docSnap.id, ...docSnap.data() } as ${typeName});`);
    content = content.replace(`loadedConversations.push(docSnap.data() as Conversation);`, `loadedConversations.push({ id: docSnap.id, ...docSnap.data() } as Conversation);`);
    
    fs.writeFileSync(file, content);
}

fix('src/hooks/useIntensiveVocab.ts', 'IntensiveWord', 'updateWord');
fix('src/hooks/useVocabDeck.ts', 'KanjiCard', 'updateCard');
fix('src/hooks/useConversations.ts', 'Conversation', 'updateConversation');
