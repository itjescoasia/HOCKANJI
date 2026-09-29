import { QuizQuestion, QuizVocabItem } from '../types';

// ==========================================
// KHO DỮ LIỆU N4 ĐỂ SINH HÀNG NGHÌN CÂU HỎI
// ==========================================

export interface N4VerbEntry {
  kanji: string;
  reading: string;
  romaji: string;
  group: 1 | 2 | 3;
  meaning: string;
  // Forms
  masu: string;
  potential: string;      // Thể khả năng
  volitional: string;     // Thể ý chí
  passive: string;        // Thể bị động
  causative: string;      // Thể sai khiến
  conditional: string;    // Thể điều kiện (ば)
  imperative: string;     // Thể mệnh lệnh
  prohibitive: string;    // Thể cấm chỉ
  te: string;
  ta: string;
  nai: string;
}

export const n4Verbs: N4VerbEntry[] = [
  // Nhóm 1
  {
    kanji: '書く', reading: 'かく', romaji: 'kaku', group: 1, meaning: 'viết',
    masu: '書きます', potential: '書けます', volitional: '書こう', passive: '書かれます',
    causative: '書かせます', conditional: '書けば', imperative: '書け', prohibitive: '書くな',
    te: '書いて', ta: '書いた', nai: '書かない'
  },
  {
    kanji: '読む', reading: 'よむ', romaji: 'yomu', group: 1, meaning: 'đọc',
    masu: '読みます', potential: '読めます', volitional: '読もう', passive: '読まれます',
    causative: '読ませます', conditional: '読めば', imperative: '読め', prohibitive: '読むな',
    te: '読んで', ta: '読んだ', nai: '読まない'
  },
  {
    kanji: '話す', reading: 'はなす', romaji: 'hanasu', group: 1, meaning: 'nói chuyện',
    masu: '話します', potential: '話せます', volitional: '話そう', passive: '話されます',
    causative: '話させます', conditional: '話せば', imperative: '話せ', prohibitive: '話すな',
    te: '話して', ta: '話した', nai: '話さない'
  },
  {
    kanji: '聞く', reading: 'きく', romaji: 'kiku', group: 1, meaning: 'nghe, hỏi',
    masu: '聞きます', potential: '聞けます', volitional: '聞こう', passive: '聞かれます',
    causative: '聞かせます', conditional: '聞けば', imperative: '聞け', prohibitive: '聞くな',
    te: '聞いて', ta: '聞いた', nai: '聞かない'
  },
  {
    kanji: '泳ぐ', reading: 'およぐ', romaji: 'oyogu', group: 1, meaning: 'bơi lội',
    masu: '泳ぎます', potential: '泳げます', volitional: '泳ごう', passive: '泳がれます',
    causative: '泳がせます', conditional: '泳げば', imperative: '泳げ', prohibitive: '泳ぐな',
    te: '泳いで', ta: '泳いだ', nai: '泳がない'
  },
  {
    kanji: '行く', reading: 'いく', romaji: 'iku', group: 1, meaning: 'đi',
    masu: '行きます', potential: '行けます', volitional: '行こう', passive: '行かれます',
    causative: '行かせます', conditional: '行けば', imperative: '行け', prohibitive: '行くな',
    te: '行って', ta: '行った', nai: '行かない'
  },
  {
    kanji: '買う', reading: 'かう', romaji: 'kau', group: 1, meaning: 'mua',
    masu: '買います', potential: '買えます', volitional: '買おう', passive: '買われます',
    causative: '買わせます', conditional: '買えば', imperative: '買え', prohibitive: '買うな',
    te: '買って', ta: '買った', nai: '買わない'
  },
  {
    kanji: '待つ', reading: 'まつ', romaji: 'matsu', group: 1, meaning: 'chờ đợi',
    masu: '待ちます', potential: '待てます', volitional: '待とう', passive: '待たれます',
    causative: '待たせます', conditional: '待てば', imperative: '待て', prohibitive: '待つな',
    te: '待って', ta: '待った', nai: '待たない'
  },
  {
    kanji: '持つ', reading: 'もつ', romaji: 'motsu', group: 1, meaning: 'cầm, nắm, sở hữu',
    masu: '持ちます', potential: '持てます', volitional: '持とう', passive: '持たれます',
    causative: '持たせます', conditional: '持てば', imperative: '持て', prohibitive: '持つな',
    te: '持って', ta: '持った', nai: '持たない'
  },
  {
    kanji: '呼ぶ', reading: 'よぶ', romaji: 'yobu', group: 1, meaning: 'gọi, mời',
    masu: '呼びます', potential: '呼べます', volitional: '呼ぼう', passive: '呼ばれます',
    causative: '呼ばせます', conditional: '呼べば', imperative: '呼べ', prohibitive: '呼ぶな',
    te: '呼んで', ta: '呼んだ', nai: '呼ばない'
  },
  {
    kanji: '遊ぶ', reading: 'あそぶ', romaji: 'asobu', group: 1, meaning: 'chơi',
    masu: '遊びます', potential: '遊べます', volitional: '遊ぼう', passive: '遊ばれます',
    causative: '遊ばせます', conditional: '遊べば', imperative: '遊べ', prohibitive: '遊ぶな',
    te: '遊んで', ta: '遊んだ', nai: '遊ばない'
  },
  {
    kanji: '休む', reading: 'やすむ', romaji: 'yasumu', group: 1, meaning: 'nghỉ ngơi',
    masu: '休みます', potential: '休めます', volitional: '休もう', passive: '休まれます',
    causative: '休ませます', conditional: '休めば', imperative: '休め', prohibitive: '休むな',
    te: '休んで', ta: '休んだ', nai: '休まない'
  },
  {
    kanji: '働く', reading: 'はたらく', romaji: 'hataraku', group: 1, meaning: 'làm việc',
    masu: '働きます', potential: '働けます', volitional: '働こう', passive: '働かれます',
    causative: '働かせます', conditional: '働けば', imperative: '働け', prohibitive: '働くな',
    te: '働いて', ta: '働いた', nai: '働かない'
  },
  {
    kanji: '急ぐ', reading: 'いそぐ', romaji: 'isogu', group: 1, meaning: 'khẩn trương, vội',
    masu: '急ぎます', potential: '急げます', volitional: '急ごう', passive: '急がれます',
    causative: '急がせます', conditional: '急げば', imperative: '急げ', prohibitive: '急ぐな',
    te: '急いで', ta: '急いだ', nai: '急がない'
  },
  {
    kanji: '直す', reading: 'なおす', romaji: 'naosu', group: 1, meaning: 'sửa chữa',
    masu: '直します', potential: '直せます', volitional: '直そう', passive: '直されます',
    causative: '直させます', conditional: '直せば', imperative: '直せ', prohibitive: '直すな',
    te: '直して', ta: '直した', nai: '直さない'
  },
  {
    kanji: '押す', reading: 'おす', romaji: 'osu', group: 1, meaning: 'nhấn, ấn, đẩy',
    masu: '押します', potential: '押せます', volitional: '押そう', passive: '押されます',
    causative: '押させます', conditional: '押せば', imperative: '押せ', prohibitive: '押すな',
    te: '押して', ta: '押した', nai: '押さない'
  },
  {
    kanji: '立つ', reading: 'たつ', romaji: 'tatsu', group: 1, meaning: 'đứng',
    masu: '立ちます', potential: '立てます', volitional: '立とう', passive: '立たれます',
    causative: '立たせます', conditional: '立てば', imperative: '立て', prohibitive: '立つな',
    te: '立って', ta: '立った', nai: '立たない'
  },
  {
    kanji: '座る', reading: 'すわる', romaji: 'suwaru', group: 1, meaning: 'ngồi',
    masu: '座ります', potential: '座れます', volitional: '座ろう', passive: '座られます',
    causative: '座らせます', conditional: '座れば', imperative: '座れ', prohibitive: '座るな',
    te: '座って', ta: '座った', nai: '座らない'
  },
  {
    kanji: '取る', reading: 'とる', romaji: 'toru', group: 1, meaning: 'lấy, chụp (ảnh)',
    masu: '取ります', potential: '取れます', volitional: '取ろう', passive: '取られます',
    causative: '取らせます', conditional: '取れば', imperative: '取れ', prohibitive: '取るな',
    te: '取って', ta: '取った', nai: '取らない'
  },
  {
    kanji: '送る', reading: 'おくる', romaji: 'okuru', group: 1, meaning: 'gửi, tiễn',
    masu: '送ります', potential: '送れます', volitional: '送ろう', passive: '送られます',
    causative: '送らせます', conditional: '送れば', imperative: '送れ', prohibitive: '送るな',
    te: '送って', ta: '送った', nai: '送らない'
  },
  {
    kanji: '作る', reading: 'つくる', romaji: 'tsukuru', group: 1, meaning: 'làm, chế tạo',
    masu: '作ります', potential: '作れます', volitional: '作ろう', passive: '作られます',
    causative: '作らせます', conditional: '作れば', imperative: '作れ', prohibitive: '作るな',
    te: '作って', ta: '作った', nai: '作らない'
  },
  {
    kanji: '弾く', reading: 'ひく', romaji: 'hiku', group: 1, meaning: 'chơi (nhạc cụ gảy/phím)',
    masu: '弾きます', potential: '弾けます', volitional: '弾こう', passive: '弾かれます',
    causative: '弾かせます', conditional: '弾けば', imperative: '弾け', prohibitive: '弾くな',
    te: '弾いて', ta: '弾いた', nai: '弾かない'
  },
  {
    kanji: '歌う', reading: 'うたう', romaji: 'utau', group: 1, meaning: 'hát',
    masu: '歌います', potential: '歌えます', volitional: '歌おう', passive: '歌われます',
    causative: '歌わせます', conditional: '歌えば', imperative: '歌え', prohibitive: '歌うな',
    te: '歌って', ta: '歌った', nai: '歌わない'
  },
  {
    kanji: '走る', reading: 'はしる', romaji: 'hashiru', group: 1, meaning: 'chạy',
    masu: '走ります', potential: '走れます', volitional: '走ろう', passive: '走られます',
    causative: '走らせます', conditional: '走れば', imperative: '走れ', prohibitive: '走るな',
    te: '走って', ta: '走った', nai: '走らない'
  },

  // Nhóm 2
  {
    kanji: '食べる', reading: 'たべる', romaji: 'taberu', group: 2, meaning: 'ăn',
    masu: '食べます', potential: '食べられます', volitional: '食べよう', passive: '食べられます',
    causative: '食べさせます', conditional: '食べれば', imperative: '食べろ', prohibitive: '食べるな',
    te: '食べて', ta: '食べた', nai: '食べない'
  },
  {
    kanji: '見る', reading: 'みる', romaji: 'miru', group: 2, meaning: 'nhìn, xem',
    masu: '見ます', potential: '見られます', volitional: '見よう', passive: '見られます',
    causative: '見させます', conditional: '見れば', imperative: '見ろ', prohibitive: '見るな',
    te: '見て', ta: '見た', nai: '見ない'
  },
  {
    kanji: '起きる', reading: 'おきる', romaji: 'okiru', group: 2, meaning: 'thức dậy',
    masu: '起きます', potential: '起きられます', volitional: '起きよう', passive: '起きられます',
    causative: '起きさせます', conditional: '起きれば', imperative: '起きろ', prohibitive: '起きるな',
    te: '起きて', ta: '起きた', nai: '起きない'
  },
  {
    kanji: '寝る', reading: 'ねる', romaji: 'neru', group: 2, meaning: 'ngủ',
    masu: '寝ます', potential: '寝られます', volitional: '寝よう', passive: '寝られます',
    causative: '寝させます', conditional: '寝れば', imperative: '寝ろ', prohibitive: '寝るな',
    te: '寝て', ta: '寝た', nai: '寝ない'
  },
  {
    kanji: '教える', reading: 'おしえる', romaji: 'oshieru', group: 2, meaning: 'dạy, chỉ bảo',
    masu: '教えます', potential: '教えられます', volitional: '教えよう', passive: '教えられます',
    causative: '教えさせます', conditional: '教えれば', imperative: '教えろ', prohibitive: '教えるな',
    te: '教えて', ta: '教えた', nai: '教えない'
  },
  {
    kanji: '覚える', reading: 'おぼえる', romaji: 'oboeru', group: 2, meaning: 'ghi nhớ',
    masu: '覚えます', potential: '覚えられます', volitional: '覚えよう', passive: '覚えられます',
    causative: '覚えさせます', conditional: '覚えれば', imperative: '覚えろ', prohibitive: '覚えるな',
    te: '覚えて', ta: '覚えた', nai: '覚えない'
  },
  {
    kanji: '忘れる', reading: 'わすれる', romaji: 'wasureru', group: 2, meaning: 'quên',
    masu: '忘れます', potential: '忘れられます', volitional: '忘れよう', passive: '忘れられます',
    causative: '忘れさせます', conditional: '忘れれば', imperative: '忘れろ', prohibitive: '忘れるな',
    te: '忘れて', ta: '忘れた', nai: '忘れない'
  },
  {
    kanji: '開ける', reading: 'あける', romaji: 'akeru', group: 2, meaning: 'mở (tha động từ)',
    masu: '開けます', potential: '開けられます', volitional: '開けよう', passive: '開けられます',
    causative: '開けさせます', conditional: '開ければ', imperative: '開けろ', prohibitive: '開けるな',
    te: '開けて', ta: '開けた', nai: '開けない'
  },
  {
    kanji: '閉める', reading: 'しめる', romaji: 'shimeru', group: 2, meaning: 'đóng (tha động từ)',
    masu: '閉めます', potential: '閉められます', volitional: '閉めよう', passive: '閉められます',
    causative: '閉めさせます', conditional: '閉めれば', imperative: '閉めろ', prohibitive: '閉めるな',
    te: '閉めて', ta: '閉めた', nai: '閉めない'
  },
  {
    kanji: '始める', reading: 'はじめる', romaji: 'hajimeru', group: 2, meaning: 'bắt đầu',
    masu: '始めます', potential: '始められます', volitional: '始めよう', passive: '始められます',
    causative: '始めさせます', conditional: '始めれば', imperative: '始めろ', prohibitive: '始めるな',
    te: '始めて', ta: '始めた', nai: '始めない'
  },
  {
    kanji: '辞める', reading: 'やめる', romaji: 'yameru', group: 2, meaning: 'từ bỏ, nghỉ việc',
    masu: '辞めます', potential: '辞められます', volitional: '辞めよう', passive: '辞められます',
    causative: '辞めさせます', conditional: '辞めれば', imperative: '辞めろ', prohibitive: '辞めるな',
    te: '辞めて', ta: '辞めた', nai: '辞めない'
  },
  {
    kanji: '褒める', reading: 'ほめる', romaji: 'homeru', group: 2, meaning: 'khen ngợi',
    masu: '褒めます', potential: '褒められます', volitional: '褒めよう', passive: '褒められます',
    causative: '褒めさせます', conditional: '褒めれば', imperative: '褒めろ', prohibitive: '褒めるな',
    te: '褒めて', ta: '褒めた', nai: '褒めない'
  },
  {
    kanji: '叱る', reading: 'しかる', romaji: 'shikaru', group: 1, meaning: 'mắng mỏ',
    masu: '叱ります', potential: '叱れます', volitional: '叱ろう', passive: '叱られます',
    causative: '叱らせます', conditional: '叱れば', imperative: '叱れ', prohibitive: '叱るな',
    te: '叱って', ta: '叱った', nai: '叱らない'
  },

  // Nhóm 3
  {
    kanji: 'する', reading: 'する', romaji: 'suru', group: 3, meaning: 'làm',
    masu: 'します', potential: 'できます', volitional: 'しよう', passive: 'されます',
    causative: 'させます', conditional: 'すれば', imperative: 'しろ', prohibitive: 'するな',
    te: 'して', ta: 'した', nai: 'しない'
  },
  {
    kanji: '来る', reading: 'くる', romaji: 'kuru', group: 3, meaning: 'đến',
    masu: '来ます', potential: '来られます', volitional: '来よう', passive: '来られます',
    causative: '来させます', conditional: '来れば', imperative: '来い', prohibitive: '来るな',
    te: '来て', ta: '来た', nai: '来ない'
  }
];

