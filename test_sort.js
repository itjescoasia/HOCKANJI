const allExamples = [
  { id: '1', viToJaInterval: undefined }, // New
  { id: '2', viToJaInterval: 0 }, // Forgot
  { id: '3', viToJaInterval: 1 }, // Due
  { id: '4', viToJaInterval: undefined }, // New
  { id: '5', viToJaInterval: undefined }, // New
];

const dueExamples = [...allExamples];
for (let i = dueExamples.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [dueExamples[i], dueExamples[j]] = [dueExamples[j], dueExamples[i]];
}

dueExamples.sort((a, b) => {
  const getPriority = (ex) => {
    const interval = ex.viToJaInterval;
    if (interval === undefined || interval === null) return 0; // Chưa học (New)
    if (interval === 0) return 1; // Quên (Forgot)
    return 2; // Đến hạn ôn (Due)
  };
  return getPriority(a) - getPriority(b);
});

console.log("Sorted:", dueExamples.map(e => e.id + ":" + e.viToJaInterval));
