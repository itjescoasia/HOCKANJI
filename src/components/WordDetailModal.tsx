import React, { useState, useEffect, Fragment } from 'react';
import {
  X,
  Volume2,
  Copy,
  CheckCircle,
  BookOpen,
  Eye,
  Edit2,
  Lightbulb,
  Search,
  FileText,
  Sparkles
} from 'lucide-react';
import Markdown from 'react-markdown';
import { IntensiveWord, IntensiveExample, KanjiCard, FuriganaMode } from '../types';
import { getCategoryBadgeStyle, calculateMasteryPercent } from './IntensiveStudy';
import { playTTS, playAudioUrl } from '../utils/playTTS';
import { cleanMarkdownForDisplay } from '../utils/stringUtils';
import { FuriganaSentence, FuriganaToggle } from './FuriganaSentence';
import { usePersistentState } from '../hooks/usePersistentState';

interface WordDetailModalProps {
  word: IntensiveWord;
  matchedCard?: KanjiCard | null;
  isOpen: boolean;
  onClose: () => void;
  onStartReview?: () => void;
  onEdit?: () => void;
  renderHighlight?: (text: string | undefined | null, kanji: string) => React.ReactNode;
}

export default function WordDetailModal({
  word,
  matchedCard,
  isOpen,
  onClose,
  onStartReview,
  onEdit,
  renderHighlight,
}: WordDetailModalProps) {
  const [furiganaMode, setFuriganaMode] = usePersistentState<FuriganaMode>('app_furigana_mode', 'always');
  const [copied, setCopied] = useState(false);
  const [searchExampleText, setSearchExampleText] = useState('');
  const [activeAudioText, setActiveAudioText] = useState<string | null>(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const playAudio = async (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    const clean = text?.trim() || '';
    if (clean) setActiveAudioText(clean);
    try {
      if (audioUrl) {
        await playAudioUrl(audioUrl, text);
      } else if (clean) {
        await playTTS(clean);
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
    } finally {
      setTimeout(() => setActiveAudioText(null), 1200);
    }
  };

  const handleCopy = () => {
    const lines: string[] = [];
    lines.push(`【${word.word}】`);
    if (word.reading) lines.push(`Cách đọc: ${word.reading}`);
    if (word.romaji) lines.push(`Romaji: ${word.romaji}`);
    if (matchedCard?.sinoVietnamese) lines.push(`Hán Việt: ${matchedCard.sinoVietnamese}`);
    if (word.category) lines.push(`Loại từ: ${word.category}`);
    if (matchedCard?.meaning) lines.push(`Ý nghĩa: ${matchedCard.meaning}`);
    if (word.explanation) {
      lines.push('\n--- Giải thích chi tiết ---');
      lines.push(word.explanation);
    }
    if (word.examples && word.examples.length > 0) {
      lines.push(`\n--- Ví dụ minh họa (${word.examples.length} câu) ---`);
      word.examples.forEach((ex, idx) => {
        lines.push(`${idx + 1}. ${ex.sentence}`);
        if (ex.reading) lines.push(`   ${ex.reading}`);
        if (ex.translation) lines.push(`   -> ${ex.translation}`);
        if (ex.specialNote) lines.push(`   * Ghi chú: ${ex.specialNote}`);
      });
    }

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
    });
  };

  const filteredExamples = word.examples.filter(ex => {
    if (!searchExampleText.trim()) return true;
    const q = searchExampleText.toLowerCase();
    return (
      ex.sentence?.toLowerCase().includes(q) ||
      ex.translation?.toLowerCase().includes(q) ||
      ex.reading?.toLowerCase().includes(q) ||
      ex.romaji?.toLowerCase().includes(q) ||
      ex.specialNote?.toLowerCase().includes(q)
    );
  });

  const masteryPercent = calculateMasteryPercent(word);
  const masteredExamplesCount = word.examples.filter(
    ex => ex.jaToViMastered || ex.viToJaMastered || ex.mastered
  ).length;

  return (
    <div
      id="word-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="word-detail-modal-container"
        className="bg-theme-base border border-theme-subtle rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-theme-subtle bg-theme-panel/70">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-theme-primary/60">
              <BookOpen className="w-4 h-4 text-theme-accent" />
              Chi Tiết Từ Vựng
            </span>
            <span className={getCategoryBadgeStyle(word.category, "text-[10px] font-bold px-2 py-0.5 rounded-full border border-theme-subtle bg-theme-hover text-theme-primary/70")}>
              {word.category}
            </span>
            {matchedCard?.wordType && matchedCard.wordType !== word.category && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-theme-accent/30 bg-theme-accent/10 text-theme-accent">
                {matchedCard.wordType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-theme-primary/80 hover:text-theme-accent bg-theme-hover hover:bg-theme-subtle/40 border border-theme-subtle transition-all cursor-pointer"
              title="Sao chép toàn bộ thông tin từ vựng"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500 font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao chép</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-theme-primary/60 hover:text-theme-primary hover:bg-theme-hover transition-colors cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar">
          {/* Section 1: Hero Card (Word, Reading, Romaji, Audio) */}
          <div className="bg-theme-base-alt border border-theme-subtle rounded-xl p-5 sm:p-6 shadow-inner flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative">
            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-primary font-bold tracking-tight">
                  {word.word}
                </h2>
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={(e) => playAudio(e, word.word || word.reading, word.audioUrl)}
                    className={`p-2 rounded-full border border-theme-subtle shadow-sm transition-all duration-200 cursor-pointer ${
                      activeAudioText === (word.word || word.reading)?.trim()
                        ? 'scale-110 text-theme-accent bg-theme-accent/25 ring-2 ring-theme-accent/50 animate-pulse'
                        : word.audioUrl
                          ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/25 hover:scale-105 active:scale-95'
                          : 'text-theme-primary/70 hover:text-theme-accent hover:bg-theme-hover hover:scale-105 active:scale-95'
                    }`}
                    title={word.audioUrl ? "Nghe file âm thanh MP3 (Inworld AI)" : "Nghe phát âm"}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  {word.audioUrl && (
                    <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest">
                      MP3
                    </span>
                  )}
                </div>
              </div>

              {/* Reading, Romaji & Sino-Vietnamese */}
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap pt-1">
                {word.reading && (
                  <span className="text-xl sm:text-2xl text-theme-accent font-medium">
                    {word.reading}
                  </span>
                )}
                {word.romaji && (
                  <span className="text-sm sm:text-base font-mono text-theme-primary/60 px-2 py-0.5 rounded bg-theme-hover/60 border border-theme-subtle">
                    [{word.romaji}]
                  </span>
                )}
                {matchedCard?.sinoVietnamese && (
                  <span className="text-xs sm:text-sm font-serif font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                    Hán Việt: {matchedCard.sinoVietnamese}
                  </span>
                )}
              </div>

              {/* Core Meaning from matched card if available */}
              {matchedCard?.meaning && (
                <div className="pt-2 text-theme-primary/90 text-sm sm:text-base font-medium flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs uppercase font-bold text-theme-accent tracking-wider">Ý nghĩa cốt lõi:</span>
                  <span>{matchedCard.meaning}</span>
                </div>
              )}
            </div>

            {/* Quick stats badge */}
            <div className="shrink-0 bg-theme-base border border-theme-subtle/80 rounded-xl p-3.5 sm:p-4 text-center min-w-[130px] sm:min-w-[160px] shadow-sm">
              <div className="text-[10px] uppercase font-bold tracking-widest text-theme-primary/50 mb-1">
                Độ Thành Thạo
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-theme-accent mb-1.5">
                {masteryPercent}%
              </div>
              <div className="w-full bg-theme-subtle h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    masteryPercent >= 80
                      ? 'bg-green-500'
                      : masteryPercent >= 40
                        ? 'bg-theme-accent'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-theme-primary/60 font-medium">
                {masteredExamplesCount} / {word.examples.length} câu đã nhớ
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Explanation & Grammar Structure */}
          {(word.explanation || word.category) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-theme-accent">
                <Sparkles className="w-4 h-4" />
                <span>Giải Thích Chi Tiết & Cấu Trúc Ngữ Pháp</span>
              </div>
              <div className="text-theme-primary/95 text-sm sm:text-base leading-relaxed bg-theme-hover/40 p-5 sm:p-6 rounded-xl border border-theme-subtle border-l-4 border-l-theme-accent shadow-inner markdown-body whitespace-pre-wrap">
                <Markdown>
                  {(word.category ? `**Phân loại từ**: ${word.category}\n\n` : '') +
                    cleanMarkdownForDisplay(word.explanation || '')}
                </Markdown>
              </div>
            </div>
          )}

          {/* Section 3: Kanji Explanation from matched card */}
          {matchedCard?.kanjiExplanation && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <FileText className="w-4 h-4" />
                <span>Ý Nghĩa & Chi Tiết Các Chữ Hán Cấu Thành</span>
              </div>
              <div className="text-theme-primary/90 text-sm sm:text-base leading-relaxed bg-amber-500/5 p-5 rounded-xl border border-amber-500/20 shadow-inner markdown-body whitespace-pre-wrap">
                <Markdown>{cleanMarkdownForDisplay(matchedCard.kanjiExplanation)}</Markdown>
              </div>
            </div>
          )}

          {/* Section 4: Verb / Adjective Forms (if present in matched card) */}
          {matchedCard?.forms && matchedCard.forms.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-theme-accent">
                <BookOpen className="w-4 h-4" />
                <span>Các Thể Biến Đổi Của Từ ({matchedCard.forms.length} thể)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {matchedCard.forms.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-theme-base-alt border border-theme-subtle hover:border-theme-accent/40 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-theme-primary/50 block">
                        {f.name}
                      </span>
                      <span className="text-base font-serif font-semibold text-theme-primary block">
                        {f.value}
                      </span>
                      {(f.reading || f.romaji) && (
                        <span className="text-xs text-theme-accent block">
                          {f.reading} {f.romaji ? `[${f.romaji}]` : ''}
                        </span>
                      )}
                      {f.meaning && (
                        <span className="text-xs text-theme-primary/70 italic block">
                          {f.meaning}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => playAudio(e, f.value, f.audioUrl)}
                      className="p-2 rounded-full text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover transition-colors cursor-pointer"
                      title="Nghe thể này"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Examples List */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme-subtle pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold uppercase tracking-wider text-theme-primary font-serif">
                  Danh Sách Câu Ví Dụ Minh Họa ({word.examples.length})
                </span>
                <FuriganaToggle mode={furiganaMode} onChange={setFuriganaMode} />
              </div>

              {/* Quick filter within modal */}
              {word.examples.length > 2 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-theme-primary/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchExampleText}
                    onChange={(e) => setSearchExampleText(e.target.value)}
                    placeholder="Lọc câu ví dụ..."
                    className="w-full bg-theme-hover border border-theme-subtle rounded-lg py-1.5 pl-8 pr-3 text-xs text-theme-primary focus:outline-none focus:border-theme-accent placeholder:text-theme-primary/40"
                  />
                  {searchExampleText && (
                    <button
                      onClick={() => setSearchExampleText('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-primary/40 hover:text-theme-primary text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredExamples.length === 0 ? (
              <div className="text-center py-8 text-theme-primary/40 text-sm italic bg-theme-hover/20 rounded-xl border border-dashed border-theme-subtle">
                {searchExampleText ? 'Không tìm thấy câu ví dụ phù hợp với từ khóa.' : 'Chưa có câu ví dụ nào cho chuyên đề này.'}
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredExamples.map((ex, idx) => {
                  const isMastered = ex.jaToViMastered || ex.viToJaMastered || ex.mastered;
                  return (
                    <div
                      key={ex.id || idx}
                      className="p-4 sm:p-5 rounded-xl bg-theme-base-alt border border-theme-subtle hover:border-theme-accent/50 transition-all space-y-2.5 shadow-sm relative group"
                    >
                      {/* Example header & Japanese sentence */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="w-6 h-6 rounded-full bg-theme-hover border border-theme-subtle text-theme-primary/60 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1 space-y-1">
                            <div className="text-base sm:text-lg text-theme-primary font-medium leading-relaxed">
                              {furiganaMode === 'off' ? (
                                renderHighlight
                                  ? renderHighlight(ex.sentence, word.word || word.reading)
                                  : ex.sentence
                              ) : (
                                <FuriganaSentence
                                  sentence={ex.sentence}
                                  furigana={ex.furigana}
                                  mode={furiganaMode}
                                  deck={matchedCard ? [matchedCard] : undefined}
                                  autoFetch={true}
                                />
                              )}
                            </div>
                            {ex.reading && furiganaMode === 'off' && (
                              <div className="text-xs sm:text-sm text-theme-accent font-medium">
                                {ex.reading}
                              </div>
                            )}
                            {ex.romaji && (
                              <div className="text-xs font-mono text-theme-primary/50">
                                {ex.romaji}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Audio & Mastered Status */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isMastered && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
                              Đã thuộc
                            </span>
                          )}
                          <button
                            onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                            className={`p-2 rounded-full border border-theme-subtle transition-all cursor-pointer ${
                              activeAudioText === ex.sentence?.trim()
                                ? 'scale-110 text-theme-accent bg-theme-accent/25 ring-2 ring-theme-accent/50 animate-pulse'
                                : ex.audioUrl
                                  ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20'
                                  : 'text-theme-primary/60 hover:text-theme-accent hover:bg-theme-hover'
                            }`}
                            title={ex.audioUrl ? "Nghe file âm thanh MP3" : "Nghe phát âm"}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Vietnamese translation */}
                      {ex.translation && (
                        <div className="text-sm sm:text-base text-theme-primary/90 pl-9 border-t border-theme-subtle/40 pt-2 font-normal">
                          {ex.translation}
                        </div>
                      )}

                      {/* Special Note */}
                      {ex.specialNote && (
                        <div className="ml-9 p-3 rounded-lg bg-theme-hover/60 border border-theme-subtle/80 flex items-start gap-2 text-xs sm:text-sm text-theme-primary/80">
                          <Lightbulb className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
                          <div className="flex-1 whitespace-pre-wrap">
                            <span className="font-semibold text-theme-accent">Ghi chú: </span>
                            {cleanMarkdownForDisplay(ex.specialNote)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-theme-subtle bg-theme-panel/70">
          <div className="flex items-center gap-2">
            {onStartReview && word.examples.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onStartReview();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-theme-primary text-theme-base rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-theme-accent transition-colors shadow-sm cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ôn tập câu</span>
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-theme-hover text-theme-primary/80 hover:text-theme-primary rounded-lg text-xs font-medium border border-theme-subtle transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa từ</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-theme-primary/80 hover:text-theme-primary bg-theme-hover hover:bg-theme-subtle/40 border border-theme-subtle transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
