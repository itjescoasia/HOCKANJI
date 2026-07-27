const fs = require('fs');
let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');
let lines = content.split('\n');

const startIndex = lines.findIndex(line => line.includes('{filteredConversations.length === 0 ? ('));
const endIndex = lines.findIndex((line, i) => i > startIndex && line.includes('</DragDropContext>')) + 2;

console.log(startIndex, endIndex);

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex, `            {searchQuery.trim() !== "" && searchResults ? (
              searchResults.length === 0 ? (
                <div className="text-center py-20 bg-theme-panel border border-theme-subtle border-dashed">
                  <p className="text-theme-primary/50 text-sm uppercase tracking-wider">
                    Không tìm thấy kết quả nào cho "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs uppercase tracking-widest text-theme-primary/40 font-bold mb-2">Kết quả tìm kiếm ({searchResults.length})</h3>
                  {searchResults.map((result, idx) => (
                    <div 
                      key={idx}
                      className="bg-theme-panel border border-theme-subtle hover:border-theme-accent hover:shadow-lg p-4 transition-all duration-300 ease-out cursor-pointer group flex flex-col gap-2"
                      onClick={() => {
                        setSelectedConvId(result.conversation.id);
                        setViewState("detail");
                      }}
                    >
                      {result.type === 'conversation' ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-theme-base border border-theme-subtle px-2 py-0.5 rounded text-theme-primary/60 uppercase">Chủ đề</span>
                            <h4 className="font-serif text-lg text-theme-primary group-hover:text-theme-accent">{result.conversation.title}</h4>
                          </div>
                          {result.conversation.description && (
                            <p className="text-sm text-theme-primary/60 line-clamp-1">{result.conversation.description}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] bg-theme-accent/10 text-theme-accent border border-theme-accent/20 px-2 py-0.5 rounded uppercase font-bold">Câu ví dụ</span>
                            <span className="text-xs text-theme-primary/40 line-clamp-1">Trong: {result.conversation.title}</span>
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-theme-primary font-serif text-lg">{result.dialogue.japanese}</p>
                              <p className="text-theme-primary/60 text-sm mt-1">{result.dialogue.vietnamese}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const u = new SpeechSynthesisUtterance(result.dialogue.japanese);
                                u.lang = 'ja-JP';
                                window.speechSynthesis.speak(u);
                              }}
                              className="p-2 text-theme-primary/40 hover:text-theme-accent transition-colors shrink-0 bg-theme-base rounded-full"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : conversations.length === 0 ? (
              <div className="text-center py-20 bg-theme-panel border border-theme-subtle border-dashed">
                <p className="text-theme-primary/50 text-sm uppercase tracking-wider">
                  Chưa có chủ đề hội thoại nào.
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleConvDragEnd}>
                <Droppable droppableId="conversation-list" direction="vertical">
                  {(provided) => (
                    <div 
                      className="flex flex-col gap-4 relative"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <AnimatePresence>
                        {conversations.map((conv, index) => (
                          <Draggable key={conv.id} draggableId={conv.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  ...(snapshot.isDragging ? { zIndex: 50, scale: 1.05, opacity: 0.9 } : {})
                                }}
                                className="h-full"
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="group bg-theme-panel border border-theme-subtle hover:border-theme-accent hover:shadow-xl hover:-translate-y-1 hover:shadow-theme-accent/10 p-6 transition-all duration-300 ease-out cursor-pointer relative flex flex-col h-full overflow-hidden"
                                  onClick={() => {
                                    setSelectedConvId(conv.id);
                                    setViewState("detail");
                                  }}
                                >
                                  {/* Beautiful background accent */}
                                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-theme-accent/5 rounded-full blur-2xl group-hover:bg-theme-accent/10 transition-colors duration-500 pointer-events-none"></div>
                                  <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
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
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}`);
  
  fs.writeFileSync('src/components/ConversationView.tsx', lines.join('\n'));
} else {
  console.log("Could not find blocks");
}
