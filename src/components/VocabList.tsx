import { usePersistentState } from '../hooks/usePersistentState';
import { playAudioUrl, getApiEndpoint } from '../utils/playTTS';
import { safeFetchJson } from '../utils/safeFetch';
import { notify, confirmAction } from '../utils/feedback';
import {
  cleanMarkdownForDisplay,
  cleanTextForSearch,
  isDictionaryForm,
  getEffectiveCardAudioUrl,
  getEffectiveFormAudioUrl,
  syncDictionaryAudioOnCardUpload,
  syncDictionaryAudioOnFormUpload,
  sanitizeCardFormsAudio
} from '../utils/stringUtils';
import Markdown from 'react-markdown';
import { KanjiCard, KanjiExample } from '../types';
import { Eye, Trash2, Search, Upload, Download, Edit2, Check, X, Plus, Volume2, Brain, Sparkles, Loader2, CheckCircle2, Circle, Shuffle, Copy, Flame, Zap, Clock } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { scoreKanjiCardMatch } from '../utils/searchMatcher';
import { renderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from '../utils/highlight';
import { toRomaji } from 'wanakana';
import AudioUpload from './AudioUpload';
import { 
  getVerbTransitivity, 
  getBaseWordType, 
  getTransitivityBadgeStyle, 
  getTransitivityBadgeLabel 
} from '../utils/verbTransitivity';
import { ensureCompleteForms } from '../utils/verbConjugation';

export function getWordTypeBadgeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  const base = "text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ";
  if (type.startsWith("Động từ nhóm I")) {
    return base + "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
  } else if (type.startsWith("Động từ nhóm II")) {
    return base + "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300";
  } else if (type.startsWith("Động từ nhóm III")) {
    return base + "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300";
  } else if (type.startsWith("Danh từ")) {
    return base + "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  } else if (type.startsWith("Tính từ đuôi-i") || type.startsWith("Tính từ i")) {
    return base + "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  } else if (type.startsWith("Tính từ đuôi-na") || type.startsWith("Tính từ na")) {
    return base + "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";
  } else if (type.startsWith("Trạng từ")) {
    return base + "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300";
  } else if (type.startsWith("Ngữ pháp")) {
    return base + "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300";
  }
  return base + "bg-theme-base-alt text-theme-primary opacity-80 border border-theme-subtle";
}

export function WordTypeBadges({ 
  wordType, 
  kanji, 
  reading, 
  meaning, 
  badgeSize = "normal",
  className = "" 
}: { 
  wordType?: string; 
  kanji?: string; 
  reading?: string; 
  meaning?: string; 
  badgeSize?: "normal" | "small" | "large";
  className?: string; 
}) {
  if (!wordType && !kanji) return null;

  const transitivity = getVerbTransitivity(kanji, reading, meaning, wordType);
  const baseType = getBaseWordType(wordType);

  const padClass = badgeSize === "small" 
    ? "text-[10px] px-1.5 py-0.5" 
    : badgeSize === "large" 
    ? "text-xs px-2.5 py-1" 
    : "text-[10px] px-2.5 py-0.5";

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {baseType && (
        <span className={getWordTypeBadgeStyle(baseType, `${padClass} rounded-full border border-theme-subtle bg-theme-hover font-bold`)}>
          {baseType}
        </span>
      )}
      {transitivity && (
        <span className={`${getTransitivityBadgeStyle(transitivity)} ${padClass}`}>
          {getTransitivityBadgeLabel(transitivity)}
        </span>
      )}
    </div>
  );
}


interface VocabListProps {
  deck: KanjiCard[];
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<KanjiCard>) => void | Promise<void>;
  onImport: (cards: { kanji: string; reading: string; romaji?: string; meaning: string; sinoVietnamese?: string; kanjiExplanation?: string; example?: string; exampleTranslation?: string; wordType?: string }[]) => Promise<{added: number, updated: number}>;
  initialSearchQuery?: string;
  initialEditId?: string | null;
  editCardReq?: { id: string, ts: number } | null;
  viewCardReq?: { id: string, ts: number } | null;
  onStartSentenceReview?: (mode: 'JA_TO_VI' | 'VI_TO_JA', targetDeck?: any[] | null, forceAll?: boolean, isRandom?: boolean) => void;
}