// ==========================================
// CÁC MẪU CÂU TRẮC NGHIỆM TRỢ TỪ (PARTICLES)
// ==========================================

export interface ParticleTemplate {
  sentencePrefix: string;
  sentenceSuffix: string;
  correctParticle: string;
  distractors: string[];
  translation: string;
  grammarExplanation: string;
  vocab: QuizVocabItem[];
}

export const particleTemplates: ParticleTemplate[] = [
  {
    sentencePrefix: '<ruby>私<rt>わたし</rt></ruby>は 日本語（ ）<ruby>話<rt>はな</rt></ruby>せます。',
    sentenceSuffix: '',
    correctParticle: 'が',
    distractors: ['を', 'に', 'で'],
    translation: 'Tôi có thể nói được tiếng Nhật.',
    grammarExplanation: 'Với động từ thể khả năng (話せます), đối tượng khả năng thường đi với trợ từ <b>が</b> thay vì <b>を</b>.',
    vocab: [
      { kanji: '日本語', hira: 'にほんご', romaji: 'nihongo', type: 'Danh từ', meaning: 'Tiếng Nhật' },
      { kanji: '話せます', hira: 'はなせます', romaji: 'hanasemasu', type: 'Động từ khả năng', meaning: 'Có thể nói' }
    ]
  },
  {
    sentencePrefix: '駅（ ）<ruby>行<rt>い</rt></ruby>く <ruby>途中<rt>とちゅう</rt></ruby>で 友達（ ）会いました。',
    sentenceSuffix: '',
    correctParticle: 'に',
    distractors: ['を', 'で', 'へ'],
    translation: 'Trên đường đi đến nhà ga, tôi đã gặp bạn bè.',
    grammarExplanation: 'Gặp gỡ một ai đó có chủ đích hoặc tình cờ: <b>Người + に 会います</b>.',
    vocab: [
      { kanji: '駅', hira: 'えき', romaji: 'eki', type: 'Danh từ', meaning: 'Nhà ga' },
      { kanji: '友達', hira: 'ともだち', romaji: 'tomodachi', type: 'Danh từ', meaning: 'Bạn bè' },
      { kanji: '会いました', hira: 'あいました', romaji: 'aimashita', type: 'Động từ quá khứ', meaning: 'Đã gặp' }
    ]
  },
  {
    sentencePrefix: 'この <ruby>薬<rt>くすり</rt></ruby>は 1<ruby>日<rt>にち</rt></ruby>（ ）3<ruby>回<rt>かい</rt></ruby> <ruby>飲<rt>の</rt></ruby>んでください。',
    sentenceSuffix: '',
    correctParticle: 'に',
    distractors: ['で', 'を', 'が'],
    translation: 'Loại thuốc này xin hãy uống 3 lần trong 1 ngày.',
    grammarExplanation: 'Chỉ tần suất trong một khoảng thời gian: <b>Khoảng thời gian + に + Số lần</b> (1日に3回).',
    vocab: [
      { kanji: '薬', hira: 'くすり', romaji: 'kusuri', type: 'Danh từ', meaning: 'Thuốc' },
      { kanji: '飲んでください', hira: 'のんでください', romaji: 'nondekudasai', type: 'Động từ てください', meaning: 'Xin hãy uống' }
    ]
  },
  {
    sentencePrefix: '<ruby>雨<rt>あめ</rt></ruby>（ ）<ruby>降<rt>ふ</rt></ruby>っていますから、<ruby>傘<rt>かさ</rt></ruby>を <ruby>持<rt>も</rt></ruby>っていきます。',
    sentenceSuffix: '',
    correctParticle: 'が',
    distractors: ['を', 'に', 'は'],
    translation: 'Vì trời đang mưa nên tôi mang theo ô.',
    grammarExplanation: 'Hiện tượng tự nhiên (mưa rơi, gió thổi, tuyết rơi) chủ ngữ luôn đi với trợ từ <b>が</b>: 雨が降ります.',
    vocab: [
      { kanji: '雨', hira: 'あめ', romaji: 'ame', type: 'Danh từ', meaning: 'Mưa' },
      { kanji: '降っています', hira: 'ふっています', romaji: 'futteimasu', type: 'Động từ tiếp diễn', meaning: 'Đang rơi' },
      { kanji: '傘', hira: 'かさ', romaji: 'kasa', type: 'Danh từ', meaning: 'Cái ô' }
    ]
  },
  {
    sentencePrefix: '<ruby>会議<rt>かいぎ</rt></ruby>は 3<ruby>時<rt>じ</rt></ruby>（ ）<ruby>終<rt>お</rt></ruby>わります。',
    sentenceSuffix: '',
    correctParticle: 'に',
    distractors: ['で', 'を', 'まで'],
    translation: 'Cuộc họp sẽ kết thúc vào lúc 3 giờ.',
    grammarExplanation: 'Hành động xảy ra tại một thời điểm xác định có con số cụ thể: <b>Thời gian + に</b>.',
    vocab: [
      { kanji: '会議', hira: 'かいぎ', romaji: 'kaigi', type: 'Danh từ', meaning: 'Cuộc họp' },
      { kanji: '終わります', hira: 'おわります', romaji: 'owarimasu', type: 'Động từ', meaning: 'Kết thúc' }
    ]
  },
  {
    sentencePrefix: '明日（ ）<ruby>宿題<rt>しゅくだい</rt></ruby>を <ruby>出<rt>だ</rt></ruby>さなければなりません。',
    sentenceSuffix: '',
    correctParticle: 'までに',
    distractors: ['まで', 'から', 'に'],
    translation: 'Trước ngày mai bạn phải nộp bài tập về nhà.',
    grammarExplanation: '<b>までに</b> biểu thị hạn chót hành động phải hoàn tất trước thời điểm đó. Phân biệt với <b>まで</b> (hành động liên tục cho đến tận...).',
    vocab: [
      { kanji: '宿題', hira: 'しゅくだい', romaji: 'shukudai', type: 'Danh từ', meaning: 'Bài tập về nhà' },
      { kanji: '出さなければなりません', hira: 'ださなければなりません', romaji: 'dasanakerebanarimasen', type: 'Phải nộp', meaning: 'Phải nộp' }
    ]
  },
  {
    sentencePrefix: '<ruby>図書室<rt>としょしつ</rt></ruby>（ ）<ruby>本<rt>ほん</rt></ruby>を <ruby>読<rt>よ</rt></ruby>みます。',
    sentenceSuffix: '',
    correctParticle: 'で',
    distractors: ['に', 'へ', 'を'],
    translation: 'Tôi đọc sách ở phòng đọc sách / thư viện.',
    grammarExplanation: 'Nơi chốn diễn ra hành động cụ thể sử dụng trợ từ <b>で</b>.',
    vocab: [
      { kanji: '図書室', hira: 'としょしつ', romaji: 'toshoshitsu', type: 'Danh từ', meaning: 'Phòng đọc sách' },
      { kanji: '読みます', hira: 'よみます', romaji: 'yomimasu', type: 'Động từ', meaning: 'Đọc' }
    ]
  },
  {
    sentencePrefix: '<ruby>弟<rt>おとうと</rt></ruby>は <ruby>母<rt>はは</rt></ruby>（ ）<ruby>叱<rt>しか</rt></ruby>られました。',
    sentenceSuffix: '',
    correctParticle: 'に',
    distractors: ['を', 'で', 'から'],
    translation: 'Em trai tôi đã bị mẹ mắng.',
    grammarExplanation: 'Trong câu bị động (受身文), tác nhân gây ra hành động đứng trước trợ từ <b>に</b>: A は B に V-られます.',
    vocab: [
      { kanji: '弟', hira: 'おとうと', romaji: 'otouto', type: 'Danh từ', meaning: 'Em trai' },
      { kanji: '母', hira: 'はは', romaji: 'haha', type: 'Danh từ', meaning: 'Mẹ' },
      { kanji: '叱られました', hira: 'しかられました', romaji: 'shikararemashita', type: 'Thể bị động quá khứ', meaning: 'Bị mắng' }
    ]
  },
  {
    sentencePrefix: '<ruby>先生<rt>せんせい</rt></ruby>は <ruby>学生<rt>がくせい</rt></ruby>（ ）<ruby>漢字<rt>かんじ</rt></ruby>を <ruby>書<rt>か</rt></ruby>かせました。',
    sentenceSuffix: '',
    correctParticle: 'に',
    distractors: ['を', 'で', 'が'],
    translation: 'Thầy giáo đã bắt học sinh viết chữ Hán.',
    grammarExplanation: 'Trong câu sai khiến có tân ngữ trực tiếp (O を V-（さ）せます), đối tượng bị sai khiến sẽ đi với trợ từ <b>に</b> để tránh trùng 2 trợ từ を.',
    vocab: [
      { kanji: '先生', hira: 'せんせい', romaji: 'sensei', type: 'Danh từ', meaning: 'Giáo viên, thầy cô' },
      { kanji: '学生', hira: 'がくせい', romaji: 'gakusei', type: 'Danh từ', meaning: 'Học sinh, sinh viên' },
      { kanji: '書かせました', hira: 'かかせました', romaji: 'kakasemashita', type: 'Thể sai khiến quá khứ', meaning: 'Bắt viết, cho viết' }
    ]
  },
  {
    sentencePrefix: '<ruby>健康<rt>けんこう</rt></ruby>の（ ）、<ruby>毎朝<rt>まいあさ</rt></ruby> <ruby>走<rt>はし</rt></ruby>っています。',
    sentenceSuffix: '',
    correctParticle: 'ために',
    distractors: ['ように', 'のに', 'ので'],
    translation: 'Vì sức khỏe, mỗi sáng tôi đều chạy bộ.',
    grammarExplanation: 'Chỉ mục đích cho danh từ: <b>N のために</b> (Vì lợi ích của N).',
    vocab: [
      { kanji: '健康', hira: 'けんこう', romaji: 'kenkou', type: 'Danh từ', meaning: 'Sức khỏe' },
      { kanji: '毎朝', hira: 'まいあさ', romaji: 'maiasa', type: 'Danh từ', meaning: 'Mỗi buổi sáng' },
      { kanji: '走っています', hira: 'はしっています', romaji: 'hashitteimasu', type: 'Động từ', meaning: 'Đang chạy / thói quen chạy' }
    ]
  },
  {
    sentencePrefix: '<ruby>日本語<rt>にほんご</rt></ruby>が <ruby>上手<rt>じょうず</rt></ruby>に <ruby>話<rt>はな</rt></ruby>せる（ ）、<ruby>毎日<rt>まいにち</rt></ruby> <ruby>練習<rt>れんしゅう</rt></ruby>しています。',
    sentenceSuffix: '',
    correctParticle: 'ように',
    distractors: ['ために', 'のに', 'ので'],
    translation: 'Để có thể nói giỏi tiếng Nhật, ngày nào tôi cũng luyện tập.',
    grammarExplanation: 'Chỉ mục tiêu hướng đến trạng thái hoặc khả năng (động từ không ý chí hoặc thể khả năng): <b>V-khả năng + ように</b>. Phân biệt với <b>ために</b> (đi với động từ có ý chí).',
    vocab: [
      { kanji: '上手', hira: 'じょうず', romaji: 'jouzu', type: 'Tính từ na', meaning: 'Giỏi' },
      { kanji: '練習しています', hira: 'れんしゅうしています', romaji: 'renshuushiteimasu', type: 'Động từ', meaning: 'Đang luyện tập' }
    ]
  },
  {
    sentencePrefix: 'この <ruby>鋏<rt>はさみ</rt></ruby>は <ruby>花<rt>はな</rt></ruby>を <ruby>切<rt>き</rt></ruby>る（ ）<ruby>使<rt>つか</rt></ruby>います。',
    sentenceSuffix: '',
    correctParticle: 'のに',
    distractors: ['ために', 'ように', 'ので'],
    translation: 'Chiếc kéo này được dùng vào việc cắt hoa.',
    grammarExplanation: 'Chỉ mục đích sử dụng công dụng/đánh giá: <b>V-る + のに + 使います / 便利です / 時間がかかります</b>.',
    vocab: [
      { kanji: '鋏', hira: 'はさみ', romaji: 'hasami', type: 'Danh từ', meaning: 'Cái kéo' },
      { kanji: '切る', hira: 'きる', romaji: 'kiru', type: 'Động từ thể từ điển', meaning: 'Cắt' },
      { kanji: '使います', hira: 'つかいます', romaji: 'tsukaimasu', type: 'Động từ', meaning: 'Dùng, sử dụng' }
    ]
  },
  {
    sentencePrefix: '<ruby>財布<rt>さいふ</rt></ruby>には 1000<ruby>円<rt>えん</rt></ruby>（ ）ありませんから、<ruby>買<rt>か</rt></ruby>えません。',
    sentenceSuffix: '',
    correctParticle: 'しか',
    distractors: ['だけ', 'も', 'が'],
    translation: 'Trong ví chỉ có 1000 yên thôi nên không thể mua được.',
    grammarExplanation: '<b>しか + V phủ định</b> mang nghĩa "chỉ có...", nhấn mạnh sự ít ỏi thiếu thốn. Nếu dùng <b>だけ</b> thì vế sau phải là khẳng định (1000円だけあります).',
    vocab: [
      { kanji: '財布', hira: 'さいふ', romaji: 'saifu', type: 'Danh từ', meaning: 'Ví tiền' },
      { kanji: '買えません', hira: 'かえません', romaji: 'kaemasen', type: 'Động từ khả năng phủ định', meaning: 'Không thể mua' }
    ]
  }
];

