const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');

// Add import
code = code.replace(/import \{ getEndOfTodayTimestamp \} from '\.\.\/lib\/dateUtils';/, "import { getEndOfTodayTimestamp } from '../lib/dateUtils';\nimport { deleteCloudAudio } from '../utils/playTTS';");

// Patch removeCard
const oldRemove = `  const removeCard = async (id: string) => {
    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id));
      } catch (err) {
        console.error("Error removing card:", err);
      }
    } else {
      setDeck(prev => prev.filter(c => c.id !== id));
    }
  };`;

const newRemove = `  const removeCard = async (id: string) => {
    const cardToDelete = deck.find(c => c.id === id);
    if (cardToDelete) {
      // delete audio for card and all examples
      if (cardToDelete.audioUrl) await deleteCloudAudio(cardToDelete.audioUrl);
      if (cardToDelete.examples && Array.isArray(cardToDelete.examples)) {
        for (const ex of cardToDelete.examples) {
          if (ex.audioUrl) await deleteCloudAudio(ex.audioUrl);
        }
      }
    }

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id));
      } catch (err) {
        console.error("Error removing card:", err);
      }
    } else {
      setDeck(prev => prev.filter(c => c.id !== id));
    }
  };`;
code = code.replace(oldRemove, newRemove);

// Patch updateCard
const oldUpdate = `  const updateCard = async (id: string, updates: Partial<KanjiCard>) => {
    if (!id) return;
    if (auth.currentUser) {
      try {
        // Removed base64 cleanup so that MP3 audio from AI can be saved to Firestore
        let safeUpdates = JSON.parse(JSON.stringify(updates));
        
        const cleanedUpdates = removeUndefined(safeUpdates);
        console.log("updateCard CALLED WITH:", id);
        console.log("Raw updates:", updates);
        console.log("Cleaned updates ready for Firestore:", cleanedUpdates);
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id), cleanedUpdates, { merge: true });
      } catch (err: any) {
        console.error("Error updating card:", err);
        if (err.message && err.message.includes("exceeds the limit")) {
           alert("Lỗi lưu trữ: File âm thanh quá lớn vượt quá giới hạn dữ liệu (1MB) của Firestore. Vui lòng cắt nhỏ hoặc nén file mp3 lại.");
        } else {
           alert("Lỗi lưu trữ: Không thể lưu từ vựng này. Hãy kiểm tra lại kết nối mạng hoặc dung lượng.");
        }
      }
    } else {
      setDeck(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
    }
  };`;

const newUpdate = `  const updateCard = async (id: string, updates: Partial<KanjiCard>) => {
    if (!id) return;
    
    // Check for deleted audio in examples or main word
    const oldCard = deck.find(c => c.id === id);
    if (oldCard) {
       // if main audio was removed/changed
       if (updates.audioUrl === null || (updates.audioUrl !== undefined && updates.audioUrl !== oldCard.audioUrl)) {
          if (oldCard.audioUrl) await deleteCloudAudio(oldCard.audioUrl);
       }
       // if examples were updated
       if (updates.examples) {
          const newAudioUrls = new Set(updates.examples.map(ex => ex.audioUrl).filter(Boolean));
          for (const ex of oldCard.examples || []) {
             if (ex.audioUrl && !newAudioUrls.has(ex.audioUrl)) {
                 await deleteCloudAudio(ex.audioUrl);
             }
          }
       }
    }

    if (auth.currentUser) {
      try {
        let safeUpdates = JSON.parse(JSON.stringify(updates));
        const cleanedUpdates = removeUndefined(safeUpdates);
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id), cleanedUpdates, { merge: true });
      } catch (err: any) {
        console.error("Error updating card:", err);
        if (err.message && err.message.includes("exceeds the limit")) {
           alert("Lỗi lưu trữ: File âm thanh quá lớn vượt quá giới hạn dữ liệu (1MB) của Firestore. Vui lòng cắt nhỏ hoặc nén file mp3 lại.");
        } else {
           alert("Lỗi lưu trữ: Không thể lưu từ vựng này. Hãy kiểm tra lại kết nối mạng hoặc dung lượng.");
        }
      }
    } else {
      setDeck(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
    }
  };`;

code = code.replace(oldUpdate, newUpdate);

fs.writeFileSync('src/hooks/useVocabDeck.ts', code);
