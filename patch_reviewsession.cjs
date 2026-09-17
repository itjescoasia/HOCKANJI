const fs = require('fs');
let code = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');

const searchStr = `export default function ReviewSession({ deck, dueCards, onReview, onFreeStudyReview, onClose, onRemoveCard, onUpdateCard, isFreeStudy = false, isDifficultReview = false }: ReviewSessionProps) {
  const [reviewQueue, setReviewQueue] = useState<KanjiCard[]>(dueCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedState, setFlippedState] = useState<Record<number, boolean>>({});`;

const replaceStr = `export default function ReviewSession({ deck, dueCards, onReview, onFreeStudyReview, onClose, onRemoveCard, onUpdateCard, isFreeStudy = false, isDifficultReview = false }: ReviewSessionProps) {
  const [reviewQueue, setReviewQueue] = useState<KanjiCard[]>(dueCards);
  const [currentIndexRaw, setCurrentIndex] = usePersistentState('app_reviewsession_currentIndex', 0);
  const [flippedState, setFlippedState] = usePersistentState<Record<number, boolean>>('app_reviewsession_flippedState', {});
  const currentIndex = reviewQueue.length > 0 ? Math.min(currentIndexRaw, reviewQueue.length - 1) : 0;`;

if (code.includes(searchStr)) {
  code = "import { usePersistentState } from '../hooks/usePersistentState';\n" + code;
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/ReviewSession.tsx', code);
  console.log("Patched ReviewSession successfully.");
} else {
  console.log("String not found in ReviewSession");
}
