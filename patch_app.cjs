const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);`;

const replaceStr = `  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser?.email === 'nguyenthetrung200126@gmail.com') {
        const migrate = async () => {
          try {
             const { doc, getDoc, getDocs, collection, setDoc } = await import('firebase/firestore');
             const { db } = await import('./lib/firebase');
             const migratedDoc = await getDoc(doc(db, 'system', 'migrated'));
             if (!migratedDoc.exists()) {
               console.log("Migrating Admin data to global collections...");
               const kanjiSnap = await getDocs(collection(db, 'users', currentUser.uid, 'kanjiDeck'));
               for (const d of kanjiSnap.docs) { await setDoc(doc(db, 'global_kanjiDeck', d.id), d.data()); }
               
               const intSnap = await getDocs(collection(db, 'users', currentUser.uid, 'intensiveVocab'));
               for (const d of intSnap.docs) { await setDoc(doc(db, 'global_intensiveVocab', d.id), d.data()); }
               
               const convSnap = await getDocs(collection(db, 'users', currentUser.uid, 'conversations'));
               for (const d of convSnap.docs) { await setDoc(doc(db, 'global_conversations', d.id), d.data()); }
               
               const audioSnap = await getDocs(collection(db, 'users', currentUser.uid, 'audio'));
               for (const d of audioSnap.docs) { await setDoc(doc(db, 'global_audio', d.id), d.data()); }
               
               await setDoc(doc(db, 'system', 'migrated'), { done: true });
               console.log("Migration complete!");
             }
          } catch(e) {
             console.error("Migration failed:", e);
          }
        };
        migrate();
      }
    });
    return () => unsubscribe();
  }, []);`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx successfully.");
} else {
  console.log("String not found in App.tsx");
}