// ==========================================
// CÁC MẪU CÂU TRẮC NGHIỆM CHIA THỂ ĐỘNG TỪ
// ==========================================

export type VerbQuizType = 'potential' | 'volitional' | 'passive' | 'causative' | 'conditional' | 'imperative' | 'prohibitive';

export interface VerbQuizPromptConfig {
  type: VerbQuizType;
  title: string;
  questionFormatter: (v: N4VerbEntry) => {
    question: string;
    plainSentence: string;
    correctOption: string;
    distractors: string[];
    fullSentence: string;
    translation: string;
    grammarExplanation: string;
  };
}

export const verbQuizConfigs: VerbQuizPromptConfig[] = [
  // 1. THỂ KHẢ NĂNG (可能形)
  {
    type: 'potential',
    title: 'Thể Khả Năng (可能形)',
    questionFormatter: (v) => {
      const isGroup1 = v.group === 1;
      const wrong1 = isGroup1 ? v.masu.replace(/ます$/, 'られます') : v.masu.replace(/ます$/, 'せます');
      const wrong2 = v.volitional;
      const wrong3 = v.masu;

      return {
        question: `「${v.kanji}」(${v.meaning}) chuyển sang **thể khả năng** dạng lịch sự là gì?`,
        plainSentence: `${v.kanji}の可能形は${v.potential}です。`,
        correctOption: v.potential,
        distractors: [wrong1, wrong2, wrong3],
        fullSentence: `「${v.kanji}」の可能形：<strong>${v.potential}</strong>`,
        translation: `Thể khả năng của động từ "${v.kanji}" (${v.meaning}) là "${v.potential}" (có thể ${v.meaning}).`,
        grammarExplanation: `Quy tắc thể khả năng: ${isGroup1 ? 'Động từ nhóm 1 chuyển cột [い] sang cột [え] rồi thêm ます (ví dụ: ' + v.masu + ' → ' + v.potential + ').' : v.group === 2 ? 'Động từ nhóm 2 bỏ ます thêm られます (ví dụ: ' + v.masu + ' → ' + v.potential + ').' : 'Động từ nhóm 3: します → できます; 来ます → こられます.'}`
      };
    }
  },

  // 2. THỂ Ý CHÍ (意向形)
  {
    type: 'volitional',
    title: 'Thể Ý Chí (意向形)',
    questionFormatter: (v) => {
      const isGroup1 = v.group === 1;
      const wrong1 = isGroup1 ? v.potential : v.masu.replace(/ます$/, 'う');
      const wrong2 = v.imperative;
      const wrong3 = v.masu.replace(/ます$/, 'ましょう');

      return {
        question: `Hãy chuyển động từ「${v.kanji}」(${v.meaning}) sang **thể ý chí** (意向形 - dạng ngắn của ～ましょう):`,
        plainSentence: `${v.kanji}の意向形は${v.volitional}です。`,
        correctOption: v.volitional,
        distractors: [wrong1, wrong2, wrong3],
        fullSentence: `「${v.kanji}」の意向形：<strong>${v.volitional}</strong>`,
        translation: `Thể ý chí của "${v.kanji}" là "${v.volitional}" (cùng ${v.meaning} nào / dự định ${v.meaning}).`,
        grammarExplanation: `Thể ý chí (意向形): ${isGroup1 ? 'Động từ nhóm 1 chuyển hàng [い] sang hàng [お] rồi thêm [う] (ví dụ: ' + v.masu + ' → ' + v.volitional + ').' : v.group === 2 ? 'Động từ nhóm 2 bỏ ます thêm [よう] (ví dụ: ' + v.masu + ' → ' + v.volitional + ').' : 'Nhóm 3: します → しよう; 来ます (きます) → 来よう (こよう).'}`
      };
    }
  },

  // 3. THỂ BỊ ĐỘNG (受身形)
  {
    type: 'passive',
    title: 'Thể Bị Động (受身形)',
    questionFormatter: (v) => {
      const isGroup1 = v.group === 1;
      const wrong1 = isGroup1 ? v.potential : v.masu.replace(/ます$/, 'れます');
      const wrong2 = v.causative;
      const wrong3 = v.masu.replace(/ます$/, 'られました');

      return {
        question: `Trong câu bị động, động từ「${v.kanji}」(${v.meaning}) được chia thành:`,
        plainSentence: `${v.kanji}の受身形は${v.passive}です。`,
        correctOption: v.passive,
        distractors: [wrong1, wrong2, wrong3],
        fullSentence: `「${v.kanji}」の受身形：<strong>${v.passive}</strong>`,
        translation: `Thể bị động của "${v.kanji}" là "${v.passive}" (được/bị ${v.meaning}).`,
        grammarExplanation: `Quy tắc thể bị động: ${isGroup1 ? 'Động từ nhóm 1 chuyển cột [い] sang cột [あ] rồi thêm [れます] (ví dụ: ' + v.masu + ' → ' + v.passive + ').' : v.group === 2 ? 'Động từ nhóm 2 bỏ ます thêm [られます] (ví dụ: ' + v.masu + ' → ' + v.passive + ').' : 'Nhóm 3: します → されます; 来ます → こられます.'}`
      };
    }
  },

  // 4. THỂ SAI KHIẾN (使役形)
  {
    type: 'causative',
    title: 'Thể Sai Khiến (使役形)',
    questionFormatter: (v) => {
      const isGroup1 = v.group === 1;
      const wrong1 = v.passive;
      const wrong2 = isGroup1 ? v.masu.replace(/ます$/, 'させます') : v.masu.replace(/ます$/, 'せます');
      const wrong3 = v.potential;

      return {
        question: `Khi muốn biểu thị việc "cho phép" hoặc "bắt" ai đó ${v.meaning}, thể sai khiến của「${v.kanji}」là:`,
        plainSentence: `${v.kanji}の使役形は${v.causative}です。`,
        correctOption: v.causative,
        distractors: [wrong1, wrong2, wrong3],
        fullSentence: `「${v.kanji}」の使役形：<strong>${v.causative}</strong>`,
        translation: `Thể sai khiến của "${v.kanji}" là "${v.causative}" (cho phép/bắt ${v.meaning}).`,
        grammarExplanation: `Quy tắc thể sai khiến: ${isGroup1 ? 'Động từ nhóm 1 chuyển cột [い] sang cột [あ] rồi thêm [せます] (ví dụ: ' + v.masu + ' → ' + v.causative + ').' : v.group === 2 ? 'Động từ nhóm 2 bỏ ます thêm [させます] (ví dụ: ' + v.masu + ' → ' + v.causative + ').' : 'Nhóm 3: します → させます; 来ます → こさせます.'}`
      };
    }
  },

  // 5. THỂ ĐIỀU KIỆN (条件形 ～ば)
  {
    type: 'conditional',
    title: 'Thể Điều Kiện (条件形 ～ば)',
    questionFormatter: (v) => {
      const isGroup1 = v.group === 1;
      const wrong1 = isGroup1 ? v.ta + 'ら' : v.masu.replace(/ます$/, 'たら');
      const wrong2 = v.masu.replace(/ます$/, 'ば');
      const wrong3 = v.imperative;

      return {
        question: `Chuyển động từ「${v.kanji}」(${v.meaning}) sang thể điều kiện **～ば** (Nếu...):`,
        plainSentence: `${v.kanji}の条件形は${v.conditional}です。`,
        correctOption: v.conditional,
        distractors: [wrong1, wrong2, wrong3],
        fullSentence: `「${v.kanji}」の条件形：<strong>${v.conditional}</strong>`,
        translation: `Thể điều kiện của "${v.kanji}" là "${v.conditional}" (nếu ${v.meaning}).`,
        grammarExplanation: `Quy tắc thể điều kiện ば: ${isGroup1 ? 'Động từ nhóm 1 đổi nguyên âm đuôi [u] sang [e] rồi thêm [ば] (ví dụ: ' + v.reading + ' → ' + v.conditional + ').' : v.group === 2 ? 'Động từ nhóm 2 bỏ る thêm [れば] (ví dụ: ' + v.reading + ' → ' + v.conditional + ').' : 'Nhóm 3: する → すれば; くる → くれば.'}`
      };
    }
  }
];

