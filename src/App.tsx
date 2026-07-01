import { useState, useEffect, useRef } from 'react';
import { ViewState } from './types';
import { useVocabDeck } from './hooks/useVocabDeck';
import { useStudyStats } from './hooks/useStudyStats';
import { useIntensiveVocab } from './hooks/useIntensiveVocab';
import { getLocalDateString, getEndOfTodayTimestamp } from './lib/dateUtils';
import Dashboard from './components/Dashboard';
import AddVocab from './components/AddVocab';
import VocabList from './components/VocabList';
import ReviewSession from './components/ReviewSession';
import IntensiveStudy from './components/IntensiveStudy';
import ShortStudySession from './components/ShortStudySession';
import { SentenceReview } from './components/SentenceReview';
import Login from './components/Login';
import { BookMarked, Home, PlusCircle, LogOut, Lightbulb, Sun, Moon } from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dayTrigger, setDayTrigger] = useState(getLocalDateString());
  
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const msUntilEnd = getEndOfTodayTimestamp() - new Date().getTime();
      return Math.max(0, msUntilEnd);
    };

    let timerId: ReturnType<typeof setTimeout>;
    
    const setMidnightTimer = () => {
      timerId = setTimeout(() => {
        setDayTrigger(getLocalDateString());
        setMidnightTimer(); // Set up for the next day
      }, calculateTimeUntilMidnight() + 1000); // add 1 second padding
    };

    setMidnightTimer();

    return () => clearTimeout(timerId);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { deck, addCard, removeCard, updateCard, reviewCard, getDueCards, importCards, isLoaded } = useVocabDeck();
  const { intensiveDeck, addWord: addIntensiveWord, removeWord: removeIntensiveWord, updateWord: updateIntensiveWord } = useIntensiveVocab();
  const { stats, isStatsLoaded, recordReview, recordFreeStudyTime, recordWordOfTheDay } = useStudyStats();
  const [view, setView] = useState<any>('dashboard');
  const [isFreeStudyMode, setIsFreeStudyMode] = useState(false);
  const [isDifficultReviewMode, setIsDifficultReviewMode] = useState(false);
  const [shortStudyQueue, setShortStudyQueue] = useState<any[]>([]);
  const [sentenceReviewMode, setSentenceReviewMode] = useState<'JA_TO_VI' | 'VI_TO_JA'>('JA_TO_VI');
  const lastActivityRef = useRef(Date.now());
  const activeSecondsRef = useRef(0);

  useEffect(() => {
    const isTrackingView = view === 'short_study' || ((isFreeStudyMode || isDifficultReviewMode) && view === 'review');
    if (!isTrackingView) return;
    
    lastActivityRef.current = Date.now();
    activeSecondsRef.current = 0;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    const interval = setInterval(() => {
      // Allow max 2 minutes (120000ms) of inactivity before pausing tracking
      if (document.visibilityState === 'visible' && Date.now() - lastActivityRef.current < 120000) {
        activeSecondsRef.current += 1;
      }
    }, 1000);

    const handleBeforeUnload = () => {
      if (activeSecondsRef.current > 0) {
        recordFreeStudyTime(activeSecondsRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      
      if (activeSecondsRef.current > 0) {
        recordFreeStudyTime(activeSecondsRef.current);
        activeSecondsRef.current = 0;
      }
    };
  }, [isFreeStudyMode, isDifficultReviewMode, view, recordFreeStudyTime]);

  if (authLoading || !isLoaded || !isStatsLoaded) return <div className="min-h-screen bg-theme-base-alt flex items-center justify-center font-sans"><div className="w-8 h-8 border-4 border-theme-subtle border-t-[#c5a059] rounded-full animate-spin"></div></div>;

  if (!user) {
    return <Login />;
  }

  const rawDueCards = getDueCards();
  const todayStr = getLocalDateString();
  const todayStats = stats[todayStr] || { reviewed: 0, correct: 0, mastered: 0, newLearned: 0 };
  
  const newCards = rawDueCards.filter(c => c.interval === 0);
  const reviewCards = rawDueCards.filter(c => c.interval > 0);

  const maxNewPerDay = 25;
  const newLearnedToday = todayStats.newLearned || 0;
  const availableNewSlots = Math.max(0, maxNewPerDay - newLearnedToday);

  // Limit review cards queue to a maximum manageable daily batch 
  // (the algorithm handles priority, we just cap the daily session size so user doesn't get overwhelmed)
  const maxReviewPerDay = 150;
  
  const limitedNew = newCards.slice(0, availableNewSlots);
  const limitedReview = reviewCards
    .sort((a,b) => a.nextReviewDate - b.nextReviewDate)
    .slice(0, maxReviewPerDay);

  const leftoverNewCards = Math.max(0, newCards.length - availableNewSlots);

  const dueCards = [...limitedNew, ...limitedReview];

  const handleStartReview = () => {
    setIsFreeStudyMode(false);
    setIsDifficultReviewMode(false);
    setView('review');
  };

  const handleStartFreeStudy = () => {
    setIsFreeStudyMode(true);
    setIsDifficultReviewMode(false);
    setView('review');
  };

  const handleStartDifficultReview = () => {
    setIsFreeStudyMode(false);
    setIsDifficultReviewMode(true);
    setView('review');
  };

  const handleStartShortStudy = () => {
    // 5 từ hay quên nhất (difficultScore thấp nhất)
    const sorted = [...deck].sort((a, b) => (a.difficultScore ?? 0) - (b.difficultScore ?? 0));
    const top5 = sorted.slice(0, 5);
    setShortStudyQueue(top5);
    setView('short_study');
  };

  const handleStartSentenceReview = (mode: 'JA_TO_VI' | 'VI_TO_JA') => {
    setSentenceReviewMode(mode);
    setView('sentence_review');
  };

  const handleFreeStudyReview = (id: string, isRemember: boolean) => {
    // Record free study interaction
    recordReview(isRemember, false, false, isRemember);

    const card = deck.find(c => c.id === id);
    if (!card) return;
    const currentScore = card.freeStudyScore || 0;
    const newScore = isRemember ? currentScore + 1 : currentScore - 1;
    updateCard(id, { freeStudyScore: newScore });
  };

  const handleDifficultReview = (id: string, isRemember: boolean) => {
    recordReview(isRemember, false, false, isRemember);

    const card = deck.find(c => c.id === id);
    if (!card) return;
    const currentScore = card.difficultScore || 0;
    // Phục hồi điểm nhanh hơn nếu nhớ (chia đôi số âm + 1)
    const newScore = isRemember ? Math.min(0, Math.floor(currentScore / 2) + 1) : currentScore - 1;
    updateCard(id, { difficultScore: newScore });
  };

  const handleReviewCard = async (id: string, grade: any) => {
    // Also record standard SRS reviews
    const cardToReview = deck.find(c => c.id === id);
    if (cardToReview) {
      const isCorrect = grade !== 'forgot';
      const isWellRemembered = grade === 'good' || grade === 'easy';
      const isNewCard = cardToReview.interval === 0;
      // Newly mastered if the previous interval < 21 but next interval is handled inside reviewCard,
      // it's tricky to know exactly here without re-running calculateNextReview.
      // For simplicity, we just assume any grade 'easy' or 'good' on an existing somewhat mature card is progress.
      // Let's just track correct vs incorrect roughly for 'recordReview'.
      recordReview(isCorrect, false, isNewCard, isWellRemembered); 
    }
    await reviewCard(id, grade);
  };

  const handleNavigate = (newView: string) => {
    // The active time saving is handled by the unmount effect of the tracker above
    if (isFreeStudyMode || isDifficultReviewMode) {
      setIsFreeStudyMode(false);
      setIsDifficultReviewMode(false);
    }
    setView(newView);
  };

  const handleCloseReview = () => {
    handleNavigate('dashboard');
  };

  const getDifficultStudyDeck = () => {
    return [...deck]
      .sort((a, b) => {
        const scoreA = a.difficultScore || 0;
        const scoreB = b.difficultScore || 0;
        
        // Gom nhóm những từ có độ khó gần giống nhau (cùng mức độ hay quên, mỗi mức cách nhau 2 điểm)
        const groupA = Math.floor(scoreA / 2);
        const groupB = Math.floor(scoreB / 2);

        if (groupA !== groupB) {
          return groupA - groupB;
        }
        
        // Nếu ở cùng mức độ khó, sắp xếp theo Kanji để các từ đồng dạng đứng gần nhau
        const kanjiA = a.kanji || a.reading;
        const kanjiB = b.kanji || b.reading;
        return kanjiA.localeCompare(kanjiB, 'ja');
      });
  };

  const getFreeStudyDeck = () => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.sort((a, b) => {
      const scoreA = a.freeStudyScore || 0;
      const scoreB = b.freeStudyScore || 0;
      return scoreA - scoreB; // Lower score (most forgotten) comes first
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'list', label: 'Danh sách', icon: BookMarked },
    { id: 'intensive_vocab', label: 'Chuyên đề', icon: Lightbulb },
    { id: 'add', label: 'Thêm thẻ', icon: PlusCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-theme-base-alt text-theme-primary font-sans flex flex-col">
      {/* Header / Nav */}
      <header className="bg-theme-panel border-b border-theme-subtle sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div className="w-10 h-10 bg-[#8b0000] flex items-center justify-center rounded-sm border border-theme-accent">
              <span className="text-white font-serif text-2xl leading-none" style={{ fontFamily: 'serif' }}>漢</span>
            </div>
            <h1 className="text-xl font-serif tracking-widest text-theme-accent" style={{ fontFamily: 'serif' }}>KANJI FLOW</h1>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover rounded transition-all"
              title="Giao diện Sáng/Tối"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded ${
                  view === item.id 
                    ? 'bg-theme-hover text-theme-accent border border-theme-subtle' 
                    : 'text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline tracking-widest uppercase text-[10px] sm:text-[11px]">{item.label}</span>
              </button>
            ))}

            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded text-theme-primary/60 hover:text-red-500 hover:bg-theme-hover"
              title={`Đăng xuất (${user?.email})`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {view === 'dashboard' && (
          <Dashboard 
            deck={deck} 
            intensiveDeck={intensiveDeck}
            dueCards={dueCards} 
            stats={stats}
            leftoverNewCards={leftoverNewCards}
            onStartReview={handleStartReview} 
            onStartFreeStudy={handleStartFreeStudy}
            onStartDifficultReview={handleStartDifficultReview}
            onStartShortStudy={handleStartShortStudy}
            onStartSentenceReview={handleStartSentenceReview}
            onNavigateAdd={() => handleNavigate('add')} 
            onRecordWordOfTheDay={recordWordOfTheDay}
          />
        )}
        
        {view === 'list' && (
          <VocabList deck={deck} onRemove={removeCard} onUpdate={updateCard} onImport={importCards} />
        )}
        
        {view === 'add' && (
          <AddVocab onAdd={async (kanji, reading, meaning, sinoVietnamese, examples, wordType, kanjiExplanation, romaji, forms) => {
            await addCard(kanji, reading, meaning, sinoVietnamese || '', '', '', wordType || '', kanjiExplanation || '', romaji || '', examples || [], forms || []);
            alert('Vừa thêm từ vựng mới thành công');
            handleNavigate('list'); // Redirect to list to show success
          }} />
        )}

        {view === 'intensive_vocab' && (
          <IntensiveStudy 
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onUpdateWord={updateIntensiveWord}
          />
        )}
        
        {view === 'short_study' && (
          <div className="fixed inset-0 z-50 bg-theme-base-alt overflow-y-auto w-full h-full">
            <ShortStudySession
              queue={shortStudyQueue}
              onExit={() => setView('dashboard')}
              onUpdateCard={updateCard}
            />
          </div>
        )}

        {view === 'sentence_review' && (
          <div className="fixed inset-0 z-50 bg-theme-base-alt overflow-y-auto w-full h-full">
            <SentenceReview
              deck={intensiveDeck}
              mainDeck={deck}
              mode={sentenceReviewMode}
              onClose={() => setView('dashboard')}
              onUpdateWord={updateIntensiveWord}
            />
          </div>
        )}
      </main>

      {/* Review Overlay */}
      {view === 'review' && (
        <ReviewSession 
          dueCards={isDifficultReviewMode ? getDifficultStudyDeck() : (isFreeStudyMode ? getFreeStudyDeck() : dueCards)}
          onReview={handleReviewCard}
          onFreeStudyReview={isDifficultReviewMode ? handleDifficultReview : handleFreeStudyReview}
          onClose={handleCloseReview}
          onRemoveCard={removeCard}
          isFreeStudy={isFreeStudyMode || isDifficultReviewMode}
          isDifficultReview={isDifficultReviewMode}
          onUpdateCard={updateCard}
        />
      )}
    </div>
  );
}

