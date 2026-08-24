const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const targetProps = `initialEditId?: string | null;
  editCardReq?: { id: string, ts: number } | null;
}`;
const replacementProps = `initialEditId?: string | null;
  editCardReq?: { id: string, ts: number } | null;
  viewCardReq?: { id: string, ts: number } | null;
}`;
code = code.replace(targetProps, replacementProps);

const targetComponent = `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', initialEditId = null, editCardReq = null }: VocabListProps) {`;
const replacementComponent = `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', initialEditId = null, editCardReq = null, viewCardReq = null }: VocabListProps) {`;
code = code.replace(targetComponent, replacementComponent);

const targetEffect = `  React.useEffect(() => {
    const targetId = editCardReq?.id || initialEditId;
    if (targetId) {
      const card = deck.find(c => c.id === targetId);
      if (card) {
        startEdit(card);
        setSearch(card.kanji || card.reading);
      }
    }
  }, [editCardReq, initialEditId, deck]);`;

const replacementEffect = `  React.useEffect(() => {
    const targetId = editCardReq?.id || initialEditId;
    if (targetId) {
      const card = deck.find(c => c.id === targetId);
      if (card) {
        startEdit(card);
        setSearch(card.kanji || card.reading);
      }
    }
  }, [editCardReq, initialEditId, deck]);

  React.useEffect(() => {
    if (viewCardReq?.id) {
      const card = deck.find(c => c.id === viewCardReq.id);
      if (card) {
        setViewingCard(card);
        setSearch(card.kanji || card.reading);
      }
    }
  }, [viewCardReq, deck]);`;

code = code.replace(targetEffect, replacementEffect);
fs.writeFileSync('src/components/VocabList.tsx', code);