// ==========================================
// CÁC MẪU TRẮC NGHIỆM TÌM CÁCH ĐỌC KANJI N4
// ==========================================

export interface N4KanjiQuestionModel {
  kanjiWord: string;
  hiraganaCorrect: string;
  hiraganaDistractors: string[];
  sentenceWithRuby: string;
  fullSentence: string;
  plainSentence: string;
  translation: string;
  meaning: string;
  sinoVietnamese: string;
}

export const n4KanjiList: N4KanjiQuestionModel[] = [
  {
    kanjiWord: '案内', hiraganaCorrect: 'あんない', hiraganaDistractors: ['あない', 'あんなん', 'あんないん'],
    sentenceWithRuby: '京都の まちを （案内）します。',
    fullSentence: '京都の まちを <strong><ruby>案内<rt>あんない</rt></ruby></strong>します。',
    plainSentence: '京都のまちを案内します。',
    translation: 'Tôi sẽ hướng dẫn / dẫn đường quanh thành phố Kyoto.',
    meaning: 'Hướng dẫn, chỉ đường', sinoVietnamese: 'Án Nội'
  },
  {
    kanjiWord: '経験', hiraganaCorrect: 'けいけん', hiraganaDistractors: ['けいかん', 'けんけん', 'きょうけん'],
    sentenceWithRuby: '色々な （経験）を したいです。',
    fullSentence: '色々な <strong><ruby>経験<rt>けいけん</rt></ruby></strong>を したいです。',
    plainSentence: '色々な経験をしたいです。',
    translation: 'Tôi muốn trải nghiệm nhiều kinh nghiệm khác nhau.',
    meaning: 'Kinh nghiệm, trải nghiệm', sinoVietnamese: 'Kinh Nghiệm'
  },
  {
    kanjiWord: '約束', hiraganaCorrect: 'やくそく', hiraganaDistractors: ['やくしょく', 'やっそく', 'やくぞく'],
    sentenceWithRuby: '友達と （約束）が あります。',
    fullSentence: '友達と <strong><ruby>約束<rt>やくそく</rt></ruby></strong>が あります。',
    plainSentence: '友達と約束があります。',
    translation: 'Tôi có lời hẹn / cuộc hẹn với bạn bè.',
    meaning: 'Lời hứa, cuộc hẹn', sinoVietnamese: 'Ước Thúc'
  },
  {
    kanjiWord: '準備', hiraganaCorrect: 'じゅんび', hiraganaDistractors: ['じゅんぴ', 'ずんび', 'じゅうび'],
    sentenceWithRuby: '旅行の （準備）を しておきます。',
    fullSentence: '旅行の <strong><ruby>準備<rt>じゅんび</rt></ruby></strong>を しておきます。',
    plainSentence: '旅行の準備をしておきます。',
    translation: 'Tôi chuẩn bị sẵn sàng cho chuyến đi du lịch.',
    meaning: 'Sự chuẩn bị', sinoVietnamese: 'Chuẩn Bị'
  },
  {
    kanjiWord: '故障', hiraganaCorrect: 'こしょう', hiraganaDistractors: ['こじょう', 'こうしょう', 'こしょ'],
    sentenceWithRuby: '車が （故障）しましたから、修理に出します。',
    fullSentence: '車が <strong><ruby>故障<rt>こしょう</rt></ruby></strong>しましたから、修理に出します。',
    plainSentence: '車が故障しましたから、修理に出します。',
    translation: 'Vì xe hơi bị hỏng nên tôi đem đi sửa.',
    meaning: 'Hỏng hóc, sự cố', sinoVietnamese: 'Cố Chướng'
  },
  {
    kanjiWord: '遠慮', hiraganaCorrect: 'えんりょ', hiraganaDistractors: ['えんりょう', 'えいりょ', 'あんりょ'],
    sentenceWithRuby: 'どうぞ （遠慮）しないで 食べてください。',
    fullSentence: 'どうぞ <strong><ruby>遠慮<rt>えんりょ</rt></ruby></strong>しないで 食べてください。',
    plainSentence: 'どうぞ遠慮しないで食べてください。',
    translation: 'Xin đừng khách sáo, hãy cứ tự nhiên ăn đi ạ.',
    meaning: 'Khách sáo, ngại ngần', sinoVietnamese: 'Viễn Lự'
  },
  {
    kanjiWord: '都合', hiraganaCorrect: 'つごう', hiraganaDistractors: ['とごう', 'づごう', 'つこう'],
    sentenceWithRuby: '明日は （都合）が 悪いです。',
    fullSentence: '明日は <strong><ruby>都合<rt>つごう</rt></ruby></strong>が 悪いです。',
    plainSentence: '明日は都合が悪いです。',
    translation: 'Ngày mai điều kiện/thời gian của tôi không thuận tiện.',
    meaning: 'Điều kiện thuận tiện, sự sắp xếp', sinoVietnamese: 'Đô Hợp'
  },
  {
    kanjiWord: '複雑', hiraganaCorrect: 'ふくざつ', hiraganaDistractors: ['ふくさつ', 'ふくぞう', 'ふっざつ'],
    sentenceWithRuby: 'この機械の使い方は （複雑）です。',
    fullSentence: 'この機械の使い方は <strong><ruby>複雑<rt>ふくざつ</rt></ruby></strong>です。',
    plainSentence: 'この機械の使い方は複雑です。',
    translation: 'Cách sử dụng cỗ máy này rất phức tạp.',
    meaning: 'Phức tạp', sinoVietnamese: 'Phức Tạp'
  },
  {
    kanjiWord: '規則', hiraganaCorrect: 'きそく', hiraganaDistractors: ['きぞく', 'きっそく', 'けいそく'],
    sentenceWithRuby: '会社の （規則）を 守らなければなりません。',
    fullSentence: '会社の <strong><ruby>規則<rt>きそく</rt></ruby></strong>を 守らなければなりません。',
    plainSentence: '会社の規則を守らなければなりません。',
    translation: 'Bạn phải tuân thủ quy tắc / nội quy của công ty.',
    meaning: 'Quy tắc, nội quy', sinoVietnamese: 'Quy Tắc'
  },
  {
    kanjiWord: '習慣', hiraganaCorrect: 'しゅうかん', hiraganaDistractors: ['しゅかん', 'しゅうがん', 'しゅっかん'],
    sentenceWithRuby: '国によって （習慣）が 違います。',
    fullSentence: '国によって <strong><ruby>習慣<rt>しゅうかん</rt></ruby></strong>が 違います。',
    plainSentence: '国によって習慣が違います。',
    translation: 'Tùy theo từng quốc gia mà tập quán/thói quen sẽ khác nhau.',
    meaning: 'Tập quán, thói quen', sinoVietnamese: 'Tập Quán'
  }
];

