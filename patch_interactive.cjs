const fs = require('fs');
let content = fs.readFileSync('src/utils/highlight.tsx', 'utf8');

// Add setLocked to useContext
content = content.replace(
  `const { setHoveredCard, onEditCard } = useContext(HighlightContext);`,
  `const { setHoveredCard, onEditCard, isLocked, setLocked } = useContext(HighlightContext);`
);

// We should update the effect that closes the popup, but wait, it's better to react to isOpen changing:
// If we just add an effect on isOpen:
const effectCode = `  useEffect(() => {
    if (isOpen && card) {
      setLocked(true);
      setHoveredCard({ card, index: occurrenceIndex, matchedForm }, true);
    } else if (!isOpen && card) {
      // We only unlock if we are the one locking. But how do we know?
      // Actually, just setLocked(false). 
      // If another word is clicked, its onClick will fire.
      // mousedown on outside happens before the other word's onClick.
      // So setLocked(false) and then the other word's onClick sets isOpen=true and locks.
      setLocked(false);
      // We might want to setHoveredCard(null, true) when closed, to clear the lock.
      // But let's just unlock and let mouse leave handle clearing it if needed, or clear it.
      setHoveredCard(null, true);
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside =`;

content = content.replace(
  `  useEffect(() => {
    const handleClickOutside =`,
  effectCode
);

fs.writeFileSync('src/utils/highlight.tsx', content);
