import { useState, useEffect } from 'react';
import { ViewState } from './types';
import { useVocabDeck } from './hooks/useVocabDeck';
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
  const [view, setView] = useState<any>('dashboard');
  const [isFreeStudyMode, setIsFreeStudyMode] = useState(false);

  if (authLoading || !isLoaded) return <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center font-sans"><div className="w-8 h-8 border-4 border-[#2a2a2a] border-t-[#c5a059] rounded-full animate-spin"></div></div>;

  if (!user) {
    return <Login />;
  }

  const dueCards = getDueCards();

  const handleStartReview = () => {
    setIsFreeStudyMode(false);
    setView('review');
  };

  const handleStartFreeStudy = () => {
    setIsFreeStudyMode(true);
    setView('review');
  };

  const handleFreeStudyReview = (id: string, isRemember: boolean) => {
    const card = deck.find(c => c.id === id);
    if (!card) return;
    const currentScore = card.freeStudyScore || 0;
    const newScore = isRemember ? currentScore + 1 : currentScore - 1;
    updateCard(id, { freeStudyScore: newScore });
  };

  const handleCloseReview = () => {
    setIsFreeStudyMode(false);
    setView('dashboard');
  };

  const getFreeStudyDeck = () => {
    return [...deck]
      .map(card => ({
        card,
        sortKey: Math.random() + (card.freeStudyScore || 0) * 0.5
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(item => item.card);
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
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-10 h-10 bg-[#8b0000] flex items-center justify-center rounded-sm border border-[#c5a059]">
              <span className="text-white font-serif text-2xl leading-none" style={{ fontFamily: 'serif' }}>漢</span>
            </div>
            <h1 className="text-xl font-serif tracking-widest text-[#c5a059]" style={{ fontFamily: 'serif' }}>KANJI FLOW</h1>
          </div>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
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
            onStartReview={handleStartReview} 
            onStartFreeStudy={handleStartFreeStudy}
            onNavigateAdd={() => setView('add')} 
          />
        )}
        
        {view === 'list' && (
          <VocabList deck={deck} onRemove={removeCard} onUpdate={updateCard} onImport={importCards} />
        )}
        
        {view === 'add' && (
          <AddVocab onAdd={(kanji, reading, meaning, sinoVietnamese, example, exampleTranslation, wordType) => {
            addCard(kanji, reading, meaning, sinoVietnamese, example, exampleTranslation, wordType);
            setView('list'); // Redirect to list to show success
          }} />
        )}
      </main>

      {/* Review Overlay */}
      {view === 'review' && (
        <ReviewSession 
          dueCards={isFreeStudyMode ? getFreeStudyDeck() : dueCards}
          onReview={reviewCard}
          onFreeStudyReview={handleFreeStudyReview}
          onClose={handleCloseReview}
          onRemoveCard={removeCard}
          isFreeStudy={isFreeStudyMode}
        />
      )}
    </div>
  );
}

