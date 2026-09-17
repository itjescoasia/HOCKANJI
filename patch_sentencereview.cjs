const fs = require('fs');
let code = fs.readFileSync('src/components/SentenceReview.tsx', 'utf8');

const searchStr = `  const [examples, setExamples] = useState<ExampleWithWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedState, setFlippedState] = useState<Record<number, boolean>>({});`;

const replaceStr = `  const [examples, setExamples] = useState<ExampleWithWord[]>([]);
  const [currentIndexRaw, setCurrentIndex] = usePersistentState('app_sentencereview_currentIndex', 0);
  const [flippedState, setFlippedState] = usePersistentState<Record<number, boolean>>('app_sentencereview_flippedState', {});
  const currentIndex = examples.length > 0 ? Math.min(currentIndexRaw, examples.length - 1) : 0;`;

if (code.includes(searchStr)) {
  code = "import { usePersistentState } from '../hooks/usePersistentState';\n" + code;
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/SentenceReview.tsx', code);
  console.log("Patched SentenceReview successfully.");
} else {
  console.log("String not found in SentenceReview");
}
