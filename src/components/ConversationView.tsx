import React, { useState } from "react";
import { Conversation, DialogueSentence } from "../types";
import { PlusCircle, Search, Trash2, ArrowLeft, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Fuse from "fuse.js";
import { formatCreatedAt } from "../lib/dateUtils";

interface ConversationViewProps {
  conversations: Conversation[];
  onAddConversation: (conversation: Conversation) => void;
  onRemoveConversation: (id: string) => void;
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
}

export default function ConversationView({
  conversations,
  onAddConversation,
  onRemoveConversation,
  onUpdateConversation,
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
}: {
  conversation: Conversation;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Conversation>) => void;
}) {
  const [newJp, setNewJp] = useState("");
  const [newHira, setNewHira] = useState("");
  const [newRomaji, setNewRomaji] = useState("");
  const [newVietnamese, setNewVietnamese] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDialogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJp.trim()) return;

    const newDialogue: DialogueSentence = {
      id: crypto.randomUUID(),
      japanese: newJp.trim(),
      hiragana: newHira.trim(),
      romaji: newRomaji.trim(),
      vietnamese: newVietnamese.trim(),
    };

    onUpdate(conversation.id, {
      dialogues: [...conversation.dialogues, newDialogue],
    });

    setNewJp("");
    setNewHira("");
    setNewRomaji("");
    setNewVietnamese("");
    setIsAdding(true); // keep it open
  };

  const handleRemoveDialogue = (id: string) => {
    if (!confirm("Bạn có muốn xóa câu này không?")) return;
    onUpdate(conversation.id, {
      dialogues: conversation.dialogues.filter((d) => d.id !== id),
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
        {conversation.dialogues.map((dialogue, index) => (
          <div
            key={dialogue.id}
            className="p-4 bg-theme-panel border border-theme-subtle flex gap-4 group"
          >
            <div className="shrink-0 text-theme-primary/30 font-serif text-xl">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-lg text-theme-primary font-serif">
                {dialogue.japanese}
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
                <p className="text-sm text-theme-primary/70 mt-1 italic">
                  {dialogue.vietnamese}
                </p>
              )}
            </div>
            <button
              onClick={() => handleRemoveDialogue(dialogue.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-theme-primary/40 hover:text-red-500 transition-all self-start"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form
          onSubmit={handleAddDialogue}
          className="bg-theme-panel p-6 border border-theme-subtle space-y-4"
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
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!newJp.trim()}
              className="bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-2 px-6 uppercase tracking-widest text-xs transition-all"
            >
              Thêm
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-theme-primary/60 hover:text-theme-primary px-4 py-2 uppercase tracking-wider text-xs transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-theme-accent hover:text-theme-accent-hover uppercase tracking-widest text-xs font-bold transition-colors py-4 w-full justify-center border border-dashed border-theme-accent/50 hover:border-theme-accent bg-theme-accent/5"
        >
          <Plus className="w-4 h-4" />
          Thêm câu thoại mới
        </button>
      )}
    </div>
  );
}
