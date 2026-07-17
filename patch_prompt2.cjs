const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

file = file.replace(
  '// Động từ gồm: "Thể từ điển (ngắn)", "Thể lịch sự (ます)", "Thể て", "Thể quá khứ ngắn (た)", "Thể quá khứ lịch sự (ました)", "Thể phủ định ngắn (ない)", "Thể phủ định lịch sự (ません)", "Thể điều kiện (ば/たら)", "Thể sai khiến", "Thể bị động", "Thể mệnh lệnh", "Thể khả năng", "Thể ý chí".',
  '// Động từ gồm: "Thể từ điển (ngắn)", "Thể lịch sự (ます)", "Thể て", "Thể quá khứ ngắn (た)", "Thể quá khứ lịch sự (ました)", "Thể phủ định ngắn (ない)", "Thể phủ định lịch sự (ません)", "Thể điều kiện (ば/たら)", "Thể sai khiến", "Thể bị động", "Thể mệnh lệnh", "Thể khả năng", "Thể ý chí (ngắn - よう)", "Thể ý chí lịch sự (ましょう)".'
);

fs.writeFileSync('server.ts', file);
