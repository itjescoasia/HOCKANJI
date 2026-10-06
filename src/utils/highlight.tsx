import { playTTS , playAudioUrl} from '../utils/playTTS';
import React, { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
export const HighlightContext = React.createContext<{
  hoveredCard: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null;
  setHoveredCard: (info: { card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null, force?: boolean) => void;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  onEditCard?: (card: KanjiCard) => void;
}>({
  hoveredCard: null,
  setHoveredCard: () => {},
  isLocked: false,
  setLocked: () => {},
});

export const HighlightProvider: React.FC<{ children: React.ReactNode, onEditCard?: (card: KanjiCard) => void }> = ({ children, onEditCard }) => {
  const [hoveredCard, setHoveredCardState] = useState<{ card: KanjiCard, index: number, matchedForm?: { id: string, name: string, value: string, reading?: string, romaji?: string, meaning?: string } } | null>(null);
  const [isLocked, setLocked] = useState(false);
  
  const setHoveredCard = (info: any, force = false) => {
    if (isLocked && !force) return;
    setHoveredCardState(info);
  };
  
  return (
    <HighlightContext.Provider value={{ hoveredCard, setHoveredCard, isLocked, setLocked, onEditCard }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const RelatedHighlight: React.FC<{ text: string, type: 'hiragana' | 'romaji' }> = ({ text, type }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) {
      const clean = text.replace(/\*/g, '');
      return <Fragment>{clean}</Fragment>;
  }

  let cleanText = text;
  let manualMatch = { index: -1, length: 0, str: '' };
  const firstStar = text.indexOf('*');
  if (firstStar !== -1) {
      const secondStar = text.indexOf('*', firstStar + 1);
      if (secondStar !== -1) {
          const matchedPhrase = text.substring(firstStar + 1, secondStar);
          cleanText = text.substring(0, firstStar) + matchedPhrase + text.substring(secondStar + 1);
          manualMatch = { index: firstStar, length: matchedPhrase.length, str: matchedPhrase };
      }
  }

  let target = '';
  let index = 0;
  
  if (type === 'hiragana') {
    target = (hoveredCard.matchedForm && hoveredCard.matchedForm.reading) ? hoveredCard.matchedForm.reading : hoveredCard.card.reading;
    index = hoveredCard.index || 0;
  } else {
    target = (hoveredCard.matchedForm && hoveredCard.matchedForm.romaji) ? hoveredCard.matchedForm.romaji : hoveredCard.card.romaji;
    index = hoveredCard.index || 0;
  }

  if (!target) {
    return <Fragment>{cleanText}</Fragment>;
  }
  
  target = String(target || "").trim();
  let matchStr = target;
  let lowerText = cleanText.toLowerCase();
  
  if (!lowerText.includes(matchStr.toLowerCase())) {
    // Try prefix matching for conjugated verbs/adjectives
    let found = false;
    const minPrefixLength = type === 'hiragana' ? 2 : 3;
    for (let i = matchStr.length - 1; i >= Math.max(minPrefixLength, Math.floor(matchStr.length / 2)); i--) {
      const prefix = matchStr.substring(0, i);
      if (lowerText.includes(prefix.toLowerCase())) {
        if (type === 'hiragana') {
            const regex = new RegExp(`(${prefix}[ぁ-ん]*)`, 'i');
            const match = cleanText.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        } else if (type === 'romaji') {
            const regex = new RegExp(`(?:^|[^a-z])(${prefix}[a-z]*)`, 'i');
            const match = cleanText.match(regex);
            if (match) {
                matchStr = match[1];
                found = true;
                break;
            }
        }
        matchStr = prefix;
        found = true;
        break;
      }
    }
    if (!found && manualMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
    }
  }

  if (manualMatch.index !== -1) {
      const before = cleanText.substring(0, manualMatch.index);
      const match = manualMatch.str;
      const after = cleanText.substring(manualMatch.index + manualMatch.length);
      return (
        <Fragment>
          {before}
          <span className="rounded transition-all duration-200 bg-theme-accent text-white shadow-sm relative">
            {match}
          </span>
          {after}
        </Fragment>
      );
  }

  // To prevent regex errors with special characters
  const safeMatchStr = matchStr.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeMatchStr})`, 'gi');
  const parts = cleanText.split(regex);
  let matchCount = 0;

  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === matchStr.toLowerCase()) {
          const isCurrentMatch = matchCount === index;
          matchCount++;
          return <span key={i} className={`rounded transition-colors duration-200 ${isCurrentMatch ? 'bg-theme-accent text-white shadow-sm relative z-10' : 'bg-theme-accent/20 text-theme-accent'}`}>{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );
};

import { KanjiCard } from '../types';
import { Volume2, Edit2, Eye, X, BookOpen, Sparkles, Lightbulb, Copy, CheckCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { cleanMarkdownForDisplay } from './stringUtils';

interface VocabularyDetailWindowProps {
  card: KanjiCard;
  text: string;
  matchedForm?: any;
  isOpen: boolean;
  onClose: () => void;
  onEditCard?: (card: KanjiCard) => void;
}

const VocabularyDetailWindow: React.FC<VocabularyDetailWindowProps> = ({
  card,
  text,
  matchedForm,
  isOpen,
  onClose,
  onEditCard,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSpeak = async (e: React.MouseEvent, textToSpeak: string, audioUrl?: string | null) => {
    e.stopPropagation();
    setIsPlayingAudio(true);
    try {
      if (audioUrl) {
        await playAudioUrl(audioUrl, textToSpeak);
      } else {
        await playTTS(textToSpeak);
      }
    } catch (err) {
      console.warn("Audio playback error:", err);
    } finally {
      setTimeout(() => setIsPlayingAudio(false), 1200);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const info = [
      `【${card.kanji || card.reading}】`,
      card.reading && `Cách đọc: ${card.reading}`,
      card.romaji && `Romaji: ${card.romaji}`,
      card.sinoVietnamese && `Hán Việt: ${card.sinoVietnamese}`,
      card.wordType && `Loại từ: ${card.wordType}`,
      card.meaning && `Ý nghĩa: ${card.meaning}`,
      card.kanjiExplanation && `\n--- Giải thích chi tiết ---\n${cleanMarkdownForDisplay(card.kanjiExplanation)}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(info).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error("Copy error:", err));
  };

  const modalTarget = typeof document !== 'undefined' ? (document.getElementById('root') || document.body) : null;
  if (!modalTarget) return null;

  return createPortal(
    <div
      id="word-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="word-detail-modal-container"
        className="bg-theme-panel border border-theme-subtle text-theme-primary rounded-2xl shadow-2xl w-full max-w-2xl sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative z-10 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div id="word-detail-modal-header" className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-theme-subtle bg-theme-panel/95 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-theme-primary/80">
              <BookOpen className="w-4 h-4 text-theme-accent" />
              Chi Tiết Từ Vựng
            </span>
            {card.sinoVietnamese && (
              <span className="text-[10px] font-bold text-theme-inverted bg-theme-accent px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                {card.sinoVietnamese}
              </span>
            )}
            {card.wordType && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-theme-subtle bg-theme-base-alt text-theme-primary/80">
                {card.wordType}
              </span>
            )}
            {matchedForm && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-theme-accent/40 bg-theme-accent/15 text-theme-accent">
                Dạng chia: {matchedForm.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="word-detail-copy-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-theme-primary/80 hover:text-theme-accent bg-theme-base-alt hover:bg-theme-subtle/50 border border-theme-subtle transition-all cursor-pointer shadow-xs"
              title="Sao chép thông tin từ vựng"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-theme-success" />
                  <span className="text-theme-success font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
            <button
              id="word-detail-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-theme-primary/60 hover:text-theme-primary hover:bg-theme-hover transition-colors cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          {/* Hero Section */}
          <div id="word-detail-hero-section" className="bg-theme-base-alt border border-theme-subtle rounded-xl p-5 sm:p-6 shadow-inner flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-primary font-bold tracking-tight">
                {card.kanji || card.reading}
              </h3>
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                {card.reading && (
                  <span className="text-lg sm:text-xl font-serif font-medium text-theme-accent">
                    {card.reading}
                  </span>
                )}
                {card.romaji && (
                  <span className="text-sm font-sans text-theme-primary/70 italic">
                    ({card.romaji})
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                id="word-detail-audio-btn"
                onClick={(e) => handleSpeak(e, text || card.kanji || card.reading, matchedForm?.audioUrl || card.audioUrl)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
                  isPlayingAudio
                    ? 'bg-theme-accent text-theme-inverted ring-2 ring-theme-accent/50 scale-105'
                    : (matchedForm?.audioUrl || card.audioUrl)
                      ? 'bg-theme-accent text-theme-inverted hover:brightness-110 hover:scale-105 active:scale-95'
                      : 'bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 hover:scale-105 active:scale-95'
                }`}
                title={(matchedForm?.audioUrl || card.audioUrl) ? "Nghe file âm thanh MP3" : "Nghe phát âm"}
              >
                <Volume2 className="w-4 h-4" />
                <span>{(matchedForm?.audioUrl || card.audioUrl) ? "Nghe MP3 chuẩn" : "Phát âm"}</span>
              </button>
              {(matchedForm?.audioUrl || card.audioUrl) && (
                <span className="text-[8px] font-bold text-theme-accent uppercase tracking-widest">
                  Âm thanh chất lượng cao
                </span>
              )}
            </div>
          </div>

          {/* Meaning Section */}
          <div id="word-detail-meaning-section" className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-theme-accent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ý nghĩa tiếng Việt</span>
            </span>
            <div className="text-lg sm:text-xl font-medium text-theme-primary leading-relaxed bg-theme-base-alt/60 p-4 rounded-xl border border-theme-subtle">
              {card.meaning}
            </div>
          </div>

          {/* Matched Conjugation Form (if any) */}
          {matchedForm && (
            <div id="word-detail-matched-form-section" className="p-4 rounded-xl bg-theme-accent/10 border border-theme-accent/30 flex flex-col gap-2">
              <span className="text-xs uppercase font-bold text-theme-accent tracking-wider flex items-center gap-1.5">
                <span>Thể chia xuất hiện trong câu: {matchedForm.name}</span>
              </span>
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-serif font-bold text-theme-primary">{matchedForm.value}</span>
                  {matchedForm.reading && <span className="text-sm font-serif text-theme-accent">{matchedForm.reading}</span>}
                  {matchedForm.romaji && <span className="text-xs text-theme-primary/60 italic font-sans">({matchedForm.romaji})</span>}
                </div>
                <button
                  onClick={(e) => handleSpeak(e, matchedForm.value || matchedForm.reading || '', matchedForm.audioUrl)}
                  className="p-2 text-theme-accent hover:bg-theme-accent/15 rounded-lg cursor-pointer transition-colors"
                  title="Nghe dạng chia này"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              {matchedForm.meaning && (
                <p className="text-sm text-theme-primary/90 mt-0.5">{matchedForm.meaning}</p>
              )}
            </div>
          )}

          {/* Detailed Explanation / Kanji Origin */}
          {card.kanjiExplanation && (
            <div id="word-detail-explanation-section" className="p-4 sm:p-5 rounded-xl bg-theme-base-alt border border-theme-subtle space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-theme-accent flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Giải thích chi tiết & Phân tích chữ Hán</span>
              </span>
              <div className="text-sm sm:text-base text-theme-primary leading-relaxed whitespace-pre-wrap break-words font-sans">
                <Markdown>{cleanMarkdownForDisplay(card.kanjiExplanation)}</Markdown>
              </div>
            </div>
          )}

          {/* Conjugation Forms Grid */}
          {card.forms && card.forms.length > 0 && (
            <div id="word-detail-conjugations-section" className="space-y-2.5">
              <span className="text-xs uppercase tracking-widest font-bold text-theme-primary/70 flex items-center gap-1.5">
                <span>Các dạng biến thể / Thể chia ({card.forms.length})</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {card.forms.map((form) => (
                  <div
                    key={form.id || form.name}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                      matchedForm?.name === form.name
                        ? 'border-theme-accent bg-theme-accent/15 shadow-xs'
                        : 'border-theme-subtle bg-theme-base-alt/50 hover:border-theme-accent/40'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-theme-primary/60 block">
                        {form.name}
                      </span>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-serif font-bold text-theme-primary text-base">
                          {form.value}
                        </span>
                        {form.reading && (
                          <span className="text-xs font-serif text-theme-accent">
                            {form.reading}
                          </span>
                        )}
                      </div>
                      {form.meaning && (
                        <p className="text-xs text-theme-primary/70 truncate">{form.meaning}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleSpeak(e, form.value || form.reading || '', form.audioUrl)}
                      className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-lg cursor-pointer shrink-0 transition-colors"
                      title="Nghe phát âm dạng chia"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {(card.examples?.length || card.example) && (
            <div id="word-detail-examples-section" className="space-y-2.5">
              <span className="text-xs uppercase tracking-widest font-bold text-theme-primary/70 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
                <span>Câu ví dụ minh họa</span>
              </span>
              <div className="space-y-2.5">
                {card.examples && card.examples.length > 0 ? (
                  card.examples.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-4 rounded-xl bg-theme-base-alt border border-theme-subtle flex items-start justify-between gap-3 text-left shadow-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="font-serif text-base sm:text-lg text-theme-primary font-medium leading-relaxed">
                          {ex.sentence}
                        </p>
                        {ex.reading && (
                          <p className="text-xs text-theme-accent font-serif">{ex.reading}</p>
                        )}
                        {ex.translation && (
                          <p className="text-xs sm:text-sm text-theme-primary/80 italic pt-1 border-t border-theme-subtle/50">
                            {ex.translation}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleSpeak(e, ex.sentence, ex.audioUrl)}
                        className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-xl cursor-pointer shrink-0 transition-colors"
                        title="Nghe câu ví dụ"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : card.example ? (
                  <div className="p-4 rounded-xl bg-theme-base-alt border border-theme-subtle flex items-start justify-between gap-3 text-left shadow-xs">
                    <div className="space-y-1 min-w-0">
                      <p className="font-serif text-base sm:text-lg text-theme-primary font-medium leading-relaxed">
                        {card.example}
                      </p>
                      {card.exampleTranslation && (
                        <p className="text-xs sm:text-sm text-theme-primary/80 italic pt-1 border-t border-theme-subtle/50">
                          {card.exampleTranslation}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleSpeak(e, card.example!, card.audioUrl)}
                      className="p-2 text-theme-primary/50 hover:text-theme-accent hover:bg-theme-accent/10 rounded-xl cursor-pointer shrink-0 transition-colors"
                      title="Nghe câu ví dụ"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div id="word-detail-modal-footer" className="px-5 sm:px-6 py-3.5 border-t border-theme-subtle bg-theme-panel/95 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-theme-primary/50 hidden sm:inline">
            Bấm ESC hoặc nhấn ra ngoài để đóng cửa sổ
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {onEditCard && (
              <button
                id="word-detail-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onEditCard(card);
                  window.dispatchEvent(new CustomEvent('editCard', { detail: card }));
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-theme-subtle hover:border-theme-accent hover:text-theme-accent text-theme-primary/80 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa từ vựng</span>
              </button>
            )}
            <button
              id="word-detail-close-footer-btn"
              onClick={onClose}
              className="px-5 py-2 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>,
    modalTarget
  );
};

const InteractiveWord: React.FC<{ text: string, status: 'good' | 'bad' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }> = ({ text, status, card, occurrenceIndex = 0, matchedForm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const { setHoveredCard, onEditCard, isLocked, setLocked } = useContext(HighlightContext);

  useEffect(() => {
    if (isOpen && card) {
      setLocked(true);
      setHoveredCard({ card, index: occurrenceIndex, matchedForm }, true);
    } else if (!isOpen && card) {
      setLocked(false);
      setHoveredCard(null, true);
    }
  }, [isOpen]);

  let colorClass = "text-theme-accent";
  if (status === 'good') colorClass = "text-theme-success text-green-600 dark:text-green-400";
  if (status === 'bad') colorClass = "text-theme-danger text-red-500";
  if (status === 'new') colorClass = "text-theme-primary/90";

  if (!card) {
    return <span className={`${colorClass} font-bold`}>{text}</span>;
  }

  return (
    <span
      className="relative inline-block"
      ref={containerRef}
      onMouseEnter={() => card && setHoveredCard({ card, index: occurrenceIndex, matchedForm })}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <span 
        className={`${colorClass} font-bold cursor-pointer hover:underline border-b border-dashed border-current/60 hover:border-current hover:bg-theme-accent/10 rounded-xs px-0.5 transition-all`}
        onClick={(e) => {
           e.stopPropagation();
           setIsOpen(true);
        }}
        title="Nhấn để mở cửa sổ chi tiết từ vựng"
      >
        {text}
      </span>

      {isOpen && (
        <VocabularyDetailWindow
          card={card}
          text={text}
          matchedForm={matchedForm}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onEditCard={onEditCard}
        />
      )}
    </span>
  );
};


export const HighlightVietnamese: React.FC<{ text: string }> = ({ text }) => {
  const { hoveredCard } = React.useContext(HighlightContext);
  if (!hoveredCard || !text) {
      // If there are manual asterisks but no hover, we could just render without them,
      // but typically without hover we don't highlight. Let's just strip asterisks if no hover.
      const clean = text.replace(/\*/g, '');
      return <Fragment>{clean}</Fragment>;
  }

  // Check for manual *highlights* in Vietnamese text first
  let cleanText = text;
  let manualMatch = { index: -1, length: 0, str: '' };
  const firstStar = text.indexOf('*');
  if (firstStar !== -1) {
      const secondStar = text.indexOf('*', firstStar + 1);
      if (secondStar !== -1) {
          const matchedPhrase = text.substring(firstStar + 1, secondStar);
          cleanText = text.substring(0, firstStar) + matchedPhrase + text.substring(secondStar + 1);
          manualMatch = { index: firstStar, length: matchedPhrase.length, str: matchedPhrase };
      }
  }

  const card = hoveredCard.card;
  if (!card || !card.meaning) return <Fragment>{text}</Fragment>;

  let meanings = card.meaning.split(/[;,]/).map(s => String(s || "").trim()).filter(s => s.length > 0);
  
  if (hoveredCard.matchedForm && hoveredCard.matchedForm.meaning) {
    meanings = hoveredCard.matchedForm.meaning.split(/[;,]/).map(s => String(s || "").trim()).filter(s => s.length > 0);
  }
  
  let bestMatch = manualMatch;
  const lowerText = cleanText.toLowerCase();

  // 1. Exact match for each meaning segment
  if (manualMatch.index === -1) {
    meanings.forEach(m => {
      const lowerM = m.toLowerCase();
      const idx = lowerText.indexOf(lowerM);
      if (idx !== -1 && m.length > bestMatch.length) {
        bestMatch = { index: idx, length: m.length, str: cleanText.substring(idx, idx + m.length) };
      }
    });
  }

  // 2. Partial / word-sequence matching if no exact match is found
  if (bestMatch.index === -1 && manualMatch.index === -1) {
    meanings.forEach(m => {
      let lowerM = m.toLowerCase();
      // Remove common Vietnamese prefix words that might prevent a match
      const prefixes = ['sự ', 'niềm ', 'cái ', 'con ', 'việc ', 'làm ', 'người '];
      prefixes.forEach(p => {
        if (lowerM.startsWith(p)) lowerM = lowerM.substring(p.length);
      });
      
      const words = lowerM.split(/[\s\.\,\!\?]+/).filter(w => w.length > 0);
      
      // Try combinations of words from longest to shortest. Limit to max 6 words to prevent UI freeze
      const maxPhraseLength = Math.min(words.length, 6);
      for (let numWords = maxPhraseLength; numWords >= 1; numWords--) {
        let foundMatch = false;
        for (let start = 0; start <= words.length - numWords; start++) {
          const phrase = words.slice(start, start + numWords).join(' ');
          
          // Skip very short single words
          if (phrase.length < 3 && numWords === 1) continue; 
          
          // Skip common stop words if it's a single word
          const ignoreWords = [
            'một', 'những', 'các', 'để', 'và', 'của', 'là', 'có', 'không', 
            'sự', 'niềm', 'việc', 'làm', 'cái', 'trong', 'trên', 'dưới', 
            'với', 'cho', 'vào', 'ra', 'ở', 'tại', 'thì', 'mà', 'như', 
            'đã', 'đang', 'sẽ', 'bị', 'được', 'người', 'nhà', 'khi'
          ];
          if (numWords === 1 && ignoreWords.includes(phrase)) continue;

          let searchIdx = 0;
          const phraseLower = phrase.toLowerCase();
          while (searchIdx < lowerText.length) {
            const idx = lowerText.indexOf(phraseLower, searchIdx);
            if (idx === -1) break;
            const before = idx === 0 ? ' ' : lowerText[idx - 1];
            const after = idx + phrase.length >= lowerText.length ? ' ' : lowerText[idx + phrase.length];
            const isWordChar = (c) => /[\p{L}\p{N}]/u.test(c);
            if (!isWordChar(before) && !isWordChar(after)) {
              if (phrase.length > bestMatch.length) {
                bestMatch = { index: idx, length: phrase.length, str: cleanText.substring(idx, idx + phrase.length) };
                foundMatch = true;
              }
            }
            searchIdx = idx + 1;
          }
        }
        if (foundMatch) break;
      }
    });
  }

  if (bestMatch.index === -1) {
      return <Fragment>{cleanText}</Fragment>;
  }

  const matchStr = bestMatch.str;
  const safeMatchStr = matchStr.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeMatchStr})`, 'gi');
  const parts = cleanText.split(regex);
  let matchCount = 0;
  const targetIndex = hoveredCard.index || 0;

  return (
    <Fragment>
      {parts.map((part, i) => {
        if (part.toLowerCase() === matchStr.toLowerCase()) {
          const isCurrentMatch = matchCount === targetIndex;
          matchCount++;
          return <span key={i} className={`rounded transition-colors duration-200 ${isCurrentMatch ? 'bg-theme-accent text-white shadow-sm relative z-10' : 'bg-theme-accent/20 text-theme-accent'}`}>{part}</span>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </Fragment>
  );
};


const suffixes = [
  "させられませんでした", "させられません", "させられました", "させられる", "させられた", "させられて", "させられない",
  "させませんでした", "させません", "させました", "させます", "させる", "させた", "させて", "させない",
  "られませんでした", "られません", "られました", "られます", "られる", "られた", "られて", "られない",
  "れませんでした", "れません", "れました", "れます", "れる", "れた", "れて", "れない",
  "ませんでした", "ません", "ました", "ます", "ましょう",
  "しまいました", "しましょう", "しません", "しました", "します", "しまう", "しまった", "しまって",
  "いました", "いません", "います", "いる", "いた", "いて", "いない",
  "ありました", "ありません", "あります", "ある", "あった", "あって",
  "おきました", "おきません", "おきます", "おく", "おいた", "おいて", "おかない",
  "みました", "みません", "みます", "みる", "みた", "みて", "みない",
  "いきました", "いきません", "いきます", "いく", "いった", "いって", "いかない",
  "きました", "きません", "きます", "くる", "きた", "きて", "こない",
  "やすいです", "やすい", "やすかった", "やすく",
  "にくいです", "にくい", "にくかった", "にくく",
  "すぎます", "すぎました", "すぎません", "すぎる", "すぎた", "すぎて",
  "なさい", "なさいました", "なさいません", "なさる", "なさった", "なさって",
  "たいです", "たい", "たかった", "たく", "たくない", "たくありません", "たくなかった", "たくありませんでした",
  "たがります", "たがりました", "たがりません", "たがる", "たがった", "たがって",
  "かもしれない", "かもしれません",
  "でしょう", "だろう", "でしょうか",
  "らしいです", "らしい", "らしかった", "らしく",
  "そうです", "そう", "そうだった", "そうに", "そうな",
  "みたいです", "みたい", "みたいだった", "みたいに", "みたいな",
  "ではありません", "じゃありません", "ではない", "じゃない",
  "です", "でした", "だ", "だった",
  "から", "ので", "のに", "けれども", "けれど", "けど", "が", "と", "ば", "たら", "なら"
].sort((a, b) => b.length - a.length);


export function trimTrailingParticles(text: string) {
  const particles = [
    "から", "ので", "のに", "けれども", "けれど", "けど", "が", "と", "ば", "たら", "なら",
    "し", "ね", "よ", "わ", "ぞ", "ぜ", "か", "かしら", "さ", "くらい", "ぐらい", "だけ",
    "ばかり", "など", "まで", "でも", "とか", "や", "の", "に", "を", "へ", "で", "は", "も", "って"
  ].sort((a, b) => b.length - a.length);
  
  let changed = true;
  let result = text;
  while (changed) {
    changed = false;
    for (const p of particles) {
      if (result.endsWith(p) && result.length > p.length) {
        // Ensure we don't trim the entire string
        if (result === p) break;
        result = result.substring(0, result.length - p.length);
        changed = true;
        break;
      }
    }
  }
  return result;
}

export function trimAuxiliary(text: string) {
  let changed = true;
  let result = text;
  while (changed) {
    changed = false;
    for (const suffix of suffixes) {
      if (result.endsWith(suffix) && result.length > suffix.length) {
        result = result.substring(0, result.length - suffix.length);
        changed = true;
        break;
      }
    }
  }
  return result;
}export const tokenizeExampleText = (example: string, targetWord: string, mainDeck?: KanjiCard[], fallbackTargetCard?: KanjiCard, vocabScores?: Record<string, number>) => {
  if (!example) return [];

  const uniqueWords = new Map<string, KanjiCard>();
  mainDeck?.forEach(card => {
    const wordStr = card.kanji || card.reading;
    if (!wordStr || wordStr.length === 0) return;
    
    let isMatch = example.includes(wordStr);
    
    if (!isMatch && card.reading && card.reading.length > 1 && example.includes(card.reading)) {
      isMatch = true;
    }
    
    if (!isMatch && card.kanji) {
      const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
      if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem) && example.includes(stem)) {
        isMatch = true;
      }
    }

    if (!isMatch && card.forms) {
      for (const form of card.forms) {
        if ((form.value && example.includes(form.value)) || (form.reading && example.includes(form.reading))) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      if (!uniqueWords.has(wordStr)) {
        uniqueWords.set(wordStr, card);
      } else {
        const existing = uniqueWords.get(wordStr)!;
        const eScore = (existing.interval || 0) + (existing.repetition || 0);
        const cScore = (card.interval || 0) + (card.repetition || 0);
        if (cScore > eScore) {
          uniqueWords.set(wordStr, card);
        }
      }
    }
  });

  const deckWordsInExample = Array.from(uniqueWords.values());

  const allMatchCandidates: { matchStr: string, card: KanjiCard, isStem?: boolean, matchedForm?: any }[] = [];

  deckWordsInExample.forEach(card => {
    if (card.kanji) allMatchCandidates.push({ matchStr: card.kanji, card });
    if (card.reading && card.reading !== card.kanji && (card.reading.length > 1 || !card.kanji)) allMatchCandidates.push({ matchStr: card.reading, card });
    if (card.kanji) {
      // Remove trailing hiragana for verbs/adjectives if no forms are provided
      const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
      if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem)) {
        allMatchCandidates.push({ matchStr: stem, card, isStem: true });
      }
    }
    if (card.forms) {
      card.forms.forEach(f => {
        if (f.value) {
          allMatchCandidates.push({ matchStr: f.value, card, matchedForm: f });
        }
        if (f.reading && f.reading !== f.value) {
          allMatchCandidates.push({ matchStr: f.reading, card, matchedForm: f });
        }
      });
    }
  });

  // Remove duplicates and sort globally by length descending
  const uniqueCandidates = Array.from(new Map(allMatchCandidates.map(c => [c.matchStr, c])).values());
  uniqueCandidates.sort((a, b) => b.matchStr.length - a.matchStr.length);

  let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' | 'new', card?: KanjiCard, occurrenceIndex?: number, matchedForm?: any }[] = [];
  
  // Parse manual *highlights* first
  let currentExample = example;
  let nextAsterisk = currentExample.indexOf('*');
  while (nextAsterisk !== -1) {
    const endAsterisk = currentExample.indexOf('*', nextAsterisk + 1);
    if (endAsterisk !== -1) {
      if (nextAsterisk > 0) {
        tokens.push({ text: currentExample.substring(0, nextAsterisk), status: 'neutral' });
      }
      const markedText = currentExample.substring(nextAsterisk + 1, endAsterisk);
      tokens.push({ text: markedText, status: 'target', card: fallbackTargetCard });
      currentExample = currentExample.substring(endAsterisk + 1);
      nextAsterisk = currentExample.indexOf('*');
    } else {
      break;
    }
  }
  if (currentExample.length > 0) {
    tokens.push({ text: currentExample, status: 'neutral' });
  }

  // Fallback for the targetWord of this intensive item
  let targetWordCard: KanjiCard | undefined = undefined;
  if (targetWord) {
     targetWordCard = mainDeck?.find(c => c.kanji === targetWord || c.reading === targetWord) || fallbackTargetCard;
  }

  uniqueCandidates.forEach(({ matchStr, card, isStem, matchedForm }) => {
    let status: 'good' | 'bad' | 'neutral' | 'new' | 'target' = 'good';
    if (targetWord && (card.kanji === targetWord || card.reading === targetWord || card.id === targetWordCard?.id)) {
      status = 'target';
    } else if (vocabScores && vocabScores[card.id] !== undefined) {
      const score = vocabScores[card.id];
      if (score < 0) {
        status = 'bad';
      } else if (score > 0) {
        status = 'good';
      } else {
        status = 'new';
      }
    } else {
      const rep = card.repetition || 0;
      const int = card.interval || 0;
      if (rep === 0 && int === 0) {
        status = 'new';
      } else if (rep === 0 || int === 0) {
        status = 'bad';
      }
    }

    const newTokens: typeof tokens = [];
    tokens.forEach(token => {
      if (token.status !== 'neutral') {
        newTokens.push(token);
        return;
      }
      
      let currentText = token.text;
      let searchIndex = 0;
      
      while (currentText.length > 0) {
        const idx = currentText.indexOf(matchStr, searchIndex);
        if (idx === -1) {
          newTokens.push({ text: currentText, status: 'neutral' });
          break;
        }
        
        // If it's a stem, check if it's followed by another Kanji
        if (isStem) {
          const nextChar = currentText[idx + matchStr.length];
          if (nextChar && /[\u4e00-\u9faf々]/.test(nextChar)) {
            // Invalid match, skip and continue searching
            searchIndex = idx + 1;
            continue;
          }
        }
        
        // Valid match found!
        if (idx > 0) {
          newTokens.push({ text: currentText.substring(0, idx), status: 'neutral' });
        }
        
        let matchLen = matchStr.length;
        if (isStem) {
           // Consume trailing hiragana
           while (idx + matchLen < currentText.length) {
              const c = currentText[idx + matchLen];
              if (/[ぁ-ん]/.test(c)) {
                 matchLen++;
              } else {
                 break;
              }
           }
        }
        
        let actualMatchStr = matchStr;
        
        if (isStem) {
          actualMatchStr = currentText.substring(idx, idx + matchLen);
          let trimmed = trimTrailingParticles(actualMatchStr);
          if (trimmed && trimmed.length >= matchStr.length) {
            actualMatchStr = trimmed;
          }
        }
        
        newTokens.push({ text: actualMatchStr, status, card, matchedForm });
        
        currentText = currentText.substring(idx + actualMatchStr.length);
        searchIndex = 0;
      }
    });
    tokens = newTokens;
  });

  

  const newTokens: typeof tokens = [];
  tokens.forEach(token => {
    if (token.status !== 'neutral' || !targetWord) {
      newTokens.push(token);
      return;
    }
    
    let targetToHighlight = targetWord;
    
    if (!token.text.includes(targetToHighlight)) {
       // Try removing trailing okurigana
       const stem = targetWord.replace(/[ぁ-ん]+$/, '');
       if (stem && stem !== targetWord && /[\u4e00-\u9faf々]/.test(stem) && token.text.includes(stem)) {
           targetToHighlight = stem;
       } else {
           const kanjiChars = targetWord.match(/[\u4e00-\u9faf]+/g);
           if (kanjiChars && kanjiChars.length > 0) {
               const justKanji = kanjiChars.join('');
               targetToHighlight = token.text.includes(justKanji) ? justKanji : kanjiChars[0];
           }
       }
    }

    if (targetToHighlight !== targetWord && targetToHighlight.length > 0 && token.text.includes(targetToHighlight)) {
      const safeStem = targetToHighlight.replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safeStem}[ぁ-ん]*)`, 'g');
      const parts = token.text.split(regex);
      parts.forEach((part) => {
        if (part.length > 0) {
          if (part.startsWith(targetToHighlight)) {
            let trimmed = trimAuxiliary(part);
            if (!trimmed) trimmed = part;
            newTokens.push({ text: trimmed, status: 'target', card: targetWordCard });
            const remainder = part.substring(trimmed.length);
            if (remainder.length > 0) {
              newTokens.push({ text: remainder, status: 'neutral' });
            }
          } else {
            newTokens.push({ text: part, status: 'neutral' });
          }
        }
      });

    } else if (token.text.includes(targetToHighlight)) {
      const parts = token.text.split(targetToHighlight);
      parts.forEach((part, i) => {
        if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
        if (i < parts.length - 1) newTokens.push({ text: targetToHighlight, status: 'target', card: targetWordCard });
      });
    } else {
      newTokens.push(token);
    }
  });
  tokens = newTokens;

  const cardCounts = new Map<string, number>();
  tokens.forEach(token => {
    if (token.card) {
      const key = token.card.id || token.text;
      const count = cardCounts.get(key) || 0;
      token.occurrenceIndex = count;
      cardCounts.set(key, count + 1);
    }
  });

  return tokens;
};

export const renderExampleHighlight = (example: string, targetWord: string, mainDeck?: KanjiCard[], fallbackTargetCard?: KanjiCard, vocabScores?: Record<string, number>) => {
  if (!example) return <Fragment>“{example}”</Fragment>;
  const tokens = tokenizeExampleText(example, targetWord, mainDeck, fallbackTargetCard, vocabScores);
  
  return (
    <Fragment>
      {tokens.map((t, i) => {
        if (t.status === 'neutral') return <Fragment key={i}>{t.text}</Fragment>;
        return <InteractiveWord key={i} text={t.text} status={t.status} card={t.card} occurrenceIndex={t.occurrenceIndex} matchedForm={t.matchedForm} />;
      })}
    </Fragment>
  );
};

