import { usePersistentState } from './hooks/usePersistentState';
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
import ConversationView from './components/ConversationView';
import ShortStudySession from './components/ShortStudySession';
import { SentenceReview } from './components/SentenceReview';
import Login from './components/Login';
import AccountSettingsModal from './components/AccountSettingsModal';
import N4QuizView from './components/N4QuizView';
import { BookMarked, Home, X, PlusCircle, LogOut, Lightbulb, Sun, Moon, MessageSquare, Coffee, CloudMoon, Settings, CheckSquare, Check, Sparkles, Palette } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useConversations } from './hooks/useConversations';
import { UserProfile } from './types';

export type AppTheme = 'matcha' | 'washi' | 'charcoal' | 'ocean' | 'sepia' | 'dark' | 'light';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  badge?: string;
  description: string;
  bgHex: string;
  panelHex: string;
  textHex: string;
  accentHex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'matcha',
    name: 'Trà xanh dịu mắt (Matcha Sage)',
    badge: 'Khuyên dùng cho mắt',
    description: 'Bước sóng xanh thảo mộc giúp giảm mỏi võng mạc tối đa khi học Kanji lâu',
    bgHex: '#f3f6f3',
    panelHex: '#ffffff',
    textHex: '#1a2e22',
    accentHex: '#2e7a51',
  },
  {
    id: 'washi',
    name: 'Giấy Washi kem ấm (Warm Paper)',
    badge: 'Chống chói',
    description: 'Màu giấy gạo tự nhiên Nhật Bản ấm êm, chống mỏi và chói lóa như trang sách thật',
    bgHex: '#f7f4ed',
    panelHex: '#fdfbf7',
    textHex: '#2d2823',
    accentHex: '#b25833',
  },
  {
    id: 'charcoal',
    name: 'Than chì êm đêm (Soft Charcoal)',
    badge: 'Bảo vệ ban đêm',
    description: 'Xám than ấm dịu, không đen kịt, triệt tiêu quầng lóa mắt khi học trong phòng tối',
    bgHex: '#1c1e20',
    panelHex: '#292d31',
    textHex: '#e3e4e6',
    accentHex: '#dca35a',
  },
  {
    id: 'ocean',
    name: 'Đêm đại dương (Midnight Ocean)',
    badge: 'Thư giãn',
    description: 'Xanh chàm tĩnh lặng, lọc bỏ ánh sáng xanh gây mỏi mắt, thư giãn hệ thần kinh',
    bgHex: '#0c1222',
    panelHex: '#16223e',
    textHex: '#e2e8f7',
    accentHex: '#38bdf8',
  },
  {
    id: 'sepia',
    name: 'Cà phê ấm dịu (Gentle Coffee)',
    description: 'Nhiệt độ màu vàng ấm dịu đã căn chỉnh mềm mại, không bị vàng gắt',
    bgHex: '#f5ede1',
    panelHex: '#faf5ee',
    textHex: '#443627',
    accentHex: '#9f5b24',
  },
  {
    id: 'light',
    name: 'Sáng thanh lịch (Clean Light)',
    description: 'Sáng nhẹ dịu mắt với độ tương phản cao khi ở ngoài trời',
    bgHex: '#f9f9f8',
    panelHex: '#ffffff',
    textHex: '#27272a',
    accentHex: '#b07d35',
  },
  {
    id: 'dark',
    name: 'Tối cổ điển (Obsidian Dark)',
    description: 'Chế độ tối truyền thống phong cách tối giản',
    bgHex: '#121212',
    panelHex: '#1e1e1e',
    textHex: '#e4e4e7',
    accentHex: '#c5a059',
  }
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dayTrigger, setDayTrigger] = useState(getLocalDateString());
  
  // Theme state with eye-friendly modes
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'matcha' || saved === 'washi' || saved === 'charcoal' || saved === 'ocean' || saved === 'sepia' || saved === 'dark' || saved === 'light') {
      return saved as AppTheme;
    }
    if (saved === 'dim') return 'ocean';
    return 'matcha';
  });

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.remove(
      'theme-matcha',
      'theme-washi',
      'theme-charcoal',
      'theme-ocean',
      'theme-sepia',
      'theme-light',
      'theme-dim'
    );
    if (theme !== 'dark') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen]);

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
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubProfile = onSnapshot(userDocRef, async (snap) => {
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const isInitialAdmin = currentUser.email === 'it@jescoasia.vn' || currentUser.email === 'nguyenthetrung200126@gmail.com';
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Người dùng',
              photoURL: currentUser.photoURL || undefined,
              role: isInitialAdmin ? 'admin' : 'user',
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            try {
              await setDoc(userDocRef, initialProfile);
              setUserProfile(initialProfile);
            } catch (err) {
              console.warn('Could not auto-create user profile in Firestore:', err);
              setUserProfile(initialProfile);
            }
          }
        }, (err) => {
          console.error('User profile listener error:', err);
        });
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const { deck, addCard, removeCard, updateCard, reviewCard, getDueCards, importCards, isLoaded } = useVocabDeck();
  const { intensiveDeck, addWord: addIntensiveWord, removeWord: removeIntensiveWord, updateWord: updateIntensiveWord, reorderWords: reorderIntensiveWords } = useIntensiveVocab();
  const { conversations, addConversation, removeConversation, updateConversation } = useConversations();
  const { stats, isStatsLoaded, recordReview, recordFreeStudyTime, recordWordOfTheDay } = useStudyStats();
  
  const [isAddModalOpen, setIsAddModalOpen] = usePersistentState('app_isAddModalOpen', false);
  const [view, setView] = usePersistentState<any>('app_currentView_v2', 'dashboard');
  const [isFreeStudyMode, setIsFreeStudyMode] = usePersistentState('app_isFreeStudyMode', false);
  const [isDifficultReviewMode, setIsDifficultReviewMode] = usePersistentState('app_isDifficultReviewMode', false);
  const [shortStudyQueue, setShortStudyQueue] = usePersistentState<any[]>('app_shortStudyQueue', []);
  const [sentenceReviewMode, setSentenceReviewMode] = usePersistentState<'JA_TO_VI' | 'VI_TO_JA'>('app_sentenceReviewMode', 'JA_TO_VI');
  const [sentenceReviewTargetDeck, setSentenceReviewTargetDeck] = usePersistentState<any[] | null>('app_sentenceReviewTargetDeck', null);
  const [sentenceReviewForceAll, setSentenceReviewForceAll] = usePersistentState('app_sentenceReviewForceAll', false);
  const [sentenceReviewIsRandom, setSentenceReviewIsRandom] = usePersistentState('app_sentenceReviewIsRandom', false);
  const [isSentenceReviewOpen, setIsSentenceReviewOpen] = usePersistentState('app_isSentenceReviewOpen', false);

  const [listSearchQuery, setListSearchQuery] = usePersistentState('app_listSearchQuery', '');
  const [intensiveSearchQuery, setIntensiveSearchQuery] = usePersistentState('app_intensiveSearchQuery', '');
  const [intensiveSelectedWordId, setIntensiveSelectedWordId] = usePersistentState<string | null>('app_intensiveSelectedWordId', null);
  const [editCardReq, setEditCardReq] = useState<{id: string, ts: number} | null>(null);
  const [viewCardReq, setViewCardReq] = useState<{id: string, ts: number} | null>(null);

  useEffect(() => {
    const handleEditEvent = (e: any) => {
      const card = e.detail;
      setEditCardReq({ id: card.id, ts: Date.now() });
      setListSearchQuery(card.kanji || card.reading);
      setView('list');
    };
    window.addEventListener('editCard', handleEditEvent);
    const handleViewEvent = (e: any) => {
      const card = e.detail;
      setViewCardReq({ id: card.id, ts: Date.now() });
      setListSearchQuery(card.kanji || card.reading);
      setView('list');
    };
    window.addEventListener('viewCard', handleViewEvent);
    return () => {
      window.removeEventListener('editCard', handleEditEvent);
      window.removeEventListener('viewCard', handleViewEvent);
    };
  }, []);

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
    // Randomize and prioritize unremembered words
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const sorted = shuffled.sort((a, b) => {
      const isRedA = a.interval <= 1 || a.repetition === 0 ? 1 : 0;
      const isRedB = b.interval <= 1 || b.repetition === 0 ? 1 : 0;
      if (isRedA !== isRedB) {
        return isRedB - isRedA;
      }
      return (a.difficultScore ?? 0) - (b.difficultScore ?? 0);
    });
    const top5 = sorted.slice(0, 5);
    setShortStudyQueue(top5);
    setView('short_study');
  };

  const handleStartSentenceReview = (mode: 'JA_TO_VI' | 'VI_TO_JA', targetDeck: any[] | null = null, forceAll: boolean = false, isRandom: boolean = false) => {
    setSentenceReviewMode(mode);
    setSentenceReviewTargetDeck(targetDeck);
    setSentenceReviewForceAll(forceAll);
    setSentenceReviewIsRandom(isRandom);
    setIsSentenceReviewOpen(true);
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
    if (newView === 'add') {
      setIsAddModalOpen(true);
      return;
    }
    if (isFreeStudyMode || isDifficultReviewMode) {
      setIsFreeStudyMode(false);
      setIsDifficultReviewMode(false);
    }
    setIsSentenceReviewOpen(false);
    setView(newView);
    if (newView !== 'list') {
      setListSearchQuery('');
    }
  };

  const handleCloseReview = () => {
    handleNavigate('dashboard');
  };

  const getDifficultStudyDeck = () => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.sort((a, b) => {
      const isRedA = a.interval <= 1 || a.repetition === 0 ? 1 : 0;
      const isRedB = b.interval <= 1 || b.repetition === 0 ? 1 : 0;
      if (isRedA !== isRedB) {
        return isRedB - isRedA;
      }
      const scoreA = a.difficultScore || 0;
      const scoreB = b.difficultScore || 0;
      return scoreA - scoreB;
    });
  };

  const getFreeStudyDeck = () => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.sort((a, b) => {
      // Ưu tiên từ vựng "màu đỏ" (chưa thuộc, interval <= 1 hoặc nextReviewDate <= hiện tại)
      const isRedA = a.interval <= 1 || a.repetition === 0 ? 1 : 0;
      const isRedB = b.interval <= 1 || b.repetition === 0 ? 1 : 0;
      if (isRedA !== isRedB) {
        return isRedB - isRedA; // 1 (Red) lên trước 0
      }

      const scoreA = a.freeStudyScore || 0;
      const scoreB = b.freeStudyScore || 0;
      return scoreA - scoreB; // Lower score (most forgotten) comes first
    });
  };

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'it@jescoasia.vn' || user?.email === 'nguyenthetrung200126@gmail.com';
  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'quiz', label: 'Trắc nghiệm N4', icon: CheckSquare },
    { id: 'list', label: 'Danh sách', icon: BookMarked },
    { id: 'intensive_vocab', label: 'Chuyên đề', icon: Lightbulb },
    { id: 'conversation', label: 'Hội thoại', icon: MessageSquare },
    ...(isAdmin ? [{ id: 'add', label: 'Thêm thẻ', icon: PlusCircle }] : []),
  ];

  return (
    <div className="min-h-screen bg-theme-base-alt text-theme-primary font-sans flex flex-col">
      {/* Header / Nav */}
      <header id="app-header" className="bg-theme-panel border-b border-theme-subtle sticky top-0 z-30">
        <div id="app-header-container" className="max-w-5xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
          <div id="app-header-logo" className="flex items-center gap-2 sm:gap-4 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#8b0000] flex items-center justify-center rounded-sm border border-theme-accent shrink-0">
              <span className="text-white font-serif text-xl sm:text-2xl leading-none" style={{ fontFamily: 'serif' }}>漢</span>
            </div>
            <h1 className="text-lg sm:text-xl font-serif tracking-widest text-theme-accent hidden md:block" style={{ fontFamily: 'serif' }}>KANJI FLOW</h1>
          </div>
          
          <nav id="app-navbar" className="flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar">
            {/* Menu Chế độ màu nền & bảo vệ mắt */}
            <div className="relative" ref={themeMenuRef}>
              <button
                id="btn-theme-toggle"
                type="button"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 border ${
                  isThemeMenuOpen
                    ? 'bg-theme-hover text-theme-accent border-theme-accent shadow-xs'
                    : 'bg-theme-panel text-theme-primary/70 hover:text-theme-accent border-theme-subtle hover:border-theme-accent/60'
                }`}
                title="Chọn chế độ màu nền thân thiện với mắt"
                aria-expanded={isThemeMenuOpen}
              >
                <Palette className="w-4 h-4 text-theme-accent" />
                <span 
                  className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shrink-0 shadow-xs" 
                  style={{ backgroundColor: THEME_OPTIONS.find(t => t.id === theme)?.accentHex || '#2e7a51' }} 
                />
                <span className="hidden md:inline text-[11px] font-bold tracking-wider uppercase">
                  {THEME_OPTIONS.find(t => t.id === theme)?.name.split(' (')[0] || 'Màu nền'}
                </span>
              </button>

              {/* Theme Dropdown Popover / Modal */}
              {isThemeMenuOpen && (
                <>
                  <div
                    id="theme-selection-backdrop"
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
                    onClick={() => setIsThemeMenuOpen(false)}
                  />
                  <div 
                    id="theme-selection-menu"
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-xl bg-theme-panel border border-theme-subtle rounded-2xl shadow-2xl z-50 p-4 sm:p-6 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-theme-subtle shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-theme-accent/10 border border-theme-accent/30 text-theme-accent">
                          <Palette className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-theme-primary flex items-center gap-2">
                            <span>Chế độ màu nền & Bảo vệ mắt</span>
                          </h3>
                          <p className="text-xs text-theme-primary/60 mt-0.5">
                            Bấm chọn để xem trước màu nền ngay trên trang
                          </p>
                        </div>
                      </div>
                      <button
                        id="btn-close-theme-menu"
                        type="button"
                        onClick={() => setIsThemeMenuOpen(false)}
                        className="p-1.5 text-theme-primary/50 hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors cursor-pointer"
                        title="Đóng bảng màu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Options Grid */}
                    <div className="overflow-y-auto space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2.5 pr-1 custom-scrollbar my-1">
                      {THEME_OPTIONS.map((opt) => {
                        const isSelected = theme === opt.id;
                        return (
                          <button
                            key={opt.id}
                            id={`theme-opt-${opt.id}`}
                            type="button"
                            onClick={() => setTheme(opt.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 cursor-pointer relative ${
                              isSelected
                                ? 'border-theme-accent bg-theme-accent/15 ring-2 ring-theme-accent/30 shadow-sm'
                                : 'border-theme-subtle/80 bg-theme-base/50 hover:border-theme-accent/60 hover:bg-theme-hover'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              {/* Swatch & Preview */}
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div 
                                  className="w-8 h-8 rounded-lg border border-black/15 dark:border-white/20 shrink-0 flex items-center justify-center font-serif text-sm font-bold shadow-xs"
                                  style={{ backgroundColor: opt.bgHex, color: opt.textHex }}
                                >
                                  漢
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-theme-primary truncate">
                                    {opt.name.split(' (')[0]}
                                  </div>
                                  <div className="text-[10px] text-theme-primary/50 truncate">
                                    {opt.name.includes('(') ? `(${opt.name.split('(')[1]}` : ''}
                                  </div>
                                </div>
                              </div>

                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-theme-accent text-theme-inverted flex items-center justify-center shrink-0 shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-theme-subtle shrink-0" />
                              )}
                            </div>

                            {/* Badge & Description */}
                            <div className="w-full">
                              {opt.badge && (
                                <div className="mb-1">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider inline-block ${
                                    opt.badge.includes('Khuyên dùng') 
                                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-theme-accent/15 text-theme-accent border border-theme-accent/30'
                                  }`}>
                                    {opt.badge}
                                  </span>
                                </div>
                              )}
                              <p className="text-[11px] text-theme-primary/60 leading-tight">
                                {opt.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 mt-2 border-t border-theme-subtle flex items-center justify-between shrink-0">
                      <span className="text-[11px] text-theme-primary/50 hidden sm:inline">
                        Đã tự động lưu lựa chọn của bạn
                      </span>
                      <button
                        id="btn-apply-theme"
                        type="button"
                        onClick={() => setIsThemeMenuOpen(false)}
                        className="w-full sm:w-auto px-5 py-2 bg-theme-accent text-theme-inverted font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-theme-accent-hover transition-colors cursor-pointer shadow-xs ml-auto"
                      >
                        Áp dụng & Đóng
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logo Bánh răng: Cài đặt tài khoản & Phân quyền Admin/User */}
            <button
              id="btn-account-settings"
              type="button"
              onClick={() => setIsAccountModalOpen(true)}
              className="p-2 text-theme-primary/70 hover:text-theme-accent hover:bg-theme-hover rounded transition-all relative flex items-center justify-center group cursor-pointer"
              title={`Cài đặt tài khoản & Phân quyền (${isAdmin ? 'Admin' : 'User'})`}
            >
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
              {isAdmin ? (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-theme-panel" title="Quản trị viên (Admin)" />
              ) : (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-theme-primary/30 rounded-full" />
              )}
            </button>

            {navItems.map(item => (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded cursor-pointer ${
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
              id="btn-logout"
              type="button"
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded text-theme-primary/60 hover:text-red-500 hover:bg-theme-hover cursor-pointer"
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
            onNavigateAdd={isAdmin ? () => handleNavigate('add') : undefined} 
            onRecordWordOfTheDay={recordWordOfTheDay}
            onNavigateToQuiz={() => handleNavigate('quiz')}
            onNavigateToWord={(word, isIntensive, id) => {
              if (isIntensive) {
                setIntensiveSearchQuery(word);
                setIntensiveSelectedWordId(id);
                setView('intensive_vocab');
              } else {
                setListSearchQuery(word);
                setView('list');
              }
            }}
          />
        )}
        
        {view === 'list' && (
          <VocabList deck={deck} onRemove={removeCard} onUpdate={updateCard} onImport={importCards} initialSearchQuery={listSearchQuery} editCardReq={editCardReq} viewCardReq={viewCardReq} />
        )}
        
        {/* Modals */}
        {isAddModalOpen && (
          <div id="add-vocab-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative bg-theme-panel w-full max-w-2xl my-auto rounded-xl shadow-2xl border border-theme-subtle">
              <button
                id="btn-close-add-modal"
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-2 sm:p-4 max-h-[90vh] overflow-y-auto">
                <AddVocab 
                  deck={deck}
                  onNavigateToWord={(kanji) => {
                    setListSearchQuery(kanji);
                    setIsAddModalOpen(false);
                    setView('list');
                  }}
                  onAdd={async (kanji, reading, meaning, sinoVietnamese, examples, wordType, kanjiExplanation, romaji, forms, audioUrl, hasAudio) => {
                    await addCard(kanji, reading, meaning, sinoVietnamese || '', '', '', wordType || '', kanjiExplanation || '', romaji || '', examples || [], forms || [], audioUrl, hasAudio);
                    alert('Vừa thêm từ vựng mới thành công');
                    setIsAddModalOpen(false);
                  }} 
                />
              </div>
            </div>
          </div>
        )}

        {view === 'intensive_vocab' && (
          <IntensiveStudy 
            deck={intensiveDeck}
            mainDeck={deck}
            onAddWord={addIntensiveWord}
            onRemoveWord={removeIntensiveWord}
            onUpdateWord={updateIntensiveWord}
            onReorderDeck={reorderIntensiveWords}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, false)}
            initialSearchQuery={intensiveSearchQuery}
            initialSelectedWordId={intensiveSelectedWordId}
          />
        )}
        
        {view === 'short_study' && (
          <div id="short-study-overlay" className="fixed inset-0 z-40 bg-theme-base-alt overflow-y-auto w-full h-full">
            <ShortStudySession
              queue={shortStudyQueue}
              onExit={() => setView('dashboard')}
              onUpdateCard={updateCard}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />
          </div>
        )}



        {view === 'conversation' && (
          <ConversationView
            conversations={conversations}
            onAddConversation={addConversation}
            onRemoveConversation={removeConversation}
            onUpdateConversation={updateConversation}
            onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            mainDeck={deck}
            onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, false)}
            onAddIntensiveWord={addIntensiveWord}
          />
        )}

        {view === 'quiz' && (
          <N4QuizView
            onBackToDashboard={() => handleNavigate('dashboard')}
            onNavigateToWord={(word) => {
              setListSearchQuery(word);
              handleNavigate('list');
            }}
          />
        )}
      </main>

      {/* Review Overlay */}
      {view === 'review' && (
        <ReviewSession deck={deck} 
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

        {isSentenceReviewOpen && (
          <div id="sentence-review-overlay" className="fixed inset-0 z-40 bg-theme-base-alt overflow-y-auto w-full h-full">
            <SentenceReview
              deck={sentenceReviewTargetDeck || intensiveDeck}
              mainDeck={deck}
              mode={sentenceReviewMode}
              forceAll={sentenceReviewForceAll}
              isRandom={sentenceReviewIsRandom}
              onClose={() => setIsSentenceReviewOpen(false)}
              onUpdateWord={(id, updates) => {
                const conv = conversations.find(c => c.id === id);
                if (conv) {
                  const updatedDialogues = conv.dialogues.map(d => {
                    const ex = updates.examples?.find(e => e.id === d.id);
                    if (ex) {
                      return {
                        ...d,
                        jaToViMastered: ex.jaToViMastered,
                        viToJaMastered: ex.viToJaMastered,
                        jaToViNextReviewDate: ex.jaToViNextReviewDate,
                        viToJaNextReviewDate: ex.viToJaNextReviewDate,
                        jaToViInterval: ex.jaToViInterval,
                        viToJaInterval: ex.viToJaInterval,
                        jaToViFailCount: ex.jaToViFailCount,
                        viToJaFailCount: ex.viToJaFailCount,
                        jaToViRepetition: ex.jaToViRepetition,
                        viToJaRepetition: ex.viToJaRepetition,
                        jaToViEaseFactor: ex.jaToViEaseFactor,
                        viToJaEaseFactor: ex.viToJaEaseFactor
                      };
                    }
                    return d;
                  });
                  updateConversation(id, { dialogues: updatedDialogues });
                } else {
                  const card = deck.find(c => c.id === id);
                  if (card) {
                    updateCard(id, updates);
                  } else {
                    updateIntensiveWord(id, updates);
                  }
                }
              }}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />
          </div>
        )}

      {/* Modal Cài đặt thông tin tài khoản & Phân quyền */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={user}
        userProfile={userProfile}
        isAdmin={isAdmin}
        onProfileUpdated={(updated) => setUserProfile(updated)}
      />
    </div>
  );
}

