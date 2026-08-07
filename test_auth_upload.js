import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

async function test() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Signed in:", cred.user.uid);
    const storageRef = ref(storage, `users/${cred.user.uid}/test.txt`);
    const blob = new Blob(['hello world']);
    await uploadBytes(storageRef, blob);
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.message, e.code);
  }
}
test();
