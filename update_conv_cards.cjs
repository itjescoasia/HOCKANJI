const fs = require('fs');

let content = fs.readFileSync('src/components/ConversationView.tsx', 'utf8');

const oldCardPattern = /<motion\.div\s*key=\{conv\.id\}\s*initial=\{\{ opacity: 0, y: 10 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.95 \}\}\s*className="group bg-theme-panel border border-theme-subtle p-6 hover:border-theme-accent transition-all cursor-pointer relative"/;

const newCard = `<motion.div
                      key={conv.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-theme-panel border border-theme-subtle hover:border-theme-accent hover:shadow-xl hover:-translate-y-1 hover:shadow-theme-accent/10 p-6 transition-all duration-300 ease-out cursor-pointer relative flex flex-col h-full overflow-hidden"`;

content = content.replace(oldCardPattern, newCard);

// Also we need to add the beautiful background accent div right inside the card.
const oldContentStart = `<div className="flex items-start justify-between gap-4 mb-4">`;
const newContentStart = `{/* Beautiful background accent */}
                      <div className="absolute -right-12 -top-12 w-32 h-32 bg-theme-accent/5 rounded-full blur-2xl group-hover:bg-theme-accent/10 transition-colors duration-500 pointer-events-none"></div>
                      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">`;

content = content.replace(oldContentStart, newContentStart);

fs.writeFileSync('src/components/ConversationView.tsx', content);
