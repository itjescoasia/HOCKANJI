const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldNav = `  const handleNavigate = (newView: string) => {
    // The active time saving is handled by the unmount effect of the tracker above
    if (isFreeStudyMode || isDifficultReviewMode) {
      setIsFreeStudyMode(false);
      setIsDifficultReviewMode(false);
    }
    setView(newView);
    if (newView !== 'list') {
      setListSearchQuery('');
    }
  };`;

const newNav = `  const handleNavigate = (newView: string) => {
    // The active time saving is handled by the unmount effect of the tracker above
    if (isFreeStudyMode || isDifficultReviewMode) {
      setIsFreeStudyMode(false);
      setIsDifficultReviewMode(false);
    }
    setIsSentenceReviewOpen(false);
    setView(newView);
    if (newView !== 'list') {
      setListSearchQuery('');
    }
  };`;

content = content.replace(oldNav, newNav);
fs.writeFileSync('src/App.tsx', content);
console.log("Patched nav");
