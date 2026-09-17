const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchStr = `  const { stats, isStatsLoaded, recordReview, recordFreeStudyTime, recordWordOfTheDay } = useStudyStats();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [view, setView] = useState<any>(() => {
    return localStorage.getItem('currentView') || 'dashboard';
  });
  
  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);
  const [isFreeStudyMode, setIsFreeStudyMode] = useState(false);
  const [isDifficultReviewMode, setIsDifficultReviewMode] = useState(false);
  const [shortStudyQueue, setShortStudyQueue] = useState<any[]>([]);
  const [sentenceReviewMode, setSentenceReviewMode] = useState<'JA_TO_VI' | 'VI_TO_JA'>('JA_TO_VI');
  const [sentenceReviewTargetDeck, setSentenceReviewTargetDeck] = useState<any[] | null>(null);
  const [sentenceReviewForceAll, setSentenceReviewForceAll] = useState(false);
  const [isSentenceReviewOpen, setIsSentenceReviewOpen] = useState(false);

  const [listSearchQuery, setListSearchQuery] = useState('');
  const [intensiveSearchQuery, setIntensiveSearchQuery] = useState('');
  const [intensiveSelectedWordId, setIntensiveSelectedWordId] = useState<string | null>(null);`;

const replaceStr = `  const { stats, isStatsLoaded, recordReview, recordFreeStudyTime, recordWordOfTheDay } = useStudyStats();
  
  const [isAddModalOpen, setIsAddModalOpen] = usePersistentState('app_isAddModalOpen', false);
  const [view, setView] = usePersistentState<any>('app_currentView_v2', 'dashboard');
  const [isFreeStudyMode, setIsFreeStudyMode] = usePersistentState('app_isFreeStudyMode', false);
  const [isDifficultReviewMode, setIsDifficultReviewMode] = usePersistentState('app_isDifficultReviewMode', false);
  const [shortStudyQueue, setShortStudyQueue] = usePersistentState<any[]>('app_shortStudyQueue', []);
  const [sentenceReviewMode, setSentenceReviewMode] = usePersistentState<'JA_TO_VI' | 'VI_TO_JA'>('app_sentenceReviewMode', 'JA_TO_VI');
  const [sentenceReviewTargetDeck, setSentenceReviewTargetDeck] = usePersistentState<any[] | null>('app_sentenceReviewTargetDeck', null);
  const [sentenceReviewForceAll, setSentenceReviewForceAll] = usePersistentState('app_sentenceReviewForceAll', false);
  const [isSentenceReviewOpen, setIsSentenceReviewOpen] = usePersistentState('app_isSentenceReviewOpen', false);

  const [listSearchQuery, setListSearchQuery] = usePersistentState('app_listSearchQuery', '');
  const [intensiveSearchQuery, setIntensiveSearchQuery] = usePersistentState('app_intensiveSearchQuery', '');
  const [intensiveSelectedWordId, setIntensiveSelectedWordId] = usePersistentState<string | null>('app_intensiveSelectedWordId', null);`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  code = "import { usePersistentState } from './hooks/usePersistentState';\n" + code;
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx successfully.");
} else {
  console.log("String not found in App.tsx");
}
