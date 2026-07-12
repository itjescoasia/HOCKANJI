import React, { useState, Fragment, useEffect } from "react";
import Fuse from "fuse.js";
import {
  IntensiveWord,
  IntensiveExample,
  WordCategory,
  KanjiCard,
} from "../types";
import {
  PlusCircle,
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
  CopyPlus,
  CheckCircle,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { renderExampleHighlight as baseRenderExampleHighlight, RelatedHighlight, HighlightProvider, HighlightVietnamese } from "../utils/highlight";
import { normalizeSentence } from "../utils/stringUtils";
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
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  onAddWord: (word: IntensiveWord) => void;
  onRemoveWord: (id: string) => void;
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void;
  onReorderDeck?: (deck: IntensiveWord[]) => void;
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
  const isDragDisabled = !!searchQuery.trim();
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
            <span>{word.examples.length} câu ví dụ</span>
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

const SearchHighlight = ({ text, query }: { text: string, query: string }) => {
  if (!query.trim() || !text) return <Fragment>{text}</Fragment>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <Fragment>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-theme-accent/20 text-theme-accent px-0.5 rounded font-medium">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </Fragment>
  );
};

export default function IntensiveStudy({
  deck,
  mainDeck,
  onAddWord,
  onRemoveWord,
  onUpdateWord,
  onReorderDeck,
}: IntensiveStudyProps) {
  const [viewState, setViewState] = useState<"list" | "add" | "study">("list");
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetExampleId, setTargetExampleId] = useState<string | null>(null);

  // Add Form State
  const [newWordData, setNewWordData] = useState({
    word: "",
    reading: "",
    romaji: "",
    category: "Danh từ" as WordCategory,
    explanation: "",
  });

  const selectedWord = deck.find((w) => w.id === selectedWordId);

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
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
    const q = searchQuery.trim();
    if (!q) return deck;
    
    let results = fuse.search(q).map((result) => result.item);
    const existingIds = new Set(results.map(r => r.id));
    
    // Fallback: manually check substring matches to ensure they are always found
    const lowerQ = q.toLowerCase();
    deck.forEach(item => {
        if (!existingIds.has(item.id)) {
            const isMatch = item.word.toLowerCase().includes(lowerQ) ||
                            (item.reading && item.reading.toLowerCase().includes(lowerQ)) ||
                            (item.romaji && item.romaji.toLowerCase().includes(lowerQ)) ||
                            item.examples.some(ex => 
                                ex.sentence.toLowerCase().includes(lowerQ) ||
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
               const isMatch = item.word.toLowerCase().includes(lowerAltQ) ||
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (!onReorderDeck) return;
      if (searchQuery.trim()) return;

      const oldIndex = deck.findIndex((item) => item.id === active.id);
      const newIndex = deck.findIndex((item) => item.id === over.id);

      const newDeck = arrayMove(deck, oldIndex, newIndex);

      const updatedDeck = newDeck.map((word, index) => ({
        ...word,
        order: index,
      }));

      onReorderDeck(updatedDeck);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordData.word.trim()) return;

    const newWord: IntensiveWord = {
      id: crypto.randomUUID(),
      word: newWordData.word.trim(),
      reading: newWordData.reading.trim(),
      romaji: newWordData.romaji.trim(),
      category: newWordData.category,
      explanation: newWordData.explanation.trim(),
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

  if (viewState === "add") {
    return (
      <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col gap-6">
        <button
          onClick={() => setViewState("list")}
          className="flex items-center gap-2 text-theme-primary/60 hover:text-theme-accent transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wider uppercase">
            Quay lại
          </span>
        </button>

        <div className="bg-theme-hover p-6 sm:p-8 rounded-lg border border-theme-subtle shadow-xl">
          <h2 className="text-xl font-serif text-theme-accent mb-6 tracking-widest text-center sm:text-left">
            THÊM TỪ VỰNG CHUYÊN SÂU
          </h2>

          <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                Từ khóa / Kanji *
              </label>
              <input
                required
                type="text"
                value={newWordData.word}
                onChange={(e) =>
                  setNewWordData({ ...newWordData, word: e.target.value })
                }
                className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-4 text-theme-primary focus:outline-none focus:border-theme-accent font-serif text-2xl transition-colors placeholder:text-theme-primary/40 shadow-inner"
                placeholder="Ví dụ: 情報, 食べる, Ngữ pháp ~て..."
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Cách đọc (Hiragana)
                </label>
                <input
                  type="text"
                  value={newWordData.reading}
                  onChange={(e) =>
                    setNewWordData({
                      ...newWordData,
                      reading: e.target.value,
                    })
                  }
                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                  placeholder="e.g. じょうほう"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Phiên âm Romaji
                </label>
                <input
                  type="text"
                  value={newWordData.romaji}
                  onChange={(e) =>
                    setNewWordData({ ...newWordData, romaji: e.target.value })
                  }
                  className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                  placeholder="e.g. jōhō"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                Tính chất
              </label>
              <select
                value={newWordData.category}
                onChange={(e) =>
                  setNewWordData({
                    ...newWordData,
                    category: e.target.value as WordCategory,
                  })
                }
                className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent appearance-none"
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
                value={newWordData.explanation}
                onChange={(e) =>
                  setNewWordData({
                    ...newWordData,
                    explanation: e.target.value,
                  })
                }
                className="w-full bg-theme-panel border border-theme-subtle rounded px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                placeholder="e.g. Đây là từ ít xuất hiện, thường dùng trong ngữ cảnh..."
              />
            </div>

            <button
              type="submit"
              disabled={!newWordData.word.trim()}
              className="mt-4 bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-3 rounded uppercase tracking-widest text-sm transition-all"
            >
              Tạo Chuyên Đề
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleCopyExample = (example: IntensiveExample, targetWordId: string) => {
    const targetWord = deck.find(w => w.id === targetWordId);
    if (!targetWord) return;
    
    // Copy the example with a new id
    const copiedExample = { ...example, id: crypto.randomUUID() };
    onUpdateWord(targetWordId, {
      examples: [...targetWord.examples, copiedExample]
    });
  };

  if (viewState === "study" && selectedWord) {
    return (
      <StudyView
        deck={deck}
        word={selectedWord}
        targetExampleId={targetExampleId}
        onCopyExample={handleCopyExample}
        onBack={() => {
          setViewState("list");
          setTargetExampleId(null);
        }}
        onUpdateWord={onUpdateWord}
        renderHighlight={renderExampleHighlight}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-serif text-theme-primary tracking-wider">
          ÔN CHUYÊN TỪ VỰNG
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setViewState("add")}
            className="bg-theme-hover hover:bg-theme-active text-theme-accent border border-theme-subtle px-4 py-2 rounded flex items-center gap-2 transition-all font-medium uppercase tracking-wider text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Từ</span>
          </button>
        </div>
      </div>

      {deck.length > 0 && (
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-primary/40" />
          <input
            type="text"
            placeholder="Tìm kiếm chuyên đề, câu ví dụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-panel border border-theme-subtle rounded pl-10 pr-4 py-3 text-base sm:text-sm focus:outline-none focus:border-theme-accent transition-colors"
          />
          {searchQuery.trim() && filteredDeck.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-theme-panel border border-theme-subtle rounded-lg shadow-xl z-50 max-h-[60vh] overflow-y-auto">
              {filteredDeck.slice(0, 10).map((word) => {
                const query = searchQuery.toLowerCase();
                const matchedExample = word.examples.find(
                  (ex) =>
                    ex.sentence.toLowerCase().includes(query) ||
                    (ex.translation &&
                      ex.translation.toLowerCase().includes(query)) ||
                    (ex.reading && ex.reading.toLowerCase().includes(query))
                ) || word.examples[0];

                return (
                  <button
                    key={word.id}
                    onClick={() => {
                      setSelectedWordId(word.id);
                      setTargetExampleId(matchedExample?.id || null);
                      setViewState("study");
                      setSearchQuery("");
                    }}
                    className="w-full text-left p-3 sm:p-4 border-b border-theme-subtle hover:bg-theme-hover transition-colors last:border-0 flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <span className="font-serif text-base sm:text-lg text-theme-primary truncate">
                        <SearchHighlight text={word.word} query={searchQuery} />
                      </span>
                      {word.reading && (
                        <span className="text-theme-accent text-sm font-medium truncate">
                          <SearchHighlight text={word.reading} query={searchQuery} />
                        </span>
                      )}
                      {word.romaji && (
                        <span className="text-theme-primary/60 text-xs font-medium truncate">
                          <SearchHighlight text={word.romaji} query={searchQuery} />
                        </span>
                      )}
                      <span className="text-[10px] uppercase tracking-wider text-theme-primary/40 ml-auto whitespace-nowrap flex-shrink-0">
                        {word.category}
                      </span>
                    </div>
                    {matchedExample && (
                      <div className="text-sm text-theme-primary/70 mt-2 pl-3 border-l-2 border-theme-accent/50 italic flex flex-col gap-1">
                        <span className="block text-theme-primary font-serif">
                          <SearchHighlight text={matchedExample.sentence} query={searchQuery} />
                        </span>
                        {matchedExample.romaji && (
                          <span className="block text-xs font-mono text-theme-primary/60">
                            <SearchHighlight text={matchedExample.romaji} query={searchQuery} />
                          </span>
                        )}
                        {matchedExample.translation && (
                          <span className="block text-xs">
                            <SearchHighlight text={matchedExample.translation} query={searchQuery} />
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {deck.length === 0 ? (
        <div className="text-center py-20 bg-theme-panel border border-theme-subtle rounded-lg mt-8">
          <p className="text-theme-primary/60 font-medium mb-4">
            Bạn chưa tạo chuyên đề từ vựng nào.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SortableContext items={filteredDeck.map(w => w.id)} strategy={rectSortingStrategy}>
              {filteredDeck.map((word) => (
                <SortableWordItem
                  key={word.id}
                  word={word}
                  searchQuery={searchQuery}
                  onRemoveWord={onRemoveWord}
                  onSelectWord={(id) => {
                    setSelectedWordId(id);
                    setViewState("study");
                  }}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}
    </div>
  );
}

function StudyView({
  deck,
  word,
  targetExampleId,
  onCopyExample,
  onBack,
  onUpdateWord,
  renderHighlight,
}: {
  deck: IntensiveWord[];
  word: IntensiveWord;
  targetExampleId?: string | null;
  onCopyExample: (example: IntensiveExample, targetWordId: string) => void;
  onBack: () => void;
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void;
  renderHighlight: (text: string, kanji: string) => React.ReactNode;
}) {
  const [isAddingExample, setIsAddingExample] = useState(!word.examples.length);
  const [copyingExample, setCopyingExample] = useState<IntensiveExample | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [duplicateWarningId, setDuplicateWarningId] = useState<string | null>(null);
  const [highlightedExampleId, setHighlightedExampleId] = useState<string | null>(null);
  const [newSentence, setNewSentence] = useState("");
  const [newReading, setNewReading] = useState("");
  const [newRomaji, setNewRomaji] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [newSpecialNote, setNewSpecialNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editWordData, setEditWordData] = useState({
    word: word.word,
    reading: word.reading,
    romaji: word.romaji || "",
    category: word.category as WordCategory,
    explanation: word.explanation,
  });

  // Real-time duplicate detection for adding
  useEffect(() => {
    if (newSentence.trim()) {
      const existing = word.examples.find(
        (ex) => normalizeSentence(ex.sentence) === normalizeSentence(newSentence)
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

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
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
    reading: "",
    romaji: "",
    translation: "",
    specialNote: "",
  });

  // Real-time duplicate detection for editing
  useEffect(() => {
    if (editingExampleId && editExampleData && editExampleData.sentence.trim()) {
      const existing = word.examples.find(
        (ex) => ex.id !== editingExampleId && normalizeSentence(ex.sentence) === normalizeSentence(editExampleData.sentence)
      );
      setDuplicateWarningId(existing ? existing.id : null);
    } else {
      if (!newSentence.trim()) {
        setDuplicateWarningId(null);
      }
    }
  }, [editExampleData?.sentence, editingExampleId, word.examples, newSentence]);

  const handleStartEditExample = (ex: IntensiveExample) => {
    setEditingExampleId(ex.id);
    setEditExampleData({
      sentence: ex.sentence,
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
    if (!editExampleData.sentence.trim() || !editingExampleId) return;

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
          sentence: editExampleData.sentence.trim(),
          reading: editExampleData.reading.trim(),
          romaji: editExampleData.romaji.trim(),
          translation: editExampleData.translation.trim(),
          specialNote: editExampleData.specialNote.trim(),
        };
      }
      return ex;
    });

    onUpdateWord(word.id, { examples: updatedExamples });
    setEditingExampleId(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editWordData.word.trim()) return;
    onUpdateWord(word.id, {
      word: editWordData.word.trim(),
      reading: editWordData.reading.trim(),
      romaji: editWordData.romaji.trim(),
      category: editWordData.category,
      explanation: editWordData.explanation.trim(),
    });
    setIsEditing(false);
  };

  const handleAddExample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSentence.trim()) return;

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
      sentence: newSentence.trim(),
      reading: newReading.trim(),
      romaji: newRomaji.trim(),
      translation: newTranslation.trim(),
      specialNote: newSpecialNote.trim(),
    };

    onUpdateWord(word.id, {
      examples: [newExample, ...word.examples],
    });

    setNewSentence("");
    setNewReading("");
    setNewRomaji("");
    setNewTranslation("");
    setNewSpecialNote("");
    setIsAddingExample(false);
  };

  const handleRemoveExample = (exId: string) => {
    onUpdateWord(word.id, {
      examples: word.examples.filter((e) => e.id !== exId),
    });
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
                  disabled={!editWordData.word.trim()}
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
            <div className="w-32 min-h-[8rem] sm:w-40 sm:min-h-[10rem] shrink-0 bg-theme-base-alt flex items-center justify-center rounded border border-theme-subtle shadow-inner mb-4 sm:mb-0 p-4 mx-auto sm:mx-0 relative group/speaker">
              <span className="text-2xl sm:text-4xl font-serif text-theme-primary text-center break-words">
                {word.word}
              </span>
              <button
                onClick={(e) => playAudio(e, word.word || word.reading)}
                className="absolute -right-2 -bottom-2 p-2 bg-theme-panel text-theme-primary/50 hover:text-theme-accent border border-theme-subtle rounded-full shadow-md transition-all opacity-0 group-hover/speaker:opacity-100"
                title="Nghe phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center text-center sm:text-left h-full pr-8">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
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
              </div>
              {word.explanation && (
                <div className="text-theme-primary/90 text-sm sm:text-base leading-relaxed bg-theme-hover/50 p-5 rounded-lg border border-theme-subtle border-l-4 border-l-[#c5a059] mt-3 shadow-inner max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="whitespace-pre-wrap font-sans">
                    {word.explanation}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Examples List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-theme-subtle pb-4">
          <h3 className="text-lg font-serif text-theme-primary tracking-widest uppercase">
            Các Câu Ví Dụ ({word.examples.length})
          </h3>
          <div className="flex items-center gap-6">
            {word.examples.length > 0 && (
              <>
                <button
                  onClick={toggleAllMeanings}
                  className="text-theme-primary/60 hover:text-theme-primary flex items-center gap-1 text-[10px] sm:text-sm uppercase tracking-wider font-medium transition-colors"
                >
                  {isAllHidden ? "Hiện tất cả" : "Ẩn tất cả"}
                </button>
                <button
                  onClick={() => {
                    setDeleteEnabled(!deleteEnabled);
                    setConfirmingDeleteId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all border rounded ${
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
                onClick={() => setIsAddingExample(true)}
                className="text-theme-accent hover:text-theme-accent-hover flex items-center gap-1 text-sm uppercase tracking-wider font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm mới</span>
              </button>
            )}
          </div>
        </div>

        {isAddingExample && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-theme-base-alt border border-theme-accent/30 p-6 rounded-lg relative shadow-xl mb-4"
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
                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                  Câu ví dụ (nên có chứa từ "{word.word}") *
                </label>
                <textarea
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
                  disabled={!newSentence.trim()}
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
            const newExamples = Array.from(word.examples);
            const [reorderedItem] = newExamples.splice(result.source.index, 1);
            newExamples.splice(result.destination.index, 0, reorderedItem);
            onUpdateWord(word.id, { examples: newExamples });
          }}
        >
          <Droppable droppableId="examples">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {word.examples.map((ex, index) => (
                  <Draggable
                    // @ts-ignore
                    key={ex.id}
                    draggableId={ex.id}
                    index={index}
                    isDragDisabled={editingExampleId === ex.id}
                  >
                    {(provided, snapshot) => (
                      <div
                        id={`example-${ex.id}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative rounded-lg border transition-all duration-500 ${snapshot.isDragging ? "border-theme-accent shadow-2xl z-50" : "border-theme-subtle"} ${highlightedExampleId === ex.id ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20" : ""} bg-theme-panel group mb-4`}
                        style={provided.draggableProps.style}
                      >
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
                                <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                                  Câu ví dụ *
                                </label>
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
                                  disabled={!editExampleData.sentence.trim()}
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
                                  <button
                                    onClick={(e) => playAudio(e, ex.sentence)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent rounded hover:bg-theme-panel"
                                    title="Phát âm thanh"
                                  >
                                    <Volume2 className="w-4 h-4" />
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
                              <div className="flex gap-4 pr-16">
                                <div className="w-8 h-8 shrink-0 bg-theme-base-alt border border-theme-subtle flex items-center justify-center rounded-full text-theme-accent font-serif text-sm">
                                  {index + 1}
                                </div>
                                <HighlightProvider><div className="flex-1 pt-1">
                                  {ex.reading &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-accent opacity-80 mb-1">
                                        <RelatedHighlight text={ex.reading} type="hiragana" />
                                      </p>
                                    )}
                                  <p className="text-xl sm:text-2xl text-theme-primary font-serif leading-relaxed mb-3">
                                    {renderHighlight(ex.sentence, word.word)}
                                    <button
                                      onClick={(e) => playAudio(e, ex.sentence)}
                                      className="inline-flex items-center justify-center p-2 ml-3 text-theme-primary/40 hover:text-theme-accent transition-colors align-middle rounded-full hover:bg-theme-accent/10"
                                      title="Nghe câu ví dụ"
                                    >
                                      <Volume2 className="w-5 h-5" />
                                    </button>
                                  </p>
                                  {ex.romaji &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-primary/60 mb-1">
                                        <RelatedHighlight text={ex.romaji} type="romaji" />
                                      </p>
                                    )}
                                  {ex.translation &&
                                    !hiddenMeaningIds.includes(ex.id) && (
                                      <p className="text-sm text-theme-primary/50 italic mb-2">
                                        (<HighlightVietnamese text={ex.translation || ""} />)
                                      </p>
                                    )}
                                  
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
                                          <div className="relative z-10 text-[15px] text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                                            {ex.specialNote}
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
        <div className="fixed inset-0 bg-theme-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                    key={w.id}
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
    </div>
  );
}
