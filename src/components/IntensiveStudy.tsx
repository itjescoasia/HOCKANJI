import { usePersistentState } from '../hooks/usePersistentState';
import { playTTS, generateAndUploadTTS, playAudioUrl } from '../utils/playTTS';

import localforage from 'localforage';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import Markdown from 'react-markdown';
import React, { useState, Fragment, useEffect } from "react";
import Fuse from "fuse.js";
import {
  IntensiveWord,
  IntensiveExample,
  WordCategory,
  KanjiCard,
  FuriganaMode,
} from "../types";
import {
  Search,
  Trash2,
  ArrowLeft,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  GripVertical,
  Lightbulb,
  Lock,
  Unlock,
  Volume2,
  CopyPlus, Copy, Music,
  CheckCircle,
  CheckCircle2,
  Circle,
  Info,
  BookOpen,
  MessageCircle,
  ArrowRight,
  PlusCircle,
  X,
  FileText,
  Sparkles,
  AlertTriangle,
  ArrowRightLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import WordDetailModal from "./WordDetailModal";
import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";
import { FuriganaSentence, FuriganaToggle } from "./FuriganaSentence";
import { fetchFuriganaWithGemini } from "../utils/furigana";


export function calculateMasteryPercent(word: IntensiveWord): number {
  if (word.manualStatus === 'mastered') return 100;
  if (!word.examples || word.examples.length === 0) return 0;
  const targetScore = Math.max(1, word.examples.length * 3);
  let currentScore = word.reviewScore || 0;
  let legacyScore = 0;
  word.examples.forEach(ex => {
    if (ex.jaToViMastered || ex.viToJaMastered || ex.mastered) {
      legacyScore += 3;
    }
  });
  const finalScore = Math.max(currentScore, legacyScore);
  const calculated = Math.max(0, Math.min(100, Math.round((finalScore / targetScore) * 100)));
  if (word.manualStatus === 'learning' && calculated >= 100) {
    return 95;
  }
  return calculated;
}

export function isWordMastered(word: IntensiveWord): boolean {
  if (word.manualStatus === 'mastered') return true;
  if (word.manualStatus === 'learning') return false;
  return calculateMasteryPercent(word) >= 100;
}

export function getCategoryBadgeStyle(typeStr: string | undefined, defaultClasses: string) {
  if (!typeStr) return defaultClasses;
  const type = typeStr.trim();
  if (type === "Động từ nhóm I") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] border-[var(--badge-blue-border)]";
  } else if (type === "Động từ nhóm II") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)] border-[var(--badge-purple-border)]";
  } else if (type === "Động từ nhóm III") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] border-[var(--badge-pink-border)]";
  } else if (type === "Danh từ") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-emerald-bg)] text-[var(--badge-emerald-text)] border-[var(--badge-emerald-border)]";
  } else if (type === "Tính từ đuôi-i" || type === "Tính từ i") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-amber-bg)] text-[var(--badge-amber-text)] border-[var(--badge-amber-border)]";
  } else if (type === "Tính từ đuôi-na" || type === "Tính từ na") {
    return "text-[10px] font-bold px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-sm border bg-[var(--badge-orange-bg)] text-[var(--badge-orange-text)] border-[var(--badge-orange-border)]";
  }
  return defaultClasses;
}

import { normalizeSentence, cleanTextForSearch, cleanMarkdownForDisplay, calculateSimilarity } from "../utils/stringUtils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatCreatedAt } from "../lib/dateUtils";

interface IntensiveStudyProps {
  onStartTopicReview?: (topicDeck: IntensiveWord[]) => void;
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  onAddWord: (word: IntensiveWord) => void;
  onRemoveWord: (id: string) => void;
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void;
  onReorderDeck?: (deck: IntensiveWord[]) => void;
  initialSearchQuery?: string;
  initialSelectedWordId?: string | null;
}

const CATEGORIES: WordCategory[] = [
  "Danh từ",
  "Động từ nhóm I",
  "Động từ nhóm II",
  "Động từ nhóm III",
  "Tính từ đuôi-i",
  "Tính từ đuôi-na",
  "Ngữ pháp",
  "Trạng từ (副詞)",
  "Khác",
];

