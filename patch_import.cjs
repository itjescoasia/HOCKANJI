const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

// Add import
if (!code.includes('import { doc, setDoc } from "firebase/firestore"')) {
  code = code.replace(
    "import { Eye, Trash2, Search, Upload, Download, Edit2, Check, X, Plus, Volume2 } from 'lucide-react';",
    "import { Eye, Trash2, Search, Upload, Download, Edit2, Check, X, Plus, Volume2 } from 'lucide-react';\nimport { doc, setDoc } from 'firebase/firestore';\nimport { db, auth } from '../lib/firebase';"
  );
}

const targetLogic = `          // Bỏ qua onUpdate thông thường để force ghi trực tiếp lên Firebase cho chắc chắn
          try {
             const { doc, setDoc } = require('firebase/firestore');
             const { db, auth } = require('../lib/firebase');`;

const newLogic = `          // Bỏ qua onUpdate thông thường để force ghi trực tiếp lên Firebase cho chắc chắn
          try {`;

code = code.replace(targetLogic, newLogic);
fs.writeFileSync('src/components/VocabList.tsx', code);
