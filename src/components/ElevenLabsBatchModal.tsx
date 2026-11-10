import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Layers,
  FileAudio,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { KanjiCard, KanjiExample } from '../types';
import { playAudioUrl } from '../utils/playTTS';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  accent?: string;
  preview_url?: string;
}

interface BatchItem {
  id: string;
  type: 'word' | 'form' | 'example';
  index?: number;
  label: string;
  text: string;
  translation?: string;
  currentAudioUrl?: string | null;
  selected: boolean;
  status: 'idle' | 'generating' | 'success' | 'failed';
  resultAudioUrl?: string;
  errorMessage?: string;
}

interface ElevenLabsBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: KanjiCard;
  onCardUpdated: (updatedCard: KanjiCard) => Promise<void> | void;
}

export default function ElevenLabsBatchModal({
  isOpen,
  onClose,
  card,
  onCardUpdated
}: ElevenLabsBatchModalProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  // Default to Lily (100% free Japanese voice for all tiers)
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('pFZP5JQG7iQjIQuC4Bku'); 
  const [selectedModelId, setSelectedModelId] = useState<string>('eleven_multilingual_v2');
  const [customVoiceId, setCustomVoiceId] = useState<string>('');
  const [useCustomVoice, setUseCustomVoice] = useState(false);

  // Items to process
  const [items, setItems] = useState<BatchItem[]>([]);
  const [onlyMissing, setOnlyMissing] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [currentProcessingItem, setCurrentProcessingItem] = useState<{ label: string; text: string } | null>(null);
  const [liveSuccessCount, setLiveSuccessCount] = useState<number>(0);
  const [liveFailCount, setLiveFailCount] = useState<number>(0);
  const [completionSummary, setCompletionSummary] = useState<{ success: number; total: number } | null>(null);

  // Voice preview playback
  const [playingPreviewVoiceId, setPlayingPreviewVoiceId] = useState<string | null>(null);
  const [previewAudioObj, setPreviewAudioObj] = useState<HTMLAudioElement | null>(null);

  // Initialize items from card data
  useEffect(() => {
    if (!isOpen || !card) return;

    const list: BatchItem[] = [];

    // 1. Word main pronunciation (Kanji or reading)
    const wordText = (card.kanji || card.reading || '').trim();
    if (wordText) {
      list.push({
        id: 'word-main',
        type: 'word',
        label: 'Từ chính',
        text: wordText,
        translation: card.meaning,
        currentAudioUrl: card.audioUrl,
        selected: onlyMissing ? !card.audioUrl : true,
        status: 'idle'
      });
    }

    // 2. Forms (các thể / các thì)
    if (card.forms && Array.isArray(card.forms)) {
      card.forms.forEach((f, idx) => {
        const formVal = (f.value || '').trim();
        if (formVal) {
          list.push({
            id: `form-${idx}`,
            type: 'form',
            index: idx,
            label: f.name || `Thể #${idx + 1}`,
            text: formVal,
            translation: f.meaning || f.reading,
            currentAudioUrl: f.audioUrl,
            selected: onlyMissing ? !f.audioUrl : true,
            status: 'idle'
          });
        }
      });
    }

    // 3. Examples (các câu ví dụ)
    if (card.examples && Array.isArray(card.examples)) {
      card.examples.forEach((ex, idx) => {
        const sentence = (ex.sentence || '').trim();
        if (sentence) {
          list.push({
            id: `example-${idx}`,
            type: 'example',
            index: idx,
            label: `Câu ví dụ #${idx + 1}`,
            text: sentence,
            translation: ex.translation,
            currentAudioUrl: ex.audioUrl,
            selected: onlyMissing ? !ex.audioUrl : true,
            status: 'idle'
          });
        }
      });
    } else if (card.example && card.example.trim()) {
      // Legacy example
      list.push({
        id: 'example-legacy',
        type: 'example',
        label: 'Câu ví dụ',
        text: card.example.trim(),
        translation: card.exampleTranslation,
        currentAudioUrl: card.audioUrl,
        selected: onlyMissing ? !card.audioUrl : true,
        status: 'idle'
      });
    }

    setItems(list);
    setCompletionSummary(null);
  }, [isOpen, card, onlyMissing]);

  // Check ElevenLabs status and fetch voices
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function checkStatus() {
      try {
        const res = await fetch('/api/elevenlabs/voices');
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setIsConfigured(data.configured);
            if (Array.isArray(data.voices) && data.voices.length > 0) {
              setVoices(data.voices);
              // Default to Lily (pFZP5JQG7iQjIQuC4Bku)
              const defaultVoice = data.voices.find((v: ElevenLabsVoice) => v.voice_id === 'pFZP5JQG7iQjIQuC4Bku') 
                || data.voices.find((v: ElevenLabsVoice) => v.voice_id === 'cjVigY5qzO86Huf0OWal')
                || data.voices[0];
              if (defaultVoice) {
                setSelectedVoiceId(defaultVoice.voice_id);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load ElevenLabs voices:', e);
        if (mounted) setIsConfigured(false);
      }
    }

    checkStatus();

    return () => {
      mounted = false;
      if (previewAudioObj) {
        previewAudioObj.pause();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    if (isGenerating) return;
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const handleSelectAll = (select: boolean) => {
    if (isGenerating) return;
    setItems(prev => prev.map(item => ({ ...item, selected: select })));
  };

  // Preview Voice Sample
  const handlePlayVoicePreview = (voice: ElevenLabsVoice) => {
    if (playingPreviewVoiceId === voice.voice_id) {
      if (previewAudioObj) {
        previewAudioObj.pause();
        setPreviewAudioObj(null);
      }
      setPlayingPreviewVoiceId(null);
      return;
    }

    if (previewAudioObj) {
      previewAudioObj.pause();
    }

    if (voice.preview_url) {
      const audio = new Audio(voice.preview_url);
      setPreviewAudioObj(audio);
      setPlayingPreviewVoiceId(voice.voice_id);
      audio.play().catch(() => {});
      audio.onended = () => {
        setPlayingPreviewVoiceId(null);
        setPreviewAudioObj(null);
      };
    }
  };

  // Start Batch Generation
  const handleStartBatch = async () => {
    const selectedItems = items.filter(it => it.selected);
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 mục để tạo âm thanh!');
      return;
    }

    const effectiveVoiceId = useCustomVoice && customVoiceId.trim() ? customVoiceId.trim() : selectedVoiceId;
    if (!effectiveVoiceId) {
      alert('Vui lòng chọn giọng phát âm (Voice ID)!');
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: selectedItems.length });
    setLiveSuccessCount(0);
    setLiveFailCount(0);
    setCompletionSummary(null);

    // Prepare deep clones of card data to update
    const updatedCard: KanjiCard = JSON.parse(JSON.stringify(card));
    if (!updatedCard.forms) updatedCard.forms = [];
    if (!updatedCard.examples) updatedCard.examples = [];

    let successCount = 0;

    for (let i = 0; i < selectedItems.length; i++) {
      const currentItem = selectedItems[i];
      setProgress({ current: i + 1, total: selectedItems.length });
      setCurrentProcessingItem({ label: currentItem.label, text: currentItem.text });

      // Auto-scroll to current item so user sees each item live
      try {
        const el = document.getElementById(`batch-item-${currentItem.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (e) {}

      // Set item status to generating
      setItems(prev => prev.map(it => it.id === currentItem.id ? { ...it, status: 'generating' } : it));

      try {
        const res = await fetch('/api/elevenlabs/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: currentItem.text,
            voiceId: effectiveVoiceId,
            modelId: selectedModelId
          })
        });

        const data = await res.json();

        if (res.ok && data.audioUrl) {
          successCount++;
          setLiveSuccessCount(c => c + 1);
          const newUrl = data.audioUrl;

          // Apply to updatedCard
          if (currentItem.type === 'word') {
            updatedCard.audioUrl = newUrl;
            updatedCard.hasAudio = true;
          } else if (currentItem.type === 'form' && currentItem.index !== undefined && updatedCard.forms[currentItem.index]) {
            updatedCard.forms[currentItem.index].audioUrl = newUrl;
            updatedCard.forms[currentItem.index].hasAudio = true;
          } else if (currentItem.type === 'example' && currentItem.index !== undefined && updatedCard.examples[currentItem.index]) {
            updatedCard.examples[currentItem.index].audioUrl = newUrl;
            updatedCard.examples[currentItem.index].hasAudio = true;
          } else if (currentItem.id === 'example-legacy') {
            updatedCard.audioUrl = newUrl;
            updatedCard.hasAudio = true;
          }

          // Mark item success
          setItems(prev => prev.map(it => it.id === currentItem.id ? {
            ...it,
            status: 'success',
            resultAudioUrl: newUrl,
            currentAudioUrl: newUrl
          } : it));
        } else {
          setLiveFailCount(c => c + 1);
          const err = data.error || 'Lỗi tạo âm thanh';
          setItems(prev => prev.map(it => it.id === currentItem.id ? {
            ...it,
            status: 'failed',
            errorMessage: err
          } : it));
        }

        // Small delay between calls to respect rate limit if not cached
        if (!data.fromCache && i < selectedItems.length - 1) {
          await new Promise(r => setTimeout(r, 200));
        }
      } catch (err: any) {
        setLiveFailCount(c => c + 1);
        setItems(prev => prev.map(it => it.id === currentItem.id ? {
          ...it,
          status: 'failed',
          errorMessage: err.message || 'Lỗi kết nối'
        } : it));
      }
    }

    setIsGenerating(false);
    setProgress(null);
    setCurrentProcessingItem(null);
    setCompletionSummary({ success: successCount, total: selectedItems.length });

    // Save changes to card & Firestore
    if (successCount > 0) {
      try {
        await onCardUpdated(updatedCard);
      } catch (updateErr) {
        console.error('Failed to save card updates after ElevenLabs batch:', updateErr);
      }
    }
  };

  const selectedCount = items.filter(i => i.selected).length;
  const missingCount = items.filter(i => !i.currentAudioUrl).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-theme-panel text-theme-base border border-theme-subtle rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme-subtle bg-theme-base/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-theme-primary">
                  Tạo MP3 Hàng Loạt bằng ElevenLabs API
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  AI Voice
                </span>
              </div>
              <p className="text-xs text-theme-secondary mt-0.5">
                Tự động tạo âm thanh cho từ vựng, toàn bộ các thể/các thì và câu ví dụ chỉ với 1 click
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-subtle/50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 🌟 PROMINENT TOP STICKY PROGRESS BAR (WHEN GENERATING)         */}
        {/* ============================================================== */}
        {isGenerating && progress && (
          <div className="shrink-0 bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border-b border-purple-500/40 p-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                  ĐANG TIẾN HÀNH TẠO ÂM THANH...
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500 text-white shadow-xs">
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-purple-200 bg-purple-900/60 px-2.5 py-0.5 rounded-md border border-purple-500/30">
                  Mục {progress.current} / {progress.total}
                </span>
                <span className="text-emerald-300">✓ {liveSuccessCount} xong</span>
                {liveFailCount > 0 && <span className="text-rose-300">⚠ {liveFailCount} lỗi</span>}
              </div>
            </div>

            {/* High-visibility glowing progress track */}
            <div className="w-full bg-black/50 rounded-full h-3.5 p-0.5 border border-purple-500/40 overflow-hidden relative shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-500 via-indigo-400 to-pink-500 h-full rounded-full transition-all duration-300 shadow-md relative overflow-hidden"
                style={{ width: `${Math.max(5, Math.round((progress.current / progress.total) * 100))}%` }}
              >
                <div className="absolute inset-0 bg-white/25 animate-pulse"></div>
              </div>
            </div>

            {/* Currently Processing Sentence/Form Info */}
            {currentProcessingItem && (
              <div className="flex items-center justify-between gap-2 mt-2.5 text-xs text-purple-100">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-2 py-0.5 rounded bg-purple-500/40 text-purple-200 font-bold text-[10px] uppercase shrink-0">
                    {currentProcessingItem.label}
                  </span>
                  <span className="font-bold text-white text-xs sm:text-sm truncate">
                    &quot;{currentProcessingItem.text}&quot;
                  </span>
                </div>
                <span className="text-[11px] text-purple-300 shrink-0 font-medium">
                  {progress.total - progress.current > 0 ? `Còn ${progress.total - progress.current} mục` : 'Đang lưu hoàn tất...'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 🎉 COMPLETION CELEBRATION CARD                                */}
        {/* ============================================================== */}
        {completionSummary && !isGenerating && (
          <div className="shrink-0 bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-emerald-950/80 border-b border-emerald-500/40 p-4 shadow-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/50">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
                    <span>🎉 HOÀN THÀNH 100%!</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-500 text-white font-black">
                      {completionSummary.success}/{completionSummary.total} MP3
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    Toàn bộ file MP3 đã được tạo tự động và lưu thẳng vào Database. Bạn có thể bấm nghe thử ngay từng câu ở danh sách bên dưới!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const firstValid = items.find(it => it.resultAudioUrl || it.currentAudioUrl);
                    if (firstValid) {
                      playAudioUrl(firstValid.resultAudioUrl || firstValid.currentAudioUrl!, firstValid.text);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe thử câu đầu tiên</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Target Word Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-theme-base/80 border border-theme-subtle">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-theme-accent">
                {card.kanji || card.reading}
              </span>
              {card.kanji && card.reading && (
                <span className="text-sm text-theme-secondary font-medium">
                  【{card.reading}】
                </span>
              )}
              {card.sinoVietnamese && (
                <span className="text-xs px-2 py-0.5 rounded bg-theme-panel text-theme-secondary border border-theme-subtle font-semibold">
                  {card.sinoVietnamese}
                </span>
              )}
            </div>
            <div className="text-xs text-theme-secondary max-w-md truncate">
              {card.meaning}
            </div>
          </div>

          {/* Config Status Notice */}
          {isConfigured === false && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="text-xs leading-relaxed space-y-1">
                <div className="font-bold text-sm">Chưa thiết lập ELEVENLABS_API_KEY trên máy chủ</div>
                <p>
                  Để tự động gọi API tạo âm thanh trực tiếp từ tài khoản ElevenLabs của bạn, vui lòng thêm API Key vào biến môi trường:
                </p>
                <div className="p-2 rounded bg-black/20 font-mono text-[11px] text-amber-900 dark:text-amber-200 select-all">
                  ELEVENLABS_API_KEY=&quot;xi-api-key-cua-ban&quot;
                </div>
                <div className="pt-1 flex items-center gap-3">
                  <a
                    href="https://elevenlabs.io/app/speech-synthesis/text-to-speech"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline hover:text-amber-600 cursor-pointer"
                  >
                    <span>Lấy API Key trên ElevenLabs.io</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-theme-secondary">• Hệ thống vẫn sẽ hiển thị danh sách các câu và xem trước.</span>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Controls (Voice, Model) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-theme-base/40 border border-theme-subtle">
            {/* Voice Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-secondary mb-1.5">
                Giọng đọc (ElevenLabs Voice)
              </label>
              {!useCustomVoice ? (
                <div className="space-y-1.5">
                  <div className="relative">
                    <select
                      value={selectedVoiceId}
                      onChange={e => setSelectedVoiceId(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-theme-panel border border-theme-subtle text-theme-primary appearance-none cursor-pointer focus:outline-hidden focus:border-theme-accent"
                    >
                      {voices.map(v => (
                        <option key={v.voice_id} value={v.voice_id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-theme-secondary pointer-events-none" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = voices.find(v => v.voice_id === selectedVoiceId);
                        if (cur) handlePlayVoicePreview(cur);
                      }}
                      disabled={!voices.find(v => v.voice_id === selectedVoiceId)?.preview_url}
                      className="inline-flex items-center gap-1 text-theme-accent hover:underline cursor-pointer disabled:opacity-40"
                    >
                      {playingPreviewVoiceId === selectedVoiceId ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Dừng nghe thử giọng</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Nghe thử mẫu giọng này</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseCustomVoice(true)}
                      className="text-theme-secondary hover:text-theme-primary underline cursor-pointer"
                    >
                      Nhập Voice ID riêng
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={customVoiceId}
                    onChange={e => setCustomVoiceId(e.target.value)}
                    placeholder="Nhập Voice ID của bạn (ví dụ: pFZP5JQG7iQjIQuC4Bku)"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-theme-panel border border-theme-subtle text-theme-primary focus:outline-hidden focus:border-theme-accent"
                  />
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-theme-secondary">Lấy ID giọng từ VoiceLab trên ElevenLabs</span>
                    <button
                      type="button"
                      onClick={() => setUseCustomVoice(false)}
                      className="text-theme-accent hover:underline cursor-pointer font-semibold"
                    >
                      Chọn lại giọng miễn phí có sẵn
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-secondary mb-1.5">
                Model AI (Khuyên dùng cho tiếng Nhật)
              </label>
              <div className="relative">
                <select
                  value={selectedModelId}
                  onChange={e => setSelectedModelId(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-theme-panel border border-theme-subtle text-theme-primary appearance-none cursor-pointer focus:outline-hidden focus:border-theme-accent"
                >
                  <option value="eleven_multilingual_v2">
                    eleven_multilingual_v2 (Chuẩn nhất - ngữ điệu và trọng âm tiếng Nhật tự nhiên)
                  </option>
                  <option value="eleven_flash_v2_5">
                    eleven_flash_v2_5 (Tốc độ cực nhanh ~75ms, siêu tiết kiệm credits)
                  </option>
                  <option value="eleven_turbo_v2_5">
                    eleven_turbo_v2_5 (Cân bằng tốc độ & chất lượng)
                  </option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-theme-secondary pointer-events-none" />
              </div>
              <p className="text-[11px] text-theme-secondary mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0" />
                <span>Multilingual v2 giữ nguyên trọng âm pitch-accent chuẩn người bản xứ.</span>
              </p>
            </div>
          </div>

          {/* Selection & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                Danh sách phát âm ({items.length} mục)
              </span>
              <span className="text-xs text-theme-secondary">
                • {missingCount} mục chưa có MP3
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyMissing(!onlyMissing)}
                disabled={isGenerating}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer border ${
                  onlyMissing 
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-theme-panel border-theme-subtle text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${onlyMissing ? 'opacity-100' : 'opacity-0'}`} />
                <span>Chỉ chọn mục chưa có MP3</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                disabled={isGenerating}
                className="px-2.5 py-1 text-xs rounded-md bg-theme-panel border border-theme-subtle text-theme-secondary hover:text-theme-primary font-medium cursor-pointer"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                disabled={isGenerating}
                className="px-2.5 py-1 text-xs rounded-md bg-theme-panel border border-theme-subtle text-theme-secondary hover:text-theme-primary font-medium cursor-pointer"
              >
                Bỏ chọn
              </button>
            </div>
          </div>

          {/* Items Table / List */}
          <div className="border border-theme-subtle rounded-xl overflow-hidden divide-y divide-theme-subtle/60 bg-theme-base/20 max-h-[380px] overflow-y-auto">
            {items.map((item, index) => {
              const hasAudio = !!(item.resultAudioUrl || item.currentAudioUrl);
              const audioToPlay = item.resultAudioUrl || item.currentAudioUrl;

              return (
                <div
                  id={`batch-item-${item.id}`}
                  key={`${item.id}-${index}`}
                  onClick={() => handleToggleSelect(item.id)}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 transition-all cursor-pointer ${
                    item.status === 'generating' 
                      ? 'bg-purple-500/20 ring-2 ring-purple-500/50 scale-[1.005]' 
                      : item.status === 'success'
                      ? 'bg-emerald-500/15'
                      : item.selected 
                      ? 'bg-theme-panel/70 hover:bg-theme-panel' 
                      : 'opacity-60 hover:opacity-100 hover:bg-theme-panel/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleSelect(item.id)}
                      disabled={isGenerating}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    />

                    <div className="min-w-[110px] sm:min-w-[140px] shrink-0">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                        item.type === 'word' 
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300' 
                          : item.type === 'form'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {item.label}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-theme-primary truncate">
                        {item.text}
                      </div>
                      {item.translation && (
                        <div className="text-[11px] text-theme-secondary truncate">
                          {item.translation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status / Audio Play Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'generating' && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500 text-white text-[11px] font-bold animate-pulse shadow-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tạo...</span>
                      </span>
                    )}

                    {item.status === 'success' && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✓ Hoàn tất</span>
                      </span>
                    )}

                    {item.status === 'failed' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold" title={item.errorMessage}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Lỗi</span>
                      </span>
                    )}

                    {hasAudio && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (audioToPlay) playAudioUrl(audioToPlay, item.text);
                        }}
                        className="p-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                        title="Nghe file MP3"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!hasAudio && item.status === 'idle' && (
                      <span className="text-[10px] font-semibold text-theme-secondary px-2 py-0.5 rounded bg-theme-panel border border-theme-subtle">
                        Chưa có MP3
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-theme-subtle bg-theme-base/60 shrink-0">
          <div className="text-xs text-theme-secondary">
            Đã chọn <strong className="text-theme-primary">{selectedCount}</strong> / {items.length} mục
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-theme-subtle hover:bg-theme-subtle/50 text-theme-secondary transition-colors cursor-pointer disabled:opacity-40"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleStartBatch}
              disabled={isGenerating || selectedCount === 0 || isConfigured === false}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý ({progress?.current}/{progress?.total})...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Bắt đầu tạo ({selectedCount} mục)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
