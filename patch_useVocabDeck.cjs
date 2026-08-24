const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVocabDeck.ts', 'utf8');

code = code.replace(
  `        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id), cleanedUpdates, { merge: true });
      } catch (err) {
        console.error("Error updating card:", err);
      }`,
  `        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', id), cleanedUpdates, { merge: true });
      } catch (err: any) {
        console.error("Error updating card:", err);
        if (err.message && err.message.includes("exceeds the limit")) {
           alert("Lỗi lưu trữ: File âm thanh quá lớn vượt quá giới hạn dữ liệu (1MB) của Firestore. Vui lòng cắt nhỏ hoặc nén file mp3 lại.");
        } else {
           alert("Lỗi lưu trữ: Không thể lưu từ vựng này. Hãy kiểm tra lại kết nối mạng hoặc dung lượng.");
        }
      }`
);

code = code.replace(
  `        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', newCard.id), removeUndefined(newCard));
      } catch (err) {
        console.error("Error adding card:", err);
      }`,
  `        await setDoc(doc(db, 'users', auth.currentUser.uid, 'kanjiDeck', newCard.id), removeUndefined(newCard));
      } catch (err: any) {
        console.error("Error adding card:", err);
        if (err.message && err.message.includes("exceeds the limit")) {
           alert("Lỗi lưu trữ: File âm thanh quá lớn vượt quá giới hạn dữ liệu (1MB) của Firestore. Vui lòng cắt nhỏ hoặc nén file mp3 lại.");
        } else {
           alert("Lỗi lưu trữ: Không thể thêm từ vựng này. Hãy kiểm tra lại dung lượng.");
        }
      }`
);

fs.writeFileSync('src/hooks/useVocabDeck.ts', code);
