import React, { useState, Fragment } from 'react';
import { IntensiveWord, IntensiveExample, WordCategory, KanjiCard } from '../types';
import { PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IntensiveStudyProps {
  deck: IntensiveWord[];
  mainDeck?: KanjiCard[];
  onAddWord: (word: IntensiveWord) => void;
  onRemoveWord: (id: string) => void;
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void;
}

const CATEGORIES: WordCategory[] = [
  'Danh từ', 'Động từ nhóm I', 'Động từ nhóm II', 'Động từ nhóm III',
  'Tính từ đuôi-i', 'Tính từ đuôi-na', 'Ngữ pháp', 'Khác'
];

export default function IntensiveStudy({ deck, mainDeck, onAddWord, onRemoveWord, onUpdateWord }: IntensiveStudyProps) {
  const [viewState, setViewState] = useState<'list' | 'add' | 'study'>('list');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Form State
  const [newWordData, setNewWordData] = useState({
    word: '',
    reading: '',
    romaji: '',
    category: 'Danh từ' as WordCategory,
    explanation: ''
  });

  const selectedWord = deck.find(w => w.id === selectedWordId);

  const filteredDeck = deck.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.reading.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      createdAt: Date.now()
    };

    onAddWord(newWord);
    setViewState('list');
    setNewWordData({ word: '', reading: '', romaji: '', category: 'Danh từ', explanation: '' });
  };

  const renderExampleHighlight = (example: string, targetWord: string) => {
    if (!example) return <Fragment>“{example}”</Fragment>;

    const uniqueWords = new Map<string, KanjiCard>();
    mainDeck?.forEach(card => {
      const wordStr = card.kanji || card.reading;
      if (wordStr && wordStr.length > 0 && example.includes(wordStr)) {
        if (!uniqueWords.has(wordStr)) {
          uniqueWords.set(wordStr, card);
        } else {
          const existing = uniqueWords.get(wordStr)!;
          const eScore = existing.interval + existing.repetition;
          const cScore = card.interval + card.repetition;
          if (cScore > eScore) {
            uniqueWords.set(wordStr, card);
          }
        }
      }
    });

    const deckWordsInExample = Array.from(uniqueWords.values()).sort((a, b) => {
      const aStr = a.kanji || a.reading;
      const bStr = b.kanji || b.reading;
      return bStr.length - aStr.length;
    });

    let tokens: { text: string; status: 'good' | 'bad' | 'neutral' | 'target' }[] = [
      { text: example, status: 'neutral' }
    ];

    deckWordsInExample.forEach(card => {
      const wordStr = card.kanji || card.reading;
      
      let status: 'good' | 'bad' | 'neutral' = 'good';
      if (card.repetition === 0 && card.interval === 0) {
        status = 'neutral';
      } else if (card.repetition === 0 || card.interval <= 1) {
        status = 'bad';
      }

      if (status !== 'neutral') {
        const newTokens: typeof tokens = [];
        tokens.forEach(token => {
          if (token.status !== 'neutral') {
            newTokens.push(token);
            return;
          }
          const parts = token.text.split(wordStr);
          parts.forEach((part, i) => {
            if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
            if (i < parts.length - 1) newTokens.push({ text: wordStr, status: status });
          });
        });
        tokens = newTokens;
      }
    });

    // Fallback for the targetWord of this intensive item
    const newTokens: typeof tokens = [];
    tokens.forEach(token => {
      if (token.status !== 'neutral' || !targetWord) {
        newTokens.push(token);
        return;
      }
      
      let targetToHighlight = targetWord;
      
      if (!token.text.includes(targetWord)) {
         const kanjiChars = targetWord.match(/[\u4e00-\u9faf]+/g);
         if (kanjiChars && kanjiChars.length > 0) {
             const stem = kanjiChars.join('');
             targetToHighlight = token.text.includes(stem) ? stem : kanjiChars[0];
         }
      }

      if (token.text.includes(targetToHighlight)) {
        const parts = token.text.split(targetToHighlight);
        parts.forEach((part, i) => {
          if (part.length > 0) newTokens.push({ text: part, status: 'neutral' });
          if (i < parts.length - 1) newTokens.push({ text: targetToHighlight, status: 'target' });
        });
      } else {
        newTokens.push(token);
      }
    });
    tokens = newTokens;

    return (
      <Fragment>
        “{tokens.map((t, i) => {
          if (t.status === 'good') return <span key={i} className="text-green-500 font-bold" title="Từ này bạn đã nhớ (Tốt)">{t.text}</span>;
          if (t.status === 'bad') return <span key={i} className="text-red-400 font-bold" title="Từ này bạn cần học thêm (Khó / Lặp lại)">{t.text}</span>;
          if (t.status === 'target') return <span key={i} className="text-[#c5a059] font-bold">{t.text}</span>;
          return <Fragment key={i}>{t.text}</Fragment>;
        })}”
      </Fragment>
    );
  };

  if (viewState === 'add') {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 w-full flex flex-col gap-6">
        <button 
          onClick={() => setViewState('list')}
          className="flex items-center gap-2 text-[#d4d4d4]/60 hover:text-[#c5a059] transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wider uppercase">Quay lại</span>
        </button>

        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-lg border border-[#2a2a2a] shadow-xl">
          <h2 className="text-xl font-serif text-[#c5a059] mb-6 tracking-widest text-center sm:text-left">THÊM TỪ VỰNG CHUYÊN SÂU</h2>
          
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Từ vựng (Kanji) *</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={newWordData.word}
                  onChange={e => setNewWordData({...newWordData, word: e.target.value})}
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] font-serif text-lg transition-colors placeholder:text-[#2a2a2a]"
                  placeholder="e.g. 情報"
                />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-5">
                <div className="flex-1 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Cách đọc (Hiragana)</label>
                  <input
                    type="text"
                    value={newWordData.reading}
                    onChange={e => setNewWordData({...newWordData, reading: e.target.value})}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                    placeholder="e.g. じょうほう"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Phiên âm Romaji</label>
                  <input
                    type="text"
                    value={newWordData.romaji}
                    onChange={e => setNewWordData({...newWordData, romaji: e.target.value})}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                    placeholder="e.g. jōhō"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Tính chất</label>
              <select
                value={newWordData.category}
                onChange={e => setNewWordData({...newWordData, category: e.target.value as WordCategory})}
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4d4d4' opacity='0.6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Giải thích</label>
              <textarea
                rows={3}
                value={newWordData.explanation}
                onChange={e => setNewWordData({...newWordData, explanation: e.target.value})}
                className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                placeholder="e.g. Đây là từ ít xuất hiện, thường dùng trong ngữ cảnh..."
              />
            </div>

            <button
              type="submit"
              disabled={!newWordData.word.trim()}
              className="mt-4 bg-[#c5a059] hover:bg-[#b08d4a] disabled:bg-[#2a2a2a] disabled:text-[#d4d4d4]/40 text-[#121212] font-bold py-3 rounded uppercase tracking-widest text-sm transition-all"
            >
              Tạo Chuyên Đề
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewState === 'study' && selectedWord) {
    return (
      <StudyView 
        word={selectedWord} 
        onBack={() => setViewState('list')} 
        onUpdateWord={onUpdateWord}
        renderHighlight={renderExampleHighlight}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-serif text-white tracking-wider">ÔN CHUYÊN TỪ VỰNG</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setViewState('add')}
            className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#c5a059] border border-[#2a2a2a] px-4 py-2 rounded flex items-center gap-2 transition-all font-medium uppercase tracking-wider text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Từ</span>
          </button>
        </div>
      </div>

      {deck.length > 0 && (
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#d4d4d4]/40" />
          <input
            type="text"
            placeholder="Tìm kiếm chuyên đề..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-[#2a2a2a] rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#c5a059] transition-colors"
          />
        </div>
      )}

      {deck.length === 0 ? (
        <div className="text-center py-20 bg-[#121212] border border-[#2a2a2a] rounded-lg mt-8">
          <p className="text-[#d4d4d4]/60 font-medium mb-4">Bạn chưa tạo chuyên đề từ vựng nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDeck.map(word => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-6 hover:border-[#c5a059]/50 transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left relative group"
                onClick={() => {
                  setSelectedWordId(word.id);
                  setViewState('study');
                }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveWord(word.id); }}
                  className="absolute top-2 right-2 p-2 text-[#d4d4d4]/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-[#121212]"
                  title="Xoá chuyên đề"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-4xl font-serif text-white mb-2">{word.word}</div>
                {word.reading && <div className="text-[#c5a059] opacity-90 font-medium mb-1">{word.reading}</div>}
                <div className="text-[11px] uppercase tracking-wider text-[#d4d4d4]/40 mb-3">{word.category}</div>
                <div className="text-xs text-[#d4d4d4]/60 line-clamp-2 italic">
                  {word.explanation || "Không có giải thích"}
                </div>
                <div className="mt-4 pt-3 border-t border-[#2a2a2a] w-full flex justify-between items-center text-xs text-[#d4d4d4]/40">
                  <span>{word.examples.length} câu ví dụ</span>
                  <span className="text-[#c5a059]">Học ngay &rarr;</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StudyView({ word, onBack, onUpdateWord, renderHighlight }: { 
  word: IntensiveWord, 
  onBack: () => void,
  onUpdateWord: (id: string, updates: Partial<IntensiveWord>) => void,
  renderHighlight: (text: string, kanji: string) => React.ReactNode
}) {
  const [isAddingExample, setIsAddingExample] = useState(!word.examples.length);
  const [newSentence, setNewSentence] = useState('');
  const [newReading, setNewReading] = useState('');
  const [newRomaji, setNewRomaji] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editWordData, setEditWordData] = useState({
    word: word.word,
    reading: word.reading,
    romaji: word.romaji || '',
    category: word.category as WordCategory,
    explanation: word.explanation
  });

  const [hiddenMeaningIds, setHiddenMeaningIds] = useState<string[]>([]);
  const isAllHidden = word.examples.length > 0 && hiddenMeaningIds.length === word.examples.length;
  
  const toggleAllMeanings = () => {
    if (isAllHidden) {
      setHiddenMeaningIds([]);
    } else {
      setHiddenMeaningIds(word.examples.map(ex => ex.id));
    }
  };

  const toggleMeaning = (id: string) => {
    setHiddenMeaningIds(prev => 
      prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]
    );
  };

  const [editingExampleId, setEditingExampleId] = useState<string | null>(null);
  const [editExampleData, setEditExampleData] = useState({
    sentence: '',
    reading: '',
    romaji: '',
    translation: ''
  });

  const handleStartEditExample = (ex: IntensiveExample) => {
    setEditingExampleId(ex.id);
    setEditExampleData({
      sentence: ex.sentence,
      reading: ex.reading || '',
      romaji: ex.romaji || '',
      translation: ex.translation || ''
    });
  };

  const handleCancelEditExample = () => {
    setEditingExampleId(null);
  };

  const handleEditExampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editExampleData.sentence.trim() || !editingExampleId) return;

    const updatedExamples = word.examples.map(ex => {
      if (ex.id === editingExampleId) {
        return {
          ...ex,
          sentence: editExampleData.sentence.trim(),
          reading: editExampleData.reading.trim(),
          romaji: editExampleData.romaji.trim(),
          translation: editExampleData.translation.trim()
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
      explanation: editWordData.explanation.trim()
    });
    setIsEditing(false);
  };

  const handleAddExample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSentence.trim()) return;

    const newExample: IntensiveExample = {
      id: crypto.randomUUID(),
      sentence: newSentence.trim(),
      reading: newReading.trim(),
      romaji: newRomaji.trim(),
      translation: newTranslation.trim()
    };

    onUpdateWord(word.id, {
      examples: [...word.examples, newExample]
    });

    setNewSentence('');
    setNewReading('');
    setNewRomaji('');
    setNewTranslation('');
    setIsAddingExample(false);
  };

  const handleRemoveExample = (exId: string) => {
    onUpdateWord(word.id, {
      examples: word.examples.filter(e => e.id !== exId)
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 w-full flex flex-col gap-8 pb-32">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#d4d4d4]/60 hover:text-[#c5a059] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium tracking-wider uppercase">Về danh sách chuyên đề</span>
      </button>

      {/* Header Info */}
      <div className="bg-[#121212] border-b-2 border-b-[#c5a059] p-8 rounded-t-lg shadow-xl relative overflow-hidden group">
        {/* Background Decorative Kanji */}
        <div className="absolute -right-8 -top-8 text-[12rem] font-serif text-white/[0.02] leading-none pointer-events-none select-none">
          {word.word}
        </div>

        {isEditing ? (
          <div className="relative z-10 w-full">
            <h4 className="text-[#c5a059] uppercase tracking-wider text-sm font-medium mb-4">Chỉnh sửa chuyên đề</h4>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 space-y-2">
                  <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Từ vựng (Kanji) *</label>
                  <input
                    autoFocus
                    required
                    type="text"
                    value={editWordData.word}
                    onChange={e => setEditWordData({...editWordData, word: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] font-serif text-lg transition-colors placeholder:text-[#2a2a2a]"
                  />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-5">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Cách đọc (Hiragana)</label>
                    <input
                      type="text"
                      value={editWordData.reading}
                      onChange={e => setEditWordData({...editWordData, reading: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Phiên âm Romaji</label>
                    <input
                      type="text"
                      value={editWordData.romaji}
                      onChange={e => setEditWordData({...editWordData, romaji: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Tính chất</label>
                <select
                  value={editWordData.category}
                  onChange={e => setEditWordData({...editWordData, category: e.target.value as WordCategory})}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4d4d4' opacity='0.6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Giải thích</label>
                <textarea
                  rows={3}
                  value={editWordData.explanation}
                  onChange={e => setEditWordData({...editWordData, explanation: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!editWordData.word.trim()}
                  className="bg-[#c5a059] hover:bg-[#b08d4a] disabled:bg-[#2a2a2a] disabled:text-[#d4d4d4]/40 text-[#121212] font-bold py-2 px-6 rounded uppercase tracking-widest text-sm transition-all"
                >
                  Lưu Thay Đổi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditWordData({
                      word: word.word, reading: word.reading, romaji: word.romaji || '', category: word.category as WordCategory, explanation: word.explanation
                    });
                    setIsEditing(false);
                  }}
                  className="text-[#d4d4d4]/60 hover:text-white px-4 py-2 uppercase tracking-wider text-sm transition-colors"
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
              className="absolute top-0 right-0 p-2 bg-[#1a1a1a]/80 text-[#d4d4d4]/40 hover:text-[#c5a059] opacity-0 group-hover:opacity-100 transition-all rounded z-20"
              title="Chỉnh sửa chuyên đề"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            {/* Main Visual */}
            <div className="w-32 h-32 shrink-0 bg-[#0c0c0c] flex items-center justify-center rounded border border-[#2a2a2a] shadow-inner mb-4 sm:mb-0">
               <span className="text-5xl font-serif text-white">{word.word}</span>
            </div>

            <div className="flex-1 flex flex-col justify-center text-center sm:text-left h-full pr-8">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                <span className="text-2xl text-[#c5a059] font-medium">{word.reading}</span>
                {word.romaji && <span className="text-lg text-[#d4d4d4]/60">{word.romaji}</span>}
                <span className="bg-[#1a1a1a] text-[#d4d4d4]/60 px-2 py-1 rounded text-[10px] uppercase border border-[#2a2a2a] tracking-wider">{word.category}</span>
              </div>
              {word.explanation && (
                <div className="text-[#d4d4d4]/90 text-sm sm:text-base leading-relaxed bg-[#1a1a1a]/50 p-5 rounded-lg border border-[#2a2a2a] border-l-4 border-l-[#c5a059] mt-3 shadow-inner max-h-64 overflow-y-auto custom-scrollbar">
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
        <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
          <h3 className="text-lg font-serif text-white tracking-widest uppercase">Các Câu Ví Dụ ({word.examples.length})</h3>
          <div className="flex items-center gap-6">
            {word.examples.length > 0 && (
              <button
                 onClick={toggleAllMeanings}
                 className="text-[#d4d4d4]/60 hover:text-white flex items-center gap-1 text-sm uppercase tracking-wider font-medium transition-colors"
              >
                 {isAllHidden ? "Hiện tất cả" : "Ẩn tất cả"}
              </button>
            )}
            {!isAddingExample && (
              <button
                onClick={() => setIsAddingExample(true)}
                className="text-[#c5a059] hover:text-[#b08d4a] flex items-center gap-1 text-sm uppercase tracking-wider font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm mới</span>
              </button>
            )}
          </div>
        </div>

        {[...word.examples].reverse().map((ex, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={ex.id} 
            className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 rounded-lg relative group overflow-hidden"
          >
             {editingExampleId === ex.id ? (
               <form onSubmit={handleEditExampleSubmit} className="space-y-4">
                 <h4 className="text-xs uppercase tracking-wider text-[#c5a059] mb-4 font-medium">Chỉnh sửa câu ví dụ</h4>
                 <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Câu ví dụ *</label>
                    <textarea
                      autoFocus
                      required
                      rows={2}
                      value={editExampleData.sentence}
                      onChange={e => setEditExampleData({...editExampleData, sentence: e.target.value})}
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] font-serif text-lg transition-colors placeholder:text-[#2a2a2a]"
                    />
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4">
                   <div className="flex-1 space-y-2">
                      <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Phiên âm Hiragana</label>
                      <input
                        type="text"
                        value={editExampleData.reading}
                        onChange={e => setEditExampleData({...editExampleData, reading: e.target.value})}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                      />
                   </div>
                   <div className="flex-1 space-y-2">
                      <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Phiên âm Romaji</label>
                      <input
                        type="text"
                        value={editExampleData.romaji}
                        onChange={e => setEditExampleData({...editExampleData, romaji: e.target.value})}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                      />
                   </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Bản dịch</label>
                    <input
                      type="text"
                      value={editExampleData.translation}
                      onChange={e => setEditExampleData({...editExampleData, translation: e.target.value})}
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                    />
                 </div>
                 <div className="flex items-center gap-3 pt-2">
                   <button
                      type="submit"
                      disabled={!editExampleData.sentence.trim()}
                      className="bg-[#c5a059] hover:bg-[#b08d4a] disabled:bg-[#2a2a2a] disabled:text-[#d4d4d4]/40 text-[#121212] font-bold py-2 px-6 rounded uppercase tracking-widest text-sm transition-all"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditExample}
                      className="text-[#d4d4d4]/60 hover:text-white px-4 py-2 uppercase tracking-wider text-sm transition-colors"
                    >
                      Hủy
                    </button>
                 </div>
               </form>
             ) : (
               <>
                 <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-all">
                   <button
                     onClick={(e) => toggleMeaning(ex.id, e)}
                     className="p-2 text-[#d4d4d4]/40 hover:text-[#c5a059] rounded hover:bg-[#121212]"
                     title={hiddenMeaningIds.includes(ex.id) ? "Hiện nghĩa" : "Ẩn nghĩa"}
                   >
                     {hiddenMeaningIds.includes(ex.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                   <button
                      onClick={() => handleStartEditExample(ex)}
                      className="p-2 text-[#d4d4d4]/40 hover:text-[#c5a059] rounded hover:bg-[#121212]"
                      title="Chỉnh sửa ví dụ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveExample(ex.id)}
                      className="p-2 text-[#d4d4d4]/20 hover:text-red-500 rounded hover:bg-[#121212]"
                      title="Xoá ví dụ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
                 <div className="flex gap-4 pr-16">
                   <div className="w-8 h-8 shrink-0 bg-[#0c0c0c] border border-[#2a2a2a] flex items-center justify-center rounded-full text-[#c5a059] font-serif text-sm">
                     {index + 1}
                   </div>
                   <div className="flex-1 pt-1">
                     {ex.reading && !hiddenMeaningIds.includes(ex.id) && (
                       <p className="text-sm text-[#c5a059] opacity-80 mb-1">{ex.reading}</p>
                     )}
                     <p className="text-xl sm:text-2xl text-[#d4d4d4] font-serif leading-relaxed mb-3">
                       {renderHighlight(ex.sentence, word.word)}
                     </p>
                     {ex.romaji && !hiddenMeaningIds.includes(ex.id) && (
                       <p className="text-sm text-[#d4d4d4]/60 mb-1">{ex.romaji}</p>
                     )}
                     {ex.translation && !hiddenMeaningIds.includes(ex.id) && (
                       <p className="text-sm text-[#d4d4d4]/50 italic">
                         ({ex.translation})
                       </p>
                     )}
                   </div>
                 </div>
               </>
             )}
          </motion.div>
        ))}

        {isAddingExample && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0c0c0c] border border-[#c5a059]/30 p-6 rounded-lg relative shadow-xl"
          >
             <h4 className="text-xs uppercase tracking-wider text-[#c5a059] mb-4 font-medium">Thêm Câu Ví Dụ Mới</h4>
             <form onSubmit={handleAddExample} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Câu ví dụ (nên có chứa từ "{word.word}") *</label>
                  <textarea
                    autoFocus
                    required
                    rows={2}
                    value={newSentence}
                    onChange={e => setNewSentence(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] font-serif text-lg transition-colors placeholder:text-[#2a2a2a]"
                    placeholder="e.g. この情報は大切です。"
                  />
               </div>
               <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex-1 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Phiên âm Hiragana</label>
                    <input
                      type="text"
                      value={newReading}
                      onChange={e => setNewReading(e.target.value)}
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                      placeholder="e.g. この じょうほう は たいせつ です"
                    />
                 </div>
                 <div className="flex-1 space-y-2">
                    <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Phiên âm Romaji</label>
                    <input
                      type="text"
                      value={newRomaji}
                      onChange={e => setNewRomaji(e.target.value)}
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                      placeholder="e.g. Kono jōhō wa taisetsu desu."
                    />
                 </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-[#d4d4d4]/60 font-medium">Bản dịch</label>
                  <input
                    type="text"
                    value={newTranslation}
                    onChange={e => setNewTranslation(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors placeholder:text-[#2a2a2a]"
                    placeholder="e.g. Thông tin này quan trọng."
                  />
               </div>
               <div className="flex items-center gap-3 pt-2">
                 <button
                    type="submit"
                    disabled={!newSentence.trim()}
                    className="bg-[#c5a059] hover:bg-[#b08d4a] disabled:bg-[#2a2a2a] disabled:text-[#d4d4d4]/40 text-[#121212] font-bold py-2 px-6 rounded uppercase tracking-widest text-sm transition-all"
                  >
                    Lưu Ví Dụ
                  </button>
                  {word.examples.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingExample(false)}
                      className="text-[#d4d4d4]/60 hover:text-white px-4 py-2 uppercase tracking-wider text-sm transition-colors"
                    >
                      Hủy
                    </button>
                  )}
               </div>
             </form>
          </motion.div>
        )}
      </div>

    </div>
  );
}
