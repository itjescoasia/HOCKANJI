const text = "わたし は りんご を たべます。";
const prefix = "たべ";
const regex = new RegExp(`(${prefix}[ぁ-ん]*)`, 'i');
console.log(text.match(regex));
