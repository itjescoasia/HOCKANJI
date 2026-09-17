const fs = require('fs');
let code = fs.readFileSync('src/components/VocabList.tsx', 'utf8');

const searchStr = `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', initialEditId = null, editCardReq = null, viewCardReq = null }: VocabListProps) {
  const [search, setSearch] = useState(initialSearchQuery);
  const [filterType, setFilterType] = useState('all');
  const [audioFilter, setAudioFilter] = useState<'all' | 'has_audio' | 'no_audio'>('all');
  const [currentPage, setCurrentPage] = useState(1);`;

const replaceStr = `export default function VocabList({ deck, onRemove, onUpdate, onImport, initialSearchQuery = '', initialEditId = null, editCardReq = null, viewCardReq = null }: VocabListProps) {
  const [search, setSearch] = usePersistentState('app_vocablist_search', initialSearchQuery);
  const [filterType, setFilterType] = usePersistentState('app_vocablist_filterType', 'all');
  const [audioFilter, setAudioFilter] = usePersistentState<'all' | 'has_audio' | 'no_audio'>('app_vocablist_audioFilter', 'all');
  const [currentPage, setCurrentPage] = usePersistentState('app_vocablist_currentPage', 1);`;

if (code.includes(searchStr)) {
  code = "import { usePersistentState } from '../hooks/usePersistentState';\n" + code;
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/VocabList.tsx', code);
  console.log("Patched VocabList successfully.");
} else {
  console.log("String not found in VocabList");
}
