const text = "Tôi thường làm việc lúc 8 giờ.";
const match = "làm";
// we want to extract the matching word, but what about Vietnamese verbs that have modifiers? 
// Vietnamese doesn't conjugate words! "làm" is just "làm". 
// But what if it's "chuẩn bị" -> prefix "chuẩn", full text "chuẩn bị"? 
// We already have `HighlightVietnamese` matching the full sequence of words. 
