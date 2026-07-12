const text = "watashi wa ringo o tabemasu.";
const prefix = "tabe";
const regex = new RegExp(`(?:^|[^a-z])(${prefix}[a-z]*)`, 'i');
console.log(text.match(regex));
