const fs = require('fs');
let code = fs.readFileSync('src/hooks/useStudyStats.ts', 'utf8');

code = code.replace(/import \{ useState, useEffect \} from "react";/, 'import { useState, useEffect, useCallback } from "react";');

code = code.replace(/const recordReview = async \(/, 'const recordReview = useCallback(async (');
code = code.replace(/      return newStats;\n    \}\);\n  \};/, '      return newStats;\n    });\n  }, []);');

code = code.replace(/const recordFreeStudyTime = async \(seconds: number\) => \{/, 'const recordFreeStudyTime = useCallback(async (seconds: number) => {');
code = code.replace(/      return newStats;\n    \}\);\n  \};\n\n  const recordWordOfTheDay/, '      return newStats;\n    });\n  }, []);\n\n  const recordWordOfTheDay');

code = code.replace(/const recordWordOfTheDay = async \(wotdId: string\) => \{/, 'const recordWordOfTheDay = useCallback(async (wotdId: string) => {');
code = code.replace(/      return newStats;\n    \}\);\n  \};\n\n  return \{/, '      return newStats;\n    });\n  }, []);\n\n  return {');

fs.writeFileSync('src/hooks/useStudyStats.ts', code);
