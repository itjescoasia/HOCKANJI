const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ projectId: 'ai-studio-dd0a187a-48e5-45d8-b2ed-25b8b98b2c81' });
const db = getFirestore();

async function check() {
  const users = await db.collection('users').get();
  for (const user of users.docs) {
     const deck = await db.collection('users').doc(user.id).collection('kanjiDeck').where('kanji', '==', '変える').get();
     if (!deck.empty) {
        console.log("Found card for user", user.id);
        console.log(JSON.stringify(deck.docs[0].data(), null, 2));
     }
  }
}
check().catch(console.error);
