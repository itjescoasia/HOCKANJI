const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

file = file.replace(
  /BẮT BUỘC TẠO ÍT NHẤT 1 VÍ DỤ CHO TỪ GỐC\.\s*\/\/\s*NẾU LÀ ĐỘNG TỪ VÀ CÓ CÁC THỂ Ở TRÊN, HÃY TẠO THÊM ÍT NHẤT 1 VÍ DỤ CHO MỖI THỂ ĐÓ\./g,
  'BẮT BUỘC TẠO TỪ 3 ĐẾN 5 VÍ DỤ ĐA DẠNG CHO TỪ VỰNG NÀY (Bao gồm từ gốc và một số thể thường gặp).'
);

fs.writeFileSync('server.ts', file);
