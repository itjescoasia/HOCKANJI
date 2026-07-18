const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const target = 'Vui lòng trả về thông tin dưới dạng JSON hợp lệ, tuân thủ đúng cấu trúc sau:';
const replacement = 'TUYỆT ĐỐI KHÔNG sử dụng Markdown (như **in đậm**, *in nghiêng*, ### tiêu đề, v.v.) trong bất kỳ giá trị nào. Chỉ sử dụng văn bản thuần túy.\n\nVui lòng trả về thông tin dưới dạng JSON hợp lệ, tuân thủ đúng cấu trúc sau:';

if (file.includes(target)) {
  file = file.replace(target, replacement);
  fs.writeFileSync('server.ts', file);
  console.log('Patched successfully');
} else {
  console.log('Not found');
}
