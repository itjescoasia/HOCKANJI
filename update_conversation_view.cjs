const fs = require('fs');

let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const detailPattern = /function ConversationDetail\(/;
const match = content.match(detailPattern);
if (!match) {
  console.log("Could not find ConversationDetail");
  process.exit(1);
}

const addIndex = content.indexOf('if (viewState === "add") {');

const beforeAdd = content.substring(0, addIndex);
const componentEnd = content.substring(addIndex, match.index);
const afterComponent = content.substring(match.index);

const newRender = `
  return (
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
          <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4 w-full">
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
                  disabled={!String(newTitle || "").trim()}
                  className="mt-4 bg-theme-accent hover:bg-theme-accent-hover disabled:bg-theme-active disabled:text-theme-primary/40 text-theme-inverted font-bold py-3 px-6 uppercase tracking-widest text-sm transition-all text-center"
                >
                  Tạo chủ đề
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {viewState === "detail" && selectedConv && (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <ConversationDetail
            conversation={selectedConv}
            onBack={() => {
              setViewState("list");
              setSelectedConvId(null);
            }}
            onUpdate={(id, updates) => onUpdateConversation(id, updates)}
            onUpdateCard={onUpdateCard}
            onReviewCard={onReviewCard}
            onRecordReview={onRecordReview}
            mainDeck={mainDeck}
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
                  Hội Thoại
                </h2>
                <span className="text-theme-primary opacity-50 text-[10px] uppercase tracking-widest">
                  {conversations.length} chủ đề hội thoại
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDeleteUnlocked(!isDeleteUnlocked)}
                  className={\`flex items-center justify-center p-2.5 transition-colors border \${
                    isDeleteUnlocked 
                      ? "bg-red-500/10 border-red-500/50 text-red-500" 
                      : "bg-theme-panel border-theme-subtle text-theme-primary/40 hover:text-theme-accent hover:border-theme-accent"
                  }\`}
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
                      className="group bg-theme-panel border border-theme-subtle p-6 hover:border-theme-accent transition-all cursor-pointer relative"
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        setViewState("detail");
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="font-serif text-xl text-theme-primary group-hover:text-theme-accent transition-colors">
                          {conv.title}
                        </h3>
                        <div className="text-xs text-theme-primary/40 font-mono tracking-wider shrink-0 mt-1">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {conv.description && (
                        <p className="text-theme-primary/60 text-sm mb-6 line-clamp-2">
                          {conv.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold uppercase tracking-widest text-theme-primary/40 group-hover:text-theme-accent/60 transition-colors">
                          {conv.dialogues.length} CÂU
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {isDeleteUnlocked && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Bạn có chắc chắn muốn xóa chủ đề này không? Toàn bộ các câu hội thoại bên trong sẽ bị mất.")) {
                                  onRemoveConversation(conv.id);
                                }
                              }}
                              className="p-2 text-theme-primary/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Xóa chủ đề"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <ArrowRight className="w-5 h-5 text-theme-primary/20 group-hover:text-theme-accent transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

`

const newContent = beforeAdd + newRender + "\n\n" + afterComponent;

fs.writeFileSync('src/components/ConversationView.tsx', newContent);
console.log("Updated ConversationView.tsx successfully.");

