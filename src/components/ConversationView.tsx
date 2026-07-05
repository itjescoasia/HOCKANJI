import React, { useState, useEffect } from "react";
import { Conversation, DialogueSentence, KanjiCard } from "../types";
import { PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Check, X, Info, Lightbulb, Lock, Unlock, GripVertical, List, Presentation, ChevronLeft, ChevronRight, Copy, Brain, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import Fuse from "fuse.js";
import { formatCreatedAt } from "../lib/dateUtils";
import { renderExampleHighlight } from "../utils/highlight";

interface ConversationViewProps {
  conversations: Conversation[];
  onAddConversation: (conversation: Conversation) => void;
  onRemoveConversation: (id: string) => void;
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
  onUpdateCard?: (id: string, updates: Partial<KanjiCard>) => void;
  onReviewCard?: (id: string, grade: 'forgot' | 'hard' | 'good' | 'easy') => void;
  mainDeck: KanjiCard[];
}

export default function ConversationView({
  conversations,
  onAddConversation,
  onRemoveConversation,
  onUpdateConversation,
  onUpdateCard,
  onReviewCard,
  mainDeck,
}: ConversationViewProps) {
  const [viewState, setViewState] = useState<"list" | "add" | "detail">("list");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteUnlocked, setIsDeleteUnlocked] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const fuse = React.useMemo(
    () =>
      new Fuse(conversations, {
        keys: ["title", "description"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [conversations]
  );

  const filteredConversations = searchQuery.trim()
    ? fuse.search(searchQuery).map((r) => r.item)
    : conversations;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      dialogues: [],
      createdAt: Date.now(),
    };
    onAddConversation(newConv);
    setNewTitle("");
    setNewDescription("");
    setViewState("list");
  };

  if (viewState === "add") {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 w-full">
        <button
          onClick={() => setViewState("list")}
          className="flex items-center gap-2 text-theme-primary/60 hover:text-theme-accent transition-colors mb-6 uppercase tracking-widest text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Về danh sách
        </button>
        <div className="bg-theme-panel p-8 border border-theme-subtle">
          <h2 className="text-xl font-serif text-theme-primary mb-6 tracking-widest uppercase">
            Thêm chủ đề hội thoại
          </h2>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                Tên chủ đề *
              </label>
              <input
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent font-serif text-xl transition-colors placeholder:text-theme-primary/40"
                placeholder="Ví dụ: Hội thoại mua sắm..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                Mô tả
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40 h-24 resize-none"
                placeholder="Mô tả nội dung hoặc bối cảnh..."
              />
            </div>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="mt-4 bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-3 px-6 uppercase tracking-widest text-sm transition-all text-center"
            >
              Tạo chủ đề
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewState === "detail" && selectedConv) {
    return (
      <ConversationDetail
        conversation={selectedConv}
        onBack={() => {
          setViewState("list");
          setSelectedConvId(null);
        }}
        onUpdate={(id, updates) => onUpdateConversation(id, updates)}
        onUpdateCard={onUpdateCard}
        onReviewCard={onReviewCard}
        mainDeck={mainDeck}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-theme-accent mb-2 tracking-widest uppercase">
            Hội Thoại
          </h2>
          <span className="text-theme-primary opacity-50 text-[10px] uppercase tracking-widest">
            {conversations.length} chủ đề hội thoại
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeleteUnlocked(!isDeleteUnlocked)}
            className={`flex items-center justify-center p-2.5 transition-colors border ${
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
            className="flex items-center gap-2 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-colors shrink-0"
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
          className="w-full bg-theme-panel border border-theme-subtle py-3 pl-10 pr-4 text-theme-primary placeholder-theme-primary/30 focus:outline-none focus:border-theme-accent transition-colors text-sm"
          placeholder="Tìm kiếm chủ đề..."
        />
      </div>

      {filteredConversations.length === 0 ? (
        <div className="text-center py-20 bg-theme-panel border border-theme-subtle border-dashed">
          <p className="text-theme-primary/50 text-sm uppercase tracking-wider">
            {searchQuery
              ? "Không tìm thấy chủ đề nào."
              : "Chưa có chủ đề hội thoại nào."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-theme-panel border border-theme-subtle p-5 hover:border-theme-accent/50 transition-colors cursor-pointer flex flex-col group"
                onClick={() => {
                  setSelectedConvId(conv.id);
                  setViewState("detail");
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-theme-primary group-hover:text-theme-accent transition-colors line-clamp-1">
                    {conv.title}
                  </h3>
                  <div className="flex gap-1">
                    {isDeleteUnlocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) {
                            onRemoveConversation(conv.id);
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Xác nhận xóa chủ đề"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {conv.description && (
                  <p className="text-xs text-theme-primary/60 line-clamp-2 mb-4">
                    {conv.description}
                  </p>
                )}
                <div className="mt-auto pt-4 border-t border-theme-subtle flex justify-between items-center text-[10px] uppercase tracking-widest text-theme-primary/50">
                  <span>{conv.dialogues.length} câu thoại</span>
                  {formatCreatedAt(conv.createdAt) && (
                    <span>{formatCreatedAt(conv.createdAt)?.dateStr}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ConversationDetail({
  conversation,
  onBack,
  onUpdate,
  onUpdateCard,
  onReviewCard,
  mainDeck,
}: {
  conversation: Conversation;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Conversation>) => void;
  onUpdateCard?: (id: string, updates: Partial<KanjiCard>) => void;
  onReviewCard?: (id: string, grade: 'forgot' | 'hard' | 'good' | 'easy') => void;
  mainDeck: KanjiCard[];
}) {
  const [newJp, setNewJp] = useState("");
  const [newHira, setNewHira] = useState("");
  const [newRomaji, setNewRomaji] = useState("");
  const [newVietnamese, setNewVietnamese] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editJp, setEditJp] = useState("");
  const [editHira, setEditHira] = useState("");
  const [editRomaji, setEditRomaji] = useState("");
  const [editVietnamese, setEditVietnamese] = useState("");
  const [editExplanation, setEditExplanation] = useState("");

  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "slideshow" | "review_vocab">("list");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const playAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAllJapanese = () => {
    const textToCopy = conversation.dialogues
      .map((d, index) => `${index + 1}. ${d.japanese}`)
      .join("\n");
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleAddDialogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJp.trim()) return;

    const newDialogue: DialogueSentence = {
      id: crypto.randomUUID(),
      japanese: newJp.trim(),
      hiragana: newHira.trim(),
      romaji: newRomaji.trim(),
      vietnamese: newVietnamese.trim(),
      explanation: newExplanation.trim(),
    };

    onUpdate(conversation.id, {
      dialogues: [...conversation.dialogues, newDialogue],
    });

    setNewJp("");
    setNewHira("");
    setNewRomaji("");
    setNewVietnamese("");
    setNewExplanation("");
    setIsAdding(true); // keep it open
  };

  const handleRemoveDialogue = (id: string) => {
    onUpdate(conversation.id, {
      dialogues: conversation.dialogues.filter((d) => d.id !== id),
    });
    setConfirmingDeleteId(null);
  };

  const startEditing = (dialogue: DialogueSentence) => {
    setEditingId(dialogue.id);
    setEditJp(dialogue.japanese);
    setEditHira(dialogue.hiragana || "");
    setEditRomaji(dialogue.romaji || "");
    setEditVietnamese(dialogue.vietnamese || "");
    setEditExplanation(dialogue.explanation || "");
  };

  const handleUpdateDialogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJp.trim() || !editingId) return;

    onUpdate(conversation.id, {
      dialogues: conversation.dialogues.map(d => 
        d.id === editingId 
          ? {
              ...d,
              japanese: editJp.trim(),
              hiragana: editHira.trim(),
              romaji: editRomaji.trim(),
              vietnamese: editVietnamese.trim(),
              explanation: editExplanation.trim(),
            }
          : d
      )
    });
    setEditingId(null);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newDialogues = Array.from(conversation.dialogues);
    const [reorderedItem] = newDialogues.splice(result.source.index, 1);
    newDialogues.splice(result.destination.index, 0, reorderedItem);
    
    onUpdate(conversation.id, {
      dialogues: newDialogues,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-theme-primary/60 hover:text-theme-accent transition-colors w-fit mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-medium tracking-wider uppercase">
          Về danh sách
        </span>
      </button>

      <div className="bg-theme-panel border-b border-theme-subtle p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-serif text-theme-primary mb-1">
              {conversation.title}
            </h1>
            {conversation.description && (
              <p className="text-theme-primary/60 text-xs md:text-sm italic">
                {conversation.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-theme-base border border-theme-subtle rounded p-0.5 gap-0.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-sm font-bold tracking-widest uppercase text-[10px] shrink-0 ${
                  viewMode === "list"
                    ? "bg-theme-accent text-theme-inverted"
                    : "text-theme-primary/50 hover:text-theme-primary hover:bg-theme-hover"
                }`}
                title="Chế độ danh sách"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Danh sách</span>
              </button>
              <button
                onClick={() => setViewMode("slideshow")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-sm font-bold tracking-widest uppercase text-[10px] shrink-0 ${
                  viewMode === "slideshow"
                    ? "bg-theme-accent text-theme-inverted"
                    : "text-theme-primary/50 hover:text-theme-primary hover:bg-theme-hover"
                }`}
                title="Chế độ trình chiếu"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trình chiếu</span>
              </button>
              <button
                onClick={() => setViewMode("review_vocab")}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors rounded-sm font-bold tracking-widest uppercase text-[10px] shrink-0 ${
                  viewMode === "review_vocab"
                    ? "bg-theme-accent text-theme-inverted"
                    : "text-theme-primary/50 hover:text-theme-primary hover:bg-theme-hover"
                }`}
                title="Ôn tập từ vựng"
              >
                <Brain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Học từ</span>
              </button>
            </div>

            <div className="flex-1" />

            <button
              onClick={handleCopyAllJapanese}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all border rounded shrink-0 ${
                isCopied
                  ? "bg-theme-accent/10 text-theme-accent border-theme-accent/30"
                  : "bg-theme-base text-theme-primary/60 border-theme-subtle hover:text-theme-primary hover:border-theme-primary/60"
              }`}
              title="Copy toàn bộ tiếng Nhật"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? "Đã copy" : "Copy"}</span>
            </button>

            {viewMode === "list" && (
              <button
                onClick={() => {
                  setDeleteEnabled(!deleteEnabled);
                  setConfirmingDeleteId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold transition-all border rounded shrink-0 ${
                  deleteEnabled 
                    ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20 hover:border-red-500" 
                    : "bg-theme-base text-theme-primary/60 border-theme-subtle hover:text-theme-primary hover:border-theme-primary/60"
                }`}
              >
                {deleteEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{deleteEnabled ? "Tắt sửa" : "Sửa"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="conversation-dialogues">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4 mb-8"
              >
                {conversation.dialogues.map((dialogue, index) => (
                  <Draggable
                    // @ts-ignore
                    key={dialogue.id}
                    draggableId={dialogue.id}
                    index={index}
                    isDragDisabled={editingId === dialogue.id || deleteEnabled}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                        className={`relative rounded-lg border ${snapshot.isDragging ? "border-theme-accent shadow-2xl z-50" : "border-theme-subtle"} bg-theme-panel group mb-4`}
                      >
                        <div className={`p-4 relative z-10 w-full min-h-full ${editingId !== dialogue.id ? "pl-14" : ""}`}>
                          {editingId !== dialogue.id && !deleteEnabled && (
                            <div
                              {...provided.dragHandleProps}
                              className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-theme-primary/20 hover:text-theme-accent transition-colors z-20 border-r border-theme-subtle"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                          )}
                          
                          {editingId === dialogue.id ? (
                            <form onSubmit={handleUpdateDialogue} className="space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="text-theme-accent text-xs font-bold uppercase tracking-widest">Sửa câu {index + 1}</span>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Tiếng Nhật *</label>
                                <input required type="text" value={editJp} onChange={(e) => setEditJp(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Phiên âm Hiragana</label>
                                  <input type="text" value={editHira} onChange={(e) => setEditHira(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Phiên âm Romaji</label>
                                  <input type="text" value={editRomaji} onChange={(e) => setEditRomaji(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Nghĩa tiếng Việt</label>
                                <input type="text" value={editVietnamese} onChange={(e) => setEditVietnamese(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Giải thích chi tiết</label>
                                <textarea value={editExplanation} onChange={(e) => setEditExplanation(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors h-24 resize-none" placeholder="Giải thích chi tiết ngữ pháp, từ vựng..." />
                              </div>
                              <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={!editJp.trim()} className="bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-2 px-6 uppercase tracking-widest text-xs transition-all flex-1 flex items-center justify-center gap-2">
                                  <Check className="w-4 h-4" /> Lưu
                                </button>
                                <button type="button" onClick={() => setEditingId(null)} className="text-theme-primary/60 hover:text-theme-primary px-4 py-2 uppercase tracking-wider text-xs transition-colors flex-1 border border-theme-subtle hover:border-theme-primary/30 flex items-center justify-center gap-2">
                                  <X className="w-4 h-4" /> Hủy
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex gap-4 flex-col">
                              <div className="flex gap-4">
                                <div className="shrink-0 text-theme-primary/30 font-serif text-xl mt-1">
                                  {String(index + 1).padStart(2, "0")}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-start gap-2">
                                    <p className="text-lg text-theme-primary font-serif">
                                      {renderExampleHighlight(dialogue.japanese, "", mainDeck)}
                                    </p>
                                    <button
                                      onClick={(e) => playAudio(e, dialogue.japanese)}
                                      className="p-1.5 text-theme-primary/40 hover:text-theme-accent transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                                      title="Nghe câu hội thoại"
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  {dialogue.hiragana && (
                                    <p className="text-sm text-theme-primary/80">
                                      {dialogue.hiragana}
                                    </p>
                                  )}
                                  {dialogue.romaji && (
                                    <p className="text-xs text-theme-primary/50 font-mono">
                                      {dialogue.romaji}
                                    </p>
                                  )}
                                  {dialogue.vietnamese && (
                                    <p className="text-sm text-theme-primary/70 mt-1 italic border-l-2 border-theme-primary/20 pl-2">
                                      {dialogue.vietnamese}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all self-start relative z-20">
                                  <button
                                    onClick={() => startEditing(dialogue)}
                                    className="p-2 text-theme-primary/40 hover:text-theme-accent transition-all"
                                    title="Sửa câu"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {dialogue.explanation && (
                                    <button
                                      onClick={() => setExpandedExplanationId(expandedExplanationId === dialogue.id ? null : dialogue.id)}
                                      className={`p-2 transition-all ${expandedExplanationId === dialogue.id ? 'text-theme-accent' : 'text-theme-primary/40 hover:text-theme-accent'}`}
                                      title="Giải thích chi tiết"
                                    >
                                      <Info className="w-4 h-4" />
                                    </button>
                                  )}
                                  {deleteEnabled && (
                                    confirmingDeleteId === dialogue.id ? (
                                      <div className="flex flex-col gap-2 bg-red-500/10 p-1 rounded">
                                        <button
                                          onClick={() => handleRemoveDialogue(dialogue.id)}
                                          className="p-1.5 text-red-500 hover:text-red-400 bg-red-500/20 rounded transition-all"
                                          title="Xác nhận xóa"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setConfirmingDeleteId(null)}
                                          className="p-1.5 text-theme-primary/60 hover:text-theme-primary bg-theme-primary/10 rounded transition-all"
                                          title="Hủy"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmingDeleteId(dialogue.id)}
                                        className="p-2 text-theme-primary/40 hover:text-red-500 transition-all"
                                        title="Xóa câu"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                              
                              {/* Detailed Explanation Section */}
                              <AnimatePresence>
                                {expandedExplanationId === dialogue.id && dialogue.explanation && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 p-5 bg-theme-accent/5 border-l-4 border-theme-accent rounded-r-lg relative">
                                      <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Lightbulb className="w-12 h-12 text-theme-accent" />
                                      </div>
                                      <div className="flex items-center gap-2 mb-3 relative z-10">
                                        <Lightbulb className="w-4 h-4 text-theme-accent" />
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                                          Góc học tập
                                        </h4>
                                      </div>
                                      <div className="relative z-10 text-[15px] text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                                        {dialogue.explanation}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
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
      ) : viewMode === "review_vocab" ? (
        <div className="mb-8">
          <ConversationVocabReview conversation={conversation} mainDeck={mainDeck} onUpdate={onUpdate} onUpdateCard={onUpdateCard} onReviewCard={onReviewCard} />
        </div>
      ) : (
        <div className="mb-8">
          {conversation.dialogues.length > 0 ? (
            <div className="relative border border-theme-subtle bg-theme-panel p-8 min-h-[300px] flex flex-col justify-center rounded-xl shadow-lg">
              <div className="absolute top-4 left-4 text-theme-primary/30 font-serif text-xl">
                {String(currentSlideIndex + 1).padStart(2, "0")} / {String(conversation.dialogues.length).padStart(2, "0")}
              </div>
              <div className="space-y-6 max-w-2xl mx-auto w-full text-center mt-6">
                <p className="text-3xl md:text-4xl text-theme-primary font-serif leading-relaxed">
                  {renderExampleHighlight(conversation.dialogues[currentSlideIndex].japanese, "", mainDeck)}
                </p>
                {conversation.dialogues[currentSlideIndex].hiragana && (
                  <p className="text-xl text-theme-primary/80">
                    {conversation.dialogues[currentSlideIndex].hiragana}
                  </p>
                )}
                {conversation.dialogues[currentSlideIndex].romaji && (
                  <p className="text-lg text-theme-primary/50 font-mono tracking-wider">
                    {conversation.dialogues[currentSlideIndex].romaji}
                  </p>
                )}
                {conversation.dialogues[currentSlideIndex].vietnamese && (
                  <p className="text-xl text-theme-primary/70 italic mt-4">
                    {conversation.dialogues[currentSlideIndex].vietnamese}
                  </p>
                )}
              </div>
              
              {conversation.dialogues[currentSlideIndex].explanation && (
                <div className="mt-12 max-w-2xl mx-auto w-full">
                  <div className="p-6 bg-theme-accent/5 border-l-4 border-theme-accent rounded-r-lg relative text-left">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Lightbulb className="w-16 h-16 text-theme-accent" />
                    </div>
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                      <Lightbulb className="w-5 h-5 text-theme-accent" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-theme-accent">
                        Góc học tập
                      </h4>
                    </div>
                    <div className="relative z-10 text-base md:text-lg text-theme-primary/80 whitespace-pre-wrap leading-relaxed font-serif">
                      {conversation.dialogues[currentSlideIndex].explanation}
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                  className="p-3 bg-theme-panel border border-theme-subtle rounded-full text-theme-primary shadow-lg hover:text-theme-accent hover:border-theme-accent transition-all disabled:opacity-30 disabled:hover:text-theme-primary disabled:hover:border-theme-subtle"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => setCurrentSlideIndex(Math.min(conversation.dialogues.length - 1, currentSlideIndex + 1))}
                  disabled={currentSlideIndex === conversation.dialogues.length - 1}
                  className="p-3 bg-theme-panel border border-theme-subtle rounded-full text-theme-primary shadow-lg hover:text-theme-accent hover:border-theme-accent transition-all disabled:opacity-30 disabled:hover:text-theme-primary disabled:hover:border-theme-subtle"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-theme-primary/50 py-12 border border-theme-subtle border-dashed bg-theme-panel">
              Chưa có câu thoại nào. Hãy thêm câu mới!
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-theme-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddDialogue}
            className="bg-theme-panel p-6 border border-theme-subtle space-y-4 w-full max-w-lg shadow-2xl"
          >
            <h4 className="text-theme-accent uppercase tracking-wider text-xs font-medium mb-4">
              Thêm câu hội thoại
            </h4>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">
                Tiếng Nhật *
              </label>
              <input
                required
                type="text"
                value={newJp}
                onChange={(e) => setNewJp(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">
                Phiên âm Hiragana
              </label>
              <input
                type="text"
                value={newHira}
                onChange={(e) => setNewHira(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">
                Phiên âm Romaji
              </label>
              <input
                type="text"
                value={newRomaji}
                onChange={(e) => setNewRomaji(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">
                Nghĩa tiếng Việt
              </label>
              <input
                type="text"
                value={newVietnamese}
                onChange={(e) => setNewVietnamese(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">
                Giải thích chi tiết
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary placeholder-theme-primary/40 focus:outline-none focus:border-theme-accent transition-colors h-24 resize-none"
                placeholder="Giải thích chi tiết ngữ pháp, từ vựng..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={!newJp.trim()}
                className="bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-2 px-6 uppercase tracking-widest text-xs transition-all flex-1"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-theme-primary/60 hover:text-theme-primary px-4 py-2 uppercase tracking-wider text-xs transition-colors flex-1 border border-theme-subtle hover:border-theme-primary/30"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-theme-accent hover:text-theme-accent-hover uppercase tracking-widest text-xs font-bold transition-colors py-4 w-full justify-center border border-dashed border-theme-accent/50 hover:border-theme-accent bg-theme-accent/5"
        >
          <Plus className="w-4 h-4" />
          Thêm câu
        </button>
      )}
    </div>
  );
}

function getVocabForConversation(conversation: Conversation, mainDeck: KanjiCard[]): KanjiCard[] {
  const uniqueWords = new Map<string, KanjiCard>();
  const combinedText = conversation.dialogues.map(d => d.japanese).join(" ");
  
  mainDeck.forEach(card => {
    const wordStr = card.kanji || card.reading;
    if (!wordStr || wordStr.length === 0) return;
    
    let isMatch = combinedText.includes(wordStr);
    
    if (!isMatch && card.kanji) {
      const stem = card.kanji.replace(/[ぁ-ん]+$/, '');
      if (stem && stem !== card.kanji && /[\u4e00-\u9faf々]/.test(stem) && combinedText.includes(stem)) {
        isMatch = true;
      }
    }

    if (!isMatch && card.forms) {
      for (const form of card.forms) {
        if (form.value && combinedText.includes(form.value)) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      if (!uniqueWords.has(wordStr)) {
        uniqueWords.set(wordStr, card);
      }
    }
  });

  return Array.from(uniqueWords.values());
}

function ConversationVocabReview({
  conversation,
  mainDeck,
  onUpdate,
  onUpdateCard,
  onReviewCard
}: {
  conversation: Conversation;
  mainDeck: KanjiCard[];
  onUpdate: (id: string, updates: Partial<Conversation>) => void;
  onUpdateCard?: (id: string, updates: Partial<KanjiCard>) => void;
  onReviewCard?: (id: string, grade: 'forgot' | 'hard' | 'good' | 'easy') => void;
}) {
  const [vocab, setVocab] = useState<KanjiCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    let extracted = getVocabForConversation(conversation, mainDeck);
    
    const scores = conversation.vocabScores || {};
    
    extracted = extracted.sort(() => Math.random() - 0.5);
    extracted = extracted.sort((a, b) => {
      const scoreA = scores[a.id] || 0;
      const scoreB = scores[b.id] || 0;
      return scoreA - scoreB;
    });
    
    setVocab(extracted);
    setCurrentIndex(0);
    setIsFlipped(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  const handleScore = (change: number) => {
    const currentCard = vocab[currentIndex];
    const scores = { ...(conversation.vocabScores || {}) };
    scores[currentCard.id] = (scores[currentCard.id] || 0) + change;
    onUpdate(conversation.id, { vocabScores: scores });

    if (onReviewCard) {
      if (change > 0) {
        onReviewCard(currentCard.id, 'good');
      } else {
        onReviewCard(currentCard.id, 'forgot');
      }
    } else if (onUpdateCard) {
      if (change > 0) {
        // "Nhớ" - set interval to 2, repetition to 1 (makes status 'good' - green)
        onUpdateCard(currentCard.id, {
          interval: Math.max(currentCard.interval || 0, 2),
          repetition: Math.max(currentCard.repetition || 0, 1)
        });
      } else {
        // "Quên" - set interval to 0, repetition to 0 (makes status 'bad' - red)
        onUpdateCard(currentCard.id, {
          interval: 0,
          repetition: 0
        });
      }
    }
    
    if (currentIndex < vocab.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setCurrentIndex(vocab.length);
    }
  };

  if (vocab.length === 0) {
    return (
      <div className="text-center text-theme-primary/50 py-12 border border-theme-subtle border-dashed bg-theme-panel">
        Không có từ vựng nào trong hội thoại này được tìm thấy.
      </div>
    );
  }

  if (currentIndex >= vocab.length) {
    return (
      <div className="text-center py-20 bg-theme-panel border border-theme-subtle shadow-sm rounded-xl">
        <h3 className="text-2xl font-serif text-theme-accent mb-4 tracking-wide">Hoàn thành phiên ôn tập!</h3>
        <button
          onClick={() => {
            let extracted = [...vocab];
            const scores = conversation.vocabScores || {};
            extracted = extracted.sort(() => Math.random() - 0.5);
            extracted = extracted.sort((a, b) => {
              const scoreA = scores[a.id] || 0;
              const scoreB = scores[b.id] || 0;
              return scoreA - scoreB;
            });
            setVocab(extracted);
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className="bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted font-bold py-3 px-8 uppercase tracking-widest text-xs transition-all rounded shadow-md hover:shadow-lg"
        >
          Học lại
        </button>
      </div>
    );
  }

  const currentCard = vocab[currentIndex];

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col items-center pb-12 mt-6">
      <div className="text-theme-primary/40 text-[11px] uppercase tracking-[0.2em] font-medium mb-6">
        Từ vựng {currentIndex + 1} / {vocab.length}
      </div>
      
      <div 
        className="w-full aspect-[4/3] sm:aspect-[16/9] mb-10 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 bg-theme-panel border border-theme-subtle flex flex-col items-center justify-center p-8 shadow-2xl rounded-2xl group"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center gap-4">
              <h2 className="text-6xl md:text-8xl font-serif text-theme-primary text-center leading-tight">
                {currentCard.kanji || currentCard.reading}
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentCard.kanji || currentCard.reading) {
                    const utterance = new SpeechSynthesisUtterance(currentCard.kanji || currentCard.reading);
                    utterance.lang = 'ja-JP';
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                className="p-3 text-theme-primary/30 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Nghe phát âm"
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 bg-theme-panel border-2 border-theme-accent flex flex-col items-center justify-center p-10 shadow-2xl rounded-2xl text-center group"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
             <div className="flex items-center justify-center gap-3 mb-6">
               <div className="text-4xl md:text-5xl text-theme-primary font-serif text-theme-accent">
                  {currentCard.reading}
               </div>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   if (currentCard.reading || currentCard.kanji) {
                     const utterance = new SpeechSynthesisUtterance(currentCard.reading || currentCard.kanji!);
                     utterance.lang = 'ja-JP';
                     window.speechSynthesis.speak(utterance);
                   }
                 }}
                 className="p-2 text-theme-primary/30 hover:text-theme-accent hover:bg-theme-hover rounded-full transition-colors opacity-0 group-hover:opacity-100"
                 title="Nghe phát âm"
               >
                 <Volume2 className="w-6 h-6" />
               </button>
             </div>
             {currentCard.sinoVietnamese && (
                <div className="text-lg md:text-xl text-theme-accent/80 font-serif mb-2 uppercase tracking-widest">
                  {currentCard.sinoVietnamese}
                </div>
             )}
             {currentCard.romaji && (
                <div className="text-xl md:text-2xl text-theme-primary/50 font-mono mb-6 tracking-[0.2em] uppercase">
                  {currentCard.romaji}
                </div>
             )}
             <div className="text-2xl md:text-3xl text-theme-primary/90 font-medium mt-2">
                {currentCard.meaning}
             </div>
          </div>
        </motion.div>
      </div>

      <div className="h-16 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {isFlipped ? (
            <motion.div 
              key="buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-4 w-full h-full"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleScore(-1);
                }}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-4 px-6 uppercase tracking-widest text-sm transition-all rounded-xl hover:scale-105 active:scale-95 shadow-sm"
              >
                Quên
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleScore(1);
                }}
                className="flex-1 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted font-bold py-4 px-6 uppercase tracking-widest text-sm transition-all rounded-xl hover:scale-105 active:scale-95 shadow-md"
              >
                Nhớ
              </button>
            </motion.div>
          ) : (
             <motion.div 
               key="hint"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="text-theme-primary/40 text-xs uppercase tracking-widest text-center h-full flex items-center justify-center font-medium"
             >
               Chạm vào thẻ để lật
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
