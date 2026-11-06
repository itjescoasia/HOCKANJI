import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  indexedDBLocalPersistence, 
  inMemoryPersistence, 
  getAuth, 
  GoogleAuthProvider 
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";
import { cleanupAndMigrateStorage } from "../utils/cleanupStorage";

// Purge any bloated keys from localStorage before initializing Firestore
cleanupAndMigrateStorage();

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app, 
  { localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }) },
  (firebaseConfig as any).firestoreDatabaseId
);

export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: [
        browserLocalPersistence,
        browserSessionPersistence,
        indexedDBLocalPersistence,
        inMemoryPersistence,
      ],
    });
  } catch {
    return getAuth(app);
  }
})();
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        newObj[key] = removeUndefined(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};
