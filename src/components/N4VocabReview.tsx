import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { N4VocabWord, N4VocabTopic, N4VocabProgress } from '../types';
import { getApiEndpoint, playTTS } from '../utils/playTTS';
import { safeFetchJson } from '../utils/safeFetch';
import {
  ArrowLeft,
  RefreshCw,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
  Search,
  Shuffle,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Flame,
  ListFilter,
  Trash2,
} from 'lucide-react';

interface N4VocabReviewProps {
  userId: string;
  onBack: () => void;
  onRecordReview?: (isCorrect: boolean) => void;
}

type ReviewTab = 'study' | 'forgotten' | 'skipped' | 'browse';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
  };
  console.warn('[N4 Firestore Sync Warning]', JSON.stringify(errInfo));
}

export default function N4VocabReview({ userId, onBack, onRecordReview }: N4VocabReviewProps) {
  const [words, setWords] = useState<N4VocabWord[]>([]);
  const [topics, setTopics] = useState<N4VocabTopic[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, N4VocabProgress>>({});
  const [sourceUrl, setSourceUrl] = useState('https://hanoilink.vn/tu-vung-tieng-nhat-n4/');
  const [syncedAt, setSyncedAt] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingSource, setIsSyncingSource] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inlineToast, setInlineToast] = useState<{ text: string; tone: 'emerald' | 'rose' | 'neutral' } | null>(null);

  const [activeTab, setActiveTab] = useState<ReviewTab>('study');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [browseQuery, setBrowseQuery] = useState('');
  const [showFrontReading, setShowFrontReading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Active one-by-one session queue (array of word IDs)
  const [sessionQueue, setSessionQueue] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    remembered: 0,
    forgotten: 0,
  });

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressMapRef = useRef<Record<string, N4VocabProgress>>({});
  progressMapRef.current = progressMap;

  const showToast = useCallback((text: string, tone: 'emerald' | 'rose' | 'neutral' = 'neutral') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setInlineToast({ text, tone });
    toastTimerRef.current = setTimeout(() => {
      setInlineToast(null);
    }, 2600);
  }, []);

  // Merge two progress maps picking the newest entry per wordId
  const mergeProgressMaps = useCallback(
    (a: Record<string, N4VocabProgress>, b: Record<string, N4VocabProgress>) => {
      const merged: Record<string, N4VocabProgress> = { ...a };
      for (const [k, entry] of Object.entries(b)) {
        if (!entry || typeof entry !== 'object') continue;
        const prev = merged[k];
        if (!prev || (entry.lastReviewedAt || 0) >= (prev.lastReviewedAt || 0)) {
          merged[k] = entry;
        }
      }
      return merged;
    },
    []
  );

  // Mirror progressMap to Firestore safely
  const mirrorToFirestore = useCallback(
    async (nextMap: Record<string, N4VocabProgress>) => {
      if (!userId || userId === 'anonymous') return;
      const docPath = `users/${userId}/n4VocabState/progress`;
      try {
        await setDoc(
          doc(db, 'users', userId, 'n4VocabState', 'progress'),
          {
            progressMap: nextMap,
            updatedAt: Date.now(),
          },
          { merge: false }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    },
    [userId]
  );

  // Load deck + progress from Backend and reconcile with Firestore mirror
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const apiUrl = getApiEndpoint(`/api/n4-vocab?userId=${encodeURIComponent(userId || 'anonymous')}`);
      const res = await fetch(apiUrl);
      const parsed = await safeFetchJson<{
        sourceUrl: string;
        syncedAt: number;
        topics: N4VocabTopic[];
        words: N4VocabWord[];
        progressMap: Record<string, N4VocabProgress>;
      }>(res);

      if (!parsed.ok || !parsed.data) {
        throw new Error(parsed.error || 'Không thể tải danh sách từ vựng N4 từ backend.');
      }

      const backendWords = parsed.data.words || [];
      const backendTopics = parsed.data.topics || [];
      let mergedProgress = parsed.data.progressMap || {};

      setWords(backendWords);
      setTopics(backendTopics);
      if (parsed.data.sourceUrl) setSourceUrl(parsed.data.sourceUrl);
      if (parsed.data.syncedAt) setSyncedAt(parsed.data.syncedAt);

      // Reconcile with Firestore mirror if signed in
      if (userId && userId !== 'anonymous') {
        const docPath = `users/${userId}/n4VocabState/progress`;
        try {
          const snap = await getDoc(doc(db, 'users', userId, 'n4VocabState', 'progress'));
          if (snap.exists()) {
            const fsData = snap.data() as { progressMap?: Record<string, N4VocabProgress> };
            const fsMap = fsData?.progressMap || {};
            const combined = mergeProgressMaps(mergedProgress, fsMap);

            // Push combined back to backend if Firestore held newer/missing items
            if (Object.keys(combined).length > Object.keys(mergedProgress).length) {
              const syncRes = await fetch(getApiEndpoint('/api/n4-vocab/sync-progress'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, progressMap: combined }),
              });
              const syncParsed = await safeFetchJson<{ progressMap: Record<string, N4VocabProgress> }>(syncRes);
              if (syncParsed.ok && syncParsed.data?.progressMap) {
                mergedProgress = syncParsed.data.progressMap;
              } else {
                mergedProgress = combined;
              }
            } else {
              mergedProgress = combined;
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, docPath);
        }
      }

      setProgressMap(mergedProgress);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi tải dữ liệu N4.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, mergeProgressMaps]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Word lookup dictionary
  const wordById = useMemo(() => {
    const map = new Map<string, N4VocabWord>();
    for (const w of words) map.set(w.id, w);
    return map;
  }, [words]);

  // Topic-filtered words
  const topicWords = useMemo(() => {
    if (selectedTopicId === 'all') return words;
    return words.filter((w) => w.topicId === selectedTopicId);
  }, [words, selectedTopicId]);

  // Aggregate counts for current topic scope
  const scopeCounts = useMemo(() => {
    let skipped = 0;
    let forgottenLearning = 0;
    let fresh = 0;

    for (const w of topicWords) {
      const p = progressMap[w.id];
      if (p?.status === 'skipped') {
        skipped++;
      } else if (p && (p.forgotCount > 0 || p.status === 'learning')) {
        forgottenLearning++;
      } else {
        fresh++;
      }
    }
    return {
      total: topicWords.length,
      skipped,
      forgottenLearning,
      remaining: topicWords.length - skipped,
      fresh,
    };
  }, [topicWords, progressMap]);

  // Build ordered scientific queue whenever topic, tab, or shuffle changes
  const buildQueueIds = useCallback(
    (tab: ReviewTab, topicFilter: string, shuffleOrder: boolean, pMap: Record<string, N4VocabProgress>) => {
      const base = topicFilter === 'all' ? words : words.filter((w) => w.topicId === topicFilter);
      let candidates: N4VocabWord[] = [];

      if (tab === 'forgotten') {
        candidates = base.filter((w) => {
          const p = pMap[w.id];
          return p && p.status !== 'skipped' && p.forgotCount > 0;
        });
      } else {
        candidates = base.filter((w) => pMap[w.id]?.status !== 'skipped');
      }

      if (shuffleOrder) {
        const arr = [...candidates];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        // Still keep forgotten words slightly prioritized when shuffled or pure random:
        // sort due/forgotten cards ahead only if due now
        arr.sort((a, b) => {
          const pa = pMap[a.id];
          const pb = pMap[b.id];
          const fa = pa?.forgotCount || 0;
          const fb = pb?.forgotCount || 0;
          if (fa !== fb) return fb - fa;
          return 0;
        });
        return arr.map((w) => w.id);
      }

      // Scientific default order:
      // 1. Learning/Forgotten words due earliest & highest forgotCount
      // 2. Brand new words in sequential N4 order
      const sorted = [...candidates].sort((a, b) => {
        const pa = pMap[a.id];
        const pb = pMap[b.id];
        const isLearnA = pa?.status === 'learning' ? 1 : 0;
        const isLearnB = pb?.status === 'learning' ? 1 : 0;
        if (isLearnA !== isLearnB) return isLearnB - isLearnA;
        if (isLearnA && isLearnB) {
          const fcDiff = (pb?.forgotCount || 0) - (pa?.forgotCount || 0);
          if (fcDiff !== 0) return fcDiff;
          return (pa?.nextReviewDate || 0) - (pb?.nextReviewDate || 0);
        }
        return a.order - b.order;
      });

      return sorted.map((w) => w.id);
    },
    [words]
  );

  // Rebuild queue cleanly when words load or user switches topic/tab/shuffle
  useEffect(() => {
    if (words.length === 0) return;
    if (activeTab === 'study' || activeTab === 'forgotten') {
      const nextQueue = buildQueueIds(activeTab, selectedTopicId, isShuffled, progressMapRef.current);
      setSessionQueue(nextQueue);
      setIsFlipped(false);
    }
  }, [words, activeTab, selectedTopicId, isShuffled, buildQueueIds]);

  const currentWordId = sessionQueue[0];
  const currentWord = currentWordId ? wordById.get(currentWordId) : undefined;
  const currentProgress = currentWordId ? progressMap[currentWordId] : undefined;

  // Sync fresh words from HanoiLink server
  const handleSyncSource = async () => {
    if (isSyncingSource) return;
    setIsSyncingSource(true);
    try {
      const res = await fetch(getApiEndpoint('/api/n4-vocab/sync'), { method: 'POST' });
      const parsed = await safeFetchJson<{
        sourceUrl: string;
        syncedAt: number;
        topics: N4VocabTopic[];
        words: N4VocabWord[];
        count: number;
      }>(res);

      if (!parsed.ok || !parsed.data) {
        throw new Error(parsed.error || 'Không thể đồng bộ lại từ nguồn HanoiLink.');
      }

      setWords(parsed.data.words || []);
      setTopics(parsed.data.topics || []);
      setSyncedAt(parsed.data.syncedAt || Date.now());
      showToast(`Đã đồng bộ ${parsed.data.count || parsed.data.words.length} từ N4 từ HanoiLink`, 'emerald');
    } catch (err: any) {
      showToast(err?.message || 'Lỗi đồng bộ nguồn HanoiLink', 'rose');
    } finally {
      setIsSyncingSource(false);
    }
  };

  // Core review action: Remember (Skip) vs Forgot (Scientific Repetition)
  const handleReviewWord = useCallback(
    async (remembered: boolean) => {
      if (!currentWordId || isSavingReview) return;
      const targetId = currentWordId;
      const existing = progressMapRef.current[targetId];

      setIsSavingReview(true);
      try {
        const res = await fetch(getApiEndpoint('/api/n4-vocab/review'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId || 'anonymous',
            wordId: targetId,
            remembered,
            currentProgress: existing,
          }),
        });

        const parsed = await safeFetchJson<{
          progress: N4VocabProgress;
          requeueOffset: number;
          serverSavedAt: number;
        }>(res);

        if (!parsed.ok || !parsed.data?.progress) {
          throw new Error(parsed.error || 'Không thể lưu trạng thái về backend.');
        }

        const updatedProgress = parsed.data.progress;
        const requeueOffset = parsed.data.requeueOffset || 3;

        const nextMap = {
          ...progressMapRef.current,
          [targetId]: updatedProgress,
        };
        setProgressMap(nextMap);
        mirrorToFirestore(nextMap);

        if (onRecordReview) {
          onRecordReview(remembered);
        }

        setSessionStats((prev) => ({
          reviewed: prev.reviewed + 1,
          remembered: prev.remembered + (remembered ? 1 : 0),
          forgotten: prev.forgotten + (!remembered ? 1 : 0),
        }));

        setIsFlipped(false);

        if (remembered) {
          // Remove word immediately from active queue ("từ nào nhớ bỏ qua")
          setSessionQueue((prev) => prev.filter((id) => id !== targetId));
          showToast('Đã nhớ · Bỏ qua từ này (Đã lưu Backend)', 'emerald');
        } else {
          // Re-insert word scientifically N cards ahead in queue ("dùng cơ chế lặp lại khoa học")
          setSessionQueue((prev) => {
            const rest = prev.slice(1);
            if (rest.length === 0) {
              return [targetId];
            }
            const insertIdx = Math.min(rest.length, Math.max(1, requeueOffset));
            const next = [...rest];
            next.splice(insertIdx, 0, targetId);
            return next;
          });
          showToast(
            `Quên (${updatedProgress.forgotCount} lần) · Sẽ lặp lại sau ${Math.min(Math.max(1, sessionQueue.length - 1), requeueOffset)} từ`,
            'rose'
          );
        }
      } catch (err: any) {
        showToast(err?.message || 'Lỗi kết nối backend khi lưu từ', 'rose');
      } finally {
        setIsSavingReview(false);
      }
    },
    [currentWordId, isSavingReview, userId, mirrorToFirestore, onRecordReview, sessionQueue.length, showToast]
  );

  // Restore a skipped word back to active review or quickly skip from browse list
  const handleToggleSkipFromList = async (wordId: string, shouldSkip: boolean) => {
    try {
      const res = await fetch(getApiEndpoint('/api/n4-vocab/review'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          wordId,
          remembered: shouldSkip,
          action: shouldSkip ? 'skip' : 'restore',
          currentProgress: progressMapRef.current[wordId],
        }),
      });
      const parsed = await safeFetchJson<{ progress: N4VocabProgress }>(res);
      if (!parsed.ok || !parsed.data?.progress) {
        throw new Error(parsed.error || 'Không thể cập nhật trạng thái từ vựng');
      }
      const nextMap = {
        ...progressMapRef.current,
        [wordId]: parsed.data.progress,
      };
      setProgressMap(nextMap);
      mirrorToFirestore(nextMap);
      showToast(shouldSkip ? 'Đã đánh dấu Nhớ · Bỏ qua' : 'Đã đưa từ trở lại danh sách ôn tập', 'neutral');
    } catch (err: any) {
      showToast(err?.message || 'Lỗi cập nhật backend', 'rose');
    }
  };

  // Reset progress for selected topic or all topics
  const handleResetProgress = async () => {
    const wordIdsToReset = selectedTopicId === 'all' ? null : topicWords.map((w) => w.id);
    try {
      const res = await fetch(getApiEndpoint('/api/n4-vocab/reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          wordIds: wordIdsToReset,
        }),
      });
      const parsed = await safeFetchJson<{ progressMap: Record<string, N4VocabProgress> }>(res);
      if (!parsed.ok || !parsed.data) {
        throw new Error(parsed.error || 'Không thể đặt lại tiến độ');
      }

      const nextMap = parsed.data.progressMap || {};
      setProgressMap(nextMap);
      mirrorToFirestore(nextMap);
      setConfirmResetOpen(false);
      setSessionQueue(buildQueueIds(activeTab, selectedTopicId, isShuffled, nextMap));
      setIsFlipped(false);
      showToast(
        selectedTopicId === 'all' ? 'Đã đặt lại tiến độ toàn bộ 424 từ N4' : 'Đã đặt lại tiến độ chủ đề hiện tại',
        'neutral'
      );
    } catch (err: any) {
      showToast(err?.message || 'Lỗi đặt lại tiến độ trên backend', 'rose');
    }
  };

  // Keyboard shortcuts during single-word study
  useEffect(() => {
    if (activeTab !== 'study' && activeTab !== 'forgotten') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleReviewWord(false);
      } else if (e.key === '2') {
        e.preventDefault();
        handleReviewWord(true);
      } else if ((e.key === 'r' || e.key === 'R') && currentWord) {
        e.preventDefault();
        playTTS(currentWord.kanji || currentWord.reading);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, handleReviewWord, currentWord]);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
  };

  const filteredListWords = useMemo(() => {
    let base = topicWords;
    if (activeTab === 'skipped') {
      base = topicWords.filter((w) => progressMap[w.id]?.status === 'skipped');
    }
    const q = browseQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (w) =>
        w.kanji.toLowerCase().includes(q) ||
        w.reading.toLowerCase().includes(q) ||
        w.romaji.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q)
    );
  }, [topicWords, activeTab, progressMap, browseQuery]);

  const isStudyView = activeTab === 'study' || activeTab === 'forgotten';
  const completionPct =
    scopeCounts.total > 0 ? Math.round((scopeCounts.skipped / scopeCounts.total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-theme-subtle border-t-theme-accent rounded-full animate-spin" />
        <p className="text-sm text-theme-primary/70">Đang tải dữ liệu từ vựng N4 từ backend...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-xl mx-auto w-full px-4 py-12">
        <div className="bg-theme-panel border border-rose-500/40 rounded-2xl p-6 text-center space-y-4">
          <h2 className="text-lg font-bold text-theme-primary">Không thể tải từ vựng N4</h2>
          <p className="text-sm text-rose-500">{errorMsg}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 bg-theme-accent text-theme-inverted text-xs font-bold rounded-lg cursor-pointer"
            >
              Thử lại
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-theme-subtle text-theme-primary text-xs font-semibold rounded-lg cursor-pointer"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-3 sm:px-6 pt-3 pb-28 sm:pb-8">
      {/* Compact Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg border border-theme-subtle bg-theme-panel hover:bg-theme-hover text-theme-primary transition-colors cursor-pointer shrink-0"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-serif font-bold text-theme-primary truncate">
              Ôn Chuyên Từ Vựng N4
            </h1>
            <div className="flex items-center gap-2 text-xs text-theme-primary/60 tabular-nums flex-wrap">
              <span>{words.length} từ nguồn HanoiLink</span>
              <span aria-hidden="true">·</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-theme-accent underline-offset-2 hover:underline"
              >
                <span>Nguồn học</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {syncedAt && (
                <>
                  <span aria-hidden="true" className="hidden sm:inline">·</span>
                  <span className="hidden sm:inline">Đã lưu Backend</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncSource}
            disabled={isSyncingSource}
            className="px-3 py-2 rounded-lg border border-theme-subtle bg-theme-panel hover:bg-theme-hover text-xs font-semibold text-theme-primary flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
            title="Cập nhật mới nhất từ hanoilink.vn về Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSource ? 'animate-spin' : ''}`} />
            <span>{isSyncingSource ? 'Đang tải...' : 'Đồng bộ nguồn'}</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen((prev) => !prev)}
            className="p-2 rounded-lg border border-theme-subtle bg-theme-panel hover:bg-rose-500/10 hover:text-rose-500 text-theme-primary/70 transition-colors cursor-pointer"
            title="Đặt lại tiến độ ôn tập"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Reset Confirmation (no browser confirm dialog) */}
      {confirmResetOpen && (
        <div className="mt-3 p-3 sm:p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-theme-primary">
            Đặt lại toàn bộ trạng thái <strong>Đã nhớ / Quên</strong> cho{' '}
            <strong>
              {selectedTopicId === 'all'
                ? 'tất cả 16 chủ đề N4'
                : topics.find((t) => t.id === selectedTopicId)?.title}
            </strong>{' '}
            trên Backend?
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetProgress}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
            >
              Xác nhận đặt lại
            </button>
            <button
              type="button"
              onClick={() => setConfirmResetOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-theme-subtle bg-theme-panel text-xs font-semibold text-theme-primary cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Filter & Segmented Mode Controls */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Segmented Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-theme-panel border border-theme-subtle rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('study')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'study'
                ? 'bg-theme-accent text-theme-inverted shadow-xs'
                : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            Ôn từng từ ({scopeCounts.remaining})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('forgotten')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'forgotten'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            Hay quên ({scopeCounts.forgottenLearning})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skipped')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'skipped'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            Đã nhớ ({scopeCounts.skipped})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-theme-hover text-theme-accent border border-theme-accent/40'
                : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            Tất cả ({scopeCounts.total})
          </button>
        </div>

        {/* Topic Dropdown & Shuffle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              aria-label="Chọn chủ đề N4"
              className="w-full sm:w-56 bg-theme-panel border border-theme-subtle text-theme-primary text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-theme-accent cursor-pointer"
            >
              <option value="all">Tất cả chủ đề ({words.length} từ)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.count})
                </option>
              ))}
            </select>
          </div>

          {isStudyView && (
            <button
              type="button"
              onClick={() => setIsShuffled((prev) => !prev)}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                isShuffled
                  ? 'border-theme-accent bg-theme-accent/15 text-theme-accent'
                  : 'border-theme-subtle bg-theme-panel text-theme-primary/70 hover:text-theme-primary'
              }`}
              title="Xáo trộn ngẫu nhiên thứ tự ôn tập"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden md:inline whitespace-nowrap">Trộn từ</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Strip & Feedback Toast */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-theme-primary/70 tabular-nums">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Đã nhớ/bỏ qua: <strong className="text-emerald-600 dark:text-emerald-400">{scopeCounts.skipped}/{scopeCounts.total}</strong> ({completionPct}%)
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Phiên này: <strong className="text-theme-primary">{sessionStats.reviewed}</strong> lượt
            </span>
          </div>

          {isStudyView && (
            <button
              type="button"
              onClick={() => setShowFrontReading((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-medium text-theme-primary/70 hover:text-theme-accent cursor-pointer whitespace-nowrap"
            >
              {showFrontReading ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showFrontReading ? 'Ẩn Hiragana' : 'Hiện Hiragana'}</span>
            </button>
          )}
        </div>

        <div className="w-full h-1.5 bg-theme-panel border border-theme-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Non-blocking status toast */}
      {inlineToast && (
        <div
          className={`mt-3 px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center justify-between transition-opacity ${
            inlineToast.tone === 'emerald'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : inlineToast.tone === 'rose'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              : 'bg-theme-panel border-theme-subtle text-theme-primary/80'
          }`}
        >
          <span>{inlineToast.text}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {isStudyView ? (
        currentWord ? (
          <div className="flex-1 flex flex-col justify-between mt-3 sm:mt-4 gap-4">
            {/* Single-Word Study Card */}
            <div
              onClick={() => setIsFlipped((prev) => !prev)}
              className="flex-1 min-h-[300px] sm:min-h-[360px] bg-theme-panel border border-theme-subtle rounded-2xl p-5 sm:p-8 flex flex-col justify-between cursor-pointer hover:border-theme-accent/60 transition-colors select-text"
            >
              {/* Unboxed clean metadata top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-theme-primary/65 flex-wrap">
                  <span className="font-semibold text-theme-accent">{currentWord.topicTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentWord.wordType}</span>
                  {currentProgress?.forgotCount ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                        Đã quên {currentProgress.forgotCount} lần
                      </span>
                    </>
                  ) : null}
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Còn {sessionQueue.length} từ</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, currentWord.kanji || currentWord.reading, currentWord.id)}
                    className="p-2 rounded-lg border border-theme-subtle text-theme-primary/70 hover:text-theme-accent hover:bg-theme-hover transition-colors cursor-pointer"
                    title="Sao chép từ vựng"
                  >
                    {copiedId === currentWord.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTTS(currentWord.kanji || currentWord.reading);
                    }}
                    className="p-2 rounded-lg border border-theme-subtle text-theme-primary/70 hover:text-theme-accent hover:bg-theme-hover transition-colors cursor-pointer"
                    title="Nghe phát âm (Phím R)"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Word Showcase Center */}
              <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
                <h2
                  className="font-serif font-bold text-theme-primary tracking-wide leading-tight break-words max-w-full"
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 4.25rem)' }}
                >
                  {currentWord.kanji || currentWord.reading}
                </h2>

                {(showFrontReading || isFlipped) &&
                  currentWord.reading &&
                  currentWord.reading !== currentWord.kanji && (
                    <div className="mt-2 text-xl sm:text-2xl font-serif text-theme-accent font-medium">
                      {currentWord.reading}
                    </div>
                  )}

                {isFlipped ? (
                  <div className="mt-6 pt-5 border-t border-theme-subtle w-full max-w-xl flex flex-col items-center gap-2">
                    {currentWord.romaji && (
                      <div className="text-xs sm:text-sm font-mono text-theme-primary/55">
                        {currentWord.romaji}
                      </div>
                    )}
                    <div className="text-xl sm:text-2xl font-bold text-theme-primary leading-snug">
                      {currentWord.meaning}
                    </div>
                    <div className="mt-2 text-xs text-theme-primary/60 tabular-nums">
                      {currentProgress?.status === 'learning'
                        ? `Đang lặp lại khoa học Ebbinghaus (Hệ số nhớ ${currentProgress.easeFactor.toFixed(1)})`
                        : 'Chọn "Nhớ — Bỏ qua" nếu bạn đã thuộc, hoặc "Quên" để hệ thống lặp lại khoa học.'}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-xs text-theme-primary/50">
                    Chạm vào thẻ hoặc nhấn phím Space để xem nghĩa tiếng Việt
                  </div>
                )}
              </div>

              {/* Quiet Card Footer */}
              <div className="pt-3 border-t border-theme-subtle/60 flex items-center justify-between text-[11px] text-theme-primary/50 tabular-nums">
                <span>Từ số #{currentWord.order}</span>
                <span className="hidden sm:inline">Phím tắt: Space (Lật) · 1 (Quên) · 2 (Nhớ - Bỏ qua) · R (Nghe)</span>
              </div>
            </div>

            {/* Pinned / Mobile-Friendly 2-Button Action Dock */}
            <div className="fixed bottom-0 left-0 right-0 sm:static z-20 bg-theme-panel/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 border-theme-subtle px-3 py-3 sm:p-0">
              <div className="max-w-5xl mx-auto flex flex-col gap-2">
                {!isFlipped && (
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)}
                    className="w-full py-2.5 rounded-xl border border-theme-subtle bg-theme-panel hover:bg-theme-hover text-xs font-semibold text-theme-primary transition-colors cursor-pointer sm:hidden"
                  >
                    Xem nghĩa tiếng Việt
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    disabled={isSavingReview}
                    onClick={() => handleReviewWord(false)}
                    className="min-h-[52px] px-4 py-3 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span className="truncate">Quên · Lặp lại</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingReview}
                    onClick={() => handleReviewWord(true)}
                    className="min-h-[52px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">Nhớ · Bỏ qua</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Completed / Empty Queue State */
          <div className="my-auto py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-serif font-bold text-theme-primary">
              {activeTab === 'forgotten'
                ? 'Không còn từ N4 nào bị đánh dấu Quên!'
                : 'Tuyệt vời! Bạn đã nhớ hết chủ đề này'}
            </h2>
            <p className="text-xs sm:text-sm text-theme-primary/70 leading-relaxed">
              {activeTab === 'forgotten'
                ? 'Mọi từ hay quên trong phạm vi đã chọn đều đã được phục hồi và bỏ qua.'
                : `Toàn bộ ${scopeCounts.total} từ trong lựa chọn hiện tại đã được đánh dấu "Nhớ · Bỏ qua" và lưu về Backend.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {activeTab === 'forgotten' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('study')}
                  className="px-4 py-2.5 rounded-xl bg-theme-accent text-theme-inverted text-xs font-bold cursor-pointer"
                >
                  Chuyển sang Ôn từng từ
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('skipped')}
                    className="px-4 py-2.5 rounded-xl border border-theme-subtle bg-theme-panel text-xs font-semibold text-theme-primary cursor-pointer"
                  >
                    Xem các từ đã bỏ qua
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-theme-accent text-theme-inverted text-xs font-bold cursor-pointer"
                  >
                    Ôn lại từ đầu
                  </button>
                </>
              )}
            </div>
          </div>
        )
      ) : (
        /* Skipped / Browse All List View */
        <div className="mt-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-theme-primary/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={browseQuery}
              onChange={(e) => setBrowseQuery(e.target.value)}
              placeholder="Tìm Kanji, Hiragana, Romaji hoặc nghĩa tiếng Việt..."
              className="w-full bg-theme-panel border border-theme-subtle rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-theme-primary placeholder:text-theme-primary/40 focus:outline-none focus:border-theme-accent"
            />
          </div>

          {filteredListWords.length === 0 ? (
            <div className="py-12 text-center bg-theme-panel border border-theme-subtle rounded-2xl text-xs sm:text-sm text-theme-primary/60">
              {activeTab === 'skipped'
                ? 'Chưa có từ nào được đánh dấu Nhớ · Bỏ qua trong chủ đề này.'
                : 'Không tìm thấy từ vựng phù hợp.'}
            </div>
          ) : (
            <div className="bg-theme-panel border border-theme-subtle rounded-2xl divide-y divide-theme-subtle overflow-hidden">
              {filteredListWords.map((w) => {
                const p = progressMap[w.id];
                const isSkipped = p?.status === 'skipped';
                const forgotCount = p?.forgotCount || 0;
                return (
                  <div
                    key={w.id}
                    className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-theme-hover/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2.5 flex-wrap">
                        <span className="text-lg sm:text-xl font-serif font-bold text-theme-primary">
                          {w.kanji}
                        </span>
                        {w.reading && w.reading !== w.kanji && (
                          <span className="text-xs sm:text-sm text-theme-accent font-medium">
                            {w.reading}
                          </span>
                        )}
                        <span className="text-xs text-theme-primary/45 font-mono hidden sm:inline">
                          {w.romaji}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-theme-primary/85 mt-0.5">
                        {w.meaning}
                      </div>
                      <div className="text-[11px] text-theme-primary/50 mt-1 flex items-center gap-2 flex-wrap tabular-nums">
                        <span>{w.topicTitle}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {isSkipped
                            ? 'Đã nhớ · Bỏ qua'
                            : forgotCount > 0
                            ? `Đang lặp lại (Quên ${forgotCount} lần)`
                            : 'Chưa ôn'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => playTTS(w.kanji || w.reading)}
                        className="p-2 rounded-lg border border-theme-subtle text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSkipFromList(w.id, !isSkipped)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap border transition-colors ${
                          isSkipped
                            ? 'border-theme-subtle bg-theme-base text-theme-primary hover:border-theme-accent'
                            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {isSkipped ? 'Ôn lại' : 'Bỏ qua'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