// ==========================================
// HÀM SHUFFLE VÀ TẠO CÂU HỎI TRẮC NGHIỆM 4 ĐÁP ÁN
// ==========================================

export function buildMultipleChoice(
  id: string,
  questionHtml: string,
  plainSentence: string,
  correctOption: string,
  distractors: string[],
  fullSentenceHtml: string,
  translation: string,
  grammarExplanation: string,
  vocab: QuizVocabItem[] = [],
  lesson: string = 'N4 Tổng hợp'
): QuizQuestion {
  // Take 3 distractors
  const validDistractors = distractors.filter(d => d !== correctOption).slice(0, 3);
  const pool = [correctOption, ...validDistractors];

  // Shuffle options
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const correctIndex = pool.indexOf(correctOption);
  const optionsWithLabels = pool.map((opt, idx) => {
    const label = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
    return `${label}. ${opt}`;
  });

  return {
    id,
    question: questionHtml,
    plainSentence,
    options: optionsWithLabels,
    correctIndex,
    fullSentence: fullSentenceHtml,
    translation,
    grammar: grammarExplanation,
    vocab,
    lesson,
    level: 'N4'
  };
}

// ==========================================
// BỘ SINH CÂU HỎI VÔ TẬN (INFINITE GENERATOR)
// ==========================================