function SortableWordItem({
  word,
  searchQuery,
  onRemoveWord,
  onSelectWord,
}: {
  key?: React.Key;
  word: IntensiveWord;
  searchQuery: string;
  onRemoveWord: (id: string) => void;
  onSelectWord: (id: string) => void;
}) {
  const isDragDisabled = !!String(searchQuery || "").trim();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: word.id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms ease',
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-theme-hover border ${isDragging ? 'border-theme-accent shadow-2xl scale-[1.02]' : 'border-theme-subtle'} rounded p-6 hover:border-theme-accent/50 transition-colors cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left relative group aspect-square sm:aspect-auto`}
      onClick={() => onSelectWord(word.id)}
    >
      <div 
        {...attributes}
        {...listeners}
        className={`absolute top-2 left-2 p-2 text-theme-primary/20 hover:text-theme-accent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing z-20 ${isDragDisabled ? 'hidden' : ''}`}
        onClick={(e) => e.stopPropagation()}
        title="Kéo thả để sắp xếp"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (
            window.confirm("Bạn có chắc chắn muốn xóa chuyên đề này?")
          ) {
            onRemoveWord(word.id);
          }
        }}
        className="absolute top-2 right-2 p-2 text-theme-primary/20 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all rounded hover:bg-theme-panel z-20"
        title="Xoá chuyên đề"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      
      <div className="flex-1 w-full flex flex-col pt-4 sm:pt-6">
        <div className="text-3xl font-serif text-theme-primary mb-2 w-full break-words">
          {word.word}
        </div>
        {word.reading && (
          <div className="text-theme-accent opacity-90 font-medium mb-1 w-full truncate">
            {word.reading}
          </div>
        )}
        {word.romaji && (
          <div className="text-theme-primary/60 font-medium mb-1 w-full truncate text-sm">
            {word.romaji}
          </div>
        )}
        <div className="text-[11px] uppercase tracking-wider text-theme-primary/40 mb-3 w-full truncate">
          {word.category}
        </div>
        <div className="text-sm text-theme-primary/60 line-clamp-2 italic mb-4">
          {word.explanation || "Không có giải thích"}
        </div>
        
        <div className="mt-auto w-full pt-3 border-t border-theme-subtle flex flex-col gap-2 text-xs text-theme-primary/40">
          <div className="flex justify-between items-center w-full">
            <span className="flex items-center gap-4">
              <span>{word.examples.length} câu ví dụ</span>
              {(() => {
                const percent = calculateMasteryPercent(word);
                let colorClass = "text-theme-accent bg-theme-accent";
                if (percent >= 80) colorClass = "text-green-500 bg-green-500";
                else if (percent >= 40) colorClass = " ";
                
                return (
                  <div className="flex items-center gap-3 border-l border-theme-subtle pl-4">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-theme-primary/40">
                      Thành thạo
                    </div>
                    <div className="w-32 h-2 bg-theme-subtle rounded-full overflow-hidden relative">
                      <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[1]}`} style={{ width: `${percent}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${colorClass.split(' ')[0]}`}>{percent}%</span>
                  </div>
                );
              })()}
            </span>
            {formatCreatedAt(word.createdAt) && (
              <span className="flex items-center gap-1">
                <span>{formatCreatedAt(word.createdAt)?.dateStr}</span>
                <span className="bg-theme-accent/10 text-theme-accent px-1.5 py-0.5 rounded text-[10px] font-medium border border-theme-accent/20">
                  {formatCreatedAt(word.createdAt)?.daysStr}
                </span>
              </span>
            )}
          </div>
          <div className="flex justify-end items-center w-full mt-1">
            <span className="text-theme-accent text-sm font-medium">Học ngay &rarr;</span>
          </div>
          {word.examples.length > 0 && (
            <div
              className="w-full bg-theme-panel h-1.5 rounded-full overflow-hidden flex"
              title={`${word.examples.filter((ex) => ex.jaToViMastered || ex.viToJaMastered || ex.mastered).length} / ${word.examples.length} câu đã nhớ`}
            >
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{
                  width: `${(word.examples.filter((ex) => ex.jaToViMastered || ex.viToJaMastered || ex.mastered).length / word.examples.length) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SearchHighlight = ({ text, query }: { text: string | undefined | null, query: string }) => {
  if (!String(query || "").trim() || !text) return <Fragment>{text}</Fragment>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <Fragment>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i + '-' + part} className="bg-theme-accent/20 text-theme-accent px-0.5 rounded font-medium">{part}</span>
        ) : (
          <span key={i + '-' + part}>{part}</span>
        )
      )}
    </Fragment>
  );
};


export function _cleanMarkdownForDisplay(text: string | undefined | null) {
  if (!text) return text;
  // Remove markdown headers like ###, **, *
  return text.replace(/^#{1,6}\s*/gm, '').replace(/\*\*/g, '').replace(/\*/g, '');
}

export default function IntensiveStudy({
  deck,
  mainDeck,
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onReorderDeck,
  onStartTopicReview,
  initialSearchQuery = "",
  initialSelectedWordId = null,
}: IntensiveStudyProps) {
  const isAdmin = auth.currentUser?.email === 'nguyenthetrung200126@gmail.com';
  const [viewState, setViewState] = usePersistentState<"list" | "add" | "study">("app_intensive_viewState", "list");
  const [selectedWordId, setSelectedWordId] = usePersistentState<string | null>("app_intensive_selectedWordId", null);
  const [searchQuery, setSearchQuery] = usePersistentState("app_intensive_searchQuery", "");
  const [statusFilter, setStatusFilter] = usePersistentState<"all" | "learning" | "mastered">("app_intensive_statusFilter", "all");
  const [targetExampleId, setTargetExampleId] = useState<string | null>(null);
  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [detailModalWord, setDetailModalWord] = useState<IntensiveWord | null>(null);

  const masteredWordsCount = React.useMemo(() => deck.filter(isWordMastered).length, [deck]);
  const learningWordsCount = deck.length - masteredWordsCount;

  // Add Form State
  const [newWordData, setNewWordData] = useState({
    word: "",
    reading: "",
    romaji: "",
    category: "Danh từ" as WordCategory,
    explanation: "",
  });

  const selectedWord = deck.find((w) => w.id === selectedWordId);

  useEffect(() => {
    if (viewState === "study" && !selectedWord) {
      setViewState("list");
    }
  }, [viewState, selectedWord, setViewState]);

  const playAudio = (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      playAudioUrl(audioUrl, text);
      return;
    }
    
    if (text) playTTS(text);
  };

  const fuse = React.useMemo(
    () =>
      new Fuse(deck, {
        keys: [
          "word",
          "reading",
          "examples.sentence",
          "examples.translation",
          "examples.reading",
        ],
        threshold: 0.5,
        ignoreLocation: true,
      }),
    [deck],
  );

  const filteredDeck = React.useMemo(() => {
    const q = String(searchQuery || "").trim();
    if (!q) return deck;
    
    let results = fuse.search(q).map((result) => result.item);
    const existingIds = new Set(results.map(r => r.id));
    
    // Fallback: manually check substring matches to ensure they are always found
    const lowerQ = q.toLowerCase();
    deck.forEach(item => {
        if (!existingIds.has(item.id)) {
            const isMatch = (item.word && item.word.toLowerCase().includes(lowerQ)) ||
                            (item.reading && item.reading.toLowerCase().includes(lowerQ)) ||
                            (item.romaji && item.romaji.toLowerCase().includes(lowerQ)) ||
                            (item.examples || []).some(ex => 
                                (ex.sentence && ex.sentence.toLowerCase().includes(lowerQ)) ||
                                (ex.reading && ex.reading.toLowerCase().includes(lowerQ)) ||
                                (ex.translation && ex.translation.toLowerCase().includes(lowerQ))
                            );
            if (isMatch) {
                results.push(item);
                existingIds.add(item.id);
            }
        }
    });
    
    // Support finding stems of Japanese verbs/adjectives or pure kanji
    const stem = q.replace(/[ぁ-ん]+$/, "");
    const kanjiMatch = q.match(/[\u4e00-\u9faf々]+/g);
    const kanjiOnly = kanjiMatch ? kanjiMatch.join("") : "";
    
    const additionalQueries = new Set<string>();
    if (stem && stem !== q && /[\u4e00-\u9faf々]/.test(stem)) additionalQueries.add(stem);
    if (kanjiOnly && kanjiOnly !== q) additionalQueries.add(kanjiOnly);
    
    additionalQueries.forEach(altQ => {
       const altResults = fuse.search(altQ).map(r => r.item);
       altResults.forEach(r => {
          if (!existingIds.has(r.id)) {
            results.push(r);
            existingIds.add(r.id);
          }
       });
       
       // Manually check substring for alt queries too
       const lowerAltQ = altQ.toLowerCase();
       deck.forEach(item => {
           if (!existingIds.has(item.id)) {
               const isMatch = (item.word && item.word.toLowerCase().includes(lowerAltQ)) ||
                               (item.reading && item.reading.toLowerCase().includes(lowerAltQ));
               if (isMatch) {
                   results.push(item);
                   existingIds.add(item.id);
               }
           }
       });
    });
    
    return results;
  }, [searchQuery, deck, fuse]);

  const displayedDeck = React.useMemo(() => {
    if (statusFilter === 'all') return filteredDeck;
    return filteredDeck.filter((item) => {
      const isMastered = isWordMastered(item);
      return statusFilter === 'mastered' ? isMastered : !isMastered;
    });
  }, [filteredDeck, statusFilter]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    if (String(searchQuery || "").trim() || statusFilter !== 'all') return;
    if (!onReorderDeck) return;

    const items = Array.from(displayedDeck);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedDeck = items.map((word, index) => ({
      ...word,
      order: index,
    }));
    onReorderDeck(updatedDeck);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(newWordData.word || "").trim()) return;

    const newWord: IntensiveWord = {
      id: crypto.randomUUID(),
      word: String(newWordData.word || "").trim(),
      reading: String(newWordData.reading || "").trim(),
      romaji: String(newWordData.romaji || "").trim(),
      category: newWordData.category,
      explanation: String(newWordData.explanation || "").trim(),
      examples: [],
      createdAt: Date.now(),
    };

    onAddWord(newWord);
    setViewState("list");
    setNewWordData({
      word: "",
      reading: "",
      romaji: "",
      category: "Danh từ",
      explanation: "",
    });
  };

  const renderExampleHighlight = (example: string, targetWord: string) => {
    const intensiveCard = deck.find(w => w.word === targetWord || w.reading === targetWord);
    const fallbackTargetCard = intensiveCard ? {
      id: intensiveCard.id,
      kanji: intensiveCard.word,
      reading: intensiveCard.reading,
      meaning: intensiveCard.explanation,
      romaji: intensiveCard.romaji,
    } : undefined;

    return (
      <Fragment>
        “{baseRenderExampleHighlight(example, targetWord, mainDeck, fallbackTargetCard as any)}”
      </Fragment>
    );
  };

  

  const handleCopyExample = (example: IntensiveExample, targetWordId: string) => {
    const targetWord = deck.find(w => w.id === targetWordId);
    if (!targetWord) return;
    onUpdateWord(targetWordId, {
      examples: [...targetWord.examples, { ...example, id: crypto.randomUUID() }]
    });
  };

  return (
    <>
      <AnimatePresence mode="wait">
      {viewState === "add" && (
        <motion.div
          key="add"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col gap-6">
            <button
              onClick={() => setViewState("list")}
              className="flex items-center gap-2 text-theme-primary/60 hover:text-theme-accent transition-colors w-fit mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium tracking-wider uppercase">
                Về danh sách
              </span>
            </button>
            <div className="bg-theme-panel p-8 border border-theme-subtle shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <BookOpen className="w-32 h-32 text-theme-accent" />
              </div>
              <h2 className="text-2xl font-serif text-theme-primary mb-8 relative z-10">
                Thêm chuyên đề mới
              </h2>
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Từ khóa / Kanji *
                  </label>
                  <input
                    required
                    type="text"
                    value={newWordData.word}
                    onChange={(e) => setNewWordData({...newWordData, word: e.target.value})}
                    className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent font-serif text-xl transition-colors placeholder:text-theme-primary/40"
                    placeholder="Ví dụ: 経済, Kế hoạch..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                      Cách đọc (Hiragana)
                    </label>
                    <input
                      type="text"
                      value={newWordData.reading}
                      onChange={(e) => setNewWordData({...newWordData, reading: e.target.value})}
                      className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                      Phiên âm Romaji
                    </label>
                    <input
                      type="text"
                      value={newWordData.romaji}
                      onChange={(e) => setNewWordData({...newWordData, romaji: e.target.value})}
                      className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Danh mục / Chủ đề
                  </label>
                  <input
                    type="text"
                    value={newWordData.category}
                    onChange={(e) => setNewWordData({...newWordData, category: e.target.value as any})}
                    className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                    placeholder="Ví dụ: Kinh tế, IT..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Giải thích chi tiết
                  </label>
                  <textarea
                    value={newWordData.explanation}
                    onChange={(e) => setNewWordData({...newWordData, explanation: e.target.value})}
                    className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40 min-h-[120px] resize-y"
                    placeholder="Viết ghi chú, giải nghĩa, điểm ngữ pháp cần nhớ..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={!String(newWordData.word || "").trim()}
                  className="mt-4 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted font-bold py-4 px-6 uppercase tracking-widest text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lưu chuyên đề
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {viewState === "study" && selectedWord && (
        <motion.div
          key="study"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <StudyView
            deck={deck}
            mainDeck={mainDeck}
            word={selectedWord}
            searchQuery={searchQuery}
            targetExampleId={targetExampleId || undefined}
            onCopyExample={handleCopyExample}
            onBack={() => {
              setViewState("list");
              setSelectedWordId(null);
              setTargetExampleId(null);
            }}
            onUpdateWord={onUpdateWord}
            renderHighlight={renderExampleHighlight}
            onStartTopicReview={onStartTopicReview}
          />
        </motion.div>
      )}

      {viewState === "list" && (
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif text-theme-accent mb-2 tracking-widest uppercase">
                  Chuyên Đề Học Sâu
                </h2>
                <span className="text-theme-primary opacity-50 text-[10px] uppercase tracking-widest">
                  {deck.length} chuyên đề • {deck.reduce((sum, w) => sum + w.examples.length, 0)} mẫu câu
                </span>
              </div>

            </div>
            
            {deck.length > 0 && (
              <div className="mb-8 p-6 bg-theme-panel border border-theme-subtle rounded-xl w-full">
                <h3 className="text-sm font-bold uppercase tracking-widest text-theme-primary/60 mb-6 flex justify-between items-center">
                  <span>Thống kê mức độ thành thạo</span>
                  <span className="text-[10px] text-theme-primary/40 normal-case tracking-normal font-normal">Dựa trên tỷ lệ câu trả lời đúng</span>
                </h3>
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deck.map(word => {
                        const percent = calculateMasteryPercent(word);
                        return {
                          name: word.word,
                          percent: percent,
                          totalExamples: word.examples.length
                        };
                      }).sort((a, b) => b.percent - a.percent)}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-theme-primary/5" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'currentColor', fontSize: 10 }} 
                        className="text-theme-primary/60" 
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                      />
                      <YAxis 
                        tick={{ fill: 'currentColor', fontSize: 10 }} 
                        className="text-theme-primary/40" 
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'currentColor', opacity: 0.05 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-theme-panel border border-theme-subtle p-3 rounded shadow-lg text-theme-primary">
                                <p className="font-bold mb-1 text-sm">{data.name}</p>
                                <p className="text-xs opacity-70 mb-1">{data.totalExamples} mẫu câu</p>
                                <p className="text-sm font-bold text-theme-accent">{data.percent}% thành thạo</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {
                          deck.map((entry, index) => {
                            const percent = calculateMasteryPercent(entry);
                            let color = "#3b82f6"; // accent (blue)
                            if (percent >= 80) color = "#22c55e"; // green-500
                            else if (percent >= 40) color = "#f97316"; // orange-500
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="inline-flex p-1 bg-theme-panel border border-theme-subtle rounded-xl gap-1 shrink-0 overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    statusFilter === 'all'
                      ? 'bg-theme-accent text-white shadow-xs'
                      : 'text-theme-primary/70 hover:text-theme-primary hover:bg-theme-hover'
                  }`}
                >
                  <span>Tất cả</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    statusFilter === 'all' ? 'bg-white/25 text-white' : 'bg-theme-hover text-theme-primary/60'
                  }`}>
                    {deck.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('learning')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    statusFilter === 'learning'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <Circle className="w-3.5 h-3.5 shrink-0" />
                  <span>Chưa thuộc</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    statusFilter === 'learning' ? 'bg-white/25 text-white' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {learningWordsCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('mastered')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    statusFilter === 'mastered'
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'text-green-600 dark:text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Đã thuộc</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    statusFilter === 'mastered' ? 'bg-white/25 text-white' : 'bg-green-500/15 text-green-600 dark:text-green-400'
                  }`}>
                    {masteredWordsCount}
                  </span>
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsDeleteUnlocked(!isDeleteUnlocked)}
                  className={`flex items-center justify-center p-2.5 transition-colors border rounded-md ${
                    isDeleteUnlocked 
                      ? "bg-red-500/10 border-red-500/50 text-red-500" 
                      : "bg-theme-panel border-theme-subtle text-theme-primary/40 hover:text-theme-accent hover:border-theme-accent"
                  }`}
                  title={isDeleteUnlocked ? "Khóa chế độ xóa" : "Mở khóa chế độ xóa"}
                >
                  {isDeleteUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setViewState("add")}
                  className="flex items-center gap-2 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-5 py-2.5 rounded-md font-bold uppercase tracking-widest text-xs transition-colors shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  Thêm chủ đề
                </button>
              </div>
            </div>

            <div className="mb-8 relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-theme-primary opacity-40" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-theme-panel border border-theme-subtle py-3 pl-10 pr-4 text-theme-primary placeholder-theme-primary/30 focus:outline-none focus:border-theme-accent transition-colors text-sm rounded-lg"
                placeholder={
                  statusFilter === 'learning'
                    ? "Tìm kiếm trong các từ chưa thuộc..."
                    : statusFilter === 'mastered'
                      ? "Tìm kiếm trong các từ đã thuộc..."
                      : "Tìm kiếm chuyên đề, từ vựng..."
                }
              />
            </div>

            {displayedDeck.length === 0 ? (
              <div className="text-center py-20 bg-theme-panel border border-theme-subtle border-dashed rounded-xl">
                <p className="text-theme-primary/50 text-sm uppercase tracking-wider">
                  {searchQuery
                    ? "Không tìm thấy kết quả nào."
                    : statusFilter === 'mastered'
                      ? "Chưa có từ vựng nào được gắn cờ Đã thuộc."
                      : statusFilter === 'learning'
                        ? "Tuyệt vời! Không còn từ vựng nào chưa thuộc."
                        : "Chưa có chuyên đề nào."}
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="intensive-deck" direction="vertical">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-4 relative"
                    >
                      <AnimatePresence>
                        {displayedDeck.map((word, index) => (
                          <Draggable
                            key={word.id}
                            draggableId={word.id}
                            index={index}
                            isDragDisabled={!!searchQuery.trim() || statusFilter !== 'all'}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={provided.draggableProps.style}
                                className={`h-full ${snapshot.isDragging ? "z-50" : "z-0"}`}
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className={`group bg-theme-panel border ${snapshot.isDragging ? 'border-theme-accent shadow-2xl ring-2 ring-theme-accent/20 scale-105' : 'border-theme-subtle hover:border-theme-accent hover:shadow-xl hover:-translate-y-1 hover:shadow-theme-accent/10'} p-6 transition-all duration-300 ease-out cursor-pointer relative h-full flex flex-col overflow-hidden`}
                                  onClick={() => {
                                    setSelectedWordId(word.id);
                                    setViewState("study");
                                  }}
                                >
                                  {/* Beautiful background accent */}
                                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-theme-accent/5 rounded-full blur-2xl group-hover:bg-theme-accent/10 transition-colors duration-500 pointer-events-none"></div>

                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    {!searchQuery.trim() && statusFilter === 'all' && (
                                      <div 
                                        {...provided.dragHandleProps}
                                        className="text-theme-primary/20 hover:text-theme-accent transition-colors p-1 -ml-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                                        onClick={(e) => e.stopPropagation()}
                                        title="Kéo thả để sắp xếp"
                                      >
                                        <GripVertical className="w-5 h-5" />
                                      </div>
                                    )}
                                    <h3 className="font-serif text-2xl text-theme-primary group-hover:text-theme-accent transition-colors">
                                      {word.word}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap justify-end">
                                    {/* Gắn cờ Đã thuộc / Chưa thuộc */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentMastered = isWordMastered(word);
                                        const newStatus = currentMastered ? 'learning' : 'mastered';
                                        onUpdateWord(word.id, {
                                          manualStatus: newStatus,
                                          statusUpdatedAt: Date.now(),
                                        });
                                      }}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs select-none ${
                                        isWordMastered(word)
                                          ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/35 hover:bg-green-500/25'
                                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 hover:bg-amber-500/25'
                                      }`}
                                      title={isWordMastered(word) ? "Đang là: ĐÃ THUỘC (Bấm để đổi thành Chưa thuộc)" : "Đang là: CHƯA THUỘC (Bấm để đánh dấu Đã thuộc)"}
                                    >
                                      {isWordMastered(word) ? (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                          <span>Đã thuộc</span>
                                        </>
                                      ) : (
                                        <>
                                          <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                          <span>Chưa thuộc</span>
                                        </>
                                      )}
                                    </button>
                                    {word.category && (
                                      <span className={getCategoryBadgeStyle(word.category, "text-[10px] font-bold text-theme-accent/80 bg-theme-accent/5 px-2 py-1 rounded-sm uppercase tracking-wider border border-theme-accent/10 whitespace-nowrap")}>
                                        {word.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                {word.reading && (
                                  <div className="text-theme-primary/60 text-sm mb-4">
                                    {word.reading} {word.romaji ? `(${word.romaji})` : ""}
                                  </div>
                                )}

                                {searchQuery.trim() !== "" && (() => {
                                  const q = searchQuery.trim();
                                  
                                  const cleanQ = cleanTextForSearch(q);
                                  const queryWords = cleanQ.split(/\s+/).filter(Boolean);
                                  
                                  const matchedExamples = word.examples.filter(ex => {
                                    const s = cleanTextForSearch(ex.sentence);
                                    const r = cleanTextForSearch(ex.reading);
                                    const t = cleanTextForSearch(ex.translation);
                                    const textToSearch = `${s} ${r} ${t}`;
                                    
                                    if (textToSearch.includes(cleanQ)) return true;
                                    
                                    if (queryWords.length > 0) {
                                      const matchCount = queryWords.filter(qw => textToSearch.includes(qw)).length;
                                      return (matchCount / queryWords.length) >= 0.7; // At least 70% match
                                    }
                                    return false;
                                  });
                                  
                                  if (matchedExamples.length === 0) return null;
                                  
                                  const highlightText = (text, highlight) => {
                                    if (!highlight.trim() || !text) return text;
                                    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
                                    const parts = text.split(regex);
                                    return parts.map((part, i) => 
                                      part.toLowerCase() === highlight.trim().toLowerCase() 
                                        ? <mark key={i} className="bg-theme-accent/20 text-theme-accent font-bold px-0.5 rounded-sm">{part}</mark> 
                                        : <span key={i}>{part}</span>
                                    );
                                  };

                                  return (
                                    <div className="mb-4 mt-2 flex flex-col gap-2">
                                      {matchedExamples.slice(0, 3).map((ex, i) => (
                                        <div key={i} className="bg-theme-base p-3 border border-theme-subtle rounded-md text-sm">
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <p className="text-theme-primary font-serif text-base">{highlightText(ex.sentence, searchQuery)}</p>
                                              {(ex.reading || ex.romaji) && (
                                                <p className="text-theme-primary/40 text-xs mt-0.5">
                                                  {highlightText(ex.reading || "", searchQuery)} {(ex.reading && ex.romaji) ? '•' : ''} {highlightText(ex.romaji || "", searchQuery)}
                                                </p>
                                              )}
                                              <p className="text-theme-primary/60 text-sm mt-1">{highlightText(ex.translation || "", searchQuery)}</p>
                                            </div>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                playAudio(e, ex.sentence, ex.audioUrl);
                                              }}
                                              className="p-1.5 bg-theme-panel text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10 rounded-full transition-colors shrink-0"
                                              title="Nghe phát âm"
                                            >
                                              <Volume2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                      {matchedExamples.length > 3 && (
                                        <p className="text-xs text-theme-primary/40 italic">...và thêm {matchedExamples.length - 3} mẫu câu khác</p>
                                      )}
                                    </div>
                                  );
                                })()}

                                <div className="flex items-center justify-between mt-auto pt-6">
                                  <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-theme-primary/40 group-hover:text-theme-accent/60 transition-colors flex items-center gap-1.5 shrink-0">
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      {word.examples.length} CÂU
                                    </span>
                                    {(() => {
                                      const percent = calculateMasteryPercent(word);
                                      let colorClass = "text-theme-accent bg-theme-accent";
                                      if (percent >= 80) colorClass = "text-green-500 bg-green-500";
                                      else if (percent >= 40) colorClass = " ";
                                      
                                      return (
                                        <div className="flex flex-col gap-1.5 w-24 border-l border-theme-subtle pl-4">
                                          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold">
                                            <span className="text-theme-primary/40">Thành thạo</span>
                                            <span className={colorClass.split(' ')[0]}>{percent}%</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-theme-subtle rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[1]}`} style={{ width: `${percent}%` }} />
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDetailModalWord(word);
                                      }}
                                      className="px-2.5 py-1 text-xs font-semibold text-theme-accent hover:text-white hover:bg-theme-accent bg-theme-accent/10 border border-theme-accent/25 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                      title="Xem toàn bộ chi tiết từ vựng"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                      <span>Chi tiết</span>
                                    </button>
                                    {isDeleteUnlocked && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmingDeleteId(word.id);
                                        }}
                                        className="p-2 text-theme-primary/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                        title="Xóa chuyên đề"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                    <ArrowRight className="w-5 h-5 text-theme-primary/20 group-hover:text-theme-accent transition-colors" />
                                  </div>
                                </div>
                              </motion.div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {confirmingDeleteId && (
        <div id="confirm-delete-topic-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmingDeleteId(null)} />
          <div className="bg-theme-panel border border-theme-subtle rounded-xl shadow-2xl p-6 w-full max-w-md relative z-10 flex flex-col">
            <h3 className="text-xl font-serif text-theme-primary mb-4 text-red-500">Xóa chuyên đề?</h3>
            <p className="text-theme-primary/70 mb-6">Bạn có chắc chắn muốn xóa chuyên đề này không? Toàn bộ mẫu câu bên trong sẽ bị mất.</p>
            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setConfirmingDeleteId(null)} className="px-4 py-2 text-theme-primary/60 hover:text-theme-primary text-sm uppercase tracking-wider">Hủy</button>
              <button 
                onClick={() => {
                  onRemoveWord(confirmingDeleteId);
                  setConfirmingDeleteId(null);

                }}
                className="bg-red-500 text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-sm hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      
    </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    {detailModalWord && (
      <WordDetailModal
        word={detailModalWord}
        matchedCard={mainDeck?.find(c => 
          (c.kanji && c.kanji === detailModalWord.word?.trim()) ||
          (c.reading && c.reading === detailModalWord.reading?.trim())
        ) || null}
        isOpen={!!detailModalWord}
        onClose={() => setDetailModalWord(null)}
        onStartReview={onStartTopicReview && detailModalWord.examples.length > 0 ? () => {
          const w = detailModalWord;
          setDetailModalWord(null);
          onStartTopicReview([w]);
        } : undefined}
        onEdit={() => {
          const w = detailModalWord;
          setDetailModalWord(null);
          setSelectedWordId(w.id);
          setViewState("study");
        }}
        renderHighlight={renderExampleHighlight}
        onToggleStatus={(id, newStatus) => {
          onUpdateWord(id, { manualStatus: newStatus, statusUpdatedAt: Date.now() });
          setDetailModalWord(prev => prev && prev.id === id ? { ...prev, manualStatus: newStatus, statusUpdatedAt: Date.now() } : prev);
        }}
      />
    )}
    </>
  );
}



