const fs = require('fs');
for (const file of ['src/hooks/useIntensiveVocab.ts', 'src/hooks/useVocabDeck.ts', 'src/hooks/useConversations.ts']) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        `const updateWord = async (id: string, updates:`,
        `const updateWord = async (id: string, updates: Partial<any>) => {\n    if (!id) return;\n`
    ).replace(
        `const updateCard = async (id: string, updates:`,
        `const updateCard = async (id: string, updates: Partial<any>) => {\n    if (!id) return;\n`
    ).replace(
        `const updateConversation = async (id: string, updates:`,
        `const updateConversation = async (id: string, updates: Partial<any>) => {\n    if (!id) return;\n`
    );
    fs.writeFileSync(file, content);
}