export function generateInfiniteN4Quiz(count: number = 20, seed: number = Date.now()): QuizQuestion[] {
  const result: QuizQuestion[] = [];
  let currentSeed = seed;

  // Pseudo-random helper
  const nextRand = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  const choice = <T>(arr: T[]): T => {
    return arr[Math.floor(nextRand() * arr.length)];
  };

  for (let i = 0; i < count; i++) {
    // Choose question genre randomly:
    // 0: Particle question
    // 1: Verb Conjugation question
    // 2: Kanji Reading question
    const genre = Math.floor(nextRand() * 3);

    if (genre === 0) {
      // PARTICLE QUIZ
      const p = choice(particleTemplates);
      const qHtml = `${p.sentencePrefix.replace('（ ）', '（&nbsp;&nbsp;&nbsp;&nbsp;）')}${p.sentenceSuffix}`;
      const fullHtml = p.sentencePrefix.replace('（ ）', `<strong>${p.correctParticle}</strong>`) + p.sentenceSuffix;
      const plain = fullHtml.replace(/<[^>]*>/g, '');

      result.push(
        buildMultipleChoice(
          `gen-p-${i}-${Math.floor(nextRand() * 10000)}`,
          qHtml,
          plain,
          p.correctParticle,
          p.distractors,
          fullHtml,
          p.translation,
          p.grammarExplanation,
          p.vocab,
          'Trợ từ N4'
        )
      );
    } else if (genre === 1) {
      // VERB FORM QUIZ
      const verb = choice(n4Verbs);
      const config = choice(verbQuizConfigs);
      const f = config.questionFormatter(verb);

      result.push(
        buildMultipleChoice(
          `gen-v-${i}-${Math.floor(nextRand() * 10000)}`,
          f.question,
          f.plainSentence,
          f.correctOption,
          f.distractors,
          f.fullSentence,
          f.translation,
          f.grammarExplanation,
          [
            { kanji: verb.kanji, hira: verb.reading, romaji: verb.romaji, type: `Động từ nhóm ${verb.group}`, meaning: verb.meaning }
          ],
          config.title
        )
      );
    } else {
      // KANJI READING QUIZ
      const k = choice(n4KanjiList);
      const qHtml = k.sentenceWithRuby.replace(`（${k.kanjiWord}）`, `<u>${k.kanjiWord}</u>`);
      const fullHtml = k.fullSentence;

      result.push(
        buildMultipleChoice(
          `gen-k-${i}-${Math.floor(nextRand() * 10000)}`,
          `Hãy chọn cách đọc đúng của chữ Hán được gạch chân trong câu: <br/><span class="text-lg font-bold text-theme-accent">${qHtml}</span>`,
          k.plainSentence,
          k.hiraganaCorrect,
          k.hiraganaDistractors,
          fullHtml,
          k.translation,
          `Chữ Hán <b>${k.kanjiWord}</b> (Âm Hán Việt: <i>${k.sinoVietnamese}</i>) có cách đọc Hiragana chuẩn là <b>${k.hiraganaCorrect}</b>. Nghĩa: ${k.meaning}.`,
          [
            { kanji: k.kanjiWord, hira: k.hiraganaCorrect, romaji: '', type: 'Chữ Hán N4', meaning: `${k.meaning} (${k.sinoVietnamese})` }
          ],
          'Chữ Hán N4'
        )
      );
    }
  }

  return result;
}
