const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

code = code.replace(
  `  const updateExample = (index: number, field: string, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };`,
  `  const updateExample = (index: number, field: string, value: any) => {
    setExamples(prev => {
      const newExamples = [...prev];
      newExamples[index] = { ...newExamples[index], [field]: value };
      return newExamples;
    });
  };`
);

fs.writeFileSync('src/components/AddVocab.tsx', code);
