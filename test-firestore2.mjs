import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-dd0a187a-48e5-45d8-b2ed-25b8b98b2c81",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const querySnapshot = await getDocs(collection(db, "deck"));
  const words = [];
  querySnapshot.forEach((doc) => {
    words.push(doc.data());
  });
  
  const target = words.find(w => w.kanji === "翻訳する" || w.kanji?.includes("翻訳"));
  console.log(JSON.stringify(target, null, 2));
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
