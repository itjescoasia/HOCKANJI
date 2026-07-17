const fs = require('fs');
let file = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');

file = file.replace(
`            const isMatch = item.word.toLowerCase().includes(lowerQ) ||
                            (item.reading && item.reading.toLowerCase().includes(lowerQ)) ||
                            (item.romaji && item.romaji.toLowerCase().includes(lowerQ)) ||
                            item.examples.some(ex => 
                                ex.sentence.toLowerCase().includes(lowerQ) ||
                                (ex.reading && ex.reading.toLowerCase().includes(lowerQ)) ||
                                (ex.translation && ex.translation.toLowerCase().includes(lowerQ))
                            );`,
`            const isMatch = (item.word && item.word.toLowerCase().includes(lowerQ)) ||
                            (item.reading && item.reading.toLowerCase().includes(lowerQ)) ||
                            (item.romaji && item.romaji.toLowerCase().includes(lowerQ)) ||
                            (item.examples || []).some(ex => 
                                (ex.sentence && ex.sentence.toLowerCase().includes(lowerQ)) ||
                                (ex.reading && ex.reading.toLowerCase().includes(lowerQ)) ||
                                (ex.translation && ex.translation.toLowerCase().includes(lowerQ))
                            );`);

file = file.replace(
`               const isMatch = item.word.toLowerCase().includes(lowerAltQ) ||
                               (item.reading && item.reading.toLowerCase().includes(lowerAltQ));`,
`               const isMatch = (item.word && item.word.toLowerCase().includes(lowerAltQ)) ||
                               (item.reading && item.reading.toLowerCase().includes(lowerAltQ));`);

file = file.replace(
`                const matchedExample = word.examples.find(
                  (ex) =>
                    ex.sentence.toLowerCase().includes(query) ||
                    (ex.translation &&
                      ex.translation.toLowerCase().includes(query)) ||
                    (ex.reading && ex.reading.toLowerCase().includes(query))
                ) || word.examples[0];`,
`                const matchedExample = (word.examples || []).find(
                  (ex) =>
                    (ex.sentence && ex.sentence.toLowerCase().includes(query)) ||
                    (ex.translation &&
                      ex.translation.toLowerCase().includes(query)) ||
                    (ex.reading && ex.reading.toLowerCase().includes(query))
                ) || (word.examples || [])[0];`);

fs.writeFileSync('src/components/IntensiveStudy.tsx', file);
