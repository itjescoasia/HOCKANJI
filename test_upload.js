import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function test() {
  try {
    const storageRef = ref(storage, 'test.txt');
    const blob = new Blob(['hello world']);
    await uploadBytes(storageRef, blob);
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.message, e.code);
  }
}
test();
