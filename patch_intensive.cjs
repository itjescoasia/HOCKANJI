const fs = require('fs');
let code = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

const searchStr = `}: IntensiveStudyProps) {
  const [viewState, setViewState] = useState<"list" | "add" | "study">("list");
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");`;

const replaceStr = `}: IntensiveStudyProps) {
  const [viewState, setViewState] = usePersistentState<"list" | "add" | "study">("app_intensive_viewState", "list");
  const [selectedWordId, setSelectedWordId] = usePersistentState<string | null>("app_intensive_selectedWordId", null);
  const [searchQuery, setSearchQuery] = usePersistentState("app_intensive_searchQuery", "");`;

if (code.includes(searchStr)) {
  code = "import { usePersistentState } from '../hooks/usePersistentState';\n" + code;
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/IntensiveStudy.tsx', code);
  console.log("Patched IntensiveStudy successfully.");
} else {
  console.log("String not found in IntensiveStudy");
}
