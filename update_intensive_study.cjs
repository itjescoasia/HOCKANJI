const fs = require('fs');

let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const detailPattern = /function StudyView\(/;
const match = content.match(detailPattern);
if (!match) {
  console.log("Could not find StudyView");
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
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
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
                      value={newReading}
                      onChange={(e) => setNewReading(e.target.value)}
                      className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
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
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40"
                    placeholder="Ví dụ: Kinh tế, IT..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-theme-primary/60 font-medium">
                    Giải thích chi tiết
                  </label>
                  <textarea
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    className="w-full bg-theme-base border border-theme-subtle px-4 py-3 text-theme-primary focus:outline-none focus:border-theme-accent transition-colors placeholder:text-theme-primary/40 min-h-[120px] resize-y"
                    placeholder="Viết ghi chú, giải nghĩa, điểm ngữ pháp cần nhớ..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={!String(newWord || "").trim()}
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
            word={selectedWord}
            onBack={() => {
              setViewState("list");
              setSelectedWordId(null);
            }}
            onUpdate={(id, updates) => onUpdateWord(id, updates)}
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
                  Chuyên Đề Học Sâu
                </h2>
                <span className="text-theme-primary opacity-50 text-[10px] uppercase tracking-widest">
                  {deck.length} chuyên đề • {deck.reduce((sum, w) => sum + w.examples.length, 0)} mẫu câu
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
                placeholder="Tìm kiếm chuyên đề, từ vựng..."
              />
            </div>

            {filteredDeck.length === 0 ? (
              <div className="text-center py-20 bg-theme-panel border border-theme-subtle border-dashed">
                <p className="text-theme-primary/50 text-sm uppercase tracking-wider">
                  {searchQuery ? "Không tìm thấy kết quả nào." : "Chưa có chuyên đề nào."}
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="intensive-deck">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <AnimatePresence>
                        {filteredDeck.map((word, index) => (
                          <Draggable
                            key={word.id}
                            draggableId={word.id}
                            index={index}
                            isDragDisabled={!!searchQuery.trim()}
                          >
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={\`group bg-theme-panel border \${snapshot.isDragging ? 'border-theme-accent shadow-lg z-50' : 'border-theme-subtle hover:border-theme-accent'} p-6 transition-all cursor-pointer relative\`}
                                onClick={() => {
                                  setSelectedWordId(word.id);
                                  setViewState("study");
                                }}
                              >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    {!searchQuery.trim() && (
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
                                  {word.category && (
                                    <span className="text-[10px] font-bold text-theme-accent/80 bg-theme-accent/5 px-2 py-1 rounded-sm uppercase tracking-wider border border-theme-accent/10 whitespace-nowrap">
                                      {word.category}
                                    </span>
                                  )}
                                </div>
                                
                                {word.reading && (
                                  <div className="text-theme-primary/60 text-sm mb-4">
                                    {word.reading} {word.romaji ? \`(\${word.romaji})\` : ""}
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-6">
                                  <span className="text-xs font-bold uppercase tracking-widest text-theme-primary/40 group-hover:text-theme-accent/60 transition-colors flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    {word.examples.length} MẪU CÂU
                                  </span>
                                  
                                  <div className="flex items-center gap-2">
                                    {isDeleteUnlocked && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm("Bạn có chắc chắn muốn xóa chuyên đề này không? Toàn bộ mẫu câu bên trong sẽ bị mất.")) {
                                            onRemoveWord(word.id);
                                          }
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
                            )}
                          </Draggable>
                        ))}
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
  );
}

`

const newContent = beforeAdd + newRender + "\n\n" + afterComponent;

if (!newContent.includes("ArrowRight")) {
    console.log("No arrow right? it's in the text.");
}

fs.writeFileSync('src/components/IntensiveStudy.tsx', newContent);
console.log("Updated IntensiveStudy.tsx successfully.");