function StudyView({
  deck,
  mainDeck,
  word,
  targetExampleId,
  searchQuery,
  onCopyExample,
  onBack,
  onUpdateWord,
  renderHighlight,
  onStartTopicReview,
}: {
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  word: IntensiveWord;
  targetExampleId?: string | null;
  searchQuery?: string;
  onCopyExample: (example: IntensiveExample, targetWordId: string) => void;
  onBack: () => void;
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void;
  renderHighlight: (text: string | undefined | null, kanji: string) => React.ReactNode;
  onStartTopicReview?: (topicDeck: IntensiveWord[]) => void;
}) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const matchedCard = React.useMemo(() => {
    if (!mainDeck || mainDeck.length === 0) return null;
    const cleanWord = (word.word || "").trim();
    const cleanReading = (word.reading || "").trim();
    return mainDeck.find(c => 
      (c.kanji && c.kanji === cleanWord) ||
      (c.reading && c.reading === cleanWord) ||
      (cleanReading && (c.reading === cleanReading || c.kanji === cleanReading))
    ) || null;
  }, [mainDeck, word.word, word.reading]);

  const highlightSearchTerm = (text: string | undefined | null, highlight?: string) => {
    if (!text) return "";
    if (!highlight || !highlight.trim()) return text;
    const escapedHighlight = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.trim().toLowerCase()
        ? <mark key={i} className="bg-theme-accent/20 text-theme-accent font-bold px-0.5 rounded-sm">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };

  const [furiganaMode, setFuriganaMode] = usePersistentState<FuriganaMode>('app_furigana_mode', 'always');
  const [isAddingExample, setIsAddingExample] = useState(!word.examples.length);
  const [copyingExample, setCopyingExample] = useState<IntensiveExample | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [duplicateWarningId, setDuplicateWarningId] = useState<string | null>(null);
  const [highlightedExampleId, setHighlightedExampleId] = useState<string | null>(null);
  const [newSentence, setNewSentence] = useState("");
  const [newFurigana, setNewFurigana] = useState("");
  const [isGeneratingFurigana, setIsGeneratingFurigana] = useState(false);
  const [newReading, setNewReading] = useState("");
  const [newRomaji, setNewRomaji] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [newSpecialNote, setNewSpecialNote] = useState("");
  const [exampleSearchQuery, setExampleSearchQuery] = useState("");
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);

  // Map of duplicate examples in this topic
  const duplicateExampleMap = React.useMemo(() => {
    const map = new Map<string, { reason: string; otherId: string; otherIndex: number }>();
    const examples = word.examples || [];
    
    for (let i = 0; i < examples.length; i++) {
      const ex1 = examples[i];
      const normJp1 = normalizeSentence(ex1.sentence);
      const normVi1 = cleanTextForSearch(ex1.translation || '');
      const normReading1 = normalizeSentence(ex1.reading || '');

      for (let j = i + 1; j < examples.length; j++) {
        const ex2 = examples[j];
        const normJp2 = normalizeSentence(ex2.sentence);
        const normVi2 = cleanTextForSearch(ex2.translation || '');
        const normReading2 = normalizeSentence(ex2.reading || '');

        let matchReason = '';
        if (normJp1 && normJp2 && normJp1 === normJp2) {
          matchReason = 'Trùng 100% câu tiếng Nhật';
        } else if (normReading1 && normReading2 && normReading1 === normReading2 && normReading1.length >= 3) {
          matchReason = 'Trùng cách đọc phiên âm';
        } else if (normVi1 && normVi2 && normVi1 === normVi2 && normVi1.length >= 2) {
          matchReason = 'Trùng bản dịch tiếng Việt';
        } else if (normJp1 && normJp2 && normJp1.length >= 6 && normJp2.length >= 6) {
          const sim = calculateSimilarity(normJp1, normJp2);
          if (sim >= 0.88) {
            matchReason = `Tương đồng ${Math.round(sim * 100)}% tiếng Nhật`;
          }
        }

        if (matchReason) {
          if (!map.has(ex1.id)) {
            map.set(ex1.id, { reason: matchReason, otherId: ex2.id, otherIndex: j + 1 });
          }
          if (!map.has(ex2.id)) {
            map.set(ex2.id, { reason: matchReason, otherId: ex1.id, otherIndex: i + 1 });
          }
        }
      }
    }

    return map;
  }, [word.examples]);

  const filteredExamples = React.useMemo(() => {
    let list = word.examples || [];
    if (showOnlyDuplicates) {
      list = list.filter(ex => duplicateExampleMap.has(ex.id));
    }
    if (!exampleSearchQuery.trim()) return list;
    const q = exampleSearchQuery.toLowerCase();
    return list.filter(ex => 
      ex.sentence?.toLowerCase().includes(q) ||
      ex.translation?.toLowerCase().includes(q) ||
      ex.reading?.toLowerCase().includes(q) ||
      ex.romaji?.toLowerCase().includes(q) ||
      ex.specialNote?.toLowerCase().includes(q)
    );
  }, [word.examples, exampleSearchQuery, showOnlyDuplicates, duplicateExampleMap]);
  const [isEditing, setIsEditing] = useState(false);
  const [editWordData, setEditWordData] = useState({
    word: word.word || "",
    reading: word.reading || "",
    romaji: word.romaji || "",
    category: word.category as WordCategory,
    explanation: word.explanation || "",
  });

  // Real-time duplicate detection for adding
  useEffect(() => {
    if (String(newSentence || "").trim()) {
      const normInput = normalizeSentence(newSentence);
      const existing = word.examples.find(
        (ex) => normalizeSentence(ex.sentence) === normInput
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      setDuplicateWarningId(null);
    }
  }, [newSentence, word.examples]);



  useEffect(() => {
    if (targetExampleId) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        const el = document.getElementById(`example-${targetExampleId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight it temporarily
          el.classList.add('ring-2', 'ring-theme-accent');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-theme-accent');
          }, 2000);
        }
      }, 100);
    }
  }, [targetExampleId]);

  const [hiddenMeaningIds, setHiddenMeaningIds] = useState<string[]>([]);
  const [expandedNoteIds, setExpandedNoteIds] = useState<string[]>([]);
  const isAllHidden =
    word.examples.length > 0 &&
    hiddenMeaningIds.length === word.examples.length;

  const playAudio = (e: React.MouseEvent, text: string | undefined | null, audioUrl?: string | null) => {
    e.stopPropagation();
    if (audioUrl) {
      playAudioUrl(audioUrl, text);
      return;
    }
    
    if (text) playTTS(text);
  };

  const toggleAllMeanings = () => {
    if (isAllHidden) {
      setHiddenMeaningIds([]);
    } else {
      setHiddenMeaningIds(word.examples.map((ex) => ex.id));
    }
  };

  const toggleMeaning = (id: string) => {
    setHiddenMeaningIds((prev) =>
      prev.includes(id) ? prev.filter((hid) => hid !== id) : [...prev, id],
    );
  };

  const toggleNote = (id: string) => {
    setExpandedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id],
    );
  };

  const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [editingExampleId, setEditingExampleId] = useState<string | null>(null);
  const [editExampleData, setEditExampleData] = useState({
    sentence: "",
    furigana: "",
    reading: "",
    romaji: "",
    translation: "",
    specialNote: "",
  });

  const handleGenerateAINewFurigana = async () => {
    if (!newSentence.trim()) return;
    try {
      setIsGeneratingFurigana(true);
      const res = await fetchFuriganaWithGemini(newSentence);
      if (res.furigana) {
        setNewFurigana(res.furigana);
        if (!newReading && res.reading) {
          setNewReading(res.reading);
        }
      }
    } catch (err: any) {
      alert('Không thể tạo Furigana bằng Gemini AI: ' + (err.message || 'Lỗi'));
    } finally {
      setIsGeneratingFurigana(false);
    }
  };

  const handleGenerateAIEditFurigana = async () => {
    if (!editExampleData.sentence.trim()) return;
    try {
      setIsGeneratingFurigana(true);
      const res = await fetchFuriganaWithGemini(editExampleData.sentence);
      if (res.furigana) {
        setEditExampleData(prev => ({
          ...prev,
          furigana: res.furigana,
          reading: (!prev.reading && res.reading) ? res.reading : prev.reading
        }));
      }
    } catch (err: any) {
      alert('Không thể tạo Furigana bằng Gemini AI: ' + (err.message || 'Lỗi'));
    } finally {
      setIsGeneratingFurigana(false);
    }
  };

  // Real-time duplicate detection for editing
  useEffect(() => {
    if (editingExampleId && editExampleData && String(editExampleData.sentence || "").trim()) {
      const existing = word.examples.find(
        (ex) => ex.id !== editingExampleId && normalizeSentence(ex.sentence) === normalizeSentence(editExampleData.sentence)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      if (!String(newSentence || "").trim()) {
        setDuplicateWarningId(null);
      }
    }
  }, [editExampleData?.sentence, editingExampleId, word.examples, newSentence]);

  const handleStartEditExample = (ex: IntensiveExample) => {
    setEditingExampleId(ex.id);
    setEditExampleData({
      sentence: ex.sentence,
      furigana: ex.furigana || "",
      reading: ex.reading || "",
      romaji: ex.romaji || "",
      translation: ex.translation || "",
      specialNote: ex.specialNote || "",
    });
  };

  const handleCancelEditExample = () => {
    setEditingExampleId(null);
  };

  const handleEditExampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(editExampleData.sentence || "").trim() || !editingExampleId) return;

    const existingExample = word.examples.find(
      (ex) =>
        ex.id !== editingExampleId &&
        normalizeSentence(ex.sentence) === normalizeSentence(editExampleData.sentence),
    );

    if (existingExample) {
      setDuplicateWarningId(existingExample.id);
      return;
    }

    const updatedExamples = word.examples.map((ex) => {
      if (ex.id === editingExampleId) {
        return {
          ...ex,
          sentence: String(editExampleData.sentence || "").trim(),
          furigana: String(editExampleData.furigana || "").trim(),
          reading: String(editExampleData.reading || "").trim(),
          romaji: String(editExampleData.romaji || "").trim(),
          translation: String(editExampleData.translation || "").trim(),
          specialNote: String(editExampleData.specialNote || "").trim(),
        };
      }
      return ex;
    });

    onUpdateWord(word.id, { examples: updatedExamples });
    setEditingExampleId(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(editWordData.word || "").trim()) return;
    onUpdateWord(word.id, {
      word: String(editWordData.word || "").trim(),
      reading: String(editWordData.reading || "").trim(),
      romaji: String(editWordData.romaji || "").trim(),
      category: editWordData.category,
      explanation: String(editWordData.explanation || "").trim(),
    });
    setIsEditing(false);
  };

  const handleAddExample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!String(newSentence || "").trim()) return;

    const existingExample = word.examples.find(
      (ex) =>
        normalizeSentence(ex.sentence) === normalizeSentence(newSentence),
    );

    if (existingExample) {
      setDuplicateWarningId(existingExample.id);
      return;
    }

    const newExample: IntensiveExample = {
      id: crypto.randomUUID(),
      sentence: String(newSentence || "").trim(),
      furigana: String(newFurigana || "").trim(),
      reading: String(newReading || "").trim(),
      romaji: String(newRomaji || "").trim(),
      translation: String(newTranslation || "").trim(),
      specialNote: String(newSpecialNote || "").trim(),
    };

    onUpdateWord(word.id, {
      examples: [newExample, ...(word.examples || [])],
    });

    setNewSentence("");
    setNewFurigana("");
    setNewReading("");
    setNewRomaji("");
    setNewTranslation("");
    setNewSpecialNote("");
    setIsAddingExample(false);
    setExampleSearchQuery(""); // Clear search so the newly added sentence is visible at the very top
    setHighlightedExampleId(newExample.id);
    setTimeout(() => {
      const el = document.getElementById(`example-${newExample.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setTimeout(() => setHighlightedExampleId(null), 3000);
    }, 100);
  };

  const handleRemoveExample = (exId: string) => {
    onUpdateWord(word.id, {
      examples: word.examples.filter((e) => e.id !== exId),
    });
  };

  const handleTransferAudio = async (
    sourceId: string,
    targetId: string,
    mode: 'move' | 'copy'
  ) => {
    const sourceEx = (word.examples || []).find((e) => e.id === sourceId);
    const targetEx = (word.examples || []).find((e) => e.id === targetId);
    if (!sourceEx || !targetEx) return;

    try {
      // 1. If localforage blob exists for source:
      const localBlob = await localforage.getItem<Blob>(`audio_intensive_${word.id}_${sourceId}`);
      if (localBlob) {
        await localforage.setItem(`audio_intensive_${word.id}_${targetId}`, localBlob);
        if (mode === 'move') {
          await localforage.removeItem(`audio_intensive_${word.id}_${sourceId}`);
        }
      }

      // 2. Compute updated examples array
      const updatedExamples = (word.examples || []).map((e) => {
        if (e.id === targetId) {
          return {
            ...e,
            hasAudio: sourceEx.hasAudio,
            audioUrl: sourceEx.audioUrl,
          };
        }
        if (mode === 'move' && e.id === sourceId) {
          return {
            ...e,
            hasAudio: false,
            audioUrl: null,
          };
        }
        return e;
      });

      // 3. Update state
      onUpdateWord(word.id, { examples: updatedExamples });

      // 4. Update Firestore if logged in
      if (auth.currentUser) {
        try {
          const cardRef = doc(db, 'global_intensiveVocab', word.id);
          await setDoc(cardRef, { examples: updatedExamples }, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore update warning in handleTransferAudio:', dbErr);
        }
      }

      // 5. Highlight and scroll to target example
      const targetIndex = (word.examples || []).findIndex((e) => e.id === targetId);
      setTimeout(() => {
        const el = document.getElementById(`example-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedExampleId(targetId);
          setTimeout(() => setHighlightedExampleId(null), 3000);
        }
      }, 100);

      const actionText = mode === 'move' ? 'Chuyển' : 'Sao chép';
      alert(`Đã ${actionText.toLowerCase()} âm thanh sang Câu #${targetIndex + 1} thành công!`);
    } catch (err: any) {
      console.error('Error transferring audio:', err);
      alert('Có lỗi xảy ra khi chuyển âm thanh: ' + (err?.message || 'Vui lòng thử lại.'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col gap-8 pb-32">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-theme-primary/60 hover:text-theme-accent transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium tracking-wider uppercase">
          Về danh sách chuyên đề
        </span>
      </button>

      {/* Header Info */}
      <div className="bg-theme-panel border-b-2 border-b-[#c5a059] p-8 rounded-t-lg shadow-xl relative overflow-hidden group">
        {/* Background Decorative Kanji */}
        <div className="absolute -right-8 -top-8 text-[12rem] font-serif text-theme-primary/[0.02] leading-none pointer-events-none select-none">
          {word.word}
        </div>

        {isEditing ? (
          <div className="relative z-10 w-full">
            <h4 className="text-theme-accent uppercase tracking-wider text-sm font-medium mb-4">
              Chỉnh sửa chuyên đề
            </h4>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Từ khóa / Kanji *
                </label>
                <input
                  required
                  type="text"
                  value={editWordData.word}
                  onChange={(e) =>
                    setEditWordData({ ...editWordData, word: e.target.value })
                  }
                  className="w-full bg-theme-hover border border-theme-subtle rounded px-4 py-4 text-theme-primary focus:outline-none focus:border-theme-accent font-serif text-2xl transition-colors placeholder:text-theme-primary/40 shadow-inner"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Cách đọc (Hiragana)
                  </label>
                  <input
                    type="text"
                    value={editWordData.reading}
                    onChange={(e) =>
                      setEditWordData({
                        ...editWordData,
                        reading: e.target.value,
                      })
                    }
                    className="w-full bg-theme-hover border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Phiên âm Romaji
                  </label>
                  <input
                    type="text"
                    value={editWordData.romaji}
                    onChange={(e) =>
                      setEditWordData({
                        ...editWordData,
                        romaji: e.target.value,
                      })
                    }
                    className="w-full bg-theme-hover border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Tính chất
                </label>
                <select
                  value={editWordData.category}
                  onChange={(e) =>
                    setEditWordData({
                      ...editWordData,
                      category: e.target.value as WordCategory,
                    })
                  }
                  className="w-full bg-theme-hover border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4d4d4' opacity='0.6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    backgroundSize: "1.2em",
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Giải thích
                </label>
                <textarea
                  rows={3}
                  value={editWordData.explanation}
                  onChange={(e) =>
                    setEditWordData({
                      ...editWordData,
                      explanation: e.target.value,
                    })
                  }
                  className="w-full bg-theme-hover border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!String(editWordData.word || "").trim()}
                  className="bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-2 px-6 rounded uppercase tracking-widest text-sm transition-all"
                >
                  Lưu Thay Đổi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditWordData({
                      word: word.word,
                      reading: word.reading,
                      romaji: word.romaji || "",
                      category: word.category as WordCategory,
                      explanation: word.explanation,
                    });
                    setIsEditing(false);
                  }}
                  className="text-theme-primary/60 hover:text-theme-primary px-4 py-2 uppercase tracking-wider text-sm transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-stretch h-full">
            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-0 right-0 p-2 bg-theme-hover/80 text-theme-primary/40 hover:text-theme-accent opacity-0 group-hover:opacity-100 transition-all rounded z-20"
              title="Chỉnh sửa chuyên đề"
            >
              <Edit2 className="w-5 h-5" />
            </button>


            {/* Main Visual */}
            <div className="min-w-[8rem] sm:min-w-[10rem] w-full sm:w-auto sm:max-w-[60%] min-h-[8rem] sm:min-h-[10rem] shrink-0 bg-theme-base-alt flex flex-col items-center justify-center rounded border border-theme-subtle shadow-inner mb-4 sm:mb-0 p-4 mx-auto sm:mx-0 relative group/speaker">
              <span className={`font-serif text-theme-primary text-center break-words mb-2 ${word.word.length > 20 ? 'text-lg sm:text-xl' : word.word.length > 10 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'}`}>
                {word.word}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                {onStartTopicReview && word.examples.length > 0 && (
                  <button
                    onClick={() => onStartTopicReview([word])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary text-theme-base rounded-md text-xs font-bold uppercase tracking-wider hover:bg-theme-accent transition-colors shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ôn câu</span>
                  </button>
                )}
                <button
                  id={`btn-detail-modal-${word.id}`}
                  onClick={() => setShowDetailModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/15 border border-theme-accent/30 text-theme-accent hover:bg-theme-accent hover:text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  title="Xem toàn bộ chi tiết từ vựng này"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>
              </div>
              <div className="absolute -right-2 -bottom-2 flex flex-col items-center gap-0.5 opacity-90 sm:opacity-0 group-hover/speaker:opacity-100 transition-all">
              <button
                onClick={(e) => playAudio(e, word.word || word.reading, word.audioUrl)}
                className={`p-2 border border-theme-subtle rounded-full shadow-md transition-colors ${word.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'bg-theme-panel text-theme-primary/50 hover:text-theme-accent hover:bg-theme-panel'}`}
                title={word.audioUrl ? "Nghe file MP3" : "Nghe phát âm"}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {word.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest bg-theme-panel px-1 rounded-sm">MP3</span>}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center text-center sm:text-left h-full pr-8">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 flex-wrap">
                <span className="text-2xl text-theme-accent font-medium">
                  {word.reading}
                </span>
                {word.romaji && (
                  <span className="text-lg text-theme-primary/60">
                    {word.romaji}
                  </span>
                )}
                <span className="bg-theme-hover text-theme-primary/60 px-2 py-1 rounded text-[10px] uppercase border border-theme-subtle tracking-wider">
                  {word.category}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const currentMastered = isWordMastered(word);
                    const newStatus = currentMastered ? 'learning' : 'mastered';
                    onUpdateWord(word.id, {
                      manualStatus: newStatus,
                      statusUpdatedAt: Date.now(),
                    });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs select-none ${
                    isWordMastered(word)
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/35 hover:bg-green-500/25'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 hover:bg-amber-500/25'
                  }`}
                  title={isWordMastered(word) ? "Đang là: ĐÃ THUỘC (Bấm để đổi thành Chưa thuộc)" : "Đang là: CHƯA THUỘC (Bấm để đánh dấu Đã thuộc)"}
                >
                  {isWordMastered(word) ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>Đã thuộc</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Chưa thuộc</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-theme-accent hover:text-white hover:bg-theme-accent bg-theme-accent/10 rounded-md border border-theme-accent/30 transition-all cursor-pointer shadow-xs"
                  title="Xem toàn bộ chi tiết từ vựng"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Xem chi tiết</span>
                </button>
              </div>
              { (word.explanation || word.category) && (
                <div className="text-theme-primary/90 text-sm sm:text-base leading-relaxed bg-theme-hover/50 p-5 rounded-lg border border-theme-subtle border-l-4 border-l-[#c5a059] mt-3 shadow-inner max-h-64 overflow-y-auto custom-scrollbar markdown-body whitespace-pre-wrap">
                  <Markdown>{(word.category ? `Loại từ: ${word.category}\nn\n` : "") + cleanMarkdownForDisplay(word.explanation || "")}</Markdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Examples List */}
      <div className="space-y-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-theme-primary opacity-40" />
          </div>
          <input
            type="text"
            value={exampleSearchQuery}
            onChange={(e) => setExampleSearchQuery(e.target.value)}
            className="w-full bg-theme-base-alt border border-theme-subtle py-2.5 pl-10 pr-4 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors text-sm rounded-md"
            placeholder="Tìm kiếm câu ví dụ (Tiếng Nhật, Romaji, Tiếng Việt...)"
          />
        </div>
        <div className="sticky top-16 z-20 bg-theme-panel/95 backdrop-blur-md py-3 px-3.5 -mx-2 sm:-mx-3 rounded-xl border border-theme-subtle shadow-md flex items-center justify-between gap-4 mb-3 transition-all">
          <h3 className="text-sm sm:text-base font-serif text-theme-primary tracking-widest uppercase">
            Các Câu Ví Dụ ({filteredExamples.length}{exampleSearchQuery.trim() ? ` / ${word.examples.length}` : ""})
          </h3>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <FuriganaToggle mode={furiganaMode} onChange={setFuriganaMode} />
            {duplicateExampleMap.size > 0 && (
              <button
                type="button"
                onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all border rounded-lg cursor-pointer ${
                  showOnlyDuplicates
                    ? "bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400 animate-pulse"
                    : "bg-amber-500/15 border-2 border-amber-500/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25"
                }`}
                title="Bấm để lọc chỉ xem các câu bị trùng nội dung"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${showOnlyDuplicates ? 'text-white' : 'text-amber-500'}`} />
                <span>{showOnlyDuplicates ? "Xem tất cả" : `Có ${duplicateExampleMap.size} câu trùng`}</span>
              </button>
            )}
            {word.examples.length > 0 && (
              <>
                <button
                  onClick={toggleAllMeanings}
                  className="text-theme-primary/60 hover:text-theme-primary flex items-center gap-1 text-[10px] sm:text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
                >
                  {isAllHidden ? "Hiện tất cả" : "Ẩn tất cả"}
                </button>
                <button
                  onClick={() => {
                    setDeleteEnabled(!deleteEnabled);
                    setConfirmingDeleteId(null);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold transition-all border rounded cursor-pointer ${
                    deleteEnabled 
                      ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20 hover:border-red-500" 
                      : "bg-theme-base text-theme-primary/40 border-theme-subtle hover:text-theme-primary hover:border-theme-primary/40"
                  }`}
                >
                  {deleteEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {deleteEnabled ? "Tắt xóa" : "Kích hoạt xóa"}
                </button>
              </>
            )}
            {!isAddingExample && (
              <button
                id="btn-sticky-add-example"
                onClick={() => {
                  setIsAddingExample(true);
                  setTimeout(() => {
                    const formEl = document.getElementById('add-example-form-section');
                    if (formEl) {
                      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      const inputEl = document.getElementById('new-sentence-input');
                      if (inputEl) inputEl.focus();
                    }
                  }, 80);
                }}
                className="text-theme-accent hover:text-theme-accent-hover flex items-center gap-1 text-xs sm:text-sm uppercase tracking-wider font-bold transition-all px-3 py-1.5 rounded-lg border border-theme-accent/40 bg-theme-accent/10 hover:bg-theme-accent/20 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm mới</span>
              </button>
            )}
          </div>
        </div>

        {isAddingExample && (
          <motion.div
            id="add-example-form-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-theme-base-alt border border-theme-accent/30 p-6 rounded-lg relative shadow-xl mb-4 scroll-mt-28"
          >
            <h4 className="text-xs uppercase tracking-wider text-theme-accent mb-4 font-medium">
              Thêm Câu Ví Dụ Mới
            </h4>
            {duplicateWarningId && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Câu ví dụ này đã tồn tại!</p>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`example-${duplicateWarningId}`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        setHighlightedExampleId(duplicateWarningId);
                        setTimeout(() => setHighlightedExampleId(null), 3000);
                      }
                    }}
                    className="text-xs underline hover:text-red-400 transition-colors"
                  >
                    Nhấn vào đây để xem câu hiện có
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleAddExample} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Câu ví dụ (nên có chứa từ "{word.word}") *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAINewFurigana}
                    disabled={isGeneratingFurigana || !newSentence.trim()}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-theme-accent hover:text-white hover:bg-theme-accent bg-theme-accent/10 border border-theme-accent/25 rounded transition-all disabled:opacity-50 cursor-pointer"
                    title="Dùng Gemini AI để tạo Furigana tự động theo ngữ cảnh"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingFurigana ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingFurigana ? 'Đang tạo...' : 'Tạo Furigana AI'}</span>
                  </button>
                </div>
                <textarea
                  id="new-sentence-input"
                  required
                  rows={2}
                  value={newSentence}
                  onChange={(e) => {
                    setNewSentence(e.target.value);
                    setDuplicateWarningId(null);
                  }}
                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent font-serif text-lg transition-colors placeholder:text-theme-primary/40"
                  placeholder="e.g. この情報は大切です。"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium flex items-center justify-between">
                  <span>Furigana 漢字[かんじ] (Tự động hoặc tùy chỉnh)</span>
                  <span className="text-[10px] text-theme-accent lowercase font-normal">Tự động gắn phiên âm chữ Hán</span>
                </label>
                <input
                  type="text"
                  value={newFurigana}
                  onChange={(e) => setNewFurigana(e.target.value)}
                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-2.5 text-theme-primary focus:outline-none focus:border-theme-accent font-mono text-sm transition-colors placeholder:text-theme-primary/40"
                  placeholder="e.g. この情報[じょうほう]は大切[たいせつ]です。"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Phiên âm Hiragana
                  </label>
                  <input
                    type="text"
                    value={newReading}
                    onChange={(e) => setNewReading(e.target.value)}
                    className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                    placeholder="e.g. この じょうほう は たいせつ です"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Phiên âm Romaji
                  </label>
                  <input
                    type="text"
                    value={newRomaji}
                    onChange={(e) => setNewRomaji(e.target.value)}
                    className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                    placeholder="e.g. Kono jōhō wa taisetsu desu."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Bản dịch
                </label>
                <input
                  type="text"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                  placeholder="e.g. Thông tin này quan trọng."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Lưu ý đặc biệt
                </label>
                <textarea
                  rows={2}
                  value={newSpecialNote}
                  onChange={(e) => setNewSpecialNote(e.target.value)}
                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                  placeholder="Ghi chú lại kiến thức quan trọng của câu ví dụ này..."
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!String(newSentence || "").trim()}
                  className="bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-2 px-6 rounded uppercase tracking-widest text-sm transition-all"
                >
                  Lưu Ví Dụ
                </button>
                {word.examples.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingExample(false)}
                    className="text-theme-primary/60 hover:text-theme-primary px-4 py-2 uppercase tracking-wider text-sm transition-colors"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        <DragDropContext
          onDragEnd={(result: DropResult) => {
            if (!result.destination) return;
            if (exampleSearchQuery.trim()) return; // Disable reorder when searching
            const newExamples = Array.from(word.examples);
            const [reorderedItem] = newExamples.splice(result.source.index, 1);
            newExamples.splice(result.destination.index, 0, reorderedItem);
            onUpdateWord(word.id, { examples: newExamples });
          }}
        >
          <Droppable droppableId="examples">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {filteredExamples.map((ex, index) => (
                  <Draggable
                    // @ts-ignore
                    key={ex.id || 'ex-' + index}
                    draggableId={ex.id}
                    index={index}
                    isDragDisabled={editingExampleId === ex.id || !!exampleSearchQuery.trim()}
                  >
                    {(provided, snapshot) => (
                      <div
                        id={`example-${ex.id}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative overflow-hidden rounded-lg border transition-all duration-300 ease-out ${
                          duplicateExampleMap.has(ex.id)
                            ? "border-amber-500/90 border-l-[10px] border-l-amber-500 bg-amber-500/[0.06] ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10"
                            : snapshot.isDragging
                              ? "border-theme-accent shadow-2xl z-50 scale-[1.02]"
                              : "border-theme-subtle hover:-translate-y-1 hover:shadow-xl hover:border-theme-accent/50 hover:shadow-theme-accent/10 hover:z-40 focus-within:z-40"
                        } ${highlightedExampleId === ex.id ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20" : ""} bg-theme-panel group mb-4`}
                        style={provided.draggableProps.style}
                      >
                        {/* Corner Ribbon for Duplicate - Nhận biết ngay lập tức */}
                        {duplicateExampleMap.has(ex.id) && (
                          <div className="absolute top-0 right-0 z-20 pointer-events-none">
                            <div className="bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 shadow-md flex items-center gap-1 rounded-bl-lg">
                              <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                              <span>TRÙNG NỘI DUNG</span>
                            </div>
                          </div>
                        )}
                        <div
                          className={`bg-theme-hover p-6 relative z-10 w-full min-h-full ${editingExampleId !== ex.id ? "pl-14" : ""}`}
                        >
                          {/* Drag Handle */}
                          {editingExampleId !== ex.id && (
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-theme-primary/20 hover:text-theme-accent transition-colors z-20 border-r border-theme-subtle"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                          )}

                          {editingExampleId === ex.id ? (
                            <form
                              onSubmit={handleEditExampleSubmit}
                              className="space-y-4"
                            >
                              <h4 className="text-xs uppercase tracking-wider text-theme-accent mb-4 font-medium">
                                Chỉnh sửa câu ví dụ
                              </h4>
                              {duplicateWarningId && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg flex items-start gap-3 mb-4">
                                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-sm mb-1">Câu ví dụ này đã tồn tại!</p>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const el = document.getElementById(`example-${duplicateWarningId}`);
                                        if (el) {
                                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                                          setHighlightedExampleId(duplicateWarningId);
                                          setTimeout(() => setHighlightedExampleId(null), 3000);
                                        }
                                      }}
                                      className="text-xs underline hover:text-red-400 transition-colors"
                                    >
                                      Nhấn vào đây để xem câu hiện có
                                    </button>
                                  </div>
                                </div>
                              )}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                                    Câu ví dụ *
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleGenerateAIEditFurigana}
                                    disabled={isGeneratingFurigana || !editExampleData.sentence.trim()}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-theme-accent hover:text-white hover:bg-theme-accent bg-theme-accent/10 border border-theme-accent/25 rounded transition-all disabled:opacity-50 cursor-pointer"
                                    title="Dùng Gemini AI để tạo Furigana tự động theo ngữ cảnh"
                                  >
                                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingFurigana ? 'animate-spin' : ''}`} />
                                    <span>{isGeneratingFurigana ? 'Đang tạo...' : 'Tạo Furigana AI'}</span>
                                  </button>
                                </div>
                                <textarea
                                  required
                                  rows={2}
                                  value={editExampleData.sentence}
                                  onChange={(e) => {
                                    setEditExampleData({
                                      ...editExampleData,
                                      sentence: e.target.value,
                                    });
                                    setDuplicateWarningId(null);
                                  }}
                                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent font-serif text-lg transition-colors placeholder:text-theme-primary/40"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium flex items-center justify-between">
                                  <span>Furigana 漢字[かんじ] (Tự động hoặc tùy chỉnh)</span>
                                  <span className="text-[10px] text-theme-accent lowercase font-normal">Tự động gắn phiên âm chữ Hán</span>
                                </label>
                                <input
                                  type="text"
                                  value={editExampleData.furigana}
                                  onChange={(e) =>
                                    setEditExampleData({
                                      ...editExampleData,
                                      furigana: e.target.value,
                                    })
                                  }
                                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-2.5 text-theme-primary focus:outline-none focus:border-theme-accent font-mono text-sm transition-colors placeholder:text-theme-primary/40"
                                  placeholder="e.g. この情報[じょうほう]は大切[たいせつ]です。"
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                                    Phiên âm Hiragana
                                  </label>
                                  <input
                                    type="text"
                                    value={editExampleData.reading}
                                    onChange={(e) =>
                                      setEditExampleData({
                                        ...editExampleData,
                                        reading: e.target.value,
                                      })
                                    }
                                    className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                                  />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                                    Phiên âm Romaji
                                  </label>
                                  <input
                                    type="text"
                                    value={editExampleData.romaji}
                                    onChange={(e) =>
                                      setEditExampleData({
                                        ...editExampleData,
                                        romaji: e.target.value,
                                      })
                                    }
                                    className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                                  Bản dịch
                                </label>
                                <input
                                  type="text"
                                  value={editExampleData.translation}
                                  onChange={(e) =>
                                    setEditExampleData({
                                      ...editExampleData,
                                      translation: e.target.value,
                                    })
                                  }
                                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                                  Lưu ý đặc biệt
                                </label>
                                <textarea
                                  rows={2}
                                  value={editExampleData.specialNote}
                                  onChange={(e) =>
                                    setEditExampleData({
                                      ...editExampleData,
                                      specialNote: e.target.value,
                                    })
                                  }
                                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                                  placeholder="Ghi chú lại kiến thức quan trọng của câu ví dụ này..."
                                />
                              </div>
                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  type="submit"
                                  disabled={!String(editExampleData.sentence || "").trim()}
                                  className="bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-2 px-6 rounded uppercase tracking-widest text-sm transition-all"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEditExample}
                                  className="text-theme-primary/60 hover:text-theme-primary px-4 py-2 uppercase tracking-wider text-sm transition-colors"
                                >
                                  Hủy
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="absolute top-2 right-2 flex gap-1 z-10">
                                {ex.specialNote && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleNote(ex.id);
                                    }}
                                    className={`p-2 transition-all rounded shadow-sm ${
                                      expandedNoteIds.includes(ex.id)
                                        ? "bg-theme-accent text-theme-base"
                                        : "bg-theme-accent/10 text-theme-accent border border-theme-accent/20 hover:bg-theme-accent/20 hover:border-theme-accent/40"
                                    }`}
                                    title="Lưu ý đặc biệt"
                                  >
                                    <Lightbulb className="w-4 h-4" />
                                  </button>
                                )}
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                  {!ex.hasAudio && !ex.audioUrl && (
                                  <div className="flex flex-col items-center gap-0.5">
                                  <button
                                    onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                                    className={`p-2 rounded transition-colors ${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-panel'}`}
                                    title={ex.audioUrl ? "Nghe file MP3" : "Phát âm thanh"}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                  {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-0.5">MP3</span>}
                                  </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(ex.sentence);
                                      const btn = e.currentTarget;
                                      const originalHTML = btn.innerHTML;
                                      btn.innerHTML = '<svg class="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                                      setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
                                    }}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title="Copy câu ví dụ"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCopyingExample(ex);
                                    }}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title="Sao chép sang chuyên đề khác"
                                  >
                                    <CopyPlus className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleMeaning(ex.id);
                                    }}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title={
                                      hiddenMeaningIds.includes(ex.id)
                                        ? "Hiện nghĩa"
                                        : "Ẩn nghĩa"
                                    }
                                  >
                                    {hiddenMeaningIds.includes(ex.id) ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleStartEditExample(ex)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title="Chỉnh sửa ví dụ"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {deleteEnabled && (
                                    confirmingDeleteId === ex.id ? (
                                      <div className="flex flex-col sm:flex-row gap-1 bg-red-500/10 p-1 rounded border border-red-500/20">
                                        <button
                                          onClick={() => handleRemoveExample(ex.id)}
                                          className="p-1 text-red-500 hover:text-red-400 bg-red-500/20 hover:bg-red-500/30 rounded transition-all"
                                          title="Xác nhận xóa"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setConfirmingDeleteId(null)}
                                          className="px-2 text-[10px] uppercase font-bold text-theme-primary/60 hover:text-theme-primary transition-colors"
                                        >
                                          Hủy
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmingDeleteId(ex.id)}
                                        className="p-2 text-theme-primary/40 hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"
                                        title="Xoá ví dụ"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>

                              {duplicateExampleMap.has(ex.id) && (() => {
                                const dup = duplicateExampleMap.get(ex.id)!;
                                const otherEx = (word.examples || []).find(e => e.id === dup.otherId);
                                const thisHasAudio = !!(ex.audioUrl || ex.hasAudio);
                                const otherHasAudio = !!(otherEx?.audioUrl || otherEx?.hasAudio);
                                return (
                                  <div className="p-3.5 mb-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-red-500/15 to-amber-500/10 border-2 border-amber-500/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="p-2 bg-gradient-to-br from-amber-500 to-red-500 text-white rounded-lg shadow-sm shrink-0">
                                        <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-black text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-100 bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/40">
                                            ⚠️ CÂU TRÙNG LẶP
                                          </span>
                                          <span className="text-xs font-bold text-amber-900 dark:text-amber-100">
                                            {dup.reason}
                                          </span>
                                        </div>
                                        <p className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-1">
                                          Trùng nội dung với <strong>Câu #{dup.otherIndex}</strong> trong chuyên đề
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                                      {/* Chuyển / Lấy âm thanh thông minh giữa 2 câu trùng */}
                                      {thisHasAudio && !otherHasAudio && (
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            await handleTransferAudio(ex.id, dup.otherId, 'copy');
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs"
                                          title={`Sao chép file MP3 này sang Câu #${dup.otherIndex}`}
                                        >
                                          <ArrowRightLeft className="w-3.5 h-3.5" />
                                          <span>Chép MP3 sang câu #{dup.otherIndex}</span>
                                        </button>
                                      )}

                                      {!thisHasAudio && otherHasAudio && (
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            await handleTransferAudio(dup.otherId, ex.id, 'copy');
                                          }}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs"
                                          title={`Lấy file MP3 từ Câu #${dup.otherIndex}`}
                                        >
                                          <Volume2 className="w-3.5 h-3.5" />
                                          <span>Lấy MP3 từ câu #{dup.otherIndex}</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const el = document.getElementById(`example-${dup.otherId}`);
                                          if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            setHighlightedExampleId(dup.otherId);
                                            setTimeout(() => setHighlightedExampleId(null), 3000);
                                          }
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-900 dark:text-amber-100 font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs"
                                        title={`Bấm để cuộn và xem câu #${dup.otherIndex}`}
                                      >
                                        <Eye className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Đối chiếu câu #{dup.otherIndex}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveExample(ex.id);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs"
                                        title="Xóa câu trùng lặp này khỏi chuyên đề"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Xóa câu này</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}

                              <div className="flex gap-4 pr-16">
                                <div className="relative">
                                  <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full font-serif text-sm font-bold shadow-xs ${
                                    duplicateExampleMap.has(ex.id)
                                      ? "bg-amber-500 text-white border-2 border-amber-600"
                                      : "bg-theme-base-alt border border-theme-subtle text-theme-accent"
                                  }`}>
                                    {index + 1}
                                  </div>
                                  {duplicateExampleMap.has(ex.id) && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
                                    </span>
                                  )}
                                </div>
                                <HighlightProvider><div className="flex-1 pt-1">
                                  {ex.reading &&
                                    !hiddenMeaningIds.includes(ex.id) &&
                                    furiganaMode === 'off' && (
                                      <p className="text-xl sm:text-2xl text-theme-accent opacity-80 mb-1 font-serif">
                                        <RelatedHighlight text={ex.reading} type="hiragana" />
                                      </p>
                                    )}
                                  <div className="text-xl sm:text-2xl text-theme-primary font-serif leading-relaxed mb-3">
                                    {furiganaMode === 'off' ? (
                                      renderHighlight(ex.sentence, word.word)
                                    ) : (
                                      <FuriganaSentence
                                        sentence={ex.sentence}
                                        furigana={ex.furigana}
                                        mode={furiganaMode}
                                        deck={mainDeck}
                                        autoFetch={true}
                                      />
                                    )}
                                    {!ex.hasAudio && !ex.audioUrl && (
                                    <span className="inline-flex flex-col items-center ml-3 gap-0.5 align-middle">
                                    <button
                                      onClick={(e) => playAudio(e, ex.sentence, ex.audioUrl)}
                                      className={`inline-flex items-center justify-center p-2 transition-colors rounded-full ${ex.audioUrl ? 'text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20' : 'text-theme-primary/40 hover:text-theme-accent hover:bg-theme-accent/10'}`}
                                      title={ex.audioUrl ? "Nghe file MP3" : "Nghe câu ví dụ"}
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                    {ex.audioUrl && <span className="text-[8px] font-bold text-theme-accent uppercase leading-none tracking-widest mt-0.5">MP3</span>}
                                    </span>
                                    )}

                                  </div>
                                  {ex.romaji &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-primary/60 mb-1">
                                        <RelatedHighlight text={ex.romaji} type="romaji" />
                                      </p>
                                    )}
                                  {ex.translation &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-primary/50 italic mb-2">
                                        (<span>
                                          {searchQuery 
                                            ? highlightSearchTerm(ex.translation || "", searchQuery) 
                                            : <HighlightVietnamese text={ex.translation || ""} />}
                                        </span>)
                                      </p>
                                    )}
                                  <IntensiveExampleAudio 
                                    wordId={word.id} 
                                    example={ex} 
                                    allExamples={word.examples || []}
                                    currentIndex={index}
                                    duplicateInfo={duplicateExampleMap.get(ex.id)}
                                    onUpdateExample={(exId, updates) => {
                                      const updatedExamples = word.examples.map(e => e.id === exId ? { ...e, ...updates } : e);
                                      onUpdateWord(word.id, { examples: updatedExamples });
                                    }} 
                                    onTransferAudio={handleTransferAudio}
                                  />
                                  
                                  <AnimatePresence>
                                    {expandedNoteIds.includes(ex.id) && ex.specialNote && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden pointer-events-auto"
                                      >
                                        <div className="mt-4 p-5 bg-theme-accent/5 border-l-4 border-theme-accent rounded-r-lg relative">
                                          <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Lightbulb className="w-12 h-12 text-theme-accent" />
                                          </div>
                                          <div className="flex items-center gap-2 mb-3 relative z-10">
                                            <Lightbulb className="w-4 h-4 text-theme-accent" />
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                                              Lưu ý đặc biệt
                                            </h4>
                                          </div>
                                          <div className="relative z-10 text-[15px] text-theme-primary/80 leading-relaxed font-serif markdown-body whitespace-pre-wrap">
                                            <Markdown>{cleanMarkdownForDisplay(ex.specialNote)}</Markdown>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div></HighlightProvider>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {copyingExample && (
        <div id="copy-example-modal-overlay" className="fixed inset-0 bg-theme-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-panel border border-theme-subtle rounded-xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="text-xl font-serif text-theme-primary mb-4">
              Sao chép câu ví dụ
            </h3>
            <p className="text-theme-primary/60 text-sm mb-6">
              Chọn chuyên đề bạn muốn sao chép câu ví dụ này tới:
            </p>
            
            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
              {deck.filter(w => w.id !== word.id).length === 0 ? (
                <div className="text-center text-theme-primary/40 text-sm py-4 italic">
                  Không có chuyên đề nào khác.
                </div>
              ) : (
                deck.filter(w => w.id !== word.id).map(w => (
                  <button
                    key={w.id || Math.random().toString()}
                    onClick={() => {
                      onCopyExample(copyingExample, w.id);
                      setCopyingExample(null);
                      setShowCopySuccess(true);
                      setTimeout(() => setShowCopySuccess(false), 2000);
                    }}
                    className="w-full text-left p-4 rounded-lg bg-theme-hover hover:bg-theme-active border border-theme-subtle hover:border-theme-accent/50 transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="text-theme-primary font-serif text-lg">
                        {w.word}
                      </div>
                      <div className="text-theme-primary/40 text-xs">
                        {w.category}
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-theme-accent opacity-0 group-hover:opacity-100 transition-opacity transform rotate-180" />
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCopyingExample(null)}
                className="px-4 py-2 text-sm uppercase tracking-widest text-theme-primary/60 hover:text-theme-primary transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-theme-accent text-theme-base px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 pointer-events-none"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Đã copy thành công</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Detail Modal */}
      <WordDetailModal
        word={word}
        matchedCard={matchedCard}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onStartReview={onStartTopicReview && word.examples.length > 0 ? () => onStartTopicReview([word]) : undefined}
        onEdit={() => setIsEditing(true)}
        renderHighlight={renderHighlight}
        onToggleStatus={(id, newStatus) => {
          onUpdateWord(id, { manualStatus: newStatus, statusUpdatedAt: Date.now() });
        }}
      />

      {/* Floating Action Button (FAB) - Luôn chạy theo người dùng khi cuộn trang */}
      {!isAddingExample && (
        <button
          id="btn-floating-add-example"
          type="button"
          onClick={() => {
            setIsAddingExample(true);
            setTimeout(() => {
              const formEl = document.getElementById('add-example-form-section');
              if (formEl) {
                formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const inputEl = document.getElementById('new-sentence-input');
                if (inputEl) inputEl.focus();
              }
            }, 80);
          }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted shadow-2xl rounded-full px-5 py-3.5 flex items-center gap-2.5 font-bold tracking-wider text-xs uppercase cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-200"
          title="Thêm câu ví dụ mới (Nút nổi luôn đi theo màn hình khi cuộn)"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="font-sans font-bold">Thêm mới</span>
        </button>
      )}
    </div>
  );
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function IntensiveExampleAudio({ 
  wordId, 
  example, 
  allExamples = [],
  currentIndex = 0,
  duplicateInfo,
  onUpdateExample,
  onTransferAudio
}: { 
  wordId: string; 
  example: IntensiveExample; 
  allExamples?: IntensiveExample[];
  currentIndex?: number;
  duplicateInfo?: { reason: string; otherId: string; otherIndex: number };
  onUpdateExample: (id: string, updates: Partial<IntensiveExample>) => void;
  onTransferAudio?: (sourceId: string, targetId: string, mode: 'move' | 'copy') => Promise<void>;
}) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Transfer Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [transferMode, setTransferMode] = useState<'move' | 'copy'>('copy');
  const [isTransferring, setIsTransferring] = useState(false);

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');

  const otherExamplesWithAudio = React.useMemo(() => {
    return allExamples.filter(e => e.id !== example.id && (e.audioUrl || e.hasAudio));
  }, [allExamples, example.id]);

  const counterpart = duplicateInfo?.otherId ? allExamples.find(e => e.id === duplicateInfo.otherId) : null;
  const counterpartHasAudio = !!(counterpart?.audioUrl || counterpart?.hasAudio);

  const handleGenerateAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!example.sentence) return;
    setIsGenerating(true);
    try {
      const url = await generateAndUploadTTS(example.sentence);
      if (url) {
        onUpdateExample(example.id, { hasAudio: true, audioUrl: url });
        setAudioUrl(url);
        try {
          if (auth.currentUser) {
            const cardRef = doc(db, 'global_intensiveVocab', wordId);
            const currentDoc = await getDoc(cardRef);
            if (currentDoc.exists()) {
              const currentData = currentDoc.data();
              const updatedExs = (currentData.examples || []).map((exItem: any) => 
                exItem.id === example.id ? { ...exItem, hasAudio: true, audioUrl: url } : exItem
              );
              await setDoc(cardRef, { examples: updatedExs }, { merge: true });
            }
          }
        } catch (dbErr) {
          console.warn("Direct Firestore save warning in IntensiveStudy:", dbErr);
        }
        playAudioUrl(url, example.sentence);
      } else {
        alert("Không thể tạo file âm thanh AI lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.");
      }
    } catch(err: any) {
      console.error("AI TTS error:", err);
      alert("Lỗi khi gọi AI tạo âm thanh: " + (err?.message || "Vui lòng thử lại."));
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (example.audioUrl) {
      if (example.audioUrl.startsWith('firestore:')) {
        const audioId = example.audioUrl.split(':')[1];
        getDoc(doc(db, 'global_audio', audioId)).then((docSnap) => {
           if (docSnap.exists() && active) {
              setAudioUrl(docSnap.data().data);
           }
        }).catch(err => console.error("Failed to load audio from firestore", err));
      } else {
        setAudioUrl(example.audioUrl);
      }
    } else if (example.hasAudio) {
      localforage.getItem<Blob>(`audio_intensive_${wordId}_${example.id}`).then((blob) => {
        if (blob && active) {
          setAudioUrl(URL.createObjectURL(blob));
        }
      });
    } else {
      setAudioUrl(null);
    }
    return () => {
      active = false;
    };
  }, [wordId, example.id, example.hasAudio, example.audioUrl]);

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        let uploadedToStorage = false;
        if (auth.currentUser) {
          try {
            const base64 = await fileToBase64(file);
            const audioId = `intensive_${wordId}_${example.id}`;
            const audioDocRef = doc(db, 'global_audio', audioId);
            await setDoc(audioDocRef, { data: base64, createdAt: Date.now() });
            onUpdateExample(example.id, { hasAudio: true, audioUrl: 'firestore:' + audioId });
            setAudioUrl(base64);
            uploadedToStorage = true;
          } catch (storageErr) {
            console.warn("Firestore audio upload failed, falling back to local", storageErr);
          }
        }
        
        if (!uploadedToStorage) {
          await localforage.setItem(`audio_intensive_${wordId}_${example.id}`, file);
          const url = URL.createObjectURL(file);
          onUpdateExample(example.id, { hasAudio: true, audioUrl: null });
          setAudioUrl(url);
        }
      } catch (err) {
        console.error("Upload error", err);
      }
      setIsUploading(false);
    }
    if (e.target) {
        e.target.value = '';
    }
  };
  
  const handleRemoveAudio = async () => {
    if (auth.currentUser && example.audioUrl) {
      try {
        if (example.audioUrl.startsWith('firestore:')) {
           const audioId = example.audioUrl.split(':')[1];
           await deleteDoc(doc(db, 'global_audio', audioId));
        } else {
           // local storage
        }
      } catch (e) {
        console.error("Delete error", e);
      }
    } else {
      await localforage.removeItem(`audio_intensive_${wordId}_${example.id}`);
    }
    if (audioUrl && !audioUrl.startsWith('http')) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onUpdateExample(example.id, { hasAudio: false, audioUrl: null }); 
  };

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-theme-subtle pt-3">
      <input 
        type="file" 
        accept="audio/*,.mp3,.wav,.m4a" 
        ref={audioInputRef} 
        onChange={handleUploadAudio} 
        className="sr-only" 
      />
      {!audioUrl ? (
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); audioInputRef.current?.click(); }} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-primary/10 text-theme-primary/70 rounded text-[11px] hover:bg-theme-accent hover:text-theme-inverted transition-colors font-medium uppercase tracking-wider cursor-pointer"
          >
            <Volume2 className="w-3 h-3" />
            {isUploading ? 'Đang tải...' : 'Thêm MP3'}
          </button>
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent/10 text-theme-accent rounded text-[11px] hover:bg-theme-accent hover:text-theme-inverted transition-colors font-medium uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            <Music className="w-3 h-3" />
            {isGenerating ? 'Đang tạo...' : 'Tải âm thanh (AI)'}
          </button>

          {/* Nút nhanh: Lấy trực tiếp file MP3 từ câu trùng lặp */}
          {counterpart && counterpartHasAudio && onTransferAudio && (
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                await onTransferAudio(counterpart.id, example.id, 'copy');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded text-[11px] font-bold transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              title={`Lấy trực tiếp file MP3 từ câu trùng #${duplicateInfo?.otherIndex}`}
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Lấy MP3 từ câu #{duplicateInfo?.otherIndex}</span>
            </button>
          )}

          {/* Lấy âm thanh từ câu bất kỳ khác */}
          {otherExamplesWithAudio.length > 0 && onTransferAudio && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSourceId(otherExamplesWithAudio[0]?.id || '');
                setShowReceiveModal(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded text-[11px] font-bold transition-all cursor-pointer shadow-xs"
              title="Lấy âm thanh từ một câu khác trong danh sách"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Lấy MP3 từ câu khác...</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 w-full">
          <audio controls src={audioUrl} className="h-8 w-full max-w-[240px]" />
          
          {/* Nút nhanh chuyển/sao chép sang câu trùng lặp */}
          {counterpart && onTransferAudio && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  await onTransferAudio(example.id, counterpart.id, 'copy');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-700 dark:text-blue-300 rounded text-[11px] font-bold transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                title={`Sao chép file MP3 này sang Câu #${duplicateInfo?.otherIndex} (giữ lại ở câu này)`}
              >
                <Copy className="w-3 h-3" />
                <span>Chép sang câu #{duplicateInfo?.otherIndex}</span>
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm(`Bạn có chắc muốn chuyển hẳn âm thanh sang Câu #${duplicateInfo?.otherIndex} (và gỡ khỏi câu này)?`)) {
                    await onTransferAudio(example.id, counterpart.id, 'move');
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 rounded text-[11px] font-bold transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                title={`Chuyển hẳn file MP3 này sang Câu #${duplicateInfo?.otherIndex} (gỡ khỏi câu này)`}
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Chuyển sang câu #{duplicateInfo?.otherIndex}</span>
              </button>
            </div>
          )}

          {/* Nút mở hộp thoại chuyển sang câu bất kỳ */}
          {allExamples.length > 1 && onTransferAudio && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTargetId(duplicateInfo?.otherId || allExamples.find(e => e.id !== example.id)?.id || '');
                setShowTransferModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-theme-primary/10 hover:bg-theme-accent hover:text-theme-inverted text-theme-primary/70 rounded text-[11px] font-bold transition-all cursor-pointer shadow-xs"
              title="Chuyển hoặc sao chép âm thanh sang một câu khác trong chuyên đề"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Chuyển âm thanh...</span>
            </button>
          )}

          <button 
            onClick={(e) => { e.stopPropagation(); handleRemoveAudio(); }}
            className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors ml-auto cursor-pointer"
            title="Xóa MP3"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Chuyển/Sao chép âm thanh đi câu khác */}
      {showTransferModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowTransferModal(false)}
        >
          <div 
            className="bg-theme-panel border border-theme-subtle rounded-xl p-6 max-w-lg w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle mb-4">
              <h3 className="font-serif text-base font-bold text-theme-primary flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-theme-accent" />
                <span>Chuyển / Sao chép âm thanh (MP3)</span>
              </h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="p-1 text-theme-primary/50 hover:text-theme-primary rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-theme-primary/60 font-semibold mb-1 uppercase tracking-wider">
                  Câu gốc hiện tại (Câu #{currentIndex + 1}):
                </p>
                <p className="text-sm font-serif font-bold text-theme-primary bg-theme-base-alt p-2.5 rounded border border-theme-subtle">
                  {example.sentence}
                </p>
                {audioUrl && (
                  <audio controls src={audioUrl} className="h-8 w-full mt-2" />
                )}
              </div>

              <div>
                <label className="block text-xs text-theme-primary/60 font-semibold mb-1 uppercase tracking-wider">
                  Hình thức chuyển:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all ${transferMode === 'copy' ? 'bg-theme-accent/10 border-theme-accent text-theme-primary' : 'bg-theme-base border-theme-subtle text-theme-primary/60'}`}>
                    <input 
                      type="radio" 
                      name="transferMode" 
                      value="copy" 
                      checked={transferMode === 'copy'} 
                      onChange={() => setTransferMode('copy')}
                      className="mt-0.5 text-theme-accent"
                    />
                    <div>
                      <span className="text-xs font-bold block">Sao chép (Copy)</span>
                      <span className="text-[10px] opacity-75">Giữ âm thanh ở câu này và gán thêm cho câu mới</span>
                    </div>
                  </label>
                  <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-all ${transferMode === 'move' ? 'bg-theme-accent/10 border-theme-accent text-theme-primary' : 'bg-theme-base border-theme-subtle text-theme-primary/60'}`}>
                    <input 
                      type="radio" 
                      name="transferMode" 
                      value="move" 
                      checked={transferMode === 'move'} 
                      onChange={() => setTransferMode('move')}
                      className="mt-0.5 text-theme-accent"
                    />
                    <div>
                      <span className="text-xs font-bold block">Di chuyển (Move)</span>
                      <span className="text-[10px] opacity-75">Chuyển sang câu mới và gỡ khỏi câu này</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-theme-primary/60 font-semibold mb-1 uppercase tracking-wider">
                  Chọn câu ví dụ nhận âm thanh:
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-theme-base-alt border border-theme-subtle rounded-lg px-3 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-accent"
                >
                  <option value="">-- Chọn câu ví dụ đích --</option>
                  {allExamples.filter(e => e.id !== example.id).map((e) => {
                    const idx = allExamples.findIndex(x => x.id === e.id);
                    const isDup = duplicateInfo?.otherId === e.id;
                    const hasAud = !!(e.hasAudio || e.audioUrl);
                    return (
                      <option key={e.id} value={e.id}>
                        {`Câu #${idx + 1}: ${e.sentence.slice(0, 40)}${e.sentence.length > 40 ? '...' : ''} ${isDup ? '⚠️ [CÂU TRÙNG NỘI DUNG]' : ''} ${hasAud ? '🔊 [ĐÃ CÓ MP3]' : ''}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs uppercase font-semibold text-theme-primary/60 hover:text-theme-primary rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!selectedTargetId || isTransferring}
                  onClick={async () => {
                    if (!selectedTargetId || !onTransferAudio) return;
                    setIsTransferring(true);
                    try {
                      await onTransferAudio(example.id, selectedTargetId, transferMode);
                      setShowTransferModal(false);
                    } finally {
                      setIsTransferring(false);
                    }
                  }}
                  className="px-5 py-2 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted text-xs uppercase font-bold tracking-wider rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isTransferring ? 'Đang chuyển...' : 'Xác nhận chuyển'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lấy âm thanh từ câu khác */}
      {showReceiveModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowReceiveModal(false)}
        >
          <div 
            className="bg-theme-panel border border-theme-subtle rounded-xl p-6 max-w-lg w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle mb-4">
              <h3 className="font-serif text-base font-bold text-theme-primary flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-theme-accent" />
                <span>Lấy âm thanh từ câu khác</span>
              </h3>
              <button 
                onClick={() => setShowReceiveModal(false)}
                className="p-1 text-theme-primary/50 hover:text-theme-primary rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-theme-primary/60 font-semibold mb-1 uppercase tracking-wider">
                  Gán âm thanh cho câu này (Câu #{currentIndex + 1}):
                </p>
                <p className="text-sm font-serif font-bold text-theme-primary bg-theme-base-alt p-2.5 rounded border border-theme-subtle">
                  {example.sentence}
                </p>
              </div>

              <div>
                <label className="block text-xs text-theme-primary/60 font-semibold mb-1 uppercase tracking-wider">
                  Chọn câu nguồn đang có âm thanh để lấy:
                </label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="w-full bg-theme-base-alt border border-theme-subtle rounded-lg px-3 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-accent"
                >
                  <option value="">-- Chọn câu có sẵn âm thanh --</option>
                  {otherExamplesWithAudio.map((e) => {
                    const idx = allExamples.findIndex(x => x.id === e.id);
                    const isDup = duplicateInfo?.otherId === e.id;
                    return (
                      <option key={e.id} value={e.id}>
                        {`Câu #${idx + 1}: ${e.sentence.slice(0, 45)}${e.sentence.length > 45 ? '...' : ''} ${isDup ? '⚠️ [CÂU TRÙNG NỘI DUNG]' : ''}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-theme-subtle">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 text-xs uppercase font-semibold text-theme-primary/60 hover:text-theme-primary rounded cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!selectedSourceId || isTransferring}
                  onClick={async () => {
                    if (!selectedSourceId || !onTransferAudio) return;
                    setIsTransferring(true);
                    try {
                      await onTransferAudio(selectedSourceId, example.id, 'copy');
                      setShowReceiveModal(false);
                    } finally {
                      setIsTransferring(false);
                    }
                  }}
                  className="px-5 py-2 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted text-xs uppercase font-bold tracking-wider rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isTransferring ? 'Đang lấy...' : 'Lấy âm thanh ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
