const fs = require('fs');

function insertIsAdmin(file, searchStr) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("const isAdmin = auth.currentUser?.email === 'nguyenthetrung200126@gmail.com';")) {
    code = code.replace(searchStr, searchStr + "\n  const isAdmin = auth.currentUser?.email === 'nguyenthetrung200126@gmail.com';");
    fs.writeFileSync(file, code);
    console.log("Patched " + file);
  }
}

insertIsAdmin('src/components/VocabList.tsx', "export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', initialEditId = null, editCardReq = null, viewCardReq = null }: VocabListProps) {");

insertIsAdmin('src/components/IntensiveStudy.tsx', "}: IntensiveStudyProps) {");

insertIsAdmin('src/components/ConversationView.tsx', "  onAddIntensiveWord?: (word: any) => void;\n}) {");

