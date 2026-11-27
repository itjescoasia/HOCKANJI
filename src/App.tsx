import { usePersistentState } from './hooks/usePersistentState';
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { ViewState, KanjiCard } from './types';
import { useVocabDeck } from './hooks/useVocabDeck';
import { useStudyStats } from './hooks/useStudyStats';
import { useIntensiveVocab } from './hooks/useIntensiveVocab';
import { getLocalDateString, getEndOfTodayTimestamp } from './lib/dateUtils';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { BookMarked, Home, X, PlusCircle, LogOut, Lightbulb, MessageSquare, Settings, CheckSquare, Check, Palette, Brain, Layers, ChevronDown, LayoutGrid } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useConversations } from './hooks/useConversations';
import { UserProfile } from './types';
import FeedbackHost from './components/FeedbackHost';
import { notify } from './utils/feedback';

const AddVocab = lazy(() => import('./components/AddVocab'));
const VocabList = lazy(() => import('./components/VocabList'));
const ReviewSession = lazy(() => import('./components/ReviewSession'));
const IntensiveStudy = lazy(() => import('./components/IntensiveStudy'));
const ConversationView = lazy(() => import('./components/ConversationView'));
const ShortStudySession = lazy(() => import('./components/ShortStudySession'));
const SentenceReview = lazy(() => import('./components/SentenceReview').then(m => ({ default: m.SentenceReview })));
const AccountSettingsModal = lazy(() => import('./components/AccountSettingsModal'));
const N4QuizView = lazy(() => import('./components/N4QuizView'));
const ForgottenVocabSession = lazy(() => import('./components/ForgottenVocabSession'));
const N4VocabReview = lazy(() => import('./components/N4VocabReview'));

const ViewLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[45vh] py-12">
    <div className="w-7 h-7 border-[3px] border-theme-subtle border-t-theme-accent rounded-full animate-spin" />
  </div>
);

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
    bgHex: '#f2f6f2',
    panelHex: '#ffffff',
    textHex: '#0f2418',
    accentHex: '#1b693f',
  },
  {
    id: 'washi',
    name: 'Giấy Washi kem ấm (Warm Paper)',
    badge: 'Chống chói',
    description: 'Màu giấy gạo tự nhiên Nhật Bản ấm êm, chống mỏi và chói lóa như trang sách thật',
    bgHex: '#f6f2e9',
    panelHex: '#fdfbf7',
    textHex: '#1f1914',
    accentHex: '#9c401c',
  },
  {
    id: 'charcoal',
    name: 'Than chì êm đêm (Soft Charcoal)',
    badge: 'Bảo vệ ban đêm',
    description: 'Xám than ấm dịu, không đen kịt, triệt tiêu quầng lóa mắt khi học trong phòng tối',
    bgHex: '#16181a',
    panelHex: '#24282c',
    textHex: '#f1f3f5',
    accentHex: '#eab364',
  },
  {
    id: 'ocean',
    name: 'Đêm đại dương (Midnight Ocean)',
    badge: 'Thư giãn',
    description: 'Xanh chàm tĩnh lặng, lọc bỏ ánh sáng xanh gây mỏi mắt, thư giãn hệ thần kinh',
    bgHex: '#091020',
    panelHex: '#14203b',
    textHex: '#f0f4fc',
    accentHex: '#38bdf8',
  },
  {
    id: 'sepia',
    name: 'Cà phê ấm dịu (Gentle Coffee)',
    description: 'Nhiệt độ màu nâu cà phê ấm dịu với độ tương phản cao WCAG AAA bảo vệ mắt',
    bgHex: '#f4ebdc',
    panelHex: '#fcf7f0',
    textHex: '#191007',
    accentHex: '#783108',
  },
  {
    id: 'light',
    name: 'Sáng thanh lịch (Clean Light)',
    description: 'Sáng nhẹ dịu mắt với độ tương phản cao khi ở ngoài trời',
    bgHex: '#f8f8f7',
    panelHex: '#ffffff',
    textHex: '#18181b',
    accentHex: '#8c5a10',
  },
  {
    id: 'dark',
    name: 'Tối cổ điển (Obsidian Dark)',
    description: 'Chế độ tối truyền thống phong cách tối giản',
    bgHex: '#0d0d0f',
    panelHex: '#1a1a1f',
    textHex: '#f4f4f6',
    accentHex: '#e0b660',
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

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
    const isDarkTheme = theme === 'dark' || theme === 'charcoal' || theme === 'ocean';
    document.documentElement.classList.toggle('dark', isDarkTheme);

    const activeOption = THEME_OPTIONS.find((t) => t.id === theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor && activeOption) {
      metaThemeColor.setAttribute('content', activeOption.bgHex);
    }

    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const [isAddModalOpen, setIsAddModalOpen] = usePersistentState('app_isAddModalOpen', false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsMoreMenuOpen(false);
        setIsAccountDropdownOpen(false);
        setIsAddModalOpen(false);
      }
    };
    if (isThemeMenuOpen || isMobileMenuOpen || isMoreMenuOpen || isAccountDropdownOpen || isAddModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isThemeMenuOpen, isMobileMenuOpen, isMoreMenuOpen, isAccountDropdownOpen, isAddModalOpen, setIsAddModalOpen]);

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

  const [view, setView] = usePersistentState<any>('app_currentView_v2', 'dashboard');
  const [isFreeStudyMode, setIsFreeStudyMode] = usePersistentState('app_isFreeStudyMode', false);
  const [isDifficultReviewMode, setIsDifficultReviewMode] = usePersistentState('app_isDifficultReviewMode', false);
  const [shortStudyQueue, setShortStudyQueue] = usePersistentState<any[]>('app_shortStudyQueue', []);
  const [sentenceReviewMode, setSentenceReviewMode] = usePersistentState<'JA_TO_VI' | 'VI_TO_JA'>('app_sentenceReviewMode', 'JA_TO_VI');
  const [sentenceReviewTargetDeck, setSentenceReviewTargetDeck] = usePersistentState<any[] | null>('app_sentenceReviewTargetDeck', null);
  const [sentenceReviewForceAll, setSentenceReviewForceAll] = usePersistentState('app_sentenceReviewForceAll', false);
  const [sentenceReviewIsRandom, setSentenceReviewIsRandom] = usePersistentState('app_sentenceReviewIsRandom', false);
  const [isSentenceReviewOpen, setIsSentenceReviewOpen] = usePersistentState('app_isSentenceReviewOpen', false);

  const [topicVocabReviewCards, setTopicVocabReviewCards] = useState<KanjiCard[] | null>(null);
  const [topicVocabReviewTitle, setTopicVocabReviewTitle] = useState<string>('');
  const [isTopicVocabReviewOpen, setIsTopicVocabReviewOpen] = useState(false);

  const handleStartTopicVocabReview = (cards: KanjiCard[], title?: string) => {
    setTopicVocabReviewCards(cards);
    setTopicVocabReviewTitle(title || '');
    setIsTopicVocabReviewOpen(true);
  };

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
    const isTrackingView = view === 'short_study' || view === 'difficult_review' || ((isFreeStudyMode || isDifficultReviewMode) && view === 'review');
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

  const { dueCards, leftoverNewCards } = useMemo(() => {
    const rawDueCards = getDueCards();
    const todayStr = dayTrigger || getLocalDateString();
    const todayStats = stats[todayStr] || { reviewed: 0, correct: 0, mastered: 0, newLearned: 0 };

    const newCards = rawDueCards.filter(c => c.interval === 0);
    const reviewCards = rawDueCards.filter(c => c.interval > 0);

    const maxNewPerDay = 25;
    const newLearnedToday = todayStats.newLearned || 0;
    const availableNewSlots = Math.max(0, maxNewPerDay - newLearnedToday);
    const maxReviewPerDay = 150;

    const limitedNew = newCards.slice(0, availableNewSlots);
    const limitedReview = reviewCards
      .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
      .slice(0, maxReviewPerDay);

    return {
      leftoverNewCards: Math.max(0, newCards.length - availableNewSlots),
      dueCards: [...limitedNew, ...limitedReview]
    };
  }, [getDueCards, stats, dayTrigger]);

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'it@jescoasia.vn' || user?.email === 'nguyenthetrung200126@gmail.com';
  const primaryNavItems = useMemo(() => [
    { id: 'dashboard', label: 'Trang chủ', shortLabel: 'Trang chủ', icon: Home },
    { id: 'n4_vocab', label: 'Từ vựng N4', shortLabel: 'Từ vựng N4', icon: Layers },
    { id: 'sentence_srs', label: 'Dịch câu SRS', shortLabel: 'Dịch câu', icon: Brain },
    { id: 'list', label: 'Kho từ vựng', shortLabel: 'Kho từ', icon: BookMarked },
  ], []);
  const secondaryNavItems = useMemo(() => [
    { id: 'quiz', label: 'Trắc nghiệm N4', shortLabel: 'Trắc nghiệm', icon: CheckSquare },
    { id: 'intensive_vocab', label: 'Chuyên đề', shortLabel: 'Chuyên đề', icon: Lightbulb },
    { id: 'conversation', label: 'Hội thoại', shortLabel: 'Hội thoại', icon: MessageSquare },
  ], []);
  const navItems = useMemo(() => [
    ...primaryNavItems,
    ...secondaryNavItems,
    ...(isAdmin ? [{ id: 'add', label: 'Thêm thẻ mới', shortLabel: 'Thêm thẻ', icon: PlusCircle }] : []),
  ], [primaryNavItems, secondaryNavItems, isAdmin]);

  if (authLoading || !isLoaded || !isStatsLoaded) return <div className="min-h-screen-ios bg-theme-base-alt flex items-center justify-center font-sans"><div className="w-8 h-8 border-4 border-theme-subtle border-t-theme-accent rounded-full animate-spin"></div></div>;

  if (!user) {
    return <Login />;
  }

  const handleStartReview = () => {
    if (dueCards.length === 0 && deck.length > 0) {
      setIsFreeStudyMode(true);
    } else {
      setIsFreeStudyMode(false);
    }
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
    setView('difficult_review');
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
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsAccountDropdownOpen(false);
    // The active time saving is handled by the unmount effect of the tracker above
    if (newView === 'add') {
      setIsAddModalOpen(true);
      return;
    }
    if (newView === 'sentence_srs') {
      handleStartSentenceReview('VI_TO_JA', null, false, true);
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
      const isForgottenA = a.isForgotten ? 1 : 0;
      const isForgottenB = b.isForgotten ? 1 : 0;
      if (isForgottenA !== isForgottenB) {
        return isForgottenB - isForgottenA;
      }
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

  const isFullScreenStudy = view === 'review' || view === 'short_study' || view === 'difficult_review' || isSentenceReviewOpen || isTopicVocabReviewOpen;
  const activePageTitle = navItems.find((n) => n.id === view)?.label || 'KANJI FLOW';

  return (
    <div className="min-h-screen-ios bg-theme-base-alt text-theme-primary font-sans flex flex-col overflow-x-clip">
      {/* Header / Nav */}
      <header id="app-header" className="bg-theme-panel/95 backdrop-blur-md border-b border-theme-subtle sticky top-0 z-30 pt-safe pl-safe pr-safe">
        <div id="app-header-container" className="max-w-7xl mx-auto px-3 sm:px-5 h-[52px] md:h-16 flex items-center justify-between gap-3 md:gap-6">
          {/* Zone 1: Brand / Active View Title on Mobile */}
          <button
            id="app-header-logo"
            type="button"
            onClick={() => handleNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 min-w-0 text-left"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 bg-[#8b0000] flex items-center justify-center rounded-md border border-theme-accent/70 shrink-0 shadow-xs">
              <span className="text-white font-serif text-lg md:text-xl leading-none" style={{ fontFamily: 'serif' }}>漢</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="hidden md:block text-lg font-serif tracking-widest text-theme-accent leading-none whitespace-nowrap" style={{ fontFamily: 'serif' }}>
                KANJI FLOW
              </span>
              <span className="md:hidden text-sm font-bold text-theme-primary leading-tight truncate">
                {view === 'dashboard' ? 'KANJI FLOW' : activePageTitle}
              </span>
            </div>
          </button>

          {/* Zone 2: Clean Single-Row Desktop/Tablet Navigation */}
          <nav id="app-navbar" className="hidden md:flex items-center justify-center gap-1 min-w-0">
            {primaryNavItems.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`relative px-2.5 lg:px-3 min-h-[40px] rounded-lg text-[13px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-theme-accent/12 text-theme-accent'
                      : 'text-theme-primary/75 hover:text-theme-primary hover:bg-theme-hover'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.shortLabel}</span>
                  {active && <span className="absolute bottom-1 left-2.5 right-2.5 h-0.5 rounded-full bg-theme-accent" />}
                </button>
              );
            })}

            {secondaryNavItems.map((item) => {
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`hidden xl:inline-flex relative px-3 min-h-[40px] rounded-lg text-[13px] font-semibold transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-theme-accent/12 text-theme-accent'
                      : 'text-theme-primary/75 hover:text-theme-primary hover:bg-theme-hover'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.shortLabel}</span>
                  {active && <span className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-theme-accent" />}
                </button>
              );
            })}

            {/* Secondary modes grouped cleanly on md..lg so nothing clips horizontally */}
            <div className="relative xl:hidden shrink-0" ref={moreMenuRef}>
              <button
                id="nav-item-more"
                type="button"
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                aria-expanded={isMoreMenuOpen}
                className={`relative px-2.5 lg:px-3 min-h-[40px] rounded-lg text-[13px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  secondaryNavItems.some((s) => s.id === view) || isMoreMenuOpen
                    ? 'bg-theme-accent/12 text-theme-accent'
                    : 'text-theme-primary/75 hover:text-theme-primary hover:bg-theme-hover'
                }`}
              >
                <span>{secondaryNavItems.find((s) => s.id === view)?.shortLabel || 'Luyện thêm'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                {secondaryNavItems.some((s) => s.id === view) && (
                  <span className="absolute bottom-1 left-2.5 right-2.5 h-0.5 rounded-full bg-theme-accent" />
                )}
              </button>

              {isMoreMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-theme-panel border border-theme-subtle rounded-xl shadow-xl p-1.5 z-50 space-y-0.5">
                  {secondaryNavItems.map((item) => {
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full flex items-center justify-between px-3 min-h-[42px] rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-theme-accent text-theme-inverted font-semibold'
                            : 'text-theme-primary hover:bg-theme-hover'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </span>
                        {active && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin && (
              <button
                id="nav-item-add"
                type="button"
                onClick={() => handleNavigate('add')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 min-h-[38px] rounded-lg bg-theme-accent text-theme-inverted hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                title="Thêm thẻ từ vựng mới"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="hidden lg:inline">Thêm thẻ</span>
                <span className="lg:hidden">Thêm</span>
              </button>
            )}

            {/* Theme Selector Trigger */}
            <div className="relative shrink-0" ref={themeMenuRef}>
              <button
                id="btn-theme-toggle"
                type="button"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className={`min-h-[40px] min-w-[40px] px-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 border ${
                  isThemeMenuOpen
                    ? 'bg-theme-hover text-theme-accent border-theme-accent shadow-xs'
                    : 'bg-theme-panel text-theme-primary/80 hover:text-theme-accent border-theme-subtle hover:bg-theme-hover'
                }`}
                title="Chế độ màu nền & Bảo vệ mắt"
                aria-expanded={isThemeMenuOpen}
              >
                <Palette className="w-4 h-4 text-theme-accent shrink-0" />
                <span
                  className="w-3 h-3 rounded-full border border-black/20 dark:border-white/20 shrink-0 shadow-xs"
                  style={{ backgroundColor: THEME_OPTIONS.find(t => t.id === theme)?.accentHex || '#1b693f' }}
                />
              </button>
            </div>

            {/* Unified Account Menu */}
            <div className="relative shrink-0" ref={accountDropdownRef}>
              <button
                id="btn-account-settings"
                type="button"
                onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
                aria-expanded={isAccountDropdownOpen}
                aria-label="Menu tài khoản"
                className={`min-h-[40px] min-w-[40px] px-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isAccountDropdownOpen
                    ? 'bg-theme-hover text-theme-accent border-theme-accent'
                    : 'bg-theme-panel text-theme-primary/80 hover:text-theme-primary border-theme-subtle hover:bg-theme-hover'
                }`}
                title={`Tài khoản (${user?.email || ''})`}
              >
                <span className="w-6 h-6 rounded-md bg-theme-accent/15 text-theme-accent font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                  {user?.email?.[0] || 'U'}
                </span>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-theme-primary/60 transition-transform duration-150 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAccountDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-theme-subtle">
                    <div className="text-xs font-bold text-theme-primary truncate">{user?.email || 'Người dùng'}</div>
                    <div className="text-[11px] text-theme-muted mt-0.5">{isAdmin ? 'Quản trị viên' : 'Học viên'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      setIsAccountModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 min-h-[42px] rounded-lg text-sm font-medium text-theme-primary hover:bg-theme-hover transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-theme-primary/70 shrink-0" />
                    <span>Cài đặt tài khoản</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      setIsThemeMenuOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 min-h-[42px] rounded-lg text-sm font-medium text-theme-primary hover:bg-theme-hover transition-colors cursor-pointer"
                  >
                    <Palette className="w-4 h-4 text-theme-accent shrink-0" />
                    <span>Màu nền & Bảo vệ mắt</span>
                  </button>
                  <div className="pt-1 border-t border-theme-subtle">
                    <button
                      id="btn-logout"
                      type="button"
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        signOut(auth);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 min-h-[42px] rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col pl-safe pr-safe ${isFullScreenStudy ? 'pb-safe' : 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-safe'}`}>
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
            onNavigateToN4Vocab={() => handleNavigate('n4_vocab')}
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
          <Suspense fallback={<ViewLoader />}>
            <VocabList deck={deck} onRemove={removeCard} onUpdate={updateCard} onImport={importCards} initialSearchQuery={listSearchQuery} editCardReq={editCardReq} viewCardReq={viewCardReq} onStartSentenceReview={handleStartSentenceReview} />
          </Suspense>
        )}
        
        {/* Modals */}
        {isAddModalOpen && (
          <div
            id="add-vocab-modal-overlay"
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pt-safe pb-safe bg-black/60 backdrop-blur-sm overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-theme-panel w-full max-w-2xl my-auto rounded-xl shadow-2xl border border-theme-subtle"
            >
              <button
                id="btn-close-add-modal"
                type="button"
                aria-label="Đóng"
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-2 sm:p-4 max-h-[88dvh] overflow-y-auto custom-scrollbar">
                <Suspense fallback={<ViewLoader />}>
                  <AddVocab 
                    deck={deck}
                    onNavigateToWord={(kanji) => {
                      setListSearchQuery(kanji);
                      setIsAddModalOpen(false);
                      setView('list');
                    }}
                    onAdd={async (kanji, reading, meaning, sinoVietnamese, examples, wordType, kanjiExplanation, romaji, forms, audioUrl, hasAudio) => {
                      await addCard(kanji, reading, meaning, sinoVietnamese || '', '', '', wordType || '', kanjiExplanation || '', romaji || '', examples || [], forms || [], audioUrl, hasAudio);
                      notify.success('Vừa thêm từ vựng mới thành công!');
                      setIsAddModalOpen(false);
                    }} 
                  />
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {view === 'intensive_vocab' && (
          <Suspense fallback={<ViewLoader />}>
            <IntensiveStudy 
              deck={intensiveDeck}
              mainDeck={deck}
              onAddWord={addIntensiveWord}
              onRemoveWord={removeIntensiveWord}
              onUpdateWord={updateIntensiveWord}
              onReorderDeck={reorderIntensiveWords}
              onStartTopicReview={(topicDeck) => handleStartSentenceReview('VI_TO_JA', topicDeck, false)}
              onStartTopicVocabReview={handleStartTopicVocabReview}
              initialSearchQuery={intensiveSearchQuery}
              initialSelectedWordId={intensiveSelectedWordId}
            />
          </Suspense>
        )}
        
        {view === 'short_study' && (
          <div id="short-study-overlay" className="fixed inset-0 z-40 bg-theme-base-alt overflow-y-auto w-full h-full pt-safe pb-safe pl-safe pr-safe">
            <Suspense fallback={<ViewLoader />}>
              <ShortStudySession
                queue={shortStudyQueue}
                onExit={() => setView('dashboard')}
                onUpdateCard={updateCard}
                onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
              />
            </Suspense>
          </div>
        )}

        {view === 'conversation' && (
          <Suspense fallback={<ViewLoader />}>
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
          </Suspense>
        )}

        {view === 'quiz' && (
          <Suspense fallback={<ViewLoader />}>
            <N4QuizView
              onBackToDashboard={() => handleNavigate('dashboard')}
              onNavigateToWord={(word) => {
                setListSearchQuery(word);
                handleNavigate('list');
              }}
            />
          </Suspense>
        )}

        {view === 'n4_vocab' && (
          <Suspense fallback={<ViewLoader />}>
            <N4VocabReview
              userId={user?.uid || 'anonymous'}
              onBack={() => handleNavigate('dashboard')}
              onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
            />
          </Suspense>
        )}
      </main>

      {/* Forgotten Vocab Scientific Review Overlay */}
      {view === 'difficult_review' && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-theme-base-alt flex items-center justify-center"><ViewLoader /></div>}>
          <ForgottenVocabSession
            deck={deck}
            onClose={() => setView('dashboard')}
            onUpdateCard={updateCard}
            onRecordReview={(isCorrect) => recordReview(isCorrect, false, false, isCorrect)}
          />
        </Suspense>
      )}

      {/* Review Overlay */}
      {view === 'review' && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-theme-base-alt flex items-center justify-center"><ViewLoader /></div>}>
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
        </Suspense>
      )}

      {/* Topic Vocab Review Overlay */}
      {isTopicVocabReviewOpen && topicVocabReviewCards && (
        <div id="topic-vocab-review-overlay" className="fixed inset-0 z-50 bg-theme-base-alt overflow-y-auto w-full h-full pt-safe pb-safe pl-safe pr-safe">
          <Suspense fallback={<ViewLoader />}>
            <ReviewSession 
              deck={deck} 
              dueCards={topicVocabReviewCards}
              onReview={handleReviewCard}
              onFreeStudyReview={handleFreeStudyReview}
              onClose={() => setIsTopicVocabReviewOpen(false)}
              onRemoveCard={removeCard}
              isFreeStudy={true}
              isTopicReview={true}
              topicTitle={topicVocabReviewTitle}
              onUpdateCard={updateCard}
            />
          </Suspense>
        </div>
      )}

        {isSentenceReviewOpen && (
          <div id="sentence-review-overlay" className="fixed inset-0 z-40 bg-theme-base-alt overflow-y-auto w-full h-full pt-safe pb-safe pl-safe pr-safe">
            <Suspense fallback={<ViewLoader />}>
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
            </Suspense>
          </div>
        )}

      {/* Mobile Thumb-Zone Bottom Navigation Bar & Slide-Up Menu Sheet */}
      {!isFullScreenStudy && (
        <>
          <nav
            id="mobile-bottom-navbar"
            className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-theme-panel/95 backdrop-blur-md border-t border-theme-subtle pb-safe pl-safe pr-safe"
            aria-label="Điều hướng chính trên điện thoại"
          >
            <div className="grid grid-cols-5 h-14 items-center">
              {[
                { id: 'dashboard', label: 'Trang chủ', icon: Home },
                { id: 'n4_vocab', label: 'Từ vựng', icon: Layers },
                { id: 'sentence_srs', label: 'Dịch SRS', icon: Brain },
                { id: 'list', label: 'Kho từ', icon: BookMarked },
              ].map((tab) => {
                const active = view === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigate(tab.id)}
                    className={`relative h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 transition-colors cursor-pointer ${
                      active ? 'text-theme-accent' : 'text-theme-primary/65 hover:text-theme-primary'
                    }`}
                  >
                    {active && <span className="absolute top-0 w-7 h-0.5 rounded-b-full bg-theme-accent" />}
                    <tab.icon className="w-5 h-5 shrink-0" />
                    <span className="text-[10px] font-semibold tracking-tight leading-none truncate max-w-full">
                      {tab.label}
                    </span>
                  </button>
                );
              })}

              <button
                id="btn-mobile-menu-toggle"
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Mở menu điều hướng"
                className={`relative h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 px-1 transition-colors cursor-pointer ${
                  isMobileMenuOpen || secondaryNavItems.some((s) => s.id === view)
                    ? 'text-theme-accent'
                    : 'text-theme-primary/65 hover:text-theme-primary'
                }`}
              >
                {(isMobileMenuOpen || secondaryNavItems.some((s) => s.id === view)) && (
                  <span className="absolute top-0 w-7 h-0.5 rounded-b-full bg-theme-accent" />
                )}
                {isMobileMenuOpen ? <X className="w-5 h-5 shrink-0" /> : <LayoutGrid className="w-5 h-5 shrink-0" />}
                <span className="text-[10px] font-semibold tracking-tight leading-none truncate max-w-full">
                  Menu
                </span>
              </button>
            </div>
          </nav>

          {isMobileMenuOpen && (
            <div ref={mobileMenuRef}>
              <div
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-theme-panel border-t border-theme-subtle rounded-t-3xl shadow-2xl pb-safe max-h-[82dvh] flex flex-col overflow-hidden">
                <div className="w-10 h-1.5 bg-theme-subtle rounded-full mx-auto my-2.5 shrink-0" />
                <div className="px-5 pb-3 border-b border-theme-subtle flex items-center justify-between gap-3 shrink-0">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-theme-primary">Tất cả chức năng</div>
                    <div className="text-xs text-theme-muted truncate">{user?.email || 'Học viên'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-theme-primary/60 hover:bg-theme-hover cursor-pointer"
                    aria-label="Đóng menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 overflow-y-auto custom-scrollbar space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    {navItems.map((item) => {
                      const active = view === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNavigate(item.id)}
                          className={`min-h-[54px] px-3.5 py-2.5 rounded-2xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                            active
                              ? 'bg-theme-accent text-theme-inverted border-theme-accent shadow-xs'
                              : 'bg-theme-base-alt/60 text-theme-primary border-theme-subtle hover:bg-theme-hover'
                          }`}
                        >
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span className="text-sm font-semibold leading-tight truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-theme-subtle grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsThemeMenuOpen(true);
                      }}
                      className="min-h-[46px] px-3.5 py-2 rounded-xl border border-theme-subtle bg-theme-base-alt/50 text-theme-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-theme-accent shrink-0" />
                      <span>Màu nền</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAccountModalOpen(true);
                      }}
                      className="min-h-[46px] px-3.5 py-2 rounded-xl border border-theme-subtle bg-theme-base-alt/50 text-theme-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 shrink-0" />
                      <span>Tài khoản</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut(auth);
                    }}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Theme Selection Modal (rendered at root layer outside backdrop-blur header) */}
      {isThemeMenuOpen && (
        <div
          id="theme-selection-backdrop"
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe"
          onClick={() => setIsThemeMenuOpen(false)}
        >
          <div
            id="theme-selection-menu"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-theme-panel border border-theme-subtle rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[85dvh] overflow-hidden"
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
                className="p-2 text-theme-primary/50 hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors cursor-pointer"
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
                className="w-full sm:w-auto min-h-[42px] px-5 py-2 bg-theme-accent text-theme-inverted font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-theme-accent-hover transition-colors cursor-pointer shadow-xs ml-auto"
              >
                Áp dụng & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cài đặt thông tin tài khoản & Phân quyền */}
      {isAccountModalOpen && (
        <Suspense fallback={null}>
          <AccountSettingsModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            currentUser={user}
            userProfile={userProfile}
            isAdmin={isAdmin}
            onProfileUpdated={(updated) => setUserProfile(updated)}
          />
        </Suspense>
      )}
      <FeedbackHost />
    </div>
  );
}

