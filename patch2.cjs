const fs = require('fs');
let code = fs.readFileSync('src/components/AddVocab.tsx', 'utf8');

const targetStr = `                        placeholder="Nghĩa (Tiếng Việt)"
                      />
                    </div>
                    <button`;

const replacementStr = `                        placeholder="Nghĩa (Tiếng Việt)"
                      />
                      <AudioUpload 
                        audioUrl={f.audioUrl} 
                        onAudioChange={(url) => {
                          const newForms = [...forms];
                          newForms[index].audioUrl = url;
                          newForms[index].hasAudio = !!url;
                          setForms(newForms);
                        }}
                      />
                    </div>
                    <button`;

code = code.replace(targetStr, replacementStr);

if (!code.includes("import AudioUpload")) {
  code = `import AudioUpload from './AudioUpload';\n` + code;
}

fs.writeFileSync('src/components/AddVocab.tsx', code);
