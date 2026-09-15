const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(/import \{ initializeFirestore, persistentLocalCache, persistentMultipleTabManager \} from "firebase\/firestore";/, 
  'import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, clearIndexedDbPersistence } from "firebase/firestore";');

code = code.replace(/export const db = initializeFirestore\(\s*app,\s*\{ localCache: persistentLocalCache\(\{ tabManager: persistentMultipleTabManager\(\) \}\) \},\s*\(firebaseConfig as any\)\.firestoreDatabaseId\n\);/,
  `export const db = initializeFirestore(
  app, 
  { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) },
  (firebaseConfig as any).firestoreDatabaseId
);

clearIndexedDbPersistence(db).catch((err) => {
  console.warn("Failed to clear IndexedDB persistence. It might already be running.", err);
});
`);

fs.writeFileSync('src/lib/firebase.ts', code);
