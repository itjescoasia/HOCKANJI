const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

file = file.replace(
`    // NẾU TỪ LÀ ĐỘNG TỪ, BẮT BUỘC TRẢ VỀ CÁC THỂ: "Thể từ điển (る)", "Thể lịch sự (ます)", "Thể て", "Thể quá khứ (た)", "Thể phủ định (ない)", "Thể điều kiện (ば)", "Thể sai khiến", "Thể bị động", "Thể mệnh lệnh", "Thể khả năng", "Thể ý chí (よう)".
    // NẾU TỪ LÀ TÍNH TỪ HOẶC DANH TỪ, CÓ THỂ ĐỂ TRỐNG HOẶC TRẢ VỀ CÁC THỂ PHỦ ĐỊNH, QUÁ KHỨ.`,
`    // BẮT BUỘC TRẢ VỀ ĐẦY ĐỦ CÁC THỂ LỊCH SỰ VÀ THỂ NGẮN đối với Danh từ, Tính từ (đuôi-i, đuôi-na) và Động từ (nhóm I, II, III).
    // Động từ gồm: "Thể từ điển (ngắn)", "Thể lịch sự (ます)", "Thể て", "Thể quá khứ ngắn (た)", "Thể quá khứ lịch sự (ました)", "Thể phủ định ngắn (ない)", "Thể phủ định lịch sự (ません)", "Thể điều kiện (ば/たら)", "Thể sai khiến", "Thể bị động", "Thể mệnh lệnh", "Thể khả năng", "Thể ý chí".
    // Danh từ/Tính từ gồm: "Hiện tại khẳng định (lịch sự)", "Hiện tại phủ định (lịch sự)", "Quá khứ khẳng định (lịch sự)", "Quá khứ phủ định (lịch sự)", "Hiện tại khẳng định (ngắn)", "Hiện tại phủ định (ngắn)", "Quá khứ khẳng định (ngắn)", "Quá khứ phủ định (ngắn)".`);

fs.writeFileSync('server.ts', file);
