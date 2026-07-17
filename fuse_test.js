const Fuse = require('fuse.js');
const fuse = new Fuse([{word: "hello"}], {keys: ["word"]});
try {
  fuse.search("a".repeat(40));
  console.log("No error");
} catch (e) {
  console.log("Error:", e);
}
