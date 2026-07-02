import React, { useState } from "react";
import { Conversation, DialogueSentence, KanjiCard } from "../types";
import { PlusCircle, Search, Trash2, ArrowLeft, Plus, Edit2, Check, X, Info, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Fuse from "fuse.js";
import { formatCreatedAt } from "../lib/dateUtils";
import { renderExampleHighlight } from "../utils/highlight";

interface ConversationViewProps {
  conversations: Conversation[];
  onAddConversation: (conversation: Conversation) => void;
  onRemoveConversation: (id: string) => void;
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
  mainDeck: KanjiCard[];
}

export default function ConversationView({
  conversations,
  onAddConversation,
  onRemoveConversation,
  onUpdateConversation,
  mainDeck,
}: ConversationViewProps) {
  const [viewState, setViewState] = useState<"list" | "add" | "detail">("list");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
                className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent font-serif text-xl transition-colors placeholder:text-theme-inverted"
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
                className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-inverted h-24 resize-none"
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
        <button
          onClick={() => setViewState("add")}
          className="flex items-center gap-2 bg-theme-accent hover:bg-theme-accent-hover text-theme-inverted px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Thêm chủ đề
        </button>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) {
                        onRemoveConversation(conv.id);
                      }
                    }}
                    className="p-1.5 text-theme-primary/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
  mainDeck,
}: {
  conversation: Conversation;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Conversation>) => void;
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
    if (!confirm("Bạn có muốn xóa câu này không?")) return;
    onUpdate(conversation.id, {
      dialogues: conversation.dialogues.filter((d) => d.id !== id),
    });
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

      <div className="bg-theme-panel border-b-2 border-theme-accent p-8 mb-6">
        <h1 className="text-2xl font-serif text-theme-primary mb-2">
          {conversation.title}
        </h1>
        {conversation.description && (
          <p className="text-theme-primary/70 text-sm italic">
            {conversation.description}
          </p>
        )}
      </div>

      <div className="space-y-4 mb-8">
        {conversation.dialogues.map((dialogue, index) => {
          if (editingId === dialogue.id) {
            return (
              <div key={dialogue.id} className="p-6 bg-theme-panel border border-theme-accent">
                <form onSubmit={handleUpdateDialogue} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-theme-accent text-xs font-bold uppercase tracking-widest">Sửa câu {index + 1}</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Tiếng Nhật *</label>
                    <input required type="text" value={editJp} onChange={(e) => setEditJp(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Phiên âm Hiragana</label>
                      <input type="text" value={editHira} onChange={(e) => setEditHira(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Phiên âm Romaji</label>
                      <input type="text" value={editRomaji} onChange={(e) => setEditRomaji(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Nghĩa tiếng Việt</label>
                    <input type="text" value={editVietnamese} onChange={(e) => setEditVietnamese(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">Giải thích chi tiết</label>
                    <textarea value={editExplanation} onChange={(e) => setEditExplanation(e.target.value)} className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors h-24 resize-none" placeholder="Giải thích chi tiết ngữ pháp, từ vựng..." />
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
              </div>
            );
          }
          
          return (
            <div
              key={dialogue.id}
              className="p-4 bg-theme-panel border border-theme-subtle flex gap-4 group flex-col"
            >
              <div className="flex gap-4">
                <div className="shrink-0 text-theme-primary/30 font-serif text-xl mt-1">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-lg text-theme-primary font-serif">
                    {renderExampleHighlight(dialogue.japanese, "", mainDeck)}
                  </p>
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
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all self-start">
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
                  <button
                    onClick={() => handleRemoveDialogue(dialogue.id)}
                    className="p-2 text-theme-primary/40 hover:text-red-500 transition-all"
                    title="Xóa câu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                    <div className="mt-4 ml-14 p-5 bg-theme-accent/5 border-l-4 border-theme-accent rounded-r-lg relative">
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
          );
        })}
      </div>

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
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
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
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
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
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
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
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-theme-primary/60 font-medium">
                Giải thích chi tiết
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full bg-theme-base border border-theme-subtle px-4 py-2 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors h-24 resize-none"
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
