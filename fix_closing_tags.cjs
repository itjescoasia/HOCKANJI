const fs = require('fs');
let content = fs.readFileSync('src/components/IntensiveStudy.tsx', 'utf8');
content = content.replace("                              </motion.div>\n                            )}\n                          </Draggable>", "                              </motion.div>\n                              </div>\n                            )}\n                          </Draggable>");
fs.writeFileSync('src/components/IntensiveStudy.tsx', content);
