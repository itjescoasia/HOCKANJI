import { useState, useEffect, useRef } from 'react';
import { ViewState } from './types';
import { useVocabDeck } from './hooks/useVocabDeck';
import { useStudyStats } from './hooks/useStudyStats';
import Dashboard from './components/Dashboard';
import AddVocab from './components/AddVocab';
import VocabList from './components/VocabList';
import ReviewSession from './components/ReviewSession';
import Login from './components/Login';
import { BookMarked, Home, PlusCircle, LogOut } from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { deck, addCard, removeCard, updateCard, reviewCard, getDueCards, importCards, isLoaded } = useVocabDeck();
  const { stats, recordReview, recordFreeStudyTime, recordWordOfTheDay } = useStudyStats();
  const [view, setView] = useState<any>('dashboard');
  const [isFreeStudyMode, setIsFreeStudyMode] = useState(false);
  const [isDifficultReviewMode, setIsDifficultReviewMode] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const activeSecondsRef = useRef(0);

  useEffect(() => {
    if ((!isFreeStudyMode && !isDifficultReviewMode) || view !== 'review') return;
    
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
  }, [isFreeStudyMode, view, recordFreeStudyTime]);

  if (authLoading || !isLoaded) return <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center font-sans"><div className="w-8 h-8 border-4 border-[#2a2a2a] border-t-[#c5a059] rounded-full animate-spin"></div></div>;

  if (!user) {
    return <Login />;
  }

  const rawDueCards = getDueCards();
  const todayStr = new Date().toISOString().split('T')[0];
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

  const handleFreeStudyReview = (id: string, isRemember: boolean) => {
    // Record free study interaction
    recordReview(isRemember, false);

    const card = deck.find(c => c.id === id);
    if (!card) return;
    const currentScore = card.freeStudyScore || 0;
    const newScore = isRemember ? currentScore + 1 : currentScore - 1;
    updateCard(id, { freeStudyScore: newScore });
  };

  const handleDifficultReview = (id: string, isRemember: boolean) => {
    recordReview(isRemember, false);

    const card = deck.find(c => c.id === id);
    if (!card) return;
    const currentScore = card.difficultScore || 0;
    // Lower score means more forgotten. Initially 0. Quên -> subtract 1, Nhớ -> add 1
    const newScore = isRemember ? currentScore + 1 : currentScore - 1;
    updateCard(id, { difficultScore: newScore });
  };

  const handleReviewCard = async (id: string, grade: any) => {
    // Also record standard SRS reviews
    const cardToReview = deck.find(c => c.id === id);
    if (cardToReview) {
      const isCorrect = grade !== 'forgot';
      const isNewCard = cardToReview.interval === 0;
      // Newly mastered if the previous interval < 21 but next interval is handled inside reviewCard,
      // it's tricky to know exactly here without re-running calculateNextReview.
      // For simplicity, we just assume any grade 'easy' or 'good' on an existing somewhat mature card is progress.
      // Let's just track correct vs incorrect roughly for 'recordReview'.
      recordReview(isCorrect, false, isNewCard); 
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
        if (scoreA !== scoreB) {
          return scoreA - scoreB;
        }
        return Math.random() - 0.5;
      });
  };

  const getFreeStudyDeck = () => {
    return [...deck]
      .sort((a, b) => {
        const scoreA = a.freeStudyScore || 0;
        const scoreB = b.freeStudyScore || 0;
        if (scoreA !== scoreB) {
          return scoreA - scoreB; // Lower score (most forgotten) comes first
        }
        return Math.random() - 0.5; // Randomize order within same score
      });
  };

  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'list', label: 'Danh sách', icon: BookMarked },
    { id: 'add', label: 'Thêm thẻ', icon: PlusCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#d4d4d4] font-sans flex flex-col">
      {/* Header / Nav */}
      <header className="bg-[#121212] border-b border-[#2a2a2a] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div className="w-10 h-10 bg-[#8b0000] flex items-center justify-center rounded-sm border border-[#c5a059]">
              <span className="text-white font-serif text-2xl leading-none" style={{ fontFamily: 'serif' }}>漢</span>
            </div>
            <h1 className="text-xl font-serif tracking-widest text-[#c5a059]" style={{ fontFamily: 'serif' }}>KANJI FLOW</h1>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded ${
                  view === item.id 
                    ? 'bg-[#1a1a1a] text-[#c5a059] border border-[#2a2a2a]' 
                    : 'text-[#d4d4d4]/60 hover:text-[#c5a059] hover:bg-[#1a1a1a]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline tracking-widest uppercase text-[10px] sm:text-[11px]">{item.label}</span>
              </button>
            ))}

            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded text-[#d4d4d4]/60 hover:text-red-500 hover:bg-[#1a1a1a]"
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
            dueCards={dueCards} 
            stats={stats}
            leftoverNewCards={leftoverNewCards}
            onStartReview={handleStartReview} 
            onStartFreeStudy={handleStartFreeStudy}
            onStartDifficultReview={handleStartDifficultReview}
            onNavigateAdd={() => handleNavigate('add')} 
            onRecordWordOfTheDay={recordWordOfTheDay}
          />
        )}
        
        {view === 'list' && (
          <VocabList deck={deck} onRemove={removeCard} onUpdate={updateCard} onImport={importCards} />
        )}
        
        {view === 'add' && (
          <AddVocab onAdd={(kanji, reading, meaning, sinoVietnamese, example, exampleTranslation, wordType) => {
            addCard(kanji, reading, meaning, sinoVietnamese, example, exampleTranslation, wordType);
            handleNavigate('list'); // Redirect to list to show success
          }} />
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
        />
      )}
    </div>
  );
}

