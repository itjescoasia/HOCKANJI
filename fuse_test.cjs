const Fuse = require('fuse.js');
const text = "hello world how are you doing today I am fine and some more characters to make it really long";
const fuse = new Fuse([{word: text}], {keys: ["word"], ignoreLocation: true, threshold: 0.5});
try {
  fuse.search(text.substring(0, 33));
  console.log("No error 33");
} catch (e) {
  console.log("Error 33:", e.message);
}
try {
  fuse.search(text.substring(0, 32));
  console.log("No error 32");
} catch (e) {
  console.log("Error 32:", e.message);
}