function VocabCardExamples({ card, deck, playAudio, onEditCard }: { card: KanjiCard; deck: KanjiCard[]; playAudio: (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => void; onEditCard?: (card: KanjiCard) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!card.examples || card.examples.length === 0) return null;

  const ex = card.examples[currentIndex];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ex.sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : card.examples!.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev < card.examples!.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="mt-3 space-y-2 border-t border-theme-subtle pt-3 w-full sm:min-w-[300px] lg:min-w-[500px]">
      <HighlightProvider onEditCard={onEditCard}><div className="bg-theme-base-alt p-3 rounded-sm border border-theme-subtle group/ex relative">
        <div className="text-sm sm:text-base text-theme-primary opacity-90 mb-2 flex items-start gap-2 justify-between">
          <span title={ex.sentence}>{renderExampleHighlight(ex.sentence, card.kanji || card.reading, deck, card)}</span>
          <div className="flex items-center gap-1 shrink-0 -mt-0.5">
            <button
              onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
              className={`p-1.5 rounded-full transition-colors opacity-100 ${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'}`}
              title={ex.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
              }`}
              title={copied ? "Đã copy câu tiếng Nhật!" : "Copy câu tiếng Nhật"}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
          </div>
        </div>
        {(ex.reading || ex.romaji) && (
          <div className="flex gap-2 mb-1.5 mt-1">
            {ex.reading && <span className="text-xs text-theme-primary opacity-60 italic"><RelatedHighlight text={ex.reading} type="hiragana" /></span>}
            {ex.romaji && <span className="text-xs text-theme-primary opacity-60 italic"><RelatedHighlight text={ex.romaji} type="romaji" /></span>}
          </div>
        )}
        <div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={ex.translation}><HighlightVietnamese text={ex.translation || ""} /></div>
      </div></HighlightProvider>
      
      {card.examples.length > 1 && (
        <div className="flex justify-between items-center text-xs text-theme-primary/50 mt-1">
          <button onClick={handlePrev} className="px-2 py-1 hover:bg-theme-hover hover:text-theme-primary rounded transition-colors">&larr; Trước</button>
          <span>{currentIndex + 1} / {card.examples.length}</span>
          <button onClick={handleNext} className="px-2 py-1 hover:bg-theme-hover hover:text-theme-primary rounded transition-colors">Tiếp &rarr;</button>
        </div>

            )}
    </div>
  );
}

export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', initialEditId = null, editCardReq = null, viewCardReq = null, onStartSentenceReview }: VocabListProps) {
  const isAdmin = auth.currentUser?.email === 'nguyenthetrung200126@gmail.com';
  const [search, setSearch] = usePersistentState('app_vocablist_search', initialSearchQuery);
  const deferredSearch = React.useDeferredValue(search);
  const [filterType, setFilterType] = usePersistentState('app_vocablist_filterType', 'all');
  const [audioFilter, setAudioFilter] = usePersistentState<'all' | 'has_audio' | 'no_audio'>('app_vocablist_audioFilter', 'all');
  const [currentPage, setCurrentPage] = usePersistentState('app_vocablist_currentPage', 1);
  const itemsPerPage = 10;
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTab, setEditTab] = useState<'basic' | 'forms' | 'examples'>('basic');
  const [viewingCard, setViewingCard] = useState<KanjiCard | null>(null);
  const [copiedSentenceKey, setCopiedSentenceKey] = useState<string | null>(null);
  const editingIdRef = useRef<string | null>(null);
  const handledEditReqRef = useRef<string | null>(null);
  const handledViewReqRef = useRef<string | null>(null);

  const handleCopySentence = (e: React.MouseEvent, text: string, key: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedSentenceKey(key);
    setTimeout(() => {
      setCopiedSentenceKey(prev => prev === key ? null : prev);
    }, 2000);
  };

  // Sync initialSearchQuery if passed from parent navigation
  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearch(initialSearchQuery);
      setCurrentPage(1);
    }
  }, [initialSearchQuery]);

  const [editForm, setEditForm] = useState<Partial<Pick<KanjiCard, 'kanji' | 'reading' | 'romaji' | 'meaning' | 'sinoVietnamese' | 'kanjiExplanation' | 'example' | 'exampleTranslation' | 'examples' | 'wordType' | 'forms' | 'audioUrl' | 'hasAudio' | 'aiAutoFilledAt'>>>({});
  const editFormRef = useRef(editForm);
  editFormRef.current = editForm;
  editingIdRef.current = editingId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeAudioText, setActiveAudioText] = useState<string | null>(null);

  const playAudio = async (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    const clean = text?.trim() || '';
    if (clean) setActiveAudioText(clean);
    try {
      if (audioUrl) {
        await playAudioUrl(audioUrl, text);
      } else {
        // Tuyệt đối không phát bằng bộ phát âm thanh mặc định của Google nếu chưa có file mp3 hoàn chỉnh
        notify.warning('Mục này chưa có file MP3 phát âm hoàn chỉnh. Bạn hãy tải lên file MP3 chuẩn.');
      }
    } catch (err) {
      console.warn('Audio playback issue:', err);
    } finally {
      setTimeout(() => setActiveAudioText(null), 1200);
    }
  };

  const [uploadingMainAudio, setUploadingMainAudio] = useState(false);
  const [uploadingExIdx, setUploadingExIdx] = useState<number | null>(null);
  const [uploadingFormIdx, setUploadingFormIdx] = useState<number | null>(null);

  const uploadAudioFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('audio/')) {
      throw new Error('Vui lòng chọn file âm thanh (mp3, m4a, wav, v.v.)');
    }
    const uid = auth.currentUser?.uid;
    try {
      if (!uid) throw new Error("Chưa đăng nhập");
      const filename = `users/${uid}/audio/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);
      await Promise.race([
        uploadBytes(storageRef, file),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout khi upload Cloud")), 8000))
      ]);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.warn("Storage upload failed, falling back to Firestore", err);
      if (file.size > 800 * 1024) {
        throw new Error('File mp3 quá lớn (Vượt quá 800KB). Vui lòng dùng file nhẹ hơn.');
      }
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            if (uid) {
              const audioId = Date.now() + "_" + Math.random().toString(36).substring(7);
              const audioDocRef = doc(db, 'global_audio', audioId);
              await setDoc(audioDocRef, { data: reader.result as string, createdAt: Date.now() });
              resolve('firestore:' + audioId);
            } else {
              resolve(reader.result as string);
            }
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = () => reject(new Error("Lỗi đọc file âm thanh"));
        reader.readAsDataURL(file);
      });
    }
  };

  const handleUploadViewingCardMainAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewingCard) return;
    try {
      setUploadingMainAudio(true);
      const url = await uploadAudioFile(file);
      // Synchronize with any dictionary form(s)
      const updatedCard = syncDictionaryAudioOnCardUpload(viewingCard, url);
      const updates = { audioUrl: url, hasAudio: true, forms: updatedCard.forms };
      if (onUpdate) await onUpdate(viewingCard.id, updates);
      setViewingCard(updatedCard);
    } catch (err: any) {
      notify.error(err.message || 'Lỗi khi tải file âm thanh');
    } finally {
      setUploadingMainAudio(false);
      e.target.value = '';
    }
  };

  const handleUploadViewingCardExampleAudio = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !viewingCard) return;
    try {
      setUploadingExIdx(index);
      const url = await uploadAudioFile(file);
      const updatedExamples = [...(viewingCard.examples || [])];
      if (updatedExamples[index]) {
        updatedExamples[index] = { ...updatedExamples[index], audioUrl: url, hasAudio: true };
        const updates = { examples: updatedExamples };
        if (onUpdate) await onUpdate(viewingCard.id, updates);
        setViewingCard(prev => prev ? ({ ...prev, ...updates }) : null);
      }
    } catch (err: any) {
      notify.error(err.message || 'Lỗi khi tải file âm thanh');
    } finally {
      setUploadingExIdx(null);
      e.target.value = '';
    }
  };

  const handleUploadViewingCardSingleExampleAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewingCard) return;
    try {
      setUploadingExIdx(9999);
      const url = await uploadAudioFile(file);
      const updates = { audioUrl: url, hasAudio: true };
      if (onUpdate) await onUpdate(viewingCard.id, updates);
      setViewingCard(prev => prev ? ({ ...prev, ...updates }) : null);
    } catch (err: any) {
      notify.error(err.message || 'Lỗi khi tải file âm thanh');
    } finally {
      setUploadingExIdx(null);
      e.target.value = '';
    }
  };

  const handleUploadViewingCardFormAudio = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !viewingCard || !viewingCard.forms) return;
    try {
      setUploadingFormIdx(index);
      const url = await uploadAudioFile(file);
      const targetForm = viewingCard.forms[index];
      const isDict = isDictionaryForm(targetForm?.name, targetForm?.value, viewingCard.kanji, viewingCard.reading);

      let updatedCard: KanjiCard;
      if (isDict) {
        // Synchronize with main card only if genuinely Dictionary form
        const res = syncDictionaryAudioOnFormUpload(viewingCard, index, url);
        updatedCard = res.updatedCard;
      } else {
        // Non-dictionary form (Thể phủ định, Thể quá khứ, v.v.): STRICTLY ISOLATED to only this form!
        const updatedForms = [...viewingCard.forms];
        updatedForms[index] = { ...updatedForms[index], audioUrl: url, hasAudio: true };
        updatedCard = { ...viewingCard, forms: updatedForms };
      }
      if (onUpdate) await onUpdate(viewingCard.id, updatedCard);
      setViewingCard(updatedCard);
    } catch (err: any) {
      notify.error(err.message || 'Lỗi khi tải file âm thanh');
    } finally {
      setUploadingFormIdx(null);
      e.target.value = '';
    }
  };

  const handleDeleteViewingCardFormAudio = async (index: number) => {
    if (!viewingCard || !viewingCard.forms) return;
    try {
      const updatedForms = [...viewingCard.forms];
      if (updatedForms[index]) {
        const oldUrl = updatedForms[index].audioUrl;
        const targetForm = updatedForms[index];
        const isDict = isDictionaryForm(targetForm?.name, targetForm?.value, viewingCard.kanji, viewingCard.reading);
        const { audioUrl, hasAudio, ...rest } = updatedForms[index];
        updatedForms[index] = rest;

        let updatedCard = { ...viewingCard, forms: updatedForms };
        if (isDict && viewingCard.audioUrl === oldUrl) {
          updatedCard.audioUrl = null;
          updatedCard.hasAudio = false;
        }
        if (onUpdate) await onUpdate(viewingCard.id, updatedCard);
        setViewingCard(updatedCard);
      }
    } catch (err: any) {
      notify.error(err.message || 'Lỗi khi xóa file âm thanh');
    }
  };


  const [isFetchingOjad, setIsFetchingOjad] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchScope, setBatchScope] = useState<'missing' | 'never_ai'>('missing');
  const [batchLimit, setBatchLimit] = useState<10 | 20 | 50 | 'all'>('all');
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isStoppingBatch, setIsStoppingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    total: number;
    current: number;
    succeeded: number;
    failed: number;
    currentWord: string;
    finished: boolean;
    stoppedByQuota?: boolean;
    errorMessage?: string;
  }>({ total: 0, current: 0, succeeded: 0, failed: 0, currentWord: '', finished: false, stoppedByQuota: false });
  const stopBatchRef = useRef(false);

  const hasKanjiChar = (text: string) => /[\u4e00-\u9faf]/.test(text);

  const isCardNeverAiFilled = React.useCallback((card: KanjiCard) => {
    const word = (card.kanji || card.reading || '').trim();
    return Boolean(word) && !card.aiAutoFilledAt;
  }, []);

  const isCardMissingAiData = React.useCallback((card: KanjiCard) => {
    const word = (card.kanji || card.reading || '').trim();
    if (!word || card.aiAutoFilledAt) return false;

    const missingReading = !card.reading?.trim();
    const missingMeaning = !card.meaning?.trim();
    const missingWordType = !card.wordType?.trim();
    const missingExplanation = !card.kanjiExplanation?.trim();
    const missingSino = hasKanjiChar(word) && !card.sinoVietnamese?.trim();
    const missingExamples = !card.examples || card.examples.length === 0;
    const wt = card.wordType || '';
    const needsForms = wt.includes('Động từ') || wt === 'Danh từ' || wt === 'Tính từ i' || wt === 'Tính từ na';
    const missingForms = needsForms && (!card.forms || card.forms.length === 0);

    return (
      missingReading ||
      missingMeaning ||
      missingWordType ||
      missingExplanation ||
      missingSino ||
      missingExamples ||
      missingForms
    );
  }, []);

  const missingDataCards = React.useMemo(
    () => deck.filter(isCardMissingAiData),
    [deck, isCardMissingAiData]
  );

  const neverAiFilledCards = React.useMemo(
    () => deck.filter(isCardNeverAiFilled),
    [deck, isCardNeverAiFilled]
  );

  const openBatchModal = () => {
    setBatchScope(missingDataCards.length > 0 ? 'missing' : 'never_ai');
    setBatchLimit('all');
    setBatchProgress({ total: 0, current: 0, succeeded: 0, failed: 0, currentWord: '', finished: false, stoppedByQuota: false, errorMessage: undefined });
    setIsStoppingBatch(false);
    setShowBatchModal(true);
  };

  const fetchVocabFromAI = async (wordToQuery: string) => {
    let res: Response | null = null;
    let data: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        res = await fetch(getApiEndpoint('/api/generate-vocab'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: wordToQuery })
        });
        const parsed = await safeFetchJson(res);
        data = parsed.data || { error: parsed.error };
        if (parsed.ok) {
          if (data?.isFallback) {
            const fallbackErr: any = new Error('Hệ thống AI tạm thời không khả dụng.');
            fallbackErr.status = 503;
            throw fallbackErr;
          }
          return data;
        }
        // Do not retry non-transient client/quota/auth errors
        if (res.status === 429 || res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) {
          const fatalErr: any = new Error((data && data.error) || 'Lỗi lấy dữ liệu từ AI');
          fatalErr.status = res.status;
          fatalErr.code = data?.code;
          throw fatalErr;
        }
      } catch (fetchErr: any) {
        if (fetchErr?.status === 429 || fetchErr?.status === 400 || fetchErr?.status === 401 || fetchErr?.status === 403 || fetchErr?.status === 404) {
          throw fetchErr;
        }
        if (attempt === 2) throw fetchErr;
      }

      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 900));
      }
    }

    const err: any = new Error((data && data.error) || 'Lỗi lấy dữ liệu từ AI');
    err.status = res?.status || 500;
    err.code = data?.code;
    throw err;
  };

  const runBatchAutoFillAI = async () => {
    if (!onUpdate || isBatchRunning) return;
    const allEligible = (batchScope === 'missing' ? missingDataCards : neverAiFilledCards);
    const queue = batchLimit === 'all' ? allEligible.slice() : allEligible.slice(0, batchLimit);
    if (queue.length === 0) {
      notify.info('Tất cả từ vựng phù hợp đều đã được điền dữ liệu AI.');
      return;
    }

    stopBatchRef.current = false;
    setIsStoppingBatch(false);
    setIsBatchRunning(true);
    setBatchProgress({
      total: queue.length,
      current: 0,
      succeeded: 0,
      failed: 0,
      currentWord: queue[0].kanji || queue[0].reading || '',
      finished: false,
      stoppedByQuota: false,
      errorMessage: undefined
    });

    let succeeded = 0;
    let failed = 0;
    let consecutiveErrors = 0;
    let stoppedByQuota = false;
    let fatalErrorMsg: string | undefined;

    for (let i = 0; i < queue.length; i++) {
      if (stopBatchRef.current) break;
      const card = queue[i];
      const wordToQuery = (card.kanji || card.reading || '').trim();
      setBatchProgress({
        total: queue.length,
        current: i + 1,
        succeeded,
        failed,
        currentWord: wordToQuery,
        finished: false,
        stoppedByQuota: false,
        errorMessage: undefined
      });

      if (!wordToQuery) {
        failed++;
        continue;
      }

      try {
        const data = await fetchVocabFromAI(wordToQuery);
        consecutiveErrors = 0;

        const existingForms = card.forms || [];
        let incomingForms = Array.isArray(data.forms)
          ? data.forms.map((f: any) => {
              const prevMatch = existingForms.find(
                (ef) => (ef.name && f.name && ef.name === f.name) || (ef.value && f.value && ef.value === f.value)
              );
              return {
                ...f,
                id: prevMatch?.id || f.id || crypto.randomUUID(),
                ...(prevMatch?.audioUrl ? { audioUrl: prevMatch.audioUrl, hasAudio: true } : {}),
              };
            })
          : existingForms;

        incomingForms = ensureCompleteForms({
          word: wordToQuery || data.kanji || '',
          reading: card.reading?.trim() || data.reading || '',
          romaji: card.romaji?.trim() || data.romaji || '',
          meaning: card.meaning?.trim() || data.meaning || '',
          wordType: card.wordType?.trim() || data.wordType || '',
          forms: incomingForms
        });

        const existingExamples = card.examples || [];
        const incomingExamples =
          Array.isArray(data.examples) && data.examples.length > 0
            ? data.examples.map((ex: any) => {
                const prevMatch = existingExamples.find(
                  (ee) => ee.sentence && ex.sentence && ee.sentence.trim() === ex.sentence.trim()
                );
                return {
                  ...(prevMatch || {}),
                  ...ex,
                  id: prevMatch?.id || ex.id || crypto.randomUUID(),
                  ...(prevMatch?.audioUrl ? { audioUrl: prevMatch.audioUrl, hasAudio: true } : {}),
                };
              })
            : existingExamples;

        const updates: Partial<KanjiCard> = {
          reading: card.reading?.trim() ? card.reading : (data.reading ?? card.reading ?? ''),
          romaji: card.romaji?.trim() ? card.romaji : (data.romaji ?? card.romaji ?? ''),
          meaning: card.meaning?.trim() ? card.meaning : (data.meaning ?? card.meaning ?? ''),
          sinoVietnamese: card.sinoVietnamese?.trim()
            ? card.sinoVietnamese
            : (data.sinoVietnamese ?? card.sinoVietnamese ?? ''),
          kanjiExplanation: card.kanjiExplanation?.trim()
            ? card.kanjiExplanation
            : (data.kanjiExplanation ?? card.kanjiExplanation ?? ''),
          wordType: card.wordType?.trim() ? card.wordType : (data.wordType ?? card.wordType ?? ''),
          forms: incomingForms,
          examples: incomingExamples,
          aiAutoFilledAt: Date.now()
        };

        await onUpdate(card.id, updates);
        succeeded++;
      } catch (err: any) {
        const isQuota = err?.status === 429 || err?.code === 'QUOTA_EXHAUSTED';
        const isAuth = err?.status === 403 || err?.status === 401 || err?.code === 'API_KEY_ERROR';

        if (isQuota) {
          stoppedByQuota = true;
          fatalErrorMsg = err?.message || 'Đã hết hạn mức của gemini-4-hydrogen. Hệ thống đã dừng — các từ đã làm xong đã được lưu để hôm sau chạy tiếp.';
          setBatchProgress({
            total: queue.length,
            current: i,
            succeeded,
            failed,
            currentWord: wordToQuery,
            finished: false,
            stoppedByQuota: true,
            errorMessage: fatalErrorMsg
          });
          break;
        }

        failed++;
        consecutiveErrors++;
        if (isAuth || consecutiveErrors >= 3) {
          fatalErrorMsg = err?.message || 'Đã tạm dừng do AI gặp lỗi kết nối.';
          setBatchProgress({
            total: queue.length,
            current: i + 1,
            succeeded,
            failed,
            currentWord: wordToQuery,
            finished: false,
            stoppedByQuota: false,
            errorMessage: fatalErrorMsg
          });
          break;
        }
      }

      setBatchProgress({
        total: queue.length,
        current: i + 1,
        succeeded,
        failed,
        currentWord: wordToQuery,
        finished: false,
        stoppedByQuota: false,
        errorMessage: undefined
      });

      if (i < queue.length - 1 && !stopBatchRef.current) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    const stopped = stopBatchRef.current;
    stopBatchRef.current = false;
    setIsStoppingBatch(false);
    setIsBatchRunning(false);
    setBatchProgress(prev => ({
      ...prev,
      succeeded,
      failed,
      finished: true,
      stoppedByQuota,
      errorMessage: fatalErrorMsg
    }));

    if (stoppedByQuota) {
      notify.info(
        succeeded > 0
          ? `Đã lưu ${succeeded} từ bằng gemini-4-hydrogen và tạm dừng do hết hạn mức. Hôm sau bạn bấm chạy tiếp nhé!`
          : 'Đã hết hạn mức gemini-4-hydrogen. Vui lòng đợi hoặc hôm sau chạy tiếp nhé!'
      );
    } else if (fatalErrorMsg) {
      notify.error(fatalErrorMsg);
    } else if (stopped) {
      notify.info(`Đã dừng. Đã điền thành công ${succeeded} từ.`);
    } else if (failed === 0) {
      notify.success(`Đã AI tự động điền hoàn tất ${succeeded} từ vựng!`);
    } else {
      notify.warning(`Hoàn tất: ${succeeded} từ thành công, ${failed} từ lỗi.`);
    }
  };

  const autoFillAI = async () => {
    const wordToQuery = (editFormRef.current.kanji || '').trim();
    if (!wordToQuery) {
      notify.warning('Vui lòng nhập từ (Kanji/Hiragana) trước khi dùng AI tự động điền.');
      return;
    }
    const targetEditId = editingIdRef.current;
    
    try {
      setIsGeneratingAI(true);
      const data = await fetchVocabFromAI(wordToQuery);

      if (editingIdRef.current !== targetEditId) return;

      setEditForm(prev => {
        const currentKanji = (prev.kanji || wordToQuery || '').trim();
        let incomingForms = Array.isArray(data.forms) ? data.forms.map((f: any) => ({
          ...f,
          id: f.id || crypto.randomUUID()
        })) : (prev.forms || []);

        incomingForms = ensureCompleteForms({
          word: currentKanji || data.kanji || '',
          reading: data.reading || prev.reading || '',
          romaji: data.romaji || prev.romaji || '',
          meaning: data.meaning || prev.meaning || '',
          wordType: data.wordType || prev.wordType || '',
          forms: incomingForms
        });

        const incomingExamples = Array.isArray(data.examples) && data.examples.length > 0
          ? data.examples.map((ex: any) => ({
              id: ex.id || crypto.randomUUID(),
              ...ex
            }))
          : prev.examples;

        return {
          ...prev,
          reading: data.reading !== undefined ? data.reading : prev.reading,
          romaji: data.romaji !== undefined ? data.romaji : prev.romaji,
          meaning: data.meaning !== undefined ? data.meaning : prev.meaning,
          sinoVietnamese: data.sinoVietnamese !== undefined ? data.sinoVietnamese : prev.sinoVietnamese,
          kanjiExplanation: data.kanjiExplanation !== undefined ? data.kanjiExplanation : prev.kanjiExplanation,
          wordType: data.wordType !== undefined ? data.wordType : prev.wordType,
          forms: incomingForms,
          examples: incomingExamples,
          aiAutoFilledAt: Date.now()
        };
      });
      notify.success('Đã tự động điền thông tin từ AI! Bạn có thể xem lại ở từng tab.');
    } catch (error: any) {
      console.error(error);
      notify.error(error.message || 'Có lỗi xảy ra khi gọi AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const fetchOjadData = async () => {
    const wordToQuery = (editFormRef.current.kanji || '').trim();
    if (!wordToQuery) {
      notify.warning('Vui lòng nhập từ (Kanji/Hiragana) trước khi lấy dữ liệu OJAD.');
      return;
    }
    const targetEditId = editingIdRef.current;
    try {
      setIsFetchingOjad(true);
      const res = await fetch(getApiEndpoint(`/api/ojad?word=${encodeURIComponent(wordToQuery)}`));
      const parsed = await safeFetchJson(res);
      if (!parsed.ok || !parsed.data) throw new Error(parsed.error || 'Không thể lấy dữ liệu OJAD');
      const data = parsed.data;
      if (editingIdRef.current !== targetEditId) return;

      if (data.results && data.results.length > 0) {
         const result = data.results[0];
         const ojadForms = result.forms;
         
         const getFormMeaning = (formName: string, base: string) => {
            if (!base) return '';
            const lowerBase = base.toLowerCase();
            if (formName.includes('thể た')) return `đã ${lowerBase}`;
            if (formName.includes('thể ない')) return `không ${lowerBase}`;
            if (formName.includes('thể ば')) return `nếu ${lowerBase}`;
            if (formName.includes('sai khiến')) return `bắt / cho phép ${lowerBase}`;
            if (formName.includes('bị động') && !formName.includes('sai khiến')) return `bị / được ${lowerBase}`;
            if (formName.includes('mệnh lệnh')) return `hãy ${lowerBase} (ra lệnh)`;
            if (formName.includes('khả năng')) return `có thể ${lowerBase}`;
            if (formName.includes('thể よう')) return `hãy cùng / định ${lowerBase}`;
            if (formName.includes('thể て')) return `${lowerBase} rồi...`;
            return '';
         };

         setEditForm(prev => {
           const updatedForms = [...(prev.forms || [])];
           const baseMeaning = prev.meaning || '';
           ojadForms.forEach((f: any) => {
             const romajiValue = f.reading ? toRomaji(f.reading) : '';
             const formMeaning = getFormMeaning(f.name, baseMeaning);
             const existingIdx = updatedForms.findIndex(uf => uf.name === f.name);
             if (existingIdx !== -1) {
               updatedForms[existingIdx] = {
                 ...updatedForms[existingIdx],
                 value: f.value,
                 reading: f.reading,
                 romaji: romajiValue,
                 meaning: formMeaning
               };
             } else {
               updatedForms.push({ id: crypto.randomUUID(), name: f.name, value: f.value, reading: f.reading, romaji: romajiValue, meaning: formMeaning });
             }
           });
           const newWordType = prev.wordType || 'Động từ';
           return { ...prev, forms: updatedForms, wordType: newWordType };
         });
         notify.success('Đã cập nhật các thể chia từ OJAD!');
      } else {
         notify.warning('Không tìm thấy dữ liệu OJAD cho từ này.');
      }
    } catch (err) {
      console.error(err);
      notify.error('Lỗi kết nối hoặc lấy dữ liệu OJAD.');
    } finally {
      setIsFetchingOjad(false);
    }
  };

  const startEdit = (card: KanjiCard) => {
    editingIdRef.current = card.id;
    setEditingId(card.id);
    setEditTab('basic');
    setEditForm({
      kanji: card.kanji,
      reading: card.reading || '',
      romaji: card.romaji || '',
      sinoVietnamese: card.sinoVietnamese || '',
      kanjiExplanation: card.kanjiExplanation || '',
      meaning: card.meaning,
      example: card.example || '',
      exampleTranslation: card.exampleTranslation || '',
      examples: card.examples ? JSON.parse(JSON.stringify(card.examples)) : [], // Deep copy
      forms: card.forms ? JSON.parse(JSON.stringify(card.forms)) : [], // Deep copy
      wordType: card.wordType || '',
      audioUrl: card.audioUrl || null,
      hasAudio: card.hasAudio || !!card.audioUrl,
      aiAutoFilledAt: card.aiAutoFilledAt,
    });
  };

  React.useEffect(() => {
    const reqKey = editCardReq ? `req:${editCardReq.id}:${editCardReq.ts}` : initialEditId ? `init:${initialEditId}` : null;
    if (reqKey && handledEditReqRef.current !== reqKey) {
      const targetId = editCardReq?.id || initialEditId;
      const card = deck.find(c => c.id === targetId);
      if (card) {
        handledEditReqRef.current = reqKey;
        startEdit(card);
        setSearch(card.kanji || card.reading);
        setCurrentPage(1);
      }
    }
  }, [editCardReq, initialEditId, deck]);

  
  // Đồng bộ Realtime (Thời gian thực) từ Firebase về UI cho thẻ đang xem/sửa
  React.useEffect(() => {
    if (viewingCard) {
      const updatedCard = deck.find(c => c.id === viewingCard.id);
      if (updatedCard) {
         const sanitized = sanitizeCardFormsAudio(updatedCard);
         if (JSON.stringify(sanitized) !== JSON.stringify(viewingCard)) {
            setViewingCard(sanitized);
         }
      }
    }
  }, [deck]);

  React.useEffect(() => {
    if (editingId) {
       const updatedCard = deck.find(c => c.id === editingId);
       if (updatedCard) {
          setEditForm(prev => {
             let changed = false;
             let newForms = prev.forms ? [...prev.forms] : [];
             let newExamples = prev.examples ? [...prev.examples] : [];
             
             if (updatedCard.forms) {
                updatedCard.forms.forEach((cloudForm, idx) => {
                   if (cloudForm.audioUrl && newForms[idx] && !newForms[idx].audioUrl) {
                      newForms[idx] = { ...newForms[idx], audioUrl: cloudForm.audioUrl, hasAudio: true };
                      changed = true;
                   }
                });
             }
             if (updatedCard.examples) {
                updatedCard.examples.forEach((cloudEx, idx) => {
                   if (cloudEx.audioUrl && newExamples[idx] && !newExamples[idx].audioUrl) {
                      newExamples[idx] = { ...newExamples[idx], audioUrl: cloudEx.audioUrl, hasAudio: true };
                      changed = true;
                   }
                });
             }
             if (updatedCard.audioUrl && !prev.audioUrl) {
                return { ...prev, audioUrl: updatedCard.audioUrl, forms: newForms, examples: newExamples };
             }
             if (changed) {
                return { ...prev, forms: newForms, examples: newExamples };
             }
             return prev;
          });
       }
    }
  }, [deck]);

  React.useEffect(() => {
    const reqKey = viewCardReq ? `${viewCardReq.id}:${viewCardReq.ts}` : null;
    if (reqKey && handledViewReqRef.current !== reqKey) {
      const card = deck.find(c => c.id === viewCardReq!.id);
      if (card) {
        handledViewReqRef.current = reqKey;
        setViewingCard(sanitizeCardFormsAudio(card));
        setSearch(card.kanji || card.reading);
        setCurrentPage(1);
      }
    }
  }, [viewCardReq, deck]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showBatchModal) {
        if (!isBatchRunning) {
          setShowBatchModal(false);
        }
      } else if (editingId) {
        editingIdRef.current = null;
        setEditingId(null);
        setEditForm({});
      } else if (viewingCard) {
        setViewingCard(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showBatchModal, isBatchRunning, editingId, viewingCard]);

  const saveEdit = () => {
    if (!editingId) return;
    if (!String(editForm.kanji || '').trim() || !String(editForm.meaning || '').trim()) {
      notify.warning('Vui lòng nhập đầy đủ Từ vựng (Kanji) và Ý nghĩa!');
      return;
    }
    if (onUpdate) {
      const validExamples = editForm.examples?.filter(ex => String(ex.sentence || "").trim() || String(ex.translation || "").trim()).map(ex => ({
        id: ex.id || crypto.randomUUID(),
        sentence: String(ex.sentence || "").trim(),
        reading: String(ex.reading || "").trim() || '',
        romaji: String(ex.romaji || "").trim() || '',
        translation: String(ex.translation || "").trim(), audioUrl: ex.audioUrl || null, hasAudio: !!ex.audioUrl })) || [];
        
      const validForms = editForm.forms?.filter(f => String(f.name || "").trim() && String(f.value || "").trim()).map(f => ({
        id: f.id || crypto.randomUUID(),
        name: String(f.name || "").trim(), reading: String(f.reading || "").trim() || "", romaji: String(f.romaji || "").trim() || "", meaning: String(f.meaning || "").trim() || "",
        value: String(f.value || "").trim(), audioUrl: f.audioUrl || null, hasAudio: !!f.audioUrl })) || [];
        
      onUpdate(editingId, {
        kanji: String(editForm.kanji || "").trim(),
        reading: String(editForm.reading || "").trim() || '',
        romaji: String(editForm.romaji || "").trim() || '',
        sinoVietnamese: String(editForm.sinoVietnamese || "").trim() || '',
        kanjiExplanation: String(editForm.kanjiExplanation || "").trim() || '',
        meaning: String(editForm.meaning || "").trim(),
        example: String(editForm.example || "").trim() || '',
        exampleTranslation: String(editForm.exampleTranslation || "").trim() || '',
        examples: validExamples,
        forms: validForms,
        wordType: String(editForm.wordType || '').trim() || '', audioUrl: editForm.audioUrl || null, hasAudio: !!editForm.audioUrl,
        ...(editForm.aiAutoFilledAt ? { aiAutoFilledAt: editForm.aiAutoFilledAt } : {}) });
      editingIdRef.current = null;
      setEditingId(null);
      setEditForm({});
      notify.success('Đã lưu thay đổi từ vựng!');
    }
  };

  const cancelEdit = () => {
    editingIdRef.current = null;
    setEditingId(null);
    setEditForm({});
  };

  const filteredDeck = React.useMemo(() => {
    const q = String(deferredSearch || "").trim();

    // Deduplicate cards by id in deck first
    const seen = new Set<string>();
    const uniqueDeck: KanjiCard[] = [];
    for (const card of deck) {
      if (!card || !card.id) continue;
      if (!seen.has(card.id)) {
        seen.add(card.id);
        uniqueDeck.push(card);
      }
    }

    // 1. Filter by category/wordType and audio status
    const baseList = uniqueDeck.filter(c => {
      const matchesFilter = filterType === 'all' 
        || c.wordType === filterType 
        || (filterType.startsWith('Động từ') && (c.wordType?.startsWith(filterType) || false));
      let matchesAudio = true;
      if (audioFilter === 'has_audio') matchesAudio = !!c.audioUrl;
      else if (audioFilter === 'no_audio') matchesAudio = !c.audioUrl;
      return matchesFilter && matchesAudio;
    });

    if (!q) {
      return baseList;
    }

    // 2. Score each card using the Vietnamese & Japanese intelligent search matcher
    const scoredList: { card: KanjiCard; score: number }[] = [];
    for (const card of baseList) {
      const matchResult = scoreKanjiCardMatch(card, q);
      if (matchResult.matched) {
        scoredList.push({ card, score: matchResult.score });
      }
    }

    // 3. Sort descending by relevance score (exact phrase and whole words in meaning/Hán Việt first)
    scoredList.sort((a, b) => b.score - a.score);

    return scoredList.map(item => item.card);
  }, [deck, deferredSearch, filterType, audioFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDeck.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const hasActiveFilter = Boolean(search?.trim() || filterType !== 'all' || audioFilter !== 'all');

  const handleClearAllFilters = () => {
    setSearch('');
    setFilterType('all');
    setAudioFilter('all');
    setCurrentPage(1);
  };

  const uniqueWordTypes = React.useMemo(() => {
    return Array.from(new Set(deck.map(c => c.wordType).filter(Boolean)));
  }, [deck]);

  const handleExport = () => {
    const data = deck.map(d => ({
      Kanji: d.kanji,
      Reading: d.reading,
      "Hán Việt": d.sinoVietnamese || '',
      "Từ loại": d.wordType || '',
      Meaning: d.meaning,
      Example: d.example || '',
      "Ví dụ (Dịch)": d.exampleTranslation || ''
    }));
    
    const ws = data.length > 0 
      ? XLSX.utils.json_to_sheet(data) 
      : XLSX.utils.json_to_sheet([], { header: ["Kanji", "Reading", "Hán Việt", "Từ loại", "Meaning", "Example", "Ví dụ (Dịch)"] });
      
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vocab");
    XLSX.writeFile(wb, "KanjiFlow_Vocab.xlsx");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const importedCards = data.map((row: any) => ({
          kanji: String(row.Kanji || row.kanji || '').trim(),
          reading: String(row.Reading || row.reading || '').trim(),
          meaning: String(row.Meaning || row.meaning || '').trim(),
          wordType: String(row['Từ loại'] || row.wordType || row.Từ_loại || '').trim(),
          sinoVietnamese: String(row['Hán Việt'] || row.hanviet || row.sinoVietnamese || '').trim(),
          example: String(row.Example || row.example || row['Ví dụ'] || '').trim(),
          exampleTranslation: String(row['Ví dụ (Dịch)'] || row.exampleTranslation || row.ExampleTranslation || '').trim()
        })).filter(c => c.kanji !== '');

        if (importedCards.length > 0) {
          const result = await onImport(importedCards);
          notify.success(`Đã thêm ${result.added} từ vựng mới và cập nhật thông tin cho ${result.updated} từ đã có.`);
        } else {
          notify.warning('Không tìm thấy từ vựng hợp lệ trong file.');
        }
      } catch (err) {
        console.error("Lỗi khi import file Excel:", err);
        notify.error('Có lỗi xảy ra khi đọc file Excel.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-theme-primary font-bold mb-2 tracking-tight">Kho Từ Vựng</h2>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-theme-primary opacity-60 text-[11px] font-medium tracking-wide">
              {hasActiveFilter ? `Hiển thị ${filteredDeck.length} / ${deck.length} từ` : `Tổng cộng ${deck.length} từ`}
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 border border-amber-500/30 cursor-pointer shadow-xs"
                title="Bấm để hiển thị lại toàn bộ từ vựng"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xem tất cả ({deck.length} từ)</span>
              </button>
            )}
            <div className="h-4 w-px bg-theme-subtle hidden sm:block"></div>
            <button
              onClick={handleExport}
              className="text-xs font-medium text-theme-primary/60 hover:text-theme-accent bg-theme-base-alt hover:bg-theme-hover px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-theme-subtle hover:border-theme-accent/30 shadow-sm cursor-pointer"
            >
              <Download className="w-3 h-3" /> Xuất Excel
            </button>
            {onUpdate && deck.length > 0 && (
              <button
                type="button"
                onClick={openBatchModal}
                disabled={isBatchRunning}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                  missingDataCards.length > 0 || neverAiFilledCards.length > 0
                    ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/30 hover:bg-theme-accent hover:text-theme-inverted'
                    : 'bg-theme-base-alt text-theme-primary/65 border-theme-subtle hover:border-theme-accent/30 hover:text-theme-accent'
                }`}
                title="Chạy AI tự động điền hàng loạt cho các từ chưa có dữ liệu hoặc chưa từng chạy AI"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {missingDataCards.length > 0
                    ? `AI điền hàng loạt (${missingDataCards.length})`
                    : neverAiFilledCards.length > 0
                      ? `AI điền hàng loạt (${neverAiFilledCards.length})`
                      : 'AI điền hàng loạt (Đã đủ)'}
                </span>
              </button>
            )}
            {isAdmin && <button
          onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="text-xs font-medium text-theme-primary/60 hover:text-theme-accent bg-theme-base-alt hover:bg-theme-hover px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-theme-subtle hover:border-theme-accent/30 shadow-sm cursor-pointer"
            >
              <Upload className="w-3 h-3" /> {isImporting ? 'Đang Import...' : 'Nhập Excel'}
            </button>}
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImport}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
          <select
            value={audioFilter}
            onChange={(e) => { setAudioFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-theme-panel border border-theme-subtle text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all rounded-xl text-sm w-full sm:w-auto min-w-[160px] shadow-sm cursor-pointer hover:border-theme-accent/50"
          >
            <option value="all">Tất cả trạng thái MP3</option>
            <option value="has_audio">Đã có MP3</option>
            <option value="no_audio">Chưa có MP3</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-theme-panel border border-theme-subtle text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all rounded-xl text-sm w-full sm:w-auto min-w-[160px] shadow-sm cursor-pointer hover:border-theme-accent/50"
          >
            <option value="all">Tất cả loại từ</option>
            {uniqueWordTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-theme-accent opacity-50" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tiếng Việt (có/không dấu), Hán Việt, Kanji..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-11 pr-9 py-2.5 bg-theme-panel border border-theme-subtle text-theme-primary w-full sm:w-80 md:w-96 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all rounded-xl placeholder:text-theme-primary/40 text-sm shadow-sm hover:border-theme-accent/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setCurrentPage(1); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-primary/40 hover:text-theme-primary cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {deck.length === 0 ? (
        <div className="bg-theme-panel border border-theme-subtle p-16 text-center shadow-sm rounded-2xl">
          <div className="w-20 h-20 bg-theme-accent/10 border-theme-accent/20 flex items-center justify-center mx-auto mb-6 rounded-full">
            <Search className="w-8 h-8 text-theme-accent opacity-50" />
          </div>
          <p className="text-xl font-bold text-theme-primary mb-2">Chưa có từ vựng nào trong kho</p>
          <p className="text-theme-primary opacity-50 max-w-md mx-auto text-sm leading-relaxed tracking-wide">
            Đang tải dữ liệu từ Cloud hoặc kho từ chưa có từ nào. Bạn có thể thêm từ vựng mới hoặc nhập file Excel.
          </p>
        </div>
      ) : filteredDeck.length === 0 ? (
        <div className="bg-theme-panel border border-theme-subtle p-12 text-center shadow-sm rounded-2xl">
          <div className="w-16 h-16 bg-amber-500/10 border-amber-500/20 flex items-center justify-center mx-auto mb-4 rounded-full text-amber-600 dark:text-amber-400">
            <Search className="w-7 h-7" />
          </div>
          <p className="text-lg font-bold text-theme-primary mb-1">Không tìm thấy từ vựng nào khớp với bộ lọc</p>
          <p className="text-theme-primary/60 max-w-md mx-auto text-xs leading-relaxed mb-4">
            Kho hiện có <strong className="text-theme-accent font-bold">{deck.length} từ vựng</strong>. Các bộ lọc đang bật có thể làm ẩn kết quả.
          </p>
          <button
            type="button"
            onClick={handleClearAllFilters}
            className="px-5 py-2.5 bg-theme-accent text-theme-inverted font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-theme-accent-hover transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Xóa bộ lọc & Xem tất cả {deck.length} từ</span>
          </button>
        </div>
      ) : (
        <div className="bg-theme-panel border border-theme-subtle overflow-hidden shadow-md sm:rounded-[20px] rounded-xl">
          {/* Mobile Card List (Visible on iPhone & mobile < md) */}
          <div className="block md:hidden divide-y divide-theme-subtle">
            {filteredDeck.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage).map((card) => {
              const isEditingThis = editingId === card.id;
              return (
                <div key={`mob-${card.id}`} className={`p-4 flex flex-col gap-2.5 transition-colors ${isEditingThis ? 'bg-theme-accent/5 ring-1 ring-inset ring-theme-accent/30' : 'hover:bg-theme-hover/40'}`}>
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setViewingCard(card)}
                        className="text-2xl font-serif text-theme-primary bg-theme-base-alt px-3 py-1.5 rounded-xl shadow-xs border border-theme-subtle font-bold cursor-pointer hover:border-theme-accent transition-colors"
                      >
                        {card.kanji || card.reading}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-theme-primary/90">{card.reading || '---'}</span>
                        {card.romaji && <span className="text-[11px] font-mono text-theme-primary/50">[{card.romaji}]</span>}
                      </div>
                    </div>

                    {/* Audio & Quick Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => playAudio(e, card.kanji || card.reading, card.audioUrl)}
                        className={`p-2.5 rounded-full transition-all cursor-pointer ${
                          activeAudioText === (card.kanji || card.reading)?.trim()
                            ? 'text-theme-accent bg-theme-accent/20 ring-2 ring-theme-accent/50 animate-pulse'
                            : card.audioUrl 
                              ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' 
                              : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
                        }`}
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {card.isForgotten && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Flame className="w-3 h-3 fill-rose-500/40" />
                        Hay quên
                      </span>
                    )}
                    {card.sinoVietnamese && (
                      <span className="text-[10px] font-bold text-theme-accent uppercase tracking-widest border border-theme-accent/30 bg-theme-accent/10 px-2 py-0.5 rounded-full">
                        {card.sinoVietnamese}
                      </span>
                    )}
                    <WordTypeBadges
                      wordType={card.wordType}
                      kanji={card.kanji}
                      reading={card.reading}
                      meaning={card.meaning}
                    />
                  </div>

                  {/* Meaning */}
                  <div 
                    onClick={() => setViewingCard(card)}
                    className="text-sm text-theme-primary leading-snug font-medium cursor-pointer"
                  >
                    {card.meaning}
                  </div>

                  {/* Action Buttons row on Mobile */}
                  <div className="flex items-center justify-between pt-2 border-t border-theme-subtle/50 mt-1">
                    <button
                      onClick={() => setViewingCard(card)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-base-alt hover:bg-theme-hover text-theme-primary/80 hover:text-theme-accent text-xs font-semibold border border-theme-subtle transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {onStartSentenceReview && (
                        <button
                          onClick={() => onStartSentenceReview('VI_TO_JA', [card], true, true)}
                          className="p-2 text-theme-primary/60 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Luyện dịch câu này"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleCopySentence(e, card.kanji || card.reading, `mob-copy-${card.id}`)}
                        className="p-2 text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover rounded-lg transition-colors cursor-pointer"
                        title="Sao chép từ"
                      >
                        {copiedSentenceKey === `mob-copy-${card.id}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => startEdit(card)}
                            className="p-2 text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover rounded-lg transition-colors cursor-pointer"
                            title="Sửa từ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await confirmAction({
                                title: 'Xóa thẻ từ vựng?',
                                message: `Bạn có chắc chắn muốn xóa từ "${card.kanji || card.reading}" khỏi kho từ vựng không?`,
                                confirmText: 'Xóa thẻ',
                                danger: true,
                              });
                              if (ok && onRemove) {
                                onRemove(card.id);
                                notify.success('Đã xóa thẻ từ vựng.');
                              }
                            }}
                            className="p-2 text-theme-primary/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (Hidden on screens < md, visible md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-theme-base-alt/50 border-b border-theme-subtle">
                  <th className="px-6 py-4 text-xs text-theme-primary/60 font-semibold tracking-wider">Từ vựng</th>
                  <th className="px-6 py-4 text-xs text-theme-primary/60 font-semibold tracking-wider">Cách đọc / Nghĩa</th>
                  <th className="hidden">Tiến trình (SRS)</th>
                  <th className="px-6 py-4 text-xs text-theme-primary/60 font-semibold tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-subtle">
                {filteredDeck.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage).map((card) => {
                  const endOfToday = new Date();
                  endOfToday.setHours(23, 59, 59, 999);
                  const isDue = card.nextReviewDate <= endOfToday.getTime();
                  const isEditingThis = editingId === card.id;

                  return (
                    <tr key={`desk-${card.id}`} className={`transition-colors group ${isEditingThis ? 'bg-theme-accent/5 ring-1 ring-inset ring-theme-accent/30' : 'hover:bg-theme-hover'}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl font-serif text-theme-primary bg-theme-base-alt px-3 py-1.5 rounded-xl shadow-sm border border-theme-subtle/50 inline-block">{card.kanji}</div>
                          <div className="flex flex-col items-center gap-0.5">
    <button
      id={`audio-btn-${card.id}`}
      onClick={(e) => playAudio(e, card.kanji || card.reading, card.audioUrl)}
      className={`p-1.5 rounded-full transition-all duration-200 opacity-100 ${
        activeAudioText === (card.kanji || card.reading)?.trim()
          ? 'scale-110 text-theme-accent bg-theme-accent/25 ring-2 ring-theme-accent/50 animate-pulse'
          : card.audioUrl 
            ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20 hover:scale-105 active:scale-95' 
            : 'text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover hover:scale-105 active:scale-95'
      }`}
      title={card.audioUrl ? "Nghe file âm thanh MP3 (Inworld AI)" : "Nghe phát âm"}
    >
      <Volume2 className={`w-4 h-4 ${activeAudioText === (card.kanji || card.reading)?.trim() ? 'animate-pulse' : ''}`} />
    </button>
    {card.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
  </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 min-w-[200px] sm:min-w-[auto]">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="text-xs font-serif text-theme-primary italic opacity-60 tracking-wide break-all sm:break-normal">{card.reading || '---'}</div>
                          {card.romaji && (
                            <div className="text-xs font-serif text-theme-primary opacity-50 italic">{card.romaji}</div>
                          )}
                          <WordTypeBadges 
                            wordType={card.wordType} 
                            kanji={card.kanji} 
                            reading={card.reading} 
                            meaning={card.meaning} 
                            badgeSize="small" 
                          />
                          {card.sinoVietnamese && (
                            <span className="text-[10px] text-theme-accent uppercase tracking-widest border border-theme-accent/30 px-1.5 py-0.5 rounded-sm">{card.sinoVietnamese}</span>
                          )}
                        </div>
                        <div className="text-sm tracking-widest uppercase text-theme-primary font-light break-words whitespace-pre-wrap w-full sm:min-w-[300px] lg:min-w-[500px]">{card.meaning}</div>
                        { (card.kanjiExplanation || card.wordType) && (
                          <div className="mt-2 text-xs text-theme-primary font-sans opacity-80 leading-relaxed w-full sm:min-w-[300px] lg:min-w-[500px] markdown-body whitespace-pre-wrap">
                            <Markdown>{(card.wordType ? `**Loại từ: ${card.wordType}**\n\n` : "") + cleanMarkdownForDisplay(card.kanjiExplanation || "")}</Markdown>
                          </div>
                        )}
                        
                        {/* Display multiple examples if present */}
                        {card.examples && card.examples.length > 0 ? (
                          <VocabCardExamples card={card} deck={deck} playAudio={playAudio} onEditCard={startEdit} />
                        ) : (
                          /* Legacy single example fallback */
                          (card.example || card.exampleTranslation) && (
                            <div className="mt-3 space-y-2 border-t border-theme-subtle pt-3 w-full sm:min-w-[300px] lg:min-w-[500px]">
                              <HighlightProvider onEditCard={startEdit}><div className="bg-theme-base-alt p-3 rounded-sm border border-theme-subtle group/ex relative">
                                {card.example && (
                                  <div className="text-sm sm:text-base text-theme-primary opacity-90 mb-2 flex items-start gap-2 justify-between">
                                    <span title={card.example}>{renderExampleHighlight(card.example, card.kanji || card.reading, deck, card)}</span>
                                    <div className="flex items-center gap-1 shrink-0 -mt-0.5">
                                      <button
                                        onClick={(e) => playAudio(e, card.example!, card.audioUrl)}
                                        className={`p-1.5 rounded-full transition-colors opacity-100 ${card.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'}`}
                                        title={card.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
                                      >
                                        <Volume2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopySentence(e, card.example!, `card-${card.id}-ex`)}
                                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                          copiedSentenceKey === `card-${card.id}-ex`
                                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                            : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
                                        }`}
                                        title={copiedSentenceKey === `card-${card.id}-ex` ? "Đã copy câu tiếng Nhật!" : "Copy câu tiếng Nhật"}
                                      >
                                        {copiedSentenceKey === `card-${card.id}-ex` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                      {card.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">MP3</span>}
                                    </div>
                                  </div>
                                )}
                                {card.exampleTranslation && (
                                  <div className="text-xs sm:text-sm text-theme-accent opacity-80 italic" title={card.exampleTranslation}><HighlightVietnamese text={card.exampleTranslation || ""} /></div>
                                )}
                              </div></HighlightProvider>
                            </div>
                          )
                        )}
                      </td>
                      <td className="hidden">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1 bg-theme-active overflow-hidden border border-theme-base">
                              <div 
                                className="h-full bg-theme-accent" 
                                style={{ width: `${Math.min(100, (card.interval / 30) * 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-serif text-theme-accent opacity-80">{Number(card.interval) || 0} Ngày</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase">
                            <span className={isDue ? "text-red-500 font-medium" : "text-theme-primary opacity-50"}>
                              {isDue ? 'Cần Ôn Ngay' : `Sau ${Math.ceil((card.nextReviewDate - Date.now()) / (1000 * 60 * 60 * 24))} ngày`}
                            </span>
                            <span className="text-theme-inverted">|</span>
                            <span className="text-theme-primary opacity-40 italic font-serif">Độ khó: {(Number(card.easeFactor) || 2.5).toFixed(1)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <button 
                          onClick={() => setViewingCard(card)}
                          className="p-2 hover:bg-blue-500/10 text-theme-primary/40 hover:text-blue-500 transition-all rounded-xl inline-flex items-center justify-center mr-1"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && <button 
                          onClick={() => startEdit(card)}
                          className="p-2 hover:bg-theme-accent/10 text-theme-primary/40 hover:text-theme-accent transition-all rounded-xl inline-flex items-center justify-center mr-1"
                          title="Sửa thẻ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>}
                        {isAdmin && <button
                        onClick={async () => {
                          const ok = await confirmAction({
                            title: 'Xóa thẻ từ vựng?',
                            message: `Bạn có chắc chắn muốn xóa từ "${card.kanji || card.reading}" khỏi kho từ vựng không?`,
                            confirmText: 'Xóa thẻ',
                            danger: true,
                          });
                          if (ok) {
                            onRemove(card.id);
                            notify.success('Đã xóa thẻ từ vựng.');
                          }
                        }}
                          className="p-2 hover:bg-red-500/10 text-theme-primary/40 hover:text-red-500 transition-all rounded-xl inline-flex items-center justify-center cursor-pointer"
                          title="Xóa thẻ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredDeck.length > itemsPerPage && (
            <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-theme-subtle/50 bg-theme-base-alt/30">
              <div className="text-xs text-theme-muted text-center sm:text-left">
                Hiển thị {(safeCurrentPage - 1) * itemsPerPage + 1} - {Math.min(safeCurrentPage * itemsPerPage, filteredDeck.length)} trong {filteredDeck.length} từ
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 bg-theme-panel border border-theme-subtle hover:bg-theme-hover hover:border-theme-accent/50 disabled:opacity-50 disabled:hover:bg-theme-panel text-theme-primary transition-all text-sm rounded-xl shadow-sm cursor-pointer"
                >
                  Trước
                </button>
                <button
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 bg-theme-panel border border-theme-subtle hover:bg-theme-hover hover:border-theme-accent/50 disabled:opacity-50 disabled:hover:bg-theme-panel text-theme-primary transition-all text-sm rounded-xl shadow-sm cursor-pointer"
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {viewingCard && (
        <div id="view-card-modal-overlay" className="fixed inset-0 bg-theme-base z-50 flex flex-col w-full h-full overflow-hidden pb-safe">
          <div className="bg-theme-base w-full h-full flex flex-col relative overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            {/* Header / Main Vocab */}
            <div className="sticky top-0 bg-theme-panel/95 backdrop-blur z-20 border-b border-theme-subtle px-4 sm:px-8 py-3.5 sm:py-4 pt-safe flex flex-col sm:flex-row justify-between items-start gap-3 shrink-0 shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-4xl md:text-5xl font-serif text-theme-accent">{viewingCard.kanji || viewingCard.reading}</h2>
                  
                  {/* Audio Controls for Main Word */}
                  {(() => {
                    const effectiveMainAudio = getEffectiveCardAudioUrl(viewingCard);
                    const isSharedFromDict = !viewingCard.audioUrl && !!effectiveMainAudio;

                    return (
                      <div className="flex items-center gap-1.5 bg-theme-base-alt/80 p-1 rounded-full border border-theme-subtle shadow-xs">
                        <button
                          onClick={(e) => playAudio(e, viewingCard.kanji || viewingCard.reading, effectiveMainAudio)}
                          className="p-2 bg-theme-accent/10 text-theme-accent rounded-full hover:bg-theme-accent hover:text-theme-inverted transition-colors cursor-pointer"
                          title={effectiveMainAudio ? (isSharedFromDict ? "Nghe file âm thanh MP3 (sài chung từ Thể từ điển ngắn)" : "Nghe file âm thanh MP3") : "Nghe phát âm"}
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        {effectiveMainAudio && (
                          <span className="text-[9px] font-bold text-theme-accent uppercase tracking-widest px-1">
                            MP3{isSharedFromDict ? ' (CHUNG)' : ''}
                          </span>
                        )}

                        {/* Nút Upload MP3 cho từ vựng chính */}
                        <label
                          className={`p-2 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                            effectiveMainAudio
                              ? 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/40 shadow-xs'
                          }`}
                          title={effectiveMainAudio ? "Đổi file MP3 cho từ này (sài chung cả Thể từ điển ngắn)" : "Tải lên file MP3 phát âm cho từ này (sài chung cả Thể từ điển ngắn)"}
                        >
                          {uploadingMainAudio ? (
                            <Loader2 className="w-5 h-5 animate-spin text-theme-accent" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            disabled={uploadingMainAudio}
                            onChange={handleUploadViewingCardMainAudio}
                          />
                        </label>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {viewingCard.kanji && viewingCard.reading && viewingCard.kanji !== viewingCard.reading && (
                    <span className="text-lg text-theme-primary opacity-80">{viewingCard.reading}</span>
                  )}
                  {viewingCard.romaji && (
                    <span className="text-sm font-mono text-theme-primary opacity-60">[{viewingCard.romaji}]</span>
                  )}
                  {viewingCard.sinoVietnamese && (
                    <span className="text-xs uppercase tracking-widest bg-theme-accent/10 text-theme-accent px-2 py-1 rounded-sm border border-theme-accent/20">
                      {viewingCard.sinoVietnamese}
                    </span>
                  )}
                  <WordTypeBadges 
                    wordType={viewingCard.wordType} 
                    kanji={viewingCard.kanji} 
                    reading={viewingCard.reading} 
                    meaning={viewingCard.meaning} 
                    badgeSize="large" 
                  />
                </div>
                <div className="text-xl text-theme-primary font-medium mt-3 uppercase tracking-wide">
                  {viewingCard.meaning}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={async () => {
                    const isNow = !viewingCard.isForgotten;
                    const updates = {
                      isForgotten: isNow,
                      forgottenAt: isNow ? Date.now() : viewingCard.forgottenAt,
                      forgottenCount: isNow ? (viewingCard.forgottenCount || 0) + 1 : viewingCard.forgottenCount,
                      difficultScore: isNow ? Math.min(-1, (viewingCard.difficultScore || 0) - 2) : viewingCard.difficultScore,
                    };
                    setViewingCard(prev => prev ? { ...prev, ...updates } : null);
                    if (onUpdate) await onUpdate(viewingCard.id, updates);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                    viewingCard.isForgotten
                      ? 'bg-rose-500/20 text-rose-500 border-rose-500/50 hover:bg-rose-500/30'
                      : 'bg-theme-base-alt text-theme-primary/75 hover:text-rose-500 border-theme-subtle hover:border-rose-500/40'
                  }`}
                  title={viewingCard.isForgotten ? "Đang gán nhãn HAY QUÊN (Bấm để gỡ bỏ)" : "Gán nhãn QUÊN"}
                >
                  <Flame className={`w-3.5 h-3.5 ${viewingCard.isForgotten ? 'text-rose-500 fill-rose-500/30' : 'text-theme-primary/60'}`} />
                  <span>{viewingCard.isForgotten ? 'Đã gán: Hay Quên' : 'QUÊN'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const cardToEdit = viewingCard;
                    setViewingCard(null);
                    startEdit(cardToEdit);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-theme-subtle bg-theme-base-alt hover:border-theme-accent hover:text-theme-accent text-theme-primary/80 transition-all cursor-pointer shadow-xs"
                  title="Chỉnh sửa nội dung từ vựng này"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>

                <button 
                  onClick={() => setViewingCard(null)}
                  className="p-2 text-theme-primary/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            </div>

            {/* Content Body */}
            <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-8">
              
              {/* Kanji Explanation */}
              {viewingCard.kanjiExplanation && (
                <div className="bg-theme-base-alt rounded-md p-5 border border-theme-subtle">
                  <h3 className="text-sm uppercase tracking-[0.2em] text-theme-accent opacity-80 mb-4 border-b border-theme-subtle pb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-theme-accent rounded-full"></span>
                    Giải thích Hán tự
                  </h3>
                  <div className="markdown-body text-sm leading-relaxed opacity-90">
                    <Markdown>{cleanMarkdownForDisplay(viewingCard.kanjiExplanation)}</Markdown>
                  </div>
                </div>
              )}

              {/* Forms / Conjugation */}
              {viewingCard.forms && viewingCard.forms.length > 0 && (
                <div className="bg-theme-base-alt rounded-md p-5 border border-theme-subtle">
                  <div className="flex items-center justify-between gap-2 border-b border-theme-subtle pb-2 mb-4 flex-wrap">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-theme-accent opacity-80 flex items-center gap-2">
                      <span className="w-1 h-4 bg-theme-accent rounded-full"></span>
                      Các thể / Chia thì
                    </h3>
                    <span className="text-[11px] text-theme-accent font-medium">
                      Chỉ riêng Thể từ điển (ngắn) tự động sài chung MP3 với từ vựng lớn. Thể phủ định, quá khứ,... hoàn toàn độc lập.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewingCard.forms.map((f, idx) => {
                      const isDict = isDictionaryForm(f.name, f.value, viewingCard.kanji, viewingCard.reading);
                      const effectiveFormAudio = getEffectiveFormAudioUrl(f, viewingCard.audioUrl, viewingCard.forms, viewingCard.kanji, viewingCard.reading);
                      const isShared = isDict && !f.audioUrl && !!viewingCard.audioUrl;

                      return (
                        <div key={idx} className="bg-theme-hover p-4 rounded-md border border-theme-subtle/50 flex flex-col gap-1.5 shadow-sm">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-theme-accent/70 bg-theme-panel inline-block w-max px-2 py-0.5 rounded-sm">
                              {f.name}
                            </span>
                            {isDict && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-theme-accent/15 text-theme-accent border border-theme-accent/25">
                                Sài chung MP3 (Thể từ điển)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xl font-serif text-theme-primary">{f.value}</span>
                            <div className="flex items-center gap-1 bg-theme-panel/90 p-0.5 rounded-full border border-theme-subtle">
                              <button
                                onClick={(e) => playAudio(e, f.value, effectiveFormAudio)}
                                className={`p-1.5 rounded-full transition-colors cursor-pointer ${effectiveFormAudio ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel bg-theme-base'}`}
                                title={effectiveFormAudio ? (isShared ? "Nghe phát âm (sài chung MP3 từ vựng lớn)" : "Nghe file MP3") : "Nghe phát âm"}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              {effectiveFormAudio && <span className="text-[7px] font-bold text-theme-accent uppercase leading-none tracking-widest px-0.5">MP3</span>}

                              <label
                                className={`p-1 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                                  effectiveFormAudio
                                    ? 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/40 shadow-xs'
                                }`}
                                title={isDict ? "Tải/Đổi file MP3 (sài chung & đồng bộ cả từ vựng lớn)" : (effectiveFormAudio ? "Đổi file MP3 riêng cho thể này" : "Tải lên file MP3 riêng cho thể này")}
                              >
                                {uploadingFormIdx === idx ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-theme-accent" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5" />
                                )}
                                <input
                                  type="file"
                                  accept="audio/*"
                                  className="hidden"
                                  disabled={uploadingFormIdx !== null}
                                  onChange={(e) => handleUploadViewingCardFormAudio(e, idx)}
                                />
                              </label>

                              {f.audioUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteViewingCardFormAudio(idx)}
                                  className="p-1 rounded-full text-theme-primary/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Xóa file MP3 của thể này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          {(f.reading || f.romaji) && (
                            <div className="text-[11px] text-theme-primary/60 mt-1 flex justify-between">
                              <span>{f.reading}</span>
                              <span className="font-mono">{f.romaji}</span>
                            </div>
                          )}
                          {f.meaning && (
                            <div className="text-xs text-theme-primary/80 italic mt-2 border-t border-theme-subtle/30 pt-2">
                              {f.meaning}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* Examples */}
              {(viewingCard.examples && viewingCard.examples.length > 0) || (viewingCard.example || viewingCard.exampleTranslation) ? (
                <div className="bg-theme-base-alt rounded-md p-5 border border-theme-subtle">
                  <div className="flex flex-wrap items-center justify-between border-b border-theme-subtle pb-2 mb-4 gap-2">
                    <h3 className="text-sm uppercase tracking-[0.2em] text-theme-accent opacity-80 flex items-center gap-2">
                      <span className="w-1 h-4 bg-theme-accent rounded-full"></span>
                      Các câu ví dụ
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        onStartSentenceReview?.('VI_TO_JA', [viewingCard], true, true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer group"
                      title="Luyện dịch các câu ví dụ của từ này từ Việt sang Nhật theo nguyên tắc khoa học SRS"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                      <span>Luyện dịch câu (Việt → Nhật SRS)</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {viewingCard.examples && viewingCard.examples.length > 0 ? (
                      viewingCard.examples.map((ex, idx) => (
                        <div key={idx} className="bg-theme-hover p-3.5 sm:p-5 rounded-md border-l-4 border-theme-accent relative group/ex shadow-sm flex flex-col">
                          <div className="sm:pr-44 text-base sm:text-lg text-theme-primary mb-3 flex flex-col gap-1.5 break-words">
                            <span className="font-serif leading-relaxed">
                              <HighlightProvider onEditCard={startEdit}>
                                {renderExampleHighlight(ex.sentence, viewingCard.kanji || viewingCard.reading, deck, viewingCard)}
                              </HighlightProvider>
                            </span>
                            {(ex.reading || ex.romaji) && (
                              <div className="text-sm opacity-60 italic mt-1 leading-relaxed">
                                {ex.reading && <span className="mr-3 inline-block">{ex.reading}</span>}
                                {ex.romaji && <span className="font-mono inline-block">[{ex.romaji}]</span>}
                              </div>
                            )}
                          </div>
                          <div className="text-sm sm:text-base text-theme-accent/90 italic border-t border-theme-subtle/50 pt-3 break-words">
                            <HighlightProvider onEditCard={startEdit}>
                              <HighlightVietnamese text={ex.translation || ""} />
                            </HighlightProvider>
                          </div>
                          <div className="mt-3 sm:mt-0 self-end sm:self-auto sm:absolute sm:top-4 sm:right-4 flex items-center flex-wrap gap-1.5 bg-theme-panel/90 p-1 rounded-full border border-theme-subtle shadow-xs">
                            <button
                              onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                              className={`p-2 rounded-full transition-colors cursor-pointer shadow-xs ${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'}`}
                              title={ex.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase tracking-widest px-0.5">MP3</span>}

                            <button
                              type="button"
                              onClick={(e) => handleCopySentence(e, ex.sentence, `view-ex-${idx}`)}
                              className={`p-2 rounded-full transition-all cursor-pointer shadow-xs ${
                                copiedSentenceKey === `view-ex-${idx}`
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
                              }`}
                              title={copiedSentenceKey === `view-ex-${idx}` ? "Đã copy câu tiếng Nhật!" : "Copy câu tiếng Nhật"}
                            >
                              {copiedSentenceKey === `view-ex-${idx}` ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartSentenceReview?.('VI_TO_JA', [viewingCard], true, true);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-full transition-all cursor-pointer shadow-xs"
                              title="Luyện dịch câu ví dụ này (Việt → Nhật theo nguyên tắc khoa học SRS)"
                            >
                              <Brain className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Dịch SRS</span>
                            </button>

                            {/* Nút Upload MP3 cho câu ví dụ */}
                            <label
                              className={`px-2.5 py-1 rounded-full cursor-pointer transition-all flex items-center gap-1 font-bold text-xs shadow-xs ${
                                ex.audioUrl
                                  ? 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover p-1.5'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/40'
                              }`}
                              title={ex.audioUrl ? "Đổi file MP3 cho ví dụ này" : "Tải lên file MP3 cho câu ví dụ này (Tuyệt đối không phát giọng Google)"}
                            >
                              {uploadingExIdx === idx ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-theme-accent" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              {!ex.audioUrl && <span>Tải MP3</span>}
                              <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                disabled={uploadingExIdx !== null}
                                onChange={(e) => handleUploadViewingCardExampleAudio(e, idx)}
                              />
                            </label>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-theme-hover p-3.5 sm:p-5 rounded-md border-l-4 border-theme-accent relative group/ex shadow-sm flex flex-col">
                        <div className="sm:pr-32 text-base sm:text-lg text-theme-primary mb-3 font-serif leading-relaxed break-words">
                          <HighlightProvider>
                            {renderExampleHighlight(viewingCard.example!, viewingCard.kanji || viewingCard.reading, deck, viewingCard)}
                          </HighlightProvider>
                        </div>
                        {viewingCard.exampleTranslation && (
                          <div className="text-sm sm:text-base text-theme-accent/90 italic border-t border-theme-subtle/50 pt-3 break-words">
                            <HighlightProvider>
                              <HighlightVietnamese text={viewingCard.exampleTranslation} />
                            </HighlightProvider>
                          </div>
                        )}
                        <div className="mt-3 sm:mt-0 self-end sm:self-auto sm:absolute sm:top-4 sm:right-4 flex items-center gap-1.5 bg-theme-panel/90 p-1 rounded-full border border-theme-subtle shadow-xs">
                          <button
                            onClick={(e) => playAudio(e, viewingCard.example!, viewingCard.audioUrl)}
                            className={`p-2 rounded-full transition-colors cursor-pointer shadow-xs ${viewingCard.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'}`}
                            title={viewingCard.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          {viewingCard.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase tracking-widest px-0.5">MP3</span>}

                          <button
                            type="button"
                            onClick={(e) => handleCopySentence(e, viewingCard.example!, 'view-ex-single')}
                            className={`p-2 rounded-full transition-all cursor-pointer shadow-xs ${
                              copiedSentenceKey === 'view-ex-single'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
                            }`}
                            title={copiedSentenceKey === 'view-ex-single' ? "Đã copy câu tiếng Nhật!" : "Copy câu tiếng Nhật"}
                          >
                            {copiedSentenceKey === 'view-ex-single' ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <label
                            className={`p-1.5 rounded-full cursor-pointer transition-all flex items-center justify-center ${
                              viewingCard.audioUrl
                                ? 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-hover'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/40 shadow-xs'
                            }`}
                            title={viewingCard.audioUrl ? "Đổi file MP3 cho ví dụ này" : "Tải lên file MP3 cho ví dụ này"}
                          >
                            {uploadingExIdx === 9999 ? (
                              <Loader2 className="w-4 h-4 animate-spin text-theme-accent" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              disabled={uploadingExIdx !== null}
                              onChange={handleUploadViewingCardSingleExampleAudio}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        </div>
      )}

      {/* Unified Edit Card Modal (Desktop & Mobile) */}
      {editingId && (
        <div
          id="edit-card-modal-overlay"
          onClick={cancelEdit}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-theme-panel border border-theme-subtle w-full sm:max-w-3xl h-[92dvh] sm:h-auto sm:max-h-[90dvh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Sticky Header */}
            <div className="px-4 sm:px-6 py-3.5 pt-safe border-b border-theme-subtle bg-theme-panel flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0 flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-theme-primary truncate">Sửa thẻ từ vựng</h3>
                {(editForm.kanji || editForm.reading) && (
                  <span className="text-sm sm:text-base font-serif font-bold text-theme-accent bg-theme-accent/10 border border-theme-accent/20 px-2.5 py-0.5 rounded-lg truncate max-w-[140px] sm:max-w-[220px]">
                    {editForm.kanji || editForm.reading}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={autoFillAI}
                  disabled={isGeneratingAI || !editForm.kanji?.trim()}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[38px] min-w-[146px] px-3 py-1.5 bg-theme-accent text-theme-inverted font-bold text-xs rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs whitespace-nowrap"
                  title="Tự động điền nghĩa, cách đọc, các thể và câu ví dụ bằng AI"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{isGeneratingAI ? 'Đang tạo AI...' : 'AI tự động điền'}</span>
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="p-2 min-h-[38px] min-w-[38px] inline-flex items-center justify-center text-theme-primary/55 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Segmented Tab Bar */}
            <div className="px-4 sm:px-6 py-2 bg-theme-base-alt/60 border-b border-theme-subtle flex items-center gap-1.5 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditTab('basic')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  editTab === 'basic'
                    ? 'bg-theme-accent text-theme-inverted shadow-xs'
                    : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
                }`}
              >
                Thông tin & Âm thanh
              </button>
              <button
                type="button"
                onClick={() => setEditTab('forms')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  editTab === 'forms'
                    ? 'bg-theme-accent text-theme-inverted shadow-xs'
                    : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
                }`}
              >
                <span>Các thể / Chia thì</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  editTab === 'forms' ? 'bg-black/20 text-theme-inverted' : 'bg-theme-base border border-theme-subtle text-theme-primary/70'
                }`}>
                  {editForm.forms?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setEditTab('examples')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  editTab === 'examples'
                    ? 'bg-theme-accent text-theme-inverted shadow-xs'
                    : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
                }`}
              >
                <span>Ví dụ</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  editTab === 'examples' ? 'bg-black/20 text-theme-inverted' : 'bg-theme-base border border-theme-subtle text-theme-primary/70'
                }`}>
                  {editForm.examples && editForm.examples.length > 0 ? editForm.examples.length : (editForm.example ? 1 : 0)}
                </span>
              </button>
            </div>

            {/* Modal Scrollable Body (overflow-anchor:none prevents scroll jumps when items change) */}
            <div className="flex-1 overflow-y-auto [overflow-anchor:none] p-4 sm:p-6 space-y-4 custom-scrollbar">
              {editTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-primary/65 mb-1.5">
                        Từ vựng (Kanji / Từ gốc) *
                      </label>
                      <input
                        value={editForm.kanji || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, kanji: e.target.value }))}
                        className="w-full bg-theme-base-alt border border-theme-subtle rounded-xl text-lg font-serif text-theme-primary px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:border-theme-accent"
                        placeholder="Ví dụ: 教える"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-primary/65 mb-1.5">
                        Cách đọc (Hiragana)
                      </label>
                      <input
                        value={editForm.reading || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, reading: e.target.value }))}
                        className="w-full bg-theme-base-alt border border-theme-subtle rounded-xl text-sm text-theme-primary px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:border-theme-accent"
                        placeholder="Ví dụ: おしえる"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-primary/65 mb-1.5">
                        Romaji
                      </label>
                      <input
                        value={editForm.romaji || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, romaji: e.target.value }))}
                        className="w-full bg-theme-base-alt border border-theme-subtle rounded-xl text-sm text-theme-primary px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:border-theme-accent"
                        placeholder="oshieru"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-primary/65 mb-1.5">
                        Hán Việt
                      </label>
                      <input
                        value={editForm.sinoVietnamese || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, sinoVietnamese: e.target.value }))}
                        className="w-full bg-theme-base-alt border border-theme-subtle rounded-xl text-sm text-theme-accent uppercase px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:border-theme-accent"
                        placeholder="GIÁO"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-primary/65 mb-1.5">
                        Loại từ
                      </label>
                      <select
                        value={editForm.wordType || ''}
                        onChange={e => {
                          const newWordType = e.target.value;
                          setEditForm(prev => {
                            let newForms = prev.forms || [];
                            if (newWordType.includes('Động từ') && newForms.length === 0) {
                              newForms = [
                                { id: crypto.randomUUID(), name: 'Thể từ điển (thể る)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể lịch sự (thể ます)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể て', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể quá khứ (thể た)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể phủ định (thể ない)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể quá khứ phủ định (thể なかった)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể khả năng', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể khả năng (phủ định)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể khả năng (quá khứ phủ định)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể điều kiện (thể ば/たら)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể ý chí (thể よう)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể mệnh lệnh', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể cấm chỉ (thể な)', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể sai khiến', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể bị động', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể bị động sai khiến', value: '', reading: '', romaji: '', meaning: '' },
                                { id: crypto.randomUUID(), name: 'Thể muốn (thể たい)', value: '', reading: '', romaji: '', meaning: '' }
                              ];
                            } else if (newWordType === 'Danh từ' && newForms.length === 0) {
                              const rootK = prev.kanji?.trim() || '';
                              const rootR = prev.reading?.trim() || '';
                              const rootRom = prev.romaji?.trim() || '';
                              const rootM = prev.meaning?.trim() || '';
                              newForms = [
                                { id: crypto.randomUUID(), name: 'Khẳng định hiện tại (thể ngắn - だ)', value: rootK ? `${rootK}だ` : '', reading: rootR ? `${rootR}だ` : '', romaji: rootRom ? `${rootRom} da` : '', meaning: rootM ? `là ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Khẳng định hiện tại (thể lịch sự - です)', value: rootK ? `${rootK}です` : '', reading: rootR ? `${rootR}です` : '', romaji: rootRom ? `${rootRom} desu` : '', meaning: rootM ? `là ${rootM} (lịch sự)` : '' },
                                { id: crypto.randomUUID(), name: 'Phủ định hiện tại (thể ngắn - ではない)', value: rootK ? `${rootK}ではない` : '', reading: rootR ? `${rootR}ではない` : '', romaji: rootRom ? `${rootRom} dewa nai` : '', meaning: rootM ? `không phải là ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Phủ định hiện tại (thể lịch sự - ではありません)', value: rootK ? `${rootK}ではありません` : '', reading: rootR ? `${rootR}ではありません` : '', romaji: rootRom ? `${rootRom} dewa arimasen` : '', meaning: rootM ? `không phải là ${rootM} (lịch sự)` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ khẳng định (thể ngắn - だった)', value: rootK ? `${rootK}だった` : '', reading: rootR ? `${rootR}だった` : '', romaji: rootRom ? `${rootRom} datta` : '', meaning: rootM ? `đã là ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ khẳng định (thể lịch sự - でした)', value: rootK ? `${rootK}でした` : '', reading: rootR ? `${rootR}でした` : '', romaji: rootRom ? `${rootRom} deshita` : '', meaning: rootM ? `đã là ${rootM} (lịch sự)` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ phủ định (thể ngắn - ではなかった)', value: rootK ? `${rootK}ではなかった` : '', reading: rootR ? `${rootR}ではなかった` : '', romaji: rootRom ? `${rootRom} dewa nakatta` : '', meaning: rootM ? `đã không phải là ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ phủ định (thể lịch sự - ではありませんでした)', value: rootK ? `${rootK}ではありませんでした` : '', reading: rootR ? `${rootR}ではありませんでした` : '', romaji: rootRom ? `${rootRom} dewa arimasen deshita` : '', meaning: rootM ? `đã không phải là ${rootM} (lịch sự)` : '' },
                                { id: crypto.randomUUID(), name: 'Thể て (thể nối - で)', value: rootK ? `${rootK}で` : '', reading: rootR ? `${rootR}で` : '', romaji: rootRom ? `${rootRom} de` : '', meaning: rootM ? `là ${rootM} và...` : '' }
                              ];
                            } else if (newWordType === 'Tính từ na' && newForms.length === 0) {
                              const rootK = prev.kanji?.trim() || '';
                              const rootR = prev.reading?.trim() || '';
                              const rootRom = prev.romaji?.trim() || '';
                              const rootM = prev.meaning?.trim() || '';
                              newForms = [
                                { id: crypto.randomUUID(), name: 'Khẳng định hiện tại (thể ngắn - だ)', value: rootK ? `${rootK}だ` : '', reading: rootR ? `${rootR}だ` : '', romaji: rootRom ? `${rootRom} da` : '', meaning: rootM ? `(thể ngắn) ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Khẳng định hiện tại (thể lịch sự - です)', value: rootK ? `${rootK}です` : '', reading: rootR ? `${rootR}です` : '', romaji: rootRom ? `${rootRom} desu` : '', meaning: rootM ? `(thể lịch sự) ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Bổ nghĩa danh từ (thể な)', value: rootK ? `${rootK}な` : '', reading: rootR ? `${rootR}な` : '', romaji: rootRom ? `${rootRom} na` : '', meaning: rootM ? `(bổ nghĩa) ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Phủ định hiện tại (thể ngắn - ではない)', value: rootK ? `${rootK}ではない` : '', reading: rootR ? `${rootR}ではない` : '', romaji: rootRom ? `${rootRom} dewa nai` : '', meaning: rootM ? `không ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Phủ định hiện tại (thể lịch sự - ではありません)', value: rootK ? `${rootK}ではありません` : '', reading: rootR ? `${rootR}ではありません` : '', romaji: rootRom ? `${rootRom} dewa arimasen` : '', meaning: rootM ? `không ${rootM} (lịch sự)` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ khẳng định (thể ngắn - だった)', value: rootK ? `${rootK}だった` : '', reading: rootR ? `${rootR}だった` : '', romaji: rootRom ? `${rootRom} datta` : '', meaning: rootM ? `đã ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ khẳng định (thể lịch sự - でした)', value: rootK ? `${rootK}でした` : '', reading: rootR ? `${rootR}でした` : '', romaji: rootRom ? `${rootRom} deshita` : '', meaning: rootM ? `đã ${rootM} (lịch sự)` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ phủ định (thể ngắn - ではなかった)', value: rootK ? `${rootK}ではなかった` : '', reading: rootR ? `${rootR}ではなかった` : '', romaji: rootRom ? `${rootRom} dewa nakatta` : '', meaning: rootM ? `đã không ${rootM}` : '' },
                                { id: crypto.randomUUID(), name: 'Quá khứ phủ định (thể lịch sự - ではありませんでした)', value: rootK ? `${rootK}ではありませんでした` : '', reading: rootR ? `${rootR}ではありませんでした` : '', romaji: rootRom ? `${rootRom} dewa arimasen deshita` : '', meaning: rootM ? `đã không ${rootM} (lịch sự)` : '' },
                                { id: crypto.randomUUID(), name: 'Thể て (thể nối - で)', value: rootK ? `${rootK}で` : '', reading: rootR ? `${rootR}で` : '', romaji: rootRom ? `${rootRom} de` : '', meaning: rootM ? `${rootM} và...` : '' }
                              ];
                            }
                            return { ...prev, wordType: newWordType, forms: newForms };
                          });
                        }}
                        className="w-full bg-theme-base-alt border border-theme-subtle rounded-xl text-sm text-theme-primary px-3 py-2.5 min-h-[44px] focus:outline-none focus:border-theme-accent cursor-pointer"
                      >
                        <option value="">Chọn loại từ</option>
                        <option value="Động từ nhóm I (Tha động từ)">Động từ nhóm I (Tha động từ)</option>
                        <option value="Động từ nhóm I (Tự động từ)">Động từ nhóm I (Tự động từ)</option>
                        <option value="Động từ nhóm I">Động từ nhóm I</option>
                        <option value="Động từ nhóm II (Tha động từ)">Động từ nhóm II (Tha động từ)</option>
                        <option value="Động từ nhóm II (Tự động từ)">Động từ nhóm II (Tự động từ)</option>
                        <option value="Động từ nhóm II">Động từ nhóm II</option>
                        <option value="Động từ nhóm III (Tha động từ)">Động từ nhóm III (Tha động từ)</option>
                        <option value="Động từ nhóm III (Tự động từ)">Động từ nhóm III (Tự động từ)</option>
                        <option value="Động từ nhóm III">Động từ nhóm III</option>
                        <option value="Danh từ">Danh từ</option>
                        <option value="Tính từ i">Tính từ i</option>
                        <option value="Tính từ na">Tính từ na</option>
                        <option value="Trạng từ">Trạng từ</option>
                        <option value="Ngữ pháp">Ngữ pháp</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-primary/65 mb-1.5">
                      Ý nghĩa (Tiếng Việt) *
                    </label>
                    <input
                      value={editForm.meaning || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, meaning: e.target.value }))}
                      className="w-full bg-theme-base-alt border border-theme-subtle rounded-xl text-sm text-theme-primary px-3.5 py-2.5 min-h-[44px] focus:outline-none focus:border-theme-accent"
                      placeholder="Ví dụ: Dạy, chỉ bảo"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-primary/65 mb-1.5">
                      Giải thích Hán tự
                    </label>
                    <textarea
                      value={editForm.kanjiExplanation || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, kanjiExplanation: e.target.value }))}
                      className="w-full bg-theme-base-alt border border-theme-subtle rounded-xl text-xs sm:text-sm text-theme-primary px-3.5 py-2.5 focus:outline-none focus:border-theme-accent leading-relaxed"
                      placeholder="Phân tích bộ thủ, âm Hán Việt, mẹo ghi nhớ..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-theme-base-alt/60 border border-theme-subtle rounded-xl p-3.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-accent mb-2">
                      Âm thanh phát âm từ chính
                    </label>
                    <AudioUpload
                      audioUrl={editForm.audioUrl}
                      onAudioChange={(url) => setEditForm(prev => ({ ...prev, audioUrl: url, hasAudio: !!url }))}
                    />
                  </div>
                </div>
              )}

              {editTab === 'forms' && (() => {
                const isVerbs = editForm.wordType?.includes('Động từ');
                const formsLabel = isVerbs ? 'Các thể động từ' : 'Các thể / Chia thì';
                const formsNamePlaceholder = isVerbs ? 'Tên thể (vd: Thể て)' : 'Tên thì (vd: Quá khứ)';
                const formsValuePlaceholder = isVerbs ? 'Sau khi chia (vd: 教えて)' : 'Sau khi chia (vd: だった)';

                return (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-theme-subtle">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-theme-accent">{formsLabel}</span>
                        {isVerbs && (
                          <button
                            type="button"
                            onClick={fetchOjadData}
                            disabled={isFetchingOjad}
                            className="inline-flex items-center justify-center gap-1.5 min-w-[122px] min-h-[34px] text-xs font-semibold bg-[#1a5f7a] text-white px-3 py-1 rounded-lg hover:bg-[#227b9e] transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                          >
                            {isFetchingOjad && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                            <span>{isFetchingOjad ? 'Đang lấy...' : 'Lấy từ OJAD'}</span>
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            forms: [...(prev.forms || []), { id: crypto.randomUUID(), name: '', value: '', reading: '', romaji: '', meaning: '' }]
                          }));
                        }}
                        className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1 rounded-lg bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm thể</span>
                      </button>
                    </div>

                    {(!editForm.forms || editForm.forms.length === 0) ? (
                      <div className="py-10 text-center bg-theme-base-alt/50 border border-dashed border-theme-subtle rounded-xl px-4">
                        <p className="text-sm text-theme-primary/70 mb-3">
                          Chưa có thể chia nào. Bấm <strong>"AI tự động điền"</strong> ở góc trên hoặc bấm <strong>"+ Thêm thể"</strong> để tự nhập.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editForm.forms.map((f, index) => (
                          <div key={f.id || index} className="relative p-3.5 border border-theme-subtle bg-theme-base-alt/60 rounded-xl space-y-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditForm(prev => {
                                  const newForms = [...(prev.forms || [])];
                                  newForms.splice(index, 1);
                                  return { ...prev, forms: newForms };
                                });
                              }}
                              className="absolute top-2.5 right-2.5 p-1.5 text-theme-primary/45 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Xóa thể này"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-8">
                              <input
                                value={f.name || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditForm(prev => {
                                    const newForms = [...(prev.forms || [])];
                                    newForms[index] = { ...newForms[index], name: val };
                                    return { ...prev, forms: newForms };
                                  });
                                }}
                                className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                placeholder={formsNamePlaceholder}
                              />
                              <input
                                value={f.value || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditForm(prev => {
                                    const newForms = [...(prev.forms || [])];
                                    newForms[index] = { ...newForms[index], value: val };
                                    return { ...prev, forms: newForms };
                                  });
                                }}
                                className="w-full bg-theme-base border border-theme-subtle rounded-lg text-sm font-serif text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                placeholder={formsValuePlaceholder}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <input
                                value={f.reading || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditForm(prev => {
                                    const newForms = [...(prev.forms || [])];
                                    newForms[index] = { ...newForms[index], reading: val };
                                    return { ...prev, forms: newForms };
                                  });
                                }}
                                className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent italic"
                                placeholder="Hiragana"
                              />
                              <input
                                value={f.romaji || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditForm(prev => {
                                    const newForms = [...(prev.forms || [])];
                                    newForms[index] = { ...newForms[index], romaji: val };
                                    return { ...prev, forms: newForms };
                                  });
                                }}
                                className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent italic"
                                placeholder="Romaji"
                              />
                              <input
                                value={f.meaning || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditForm(prev => {
                                    const newForms = [...(prev.forms || [])];
                                    newForms[index] = { ...newForms[index], meaning: val };
                                    return { ...prev, forms: newForms };
                                  });
                                }}
                                className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                                placeholder="Nghĩa (Tiếng Việt)"
                              />
                            </div>

                            <AudioUpload
                              audioUrl={f.audioUrl}
                              onAudioChange={(url) => {
                                setEditForm(prev => {
                                  const newForms = [...(prev.forms || [])];
                                  newForms[index] = { ...newForms[index], audioUrl: url, hasAudio: !!url };
                                  return { ...prev, forms: newForms };
                                });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {editTab === 'examples' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
                    <span className="text-xs font-bold uppercase tracking-wider text-theme-accent">Các câu ví dụ</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm(prev => ({
                          ...prev,
                          examples: [{ id: crypto.randomUUID(), sentence: '', reading: '', romaji: '', translation: '' }, ...(prev.examples || [])]
                        }));
                      }}
                      className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1 rounded-lg bg-theme-accent/10 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm ví dụ</span>
                    </button>
                  </div>

                  {(!editForm.examples || editForm.examples.length === 0) ? (
                    <div className="space-y-2.5 p-3.5 border border-theme-subtle bg-theme-base-alt/60 rounded-xl">
                      <p className="text-[11px] text-theme-primary/60">
                        Chưa có danh sách ví dụ mở rộng (đang hiển thị ô ví dụ cũ nếu có, hoặc bấm <strong>"+ Thêm ví dụ"</strong>).
                      </p>
                      <input
                        value={editForm.example || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, example: e.target.value }))}
                        className="w-full bg-theme-base border border-theme-subtle rounded-lg text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                        placeholder="Ví dụ (Tiếng Nhật)"
                      />
                      <input
                        value={editForm.exampleTranslation || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, exampleTranslation: e.target.value }))}
                        className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                        placeholder="Dịch nghĩa (Tiếng Việt)"
                      />
                      <AudioUpload
                        audioUrl={editForm.audioUrl}
                        onAudioChange={(url) => setEditForm(prev => ({ ...prev, audioUrl: url, hasAudio: !!url }))}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editForm.examples.map((ex, index) => (
                        <div key={ex.id || index} className="relative p-3.5 border border-theme-subtle bg-theme-base-alt/60 rounded-xl space-y-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditForm(prev => {
                                const newExamples = [...(prev.examples || [])];
                                newExamples.splice(index, 1);
                                return { ...prev, examples: newExamples };
                              });
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 text-theme-primary/45 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Xóa ví dụ này"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="pr-8">
                            <input
                              value={ex.sentence || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setEditForm(prev => {
                                  const newExamples = [...(prev.examples || [])];
                                  newExamples[index] = { ...newExamples[index], sentence: val };
                                  return { ...prev, examples: newExamples };
                                });
                              }}
                              className="w-full bg-theme-base border border-theme-subtle rounded-lg text-sm font-serif text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                              placeholder="Câu ví dụ (Tiếng Nhật)"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <input
                              value={ex.reading || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setEditForm(prev => {
                                  const newExamples = [...(prev.examples || [])];
                                  newExamples[index] = { ...newExamples[index], reading: val };
                                  return { ...prev, examples: newExamples };
                                });
                              }}
                              className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent italic"
                              placeholder="Hiragana"
                            />
                            <input
                              value={ex.romaji || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setEditForm(prev => {
                                  const newExamples = [...(prev.examples || [])];
                                  newExamples[index] = { ...newExamples[index], romaji: val };
                                  return { ...prev, examples: newExamples };
                                });
                              }}
                              className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent italic"
                              placeholder="Romaji"
                            />
                          </div>

                          <input
                            value={ex.translation || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setEditForm(prev => {
                                const newExamples = [...(prev.examples || [])];
                                newExamples[index] = { ...newExamples[index], translation: val };
                                return { ...prev, examples: newExamples };
                              });
                            }}
                            className="w-full bg-theme-base border border-theme-subtle rounded-lg text-xs sm:text-sm text-theme-primary px-3 py-2 focus:outline-none focus:border-theme-accent"
                            placeholder="Dịch nghĩa (Tiếng Việt)"
                          />

                          <AudioUpload
                            audioUrl={ex.audioUrl}
                            onAudioChange={(url) => {
                              setEditForm(prev => {
                                const newExamples = [...(prev.examples || [])];
                                newExamples[index] = { ...newExamples[index], audioUrl: url, hasAudio: !!url };
                                return { ...prev, examples: newExamples };
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="px-4 sm:px-6 py-3 pb-safe border-t border-theme-subtle bg-theme-panel flex items-center justify-between gap-2.5 shrink-0">
              <div>
                {onUpdate && neverAiFilledCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      cancelEdit();
                      openBatchModal();
                    }}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-theme-accent/10 border border-theme-accent/25 text-theme-accent hover:bg-theme-accent hover:text-theme-inverted text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    title="Chạy AI tự động điền hàng loạt cho các từ chưa có dữ liệu"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Điền hàng loạt ({missingDataCards.length > 0 ? missingDataCards.length : neverAiFilledCards.length})</span>
                    <span className="sm:hidden">Hàng loạt ({missingDataCards.length > 0 ? missingDataCards.length : neverAiFilledCards.length})</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="min-h-[44px] px-5 py-2 border border-theme-subtle text-theme-primary hover:bg-theme-hover rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={!editForm.kanji?.trim() || !editForm.meaning?.trim()}
                  className="min-h-[44px] px-6 py-2 bg-theme-accent text-theme-inverted hover:opacity-90 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch AI Auto-Fill Modal */}
      {showBatchModal && (
        <div
          id="batch-autofill-modal-overlay"
          onClick={() => {
            if (!isBatchRunning) setShowBatchModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-theme-panel border border-theme-subtle w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 pt-safe border-b border-theme-subtle flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-theme-accent/15 border border-theme-accent/25 flex items-center justify-center text-theme-accent shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-theme-primary truncate">AI tự động điền hàng loạt</h3>
                  <p className="text-xs text-theme-primary/60 truncate">
                    gemini-4-hydrogen • Đã xong {deck.length - neverAiFilledCards.length} / {deck.length} từ
                  </p>
                </div>
              </div>
              {!isBatchRunning && (
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="p-2 text-theme-primary/55 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {!isBatchRunning && !batchProgress.finished ? (
                <>
                  <div className="space-y-2.5">
                    <label
                      onClick={() => setBatchScope('missing')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        batchScope === 'missing'
                          ? 'bg-theme-accent/10 border-theme-accent/50 shadow-xs'
                          : 'bg-theme-base-alt/60 border-theme-subtle hover:border-theme-accent/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="batchScope"
                        checked={batchScope === 'missing'}
                        onChange={() => setBatchScope('missing')}
                        className="mt-1 accent-theme-accent cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-theme-primary">Chỉ từ còn thiếu dữ liệu</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-theme-accent/15 text-theme-accent shrink-0">
                            {missingDataCards.length} từ
                          </span>
                        </div>
                        <p className="text-xs text-theme-primary/65 mt-1 leading-relaxed">
                          Áp dụng cho các từ chưa chạy AI và đang thiếu nghĩa, cách đọc, loại từ, Hán Việt, giải thích Hán tự, các thể hoặc câu ví dụ.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setBatchScope('never_ai')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        batchScope === 'never_ai'
                          ? 'bg-theme-accent/10 border-theme-accent/50 shadow-xs'
                          : 'bg-theme-base-alt/60 border-theme-subtle hover:border-theme-accent/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="batchScope"
                        checked={batchScope === 'never_ai'}
                        onChange={() => setBatchScope('never_ai')}
                        className="mt-1 accent-theme-accent cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-theme-primary">Tất cả từ chưa từng dùng AI</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-theme-base border border-theme-subtle text-theme-primary/80 shrink-0">
                            {neverAiFilledCards.length} từ
                          </span>
                        </div>
                        <p className="text-xs text-theme-primary/65 mt-1 leading-relaxed">
                          Chạy bổ sung đầy đủ các thể chia và 10 câu ví dụ cho mọi từ chưa được đánh dấu đã chạy AI tự động điền.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Daily batch limit selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-theme-primary/80">Số từ mỗi lần chạy</span>
                      <span className="text-theme-primary/55">Mỗi ngày làm 1 ít cũng được</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {([10, 20, 50, 'all'] as const).map((limitOption) => (
                        <button
                          key={String(limitOption)}
                          type="button"
                          onClick={() => setBatchLimit(limitOption)}
                          className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            batchLimit === limitOption
                              ? 'bg-theme-accent text-theme-inverted border-theme-accent shadow-xs'
                              : 'bg-theme-base-alt/60 border-theme-subtle text-theme-primary/75 hover:border-theme-accent/40'
                          }`}
                        >
                          {limitOption === 'all' ? 'Tới hạn mức' : `${limitOption} từ`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-theme-base-alt/70 border border-theme-subtle text-xs text-theme-primary/70 leading-relaxed">
                    Dùng model <strong>gemini-4-hydrogen</strong>. Nếu hết hạn mức trong ngày, hệ thống tự dừng ngay và giữ nguyên file MP3, tiến trình SRS cùng các từ đã điền để hôm sau bạn chạy tiếp.
                  </div>
                </>
              ) : (
                <div className="space-y-4 py-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-theme-primary/80 flex items-center gap-2">
                      {isBatchRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-theme-accent shrink-0" />
                          <span>
                            {isStoppingBatch ? 'Đang dừng sau từ hiện tại...' : `Đang xử lý: `}
                            {!isStoppingBatch && <strong className="text-theme-accent font-serif text-sm">{batchProgress.currentWord}</strong>}
                          </span>
                        </>
                      ) : batchProgress.stoppedByQuota ? (
                        <>
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-amber-700 dark:text-amber-300">Đã tạm dừng do hết hạn mức</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Đã hoàn tất quá trình xử lý</span>
                        </>
                      )}
                    </span>
                    <span className="text-theme-accent font-bold tabular-nums">
                      {batchProgress.current} / {batchProgress.total}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-theme-base-alt border border-theme-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${batchProgress.stoppedByQuota ? 'bg-amber-500' : 'bg-theme-accent'}`}
                      style={{
                        width: `${batchProgress.total > 0 ? Math.min(100, Math.round((batchProgress.current / batchProgress.total) * 100)) : 0}%`
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{batchProgress.succeeded}</div>
                      <div className="text-[11px] text-theme-primary/70 font-medium">Đã lưu thành công</div>
                    </div>
                    <div className="p-3 rounded-xl bg-theme-base-alt border border-theme-subtle">
                      <div className="text-lg font-bold text-theme-primary tabular-nums">
                        {batchScope === 'missing' ? missingDataCards.length : neverAiFilledCards.length}
                      </div>
                      <div className="text-[11px] text-theme-primary/70 font-medium">
                        Còn lại cho lần sau{batchProgress.failed > 0 ? ` (${batchProgress.failed} lỗi)` : ''}
                      </div>
                    </div>
                  </div>
                  {batchProgress.errorMessage && (
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        batchProgress.stoppedByQuota
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                      }`}
                    >
                      {batchProgress.errorMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 pb-safe border-t border-theme-subtle bg-theme-base-alt/40 flex items-center justify-end gap-2.5">
              {isBatchRunning ? (
                <button
                  type="button"
                  disabled={isStoppingBatch}
                  onClick={() => {
                    stopBatchRef.current = true;
                    setIsStoppingBatch(true);
                  }}
                  className="min-h-[44px] px-5 py-2 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isStoppingBatch ? 'Đang dừng...' : 'Dừng lại'}
                </button>
              ) : batchProgress.finished ? (
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="min-h-[44px] px-6 py-2 bg-theme-accent text-theme-inverted hover:opacity-90 rounded-xl text-sm font-bold transition-opacity cursor-pointer"
                >
                  Đóng
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="min-h-[44px] px-5 py-2 border border-theme-subtle text-theme-primary hover:bg-theme-hover rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={runBatchAutoFillAI}
                    disabled={(batchScope === 'missing' ? missingDataCards.length : neverAiFilledCards.length) === 0}
                    className="min-h-[44px] px-5 py-2 bg-theme-accent text-theme-inverted hover:opacity-90 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>
                      {(() => {
                        const eligible = batchScope === 'missing' ? missingDataCards.length : neverAiFilledCards.length;
                        const planned = batchLimit === 'all' ? eligible : Math.min(eligible, batchLimit);
                        return `Bắt đầu (${planned} từ)`;
                      })()}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
