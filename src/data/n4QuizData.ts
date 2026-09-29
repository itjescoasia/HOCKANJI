import { QuizTopic, QuizQuestion } from '../types';
import { generateInfiniteN4Quiz } from '../utils/n4QuizGenerator';

export const n4QuizTopics: QuizTopic[] = [
  // ==========================================
  // CHẾ ĐỘ ĐẶC BIỆT: HÀNG NGHÌN CÂU HỎI VÔ TẬN
  // ==========================================
  {
    id: 'infinite-n4-mode',
    title: '🔥 LUYỆN TẬP VÔ TẬN N4 (Hàng nghìn câu không giới hạn)',
    subtitle: 'Hệ thống tự động sinh hàng nghìn câu hỏi trắc nghiệm mới liên tục (Trợ từ, Chia động từ, Ngữ pháp, Kanji)',
    level: 'N4',
    questions: generateInfiniteN4Quiz(30, 1001)
  },
  {
    id: 'mock-test-n4',
    title: '🏆 Đề Thi Thử Chuẩn JLPT N4 (35 câu có tính giờ & điểm)',
    subtitle: 'Đề thi tổng hợp đầy đủ các phần Từ vựng, Kanji, Ngữ pháp câu, Điền trợ từ chuẩn format kỳ thi N4',
    level: 'N4',
    questions: generateInfiniteN4Quiz(35, 2024)
  },

  // ==========================================
  // CÁC BÀI HỌC THEO GIÁO TRÌNH MINNA BÀI 26 - 50
  // ==========================================
  {
    id: 'lesson-26',
    title: 'Bài 26 - Thể Thông Thường + ～んです / ～んですが',
    subtitle: 'Minna no Nihongo N4 - Giải thích nguyên nhân, lý do, thắc mắc và yêu cầu giúp đỡ',
    level: 'N4',
    questions: [
      {
        id: 'l26-q1',
        question: 'どうして <ruby>遅<rt>おく</rt></ruby>れた（ ）ですか。',
        options: ['A. ん', 'B. の', 'C. な', 'D. だ'],
        correctIndex: 0,
        fullSentence: 'どうして <ruby>遅<rt>おく</rt></ruby>れた<strong>んです</strong>か。',
        plainSentence: 'どうして遅れたんですか。',
        translation: 'Tại sao bạn lại đến muộn vậy?',
        vocab: [
          { kanji: '遅れた', hira: 'おくれた', romaji: 'okureta', type: 'Động từ thể た', meaning: 'Đã đến muộn' },
          { kanji: 'どうして', hira: 'どうして', romaji: 'doushite', type: 'Phó từ nghi vấn', meaning: 'Tại sao' }
        ],
        grammar: 'Cấu trúc <b>Thể thông thường + んですか</b> dùng trong câu hỏi để yêu cầu người nghe giải thích lý do, nguyên nhân cụ thể.'
      },
      {
        id: 'l26-q2',
        question: '<ruby>頭<rt>あたま</rt></ruby>が <ruby>痛<rt>いた</rt></ruby>い（ ）、<ruby>早退<rt>そうたい</rt></ruby>しても いいですか。',
        options: ['A. んで', 'B. んですが', 'C. から', 'D. ので'],
        correctIndex: 1,
        fullSentence: '<ruby>頭<rt>あたま</rt></ruby>が <ruby>痛<rt>いた</rt></ruby>い<strong>んですが</strong>、<ruby>早退<rt>そうたい</rt></ruby>しても いいですか。',
        plainSentence: '頭が痛いんですが、早退してもいいですか。',
        translation: 'Tôi bị đau đầu, tôi có thể xin về sớm được không ạ?',
        vocab: [
          { kanji: '頭が痛い', hira: 'あたまがいたい', romaji: 'atama ga itai', type: 'Cụm tính từ', meaning: 'Đau đầu' },
          { kanji: '早退', hira: 'そうたい', romaji: 'soutai', type: 'Danh từ', meaning: 'Về sớm' }
        ],
        grammar: '<b>～んですが</b> đóng vai trò mở đầu lời nói, nêu lên hoàn cảnh tiền đề trước khi đưa ra câu hỏi, yêu cầu hoặc xin phép đối phương một cách lịch sự.'
      },
      {
        id: 'l26-q3',
        question: '日本語が 上手になりたいんですが、どう（ ）いいですか。',
        options: ['A. すれば', 'B. したら', 'C. して', 'D. すると'],
        correctIndex: 1,
        fullSentence: '日本語が 上手になりたいんですが、どう<strong>したら</strong>いいですか。',
        plainSentence: '日本語が上手になりたいんですが、どうしたらいいですか。',
        translation: 'Tôi muốn giỏi tiếng Nhật, tôi nên làm thế nào thì tốt ạ?',
        vocab: [
          { kanji: '上手', hira: 'じょうず', romaji: 'jouzu', type: 'Tính từ na', meaning: 'Giỏi' },
          { kanji: 'どうしたらいいですか', hira: 'どうしたらいいですか', romaji: 'doushitara ii desu ka', type: 'Mẫu câu xin lời khuyên', meaning: 'Nên làm thế nào thì tốt' }
        ],
        grammar: 'Mẫu câu xin lời khuyên chuẩn: <b>Nghi vấn từ + V-たらいいですか</b> (Nên làm gì / làm thế nào thì tốt?).'
      }
    ]
  },
  {
    id: 'lesson-27',
    title: 'Bài 27 - Thể Khả Năng & Phân Biệt Trợ Từ (可能形)',
    subtitle: 'Minna no Nihongo N4 - Luyện tập 10 câu Thể Khả Năng Nâng Cao (可能形, が, しか, 見える/聞える)',
    level: 'N4',
    questions: [
      {
        id: 'l27-q1',
        question: '<ruby>私<rt>わたし</rt></ruby>は ピアノ（ ）<ruby>弾<rt>ひ</rt></ruby>けます。',
        options: ['A. を', 'B. が', 'C. に', 'D. で'],
        correctIndex: 1,
        fullSentence: '<ruby>私<rt>わたし</rt></ruby>は ピアノ<strong>が</strong> <ruby>弾<rt>ひ</rt></ruby>けます。',
        plainSentence: '私はピアノが弾けます。',
        translation: 'Tôi có thể chơi được đàn piano.',
        vocab: [
          { kanji: '私', hira: 'わたし', romaji: 'watashi', type: 'Danh từ', meaning: 'Tôi' },
          { kanji: 'ピアノ', hira: 'ぴあの', romaji: 'piano', type: 'Danh từ', meaning: 'Đàn piano' },
          { kanji: '弾けます', hira: 'ひけます', romaji: 'hikemasu', type: 'Động từ (Nhóm 1)', meaning: 'Có thể chơi (nhạc cụ) - Thể khả năng của 弾きます' }
        ],
        grammar: 'Trong thể khả năng, trợ từ <b>を</b> (chỉ đối tượng của hành động) được thay thế bằng trợ từ <b>が</b>.'
      },
      {
        id: 'l27-q2',
        question: '<ruby>新幹線<rt>しんかんせん</rt></ruby>から <ruby>富士山<rt>ふじさん</rt></ruby>が（ ）。',
        options: ['A. 見られます', 'B. 見えます', 'C. 見ます', 'D. 見せます'],
        correctIndex: 1,
        fullSentence: '<ruby>新幹線<rt>しんかんせん</rt></ruby>から <ruby>富士山<rt>ふじさん</rt></ruby>が <strong><ruby>見<rt>み</rt></ruby>えます</strong>。',
        plainSentence: '新幹線から富士山が見えます。',
        translation: 'Từ tàu Shinkansen có thể nhìn thấy núi Phú Sĩ.',
        vocab: [
          { kanji: '新幹線', hira: 'しんかんせん', romaji: 'shinkansen', type: 'Danh từ', meaning: 'Tàu siêu tốc Shinkansen' },
          { kanji: '富士山', hira: 'ふじさん', romaji: 'fujisan', type: 'Danh từ', meaning: 'Núi Phú Sĩ' },
          { kanji: '見えます', hira: 'みえます', romaji: 'miemasu', type: 'Động từ (Nhóm 2)', meaning: 'Nhìn thấy (tự nhiên lọt vào mắt)' }
        ],
        grammar: '<b>見えます</b> dùng để diễn tả một cảnh tượng tự nhiên lọt vào tầm mắt, không phụ thuộc vào chủ ý của người nhìn (ngồi trên tàu và núi Phú Sĩ tự nhiên đập vào mắt). Khác với <b>見られます</b> (có điều kiện, khả năng để xem).'
      },
      {
        id: 'l27-q3',
        question: 'インターネットで <ruby>世界<rt>せかい</rt></ruby>の ラジオが（ ）。',
        options: ['A. 聞きます', 'B. 聞けます', 'C. 聞こえます', 'D. 聞かれます'],
        correctIndex: 1,
        fullSentence: 'インターネットで <ruby>世界<rt>せかい</rt></ruby>の ラジオが <strong><ruby>聞<rt>き</rt></ruby>けます</strong>。',
        plainSentence: 'インターネットで世界のラジオが聞けます。',
        translation: 'Có thể nghe đài phát thanh của thế giới qua internet.',
        vocab: [
          { kanji: '世界', hira: 'せかい', romaji: 'sekai', type: 'Danh từ', meaning: 'Thế giới' },
          { kanji: 'ラジオ', hira: 'らじお', romaji: 'rajio', type: 'Danh từ', meaning: 'Đài radio' },
          { kanji: '聞けます', hira: 'きけます', romaji: 'kikemasu', type: 'Động từ (Nhóm 1)', meaning: 'Có thể nghe - Thể khả năng của 聞きます' }
        ],
        grammar: '<b>聞けます</b> dùng khi ta có chủ ý muốn nghe và nhờ có công cụ/điều kiện (như Internet) mà việc nghe trở nên khả thi. Phân biệt với <b>聞こえます</b> (âm thanh tự động truyền vào tai mà ta không chủ ý).'
      },
      {
        id: 'l27-q4',
        question: 'お<ruby>金<rt>かね</rt></ruby>が 100<ruby>円<rt>えん</rt></ruby>（ ）ありません。',
        options: ['A. も', 'B. だけ', 'C. しか', 'D. が'],
        correctIndex: 2,
        fullSentence: 'お<ruby>金<rt>かね</rt></ruby>が 100<ruby>円<rt>えん</rt></ruby><strong>しか</strong> ありません。',
        plainSentence: 'お金が100円しかありません。',
        translation: 'Tôi chỉ có 100 yên thôi.',
        vocab: [
          { kanji: 'お金', hira: 'おかね', romaji: 'okane', type: 'Danh từ', meaning: 'Tiền bạc' },
          { kanji: '100円', hira: 'ひゃくえん', romaji: 'hyakuen', type: 'Danh từ số đếm', meaning: '100 yên' },
          { kanji: 'ありません', hira: 'ありません', romaji: 'arimasen', type: 'Động từ (Nhóm 1)', meaning: 'Không có (Dạng phủ định của あります)' }
        ],
        grammar: '<b>しか + Động từ phủ định</b> mang nghĩa "Chỉ có...". Người nói muốn nhấn mạnh sự ít ỏi, thiếu thốn, không đủ so với kỳ vọng. Khác với <b>だけ</b> đi với câu khẳng định.'
      },
      {
        id: 'l27-q5',
        question: '<ruby>晩<rt>ばん</rt></ruby>ご<ruby>飯<rt>はん</rt></ruby>が（ ）よ。<ruby>食<rt>た</rt></ruby>べましょう。',
        options: ['A. 作りました', 'B. できました', 'C. しました', 'D. 食べました'],
        correctIndex: 1,
        fullSentence: '<ruby>晩<rt>ばん</rt></ruby>ご<ruby>飯<rt>はん</rt></ruby>が <strong>できました</strong>よ。<ruby>食<rt>た</rt></ruby>べましょう。',
        plainSentence: '晩ご飯ができましたよ。食べましょう。',
        translation: 'Bữa tối đã xong rồi đấy. Chúng ta cùng ăn thôi.',
        vocab: [
          { kanji: '晩ご飯', hira: 'ばんごはん', romaji: 'bangohan', type: 'Danh từ', meaning: 'Bữa tối' },
          { kanji: 'できました', hira: 'できました', romaji: 'dekimashita', type: 'Động từ (Nhóm 3)', meaning: 'Hoàn thành / Làm xong / Được làm ra' },
          { kanji: '食べましょう', hira: 'たべましょう', romaji: 'tabemashou', type: 'Động từ (Nhóm 2)', meaning: 'Cùng ăn thôi' }
        ],
        grammar: '<b>～が できます</b> mang ý nghĩa một sự vật, sự việc đã được hoàn thành (Nấu cơm xong, làm xong bài tập, tòa nhà xây xong...).'
      },
      {
        id: 'l27-q6',
        question: 'ワイン（ ）<ruby>飲<rt>の</rt></ruby>みますが、ビール（ ）<ruby>飲<rt>の</rt></ruby>みません。',
        options: ['A. を / を', 'B. は / は', 'C. が / が', 'D. に / に'],
        correctIndex: 1,
        fullSentence: 'ワイン<strong>は</strong> <ruby>飲<rt>の</rt></ruby>みますが、ビール<strong>は</strong> <ruby>飲<rt>の</rt></ruby>みません。',
        plainSentence: 'ワインは飲みますが、ビールは飲みません。',
        translation: 'Rượu vang thì tôi uống, nhưng bia thì tôi không uống.',
        vocab: [
          { kanji: 'ワイン', hira: 'わいん', romaji: 'wain', type: 'Danh từ', meaning: 'Rượu vang' },
          { kanji: 'ビール', hira: 'びーる', romaji: 'biiru', type: 'Danh từ', meaning: 'Bia' },
          { kanji: '飲みます', hira: 'のみます', romaji: 'nomimasu', type: 'Động từ (Nhóm 1)', meaning: 'Uống' }
        ],
        grammar: 'Để biểu thị sự tương phản, đối chiếu giữa hai vế, ta dùng trợ từ <b>は</b> thay cho <b>を / が</b> ở cả 2 vế. (A thì làm nhưng B thì không làm).'
      },
      {
        id: 'l27-q7',
        question: '<ruby>漢字<rt>かんじ</rt></ruby>が 100ぐらい（ ）。',
        options: ['A. 書きます', 'B. 書けます', 'C. 書けません', 'D. 書きますが'],
        correctIndex: 1,
        fullSentence: '<ruby>漢字<rt>かんじ</rt></ruby>が 100ぐらい <strong><ruby>書<rt>か</rt></ruby>けます</strong>。',
        plainSentence: '漢字が100ぐらい書けます。',
        translation: 'Tôi có thể viết được khoảng 100 chữ Kanji.',
        vocab: [
          { kanji: '漢字', hira: 'かんじ', romaji: 'kanji', type: 'Danh từ', meaning: 'Chữ Hán (Kanji)' },
          { kanji: 'ぐらい', hira: 'ぐらい', romaji: 'gurai', type: 'Phó từ', meaning: 'Khoảng' },
          { kanji: '書けます', hira: 'かけます', romaji: 'kakemasu', type: 'Động từ (Nhóm 1)', meaning: 'Có thể viết - Thể khả năng của 書きます' }
        ],
        grammar: 'Động từ <b>書きます</b> (Nhóm 1) đổi cột <b>い (ki)</b> sang cột <b>え (ke)</b> thành <b>書けます</b>. Đi với trợ từ <b>が</b> phía trước chỉ năng lực.'
      },
      {
        id: 'l27-q8',
        question: '<ruby>隣<rt>となり</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>が うるさいですから、よく（ ）。',
        options: ['A. 寝られました', 'B. 寝られませんでした', 'C. 寝ませんでした', 'D. 寝ません'],
        correctIndex: 1,
        fullSentence: '<ruby>隣<rt>となり</rt></ruby>の <ruby>部屋<rt>へや</rt></ruby>が うるさいですから、よく <strong><ruby>寝<rt>ね</rt></ruby>られませんでした</strong>。',
        plainSentence: '隣の部屋がうるさいですから、よく寝られませんでした。',
        translation: 'Vì phòng bên cạnh ồn ào nên tôi đã không thể ngủ ngon được.',
        vocab: [
          { kanji: '隣', hira: 'となり', romaji: 'tonari', type: 'Danh từ', meaning: 'Bên cạnh' },
          { kanji: '部屋', hira: 'へや', romaji: 'heya', type: 'Danh từ', meaning: 'Căn phòng' },
          { kanji: 'うるさい', hira: 'うるさい', romaji: 'urusai', type: 'Tính từ đuôi i', meaning: 'Ồn ào' },
          { kanji: '寝られませんでした', hira: 'ねられませんでした', romaji: 'neraremasendeshita', type: 'Động từ (Nhóm 2)', meaning: 'Đã không thể ngủ - Thể khả năng phủ định quá khứ của 寝ます' }
        ],
        grammar: 'Vì có nguyên nhân "ồn ào" ở quá khứ nên kết quả là "không thể ngủ" cũng phải chia ở thể khả năng, thời quá khứ, dạng phủ định.'
      },
      {
        id: 'l27-q9',
        question: '<ruby>明日<rt>あした</rt></ruby>は <ruby>用事<rt>ようじ</rt></ruby>が ありますから、パーティーに（ ）。',
        options: ['A. 来られます', 'B. 来られません', 'C. 行きません', 'D. します'],
        correctIndex: 1,
        fullSentence: '<ruby>明日<rt>あした</rt></ruby>は <ruby>用事<rt>ようじ</rt></ruby>が ありますから、パーティーに <strong><ruby>来<rt>こ</rt></ruby>られません</strong>。',
        plainSentence: '明日は用事がありますから、パーティーに来られません。',
        translation: 'Ngày mai tôi có việc bận nên không thể đến bữa tiệc được.',
        vocab: [
          { kanji: '明日', hira: 'あした', romaji: 'ashita', type: 'Danh từ', meaning: 'Ngày mai' },
          { kanji: '用事', hira: 'ようじ', romaji: 'youji', type: 'Danh từ', meaning: 'Việc bận / Việc riêng' },
          { kanji: 'パーティー', hira: 'ぱーてぃー', romaji: 'paatii', type: 'Danh từ', meaning: 'Bữa tiệc' },
          { kanji: '来られません', hira: 'こられません', romaji: 'koraremasen', type: 'Động từ (Nhóm 3)', meaning: 'Không thể đến - Thể khả năng phủ định của 来ます (kimasu)' }
        ],
        grammar: 'Động từ <b>来ます (kimasu)</b> là động từ nhóm 3, khi chuyển sang thể khả năng sẽ thành <b>来られます (koraremasu)</b>. Dạng phủ định là <b>来られません</b>.'
      },
      {
        id: 'l27-q10',
        question: 'あの スーパーで <ruby>日本<rt>にほん</rt></ruby>の <ruby>野菜<rt>やさい</rt></ruby>（ ）<ruby>買<rt>か</rt></ruby>えません。',
        options: ['A. だけ', 'B. しか', 'C. が', 'D. は'],
        correctIndex: 1,
        fullSentence: 'あの スーパーで <ruby>日本<rt>にほん</rt></ruby>の <ruby>野菜<rt>やさい</rt></ruby><strong>しか</strong> <ruby>買<rt>か</rt></ruby>えません。',
        plainSentence: 'あのスーパーで日本の野菜しか買えません。',
        translation: 'Ở siêu thị kia chỉ có thể mua được rau của Nhật Bản (không mua được rau nước khác).',
        vocab: [
          { kanji: '野菜', hira: 'やさい', romaji: 'yasai', type: 'Danh từ', meaning: 'Rau củ' },
          { kanji: '買えません', hira: 'かえません', romaji: 'kaemasen', type: 'Động từ (Nhóm 1)', meaning: 'Không thể mua - Thể khả năng phủ định của 買います' }
        ],
        grammar: 'Khi <b>しか</b> đi với động từ thể khả năng dạng phủ định, nó diễn tả việc "chỉ có thể làm V mà thôi". Trợ từ を được thay thế hoàn toàn bởi しか.'
      }
    ]
  },
  {
    id: 'lesson-28',
    title: 'Bài 28 - Vừa Làm Vừa Làm (～ながら) & Liệt Kê Lý Do (～し、～し)',
    subtitle: 'Minna no Nihongo N4 - Hành động đồng thời và diễn đạt nhiều phẩm chất/lý do',
    level: 'N4',
    questions: [
      {
        id: 'l28-q1',
        question: '<ruby>音楽<rt>おんがく</rt></ruby>を（ ）ながら、<ruby>勉強<rt>べんきょう</rt></ruby>します。',
        options: ['A. 聞きます', 'B. 聞き', 'C. 聞いて', 'D. 聞く'],
        correctIndex: 1,
        fullSentence: '<ruby>音楽<rt>おんがく</rt></ruby>を <strong><ruby>聞<rt>き</rt></ruby>き</strong>ながら、<ruby>勉強<rt>べんきょう</rt></ruby>します。',
        plainSentence: '音楽を聞きながら、勉強します。',
        translation: 'Tôi vừa nghe nhạc vừa học bài.',
        vocab: [
          { kanji: '音楽', hira: 'おんがく', romaji: 'ongaku', type: 'Danh từ', meaning: 'Âm nhạc' },
          { kanji: '聞きながら', hira: 'ききながら', romaji: 'kikinagara', type: 'Động từ + ながら', meaning: 'Vừa nghe vừa...' },
          { kanji: '勉強します', hira: 'べんきょうします', romaji: 'benkyoushimasu', type: 'Động từ', meaning: 'Học tập' }
        ],
        grammar: 'Cấu trúc <b>V-ます (bỏ ます) + ながら</b> mang nghĩa "vừa làm V1 vừa làm V2", trong đó V2 là hành động chính.'
      },
      {
        id: 'l28-q2',
        question: 'ミラーさんは <ruby>親切<rt>しんせつ</rt></ruby>（ ）、<ruby>頭<rt>あたま</rt></ruby>も いいです。',
        options: ['A. だし', 'B. で', 'C. し', 'D. なし'],
        correctIndex: 0,
        fullSentence: 'ミラーさんは <ruby>親切<rt>しんせつ</rt></ruby><strong>だし</strong>、<ruby>頭<rt>あたま</rt></ruby>も いいです。',
        plainSentence: 'ミラーさんは親切だし、頭もいいです。',
        translation: 'Anh Miller vừa tốt bụng lại thông minh nữa.',
        vocab: [
          { kanji: '親切', hira: 'しんせつ', romaji: 'shinsetsu', type: 'Tính từ đuôi na', meaning: 'Thân thiện, tốt bụng' },
          { kanji: '頭がいい', hira: 'あたまがいい', romaji: 'atama ga ii', type: 'Cụm tính từ', meaning: 'Thông minh, sáng dạ' }
        ],
        grammar: 'Cấu trúc <b>～し、～し</b> dùng để liệt kê nhiều đặc điểm, phẩm chất hoặc lý do. Với Tính từ đuôi な và Danh từ ở dạng thông thường là <b>～だし</b>.'
      },
      {
        id: 'l28-q3',
        question: '<ruby>休<rt>やす</rt></ruby>みの <ruby>日<rt>ひ</rt></ruby>は いつも スポーツを（ ）。',
        options: ['A. します', 'B. しています', 'C. したいです', 'D. しました'],
        correctIndex: 1,
        fullSentence: '<ruby>休<rt>やす</rt></ruby>みの <ruby>日<rt>ひ</rt></ruby>は いつも スポーツを <strong>しています</strong>。',
        plainSentence: '休みの日はいつもスポーツをしています。',
        translation: 'Vào ngày nghỉ tôi luôn luôn chơi thể thao.',
        vocab: [
          { kanji: '休みの日', hira: 'やすみのひ', romaji: 'yasumi no hi', type: 'Danh từ', meaning: 'Ngày nghỉ' },
          { kanji: 'スポーツ', hira: 'すぽーつ', romaji: 'supootsu', type: 'Danh từ', meaning: 'Thể thao' },
          { kanji: 'しています', hira: 'しています', romaji: 'shiteimasu', type: 'Động từ', meaning: 'Đang làm / Thường xuyên làm (thói quen)' }
        ],
        grammar: '<b>V-ています</b> ngoài diễn tả hành động đang tiếp diễn, còn dùng để diễn tả một thói quen lặp đi lặp lại thường xuyên trong đời sống.'
      }
    ]
  },
  {
    id: 'lesson-29-30',
    title: 'Bài 29 & 30 - Tự Động Từ & Tha Động Từ (～ています & ～てあります)',
    subtitle: 'Minna no Nihongo N4 - Trạng thái tự nhiên vs Trạng thái có chủ đích của con người',
    level: 'N4',
    questions: [
      {
        id: 'l29-q1',
        question: 'まどが（ ）いますから、<ruby>寒<rt>さむ</rt></ruby>いです。',
        options: ['A. あけて', 'B. あいて', 'C. あきます', 'D. あけた'],
        correctIndex: 1,
        fullSentence: 'まどが <strong>あいて</strong> いますから、<ruby>寒<rt>さむ</rt></ruby>いです。',
        plainSentence: '窓が開いていますから、寒いです。',
        translation: 'Vì cửa sổ đang mở nên trời lạnh.',
        vocab: [
          { kanji: '窓', hira: 'まど', romaji: 'mado', type: 'Danh từ', meaning: 'Cửa sổ' },
          { kanji: '開いています', hira: 'あいています', romaji: 'aiteimasu', type: 'Tự động từ', meaning: 'Đang mở (trạng thái)' },
          { kanji: '寒い', hira: 'さむい', romaji: 'samui', type: 'Tính từ đuôi i', meaning: 'Lạnh' }
        ],
        grammar: '<b>N が Tự động từ-ています</b> diễn tả trạng thái của sự vật hiển hiện trước mắt (Cửa sổ đang mở: 開いています). Khác với Tha động từ 開けます (ai đó mở).'
      },
      {
        id: 'l29-q2',
        question: 'かべに カレンダーが（ ）あります。',
        options: ['A. かけて', 'B. かかって', 'C. かきます', 'D. かけました'],
        correctIndex: 0,
        fullSentence: 'かべに カレンダーが <strong>かけて</strong> あります。',
        plainSentence: '壁にカレンダーが掛けてあります。',
        translation: 'Trên tường có treo một cuốn lịch.',
        vocab: [
          { kanji: '壁', hira: 'かべ', romaji: 'kabe', type: 'Danh từ', meaning: 'Bức tường' },
          { kanji: 'カレンダー', hira: 'かれんだー', romaji: 'karendaa', type: 'Danh từ', meaning: 'Cuốn lịch' },
          { kanji: '掛けてあります', hira: 'かけてあります', romaji: 'kaketearimasu', type: 'Tha động từ + てあります', meaning: 'Được treo (có chủ ý)' }
        ],
        grammar: '<b>N が Tha động từ-てあります</b> diễn tả trạng thái của sự vật là kết quả của một hành động có chủ ý do con người thực hiện với mục đích rõ ràng.'
      },
      {
        id: 'l30-q3',
        question: '<ruby>旅行<rt>りょこう</rt></ruby>の <ruby>前<rt>まえ</rt></ruby>に、ホテルを（ ）おきます。',
        options: ['A. よやくして', 'B. よやくした', 'C. よやくする', 'D. よやくされて'],
        correctIndex: 0,
        fullSentence: '<ruby>旅行<rt>りょこう</rt></ruby>の <ruby>前<rt>まえ</rt></ruby>に、ホテルを <strong>よやくして</strong> おきます。',
        plainSentence: '旅行の前に、ホテルを予約しておきます。',
        translation: 'Trước chuyến du lịch, tôi sẽ đặt phòng khách sạn trước.',
        vocab: [
          { kanji: '旅行', hira: 'りょこう', romaji: 'ryokou', type: 'Danh từ', meaning: 'Du lịch' },
          { kanji: '予約しておきます', hira: 'よやくしておきます', romaji: 'yoyakushiteokimasu', type: 'Động từ + ておきます', meaning: 'Đặt trước' }
        ],
        grammar: '<b>V-ておきます</b> diễn tả việc chuẩn bị sẵn một hành động trước thời điểm diễn ra sự việc hoặc để duy trì trạng thái.'
      }
    ]
  },
  {
    id: 'lesson-31-32',
    title: 'Bài 31 & 32 - Thể Ý Chí, Dự Định & Lời Khuyên (～つもり, ～ほうがいい)',
    subtitle: 'Minna no Nihongo N4 - Thể ý chí (意向形), dự định và lời khuyên sức khỏe / cuộc sống',
    level: 'N4',
    questions: [
      {
        id: 'l31-q1',
        question: 'ちょっと <ruby>休<rt>やす</rt></ruby>（ ）。',
        options: ['A. もう', 'B. もうか', 'C. みましょう', 'D. もうよ'],
        correctIndex: 0,
        fullSentence: 'ちょっと <ruby>休<rt>やす</rt></ruby><strong>もう</strong>。',
        plainSentence: 'ちょっと休もう。',
        translation: 'Nghỉ một chút nào! (Thể thông thường của 休もう)',
        vocab: [
          { kanji: '休もう', hira: 'やすもう', romaji: 'yasumou', type: 'Thể ý chí', meaning: 'Cùng nghỉ ngơi nào' }
        ],
        grammar: 'Thể ý chí (意向形) là dạng thân mật của <b>～ましょう</b>. Động từ nhóm 1 chuyển đuôi hàng い sang hàng お rồi thêm う (やすみます -> やすもう).'
      },
      {
        id: 'l31-q2',
        question: '<ruby>将来<rt>しょうらい</rt></ruby> <ruby>自分<rt>じぶん</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>を（ ）つもりです。',
        options: ['A. つくります', 'B. つくる', 'C. つくった', 'D. つくり'],
        correctIndex: 1,
        fullSentence: '<ruby>将来<rt>しょうらい</rt></ruby> <ruby>自分<rt>じぶん</rt></ruby>の <ruby>会社<rt>かいしゃ</rt></ruby>を <strong>つくる</strong> つもりです。',
        plainSentence: '将来自分の会社を作るつもりです。',
        translation: 'Tương lai tôi dự định sẽ thành lập công ty riêng của mình.',
        vocab: [
          { kanji: '将来', hira: 'しょうらい', romaji: 'shourai', type: 'Danh từ', meaning: 'Tương lai' },
          { kanji: '会社', hira: 'かいしゃ', romaji: 'kaisha', type: 'Danh từ', meaning: 'Công ty' },
          { kanji: '作る', hira: 'つくる', romaji: 'tsukuru', type: 'Động từ thể từ điển', meaning: 'Làm, tạo dựng' }
        ],
        grammar: 'Cấu trúc <b>V-る / V-ない + つもりです</b> dùng để nói về dự định chắc chắn của bản thân.'
      },
      {
        id: 'l32-q3',
        question: '<ruby>熱<rt>ねつ</rt></ruby>が ありますから、お<ruby>風呂<rt>ふろ</rt></ruby>に（ ）ほうがいいです。',
        options: ['A. はいらない', 'B. はいった', 'C. はいる', 'D. はいらなくて'],
        correctIndex: 0,
        fullSentence: '<ruby>熱<rt>ねつ</rt></ruby>が ありますから、お<ruby>風呂<rt>ふろ</rt></ruby>に <strong>はいらない</strong> ほうがいいです。',
        plainSentence: '熱がありますから、お風呂に入らないほうがいいです。',
        translation: 'Vì đang bị sốt nên bạn không nên tắm bồn.',
        vocab: [
          { kanji: '熱', hira: 'ねつ', romaji: 'netsu', type: 'Danh từ', meaning: 'Cơn sốt' },
          { kanji: 'お風呂に入る', hira: 'おふろにはいる', romaji: 'ofuro ni hairu', type: 'Cụm động từ', meaning: 'Tắm bồn' }
        ],
        grammar: 'Lời khuyên không nên làm gì: <b>V-ない + ほうがいいです</b>. Lời khuyên nên làm gì: <b>V-た + ほうがいいです</b>.'
      }
    ]
  },
  {
    id: 'lesson-33-34',
    title: 'Bài 33 & 34 - Thể Mệnh Lệnh, Cấm Chỉ & Làm Theo (～とおりに, ～あとで)',
    subtitle: 'Minna no Nihongo N4 - Mệnh lệnh (命令形), Cấm chỉ (禁止形), Ý nghĩa biển báo và trình tự hành động',
    level: 'N4',
    questions: [
      {
        id: 'l33-q1',
        question: '「立入禁止」は ここに（ ）という意味です。',
        options: ['A. 入るな', 'B. 入る', 'C. 入って', 'D. 入れば'],
        correctIndex: 0,
        fullSentence: '「立入禁止」は ここに <strong>入るな</strong> という意味です。',
        plainSentence: '「立入禁止」はここに入るなという意味です。',
        translation: 'Biển báo "Cấm vào" có nghĩa là "Không được vào đây".',
        vocab: [
          { kanji: '立入禁止', hira: 'たちいりきんし', romaji: 'tachiirikinshi', type: 'Danh từ biển báo', meaning: 'Cấm vào' },
          { kanji: '入るな', hira: 'はいるな', romaji: 'hairu na', type: 'Thể cấm chỉ', meaning: 'Cấm vào!' }
        ],
        grammar: 'Thể cấm chỉ: <b>Động từ thể từ điển + な</b> (Ví dụ: はいる → はいるな!). Mẫu câu giải thích ý nghĩa: <b>～という意味です</b>.'
      },
      {
        id: 'l34-q2',
        question: '<ruby>説明書<rt>せつめいしょ</rt></ruby>の（ ）とおりに、<ruby>組<rt>く</rt></ruby>み<ruby>立<rt>た</rt></ruby>てます。',
        options: ['A. とおりに', 'B. とおりで', 'C. ように', 'D. ために'],
        correctIndex: 0,
        fullSentence: '<ruby>説明書<rt>せつめいしょ</rt></ruby>の <strong>とおりに</strong>、<ruby>組<rt>く</rt></ruby>み<ruby>立<rt>た</rt></ruby>てます。',
        plainSentence: '説明書のとおりに、組み立てます。',
        translation: 'Tôi lắp ráp theo đúng như sách hướng dẫn.',
        vocab: [
          { kanji: '説明書', hira: 'せつめいしょ', romaji: 'setsumeisho', type: 'Danh từ', meaning: 'Sách hướng dẫn' },
          { kanji: '組み立てます', hira: 'くみたてます', romaji: 'kumitatemasu', type: 'Động từ', meaning: 'Lắp ráp' }
        ],
        grammar: '<b>V-る / V-た + とおりに</b> hoặc <b>N の + とおりに</b> mang nghĩa "làm đúng theo như...".'
      },
      {
        id: 'l34-q3',
        question: '<ruby>仕事<rt>しごと</rt></ruby>が（ ）あとで、<ruby>飲<rt>の</rt></ruby>みに <ruby>行<rt>い</rt></ruby>きましょう。',
        options: ['A. おわった', 'B. おわる', 'C. おわって', 'D. おわり'],
        correctIndex: 0,
        fullSentence: '<ruby>仕事<rt>しごと</rt></ruby>が <strong>おわった</strong> あとで、<ruby>飲<rt>の</rt></ruby>みに <ruby>行<rt>い</rt></ruby>きましょう。',
        plainSentence: '仕事が終わったあとで、飲みに行きましょう。',
        translation: 'Sau khi xong việc, chúng mình cùng đi uống nước nhé.',
        vocab: [
          { kanji: '仕事', hira: 'しごと', romaji: 'shigoto', type: 'Danh từ', meaning: 'Công việc' },
          { kanji: '終わった', hira: 'おわった', romaji: 'owatta', type: 'Thể た', meaning: 'Đã xong' }
        ],
        grammar: '<b>V-た + あとで</b> mang nghĩa "Sau khi đã làm xong V1 thì làm V2".'
      }
    ]
  },
  {
    id: 'lesson-35-37',
    title: 'Bài 35, 36 & 37 - Thể Điều Kiện (～ば), Mục Tiêu (～ように) & Bị Động (受身形)',
    subtitle: 'Minna no Nihongo N4 - Câu điều kiện giả định, mục tiêu hướng tới và câu bị động',
    level: 'N4',
    questions: [
      {
        id: 'l35-q1',
        question: 'ボタンを（ ）、<ruby>切符<rt>きっぷ</rt></ruby>が <ruby>出<rt>で</rt></ruby>ます。',
        options: ['A. おせば', 'B. おしたら', 'C. おすと', 'D. おすなら'],
        correctIndex: 0,
        fullSentence: 'ボタンを <strong>おせば</strong>、<ruby>切符<rt>きっぷ</rt></ruby>が <ruby>出<rt>で</rt></ruby>ます。',
        plainSentence: 'ボタンを押せば、切符が出ます。',
        translation: 'Nếu bạn nhấn nút thì vé sẽ ra.',
        vocab: [
          { kanji: 'ボタン', hira: 'ぼたん', romaji: 'botan', type: 'Danh từ', meaning: 'Nút bấm' },
          { kanji: '切符', hira: 'きっぷ', romaji: 'kippu', type: 'Danh từ', meaning: 'Vé xe, vé tàu' }
        ],
        grammar: 'Thể điều kiện <b>～ば</b> của động từ nhóm 1: chuyển hàng う sang hàng え rồi thêm ば (おします -> おす -> おせば).'
      },
      {
        id: 'l36-q2',
        question: '<ruby>早<rt>はや</rt></ruby>く <ruby>泳<rt>およ</rt></ruby>げる（ ）、<ruby>毎日<rt>まいにち</rt></ruby> <ruby>練習<rt>れんしゅう</rt></ruby>しています。',
        options: ['A. ように', 'B. ために', 'C. のに', 'D. ようにして'],
        correctIndex: 0,
        fullSentence: '<ruby>早<rt>はや</rt></ruby>く <ruby>泳<rt>およ</rt></ruby>げる <strong>ように</strong>、<ruby>毎日<rt>まいにち</rt></ruby> <ruby>練習<rt>れんしゅう</rt></ruby>しています。',
        plainSentence: '早く泳げるように、毎日練習しています。',
        translation: 'Để có thể bơi nhanh, mỗi ngày tôi đều luyện tập.',
        vocab: [
          { kanji: '泳げる', hira: 'およげる', romaji: 'oyogeru', type: 'Thể khả năng', meaning: 'Có thể bơi' },
          { kanji: '練習しています', hira: 'れんしゅうしています', romaji: 'renshuushiteimasu', type: 'Động từ', meaning: 'Đang luyện tập' }
        ],
        grammar: '<b>V-khả năng / V-không có ý chí + ように</b> biểu thị mục tiêu hướng tới. Phân biệt với <b>ために</b> (đi với động từ có chủ ý).'
      },
      {
        id: 'l37-q3',
        question: '<ruby>電車<rt>でんしゃ</rt></ruby>の <ruby>中<rt>なか</rt></ruby>で <ruby>足<rt>あし</rt></ruby>を（ ）。',
        options: ['A. ふまれました', 'B. ふみました', 'C. ふまさせました', 'D. ふかれました'],
        correctIndex: 0,
        fullSentence: '<ruby>電車<rt>でんしゃ</rt></ruby>の <ruby>中<rt>なか</rt></ruby>で <ruby>足<rt>あし</rt></ruby>を <strong>ふまれました</strong>。',
        plainSentence: '電車の中で足をふまれました。',
        translation: 'Tôi bị dẫm vào chân ở trên tàu điện.',
        vocab: [
          { kanji: '電車', hira: 'でんしゃ', romaji: 'densha', type: 'Danh từ', meaning: 'Tàu điện' },
          { kanji: '足', hira: 'あし', romaji: 'ashi', type: 'Danh từ', meaning: 'Bàn chân' },
          { kanji: '踏まれました', hira: 'ふまれました', romaji: 'fumaremashita', type: 'Thể bị động', meaning: 'Bị dẫm, bị giẫm lên' }
        ],
        grammar: 'Thể bị động gián tiếp (chỉ sự phiền hà, thiệt hại): <b>A は B に N を V-（ら）れます</b>. Động từ 踏みます (nhóm 1) đổi hàng い thành hàng あ rồi thêm れます -> ふまれます.'
      }
    ]
  },
  {
    id: 'lesson-48-50',
    title: 'Bài 48, 49 & 50 - Thể Sai Khiến & Kính Ngữ N4 (使役形, 尊敬語, 謙譲語)',
    subtitle: 'Minna no Nihongo N4 - Thể sai khiến, Kính ngữ (Tôn kính ngữ & Khiêm nhường ngữ)',
    level: 'N4',
    questions: [
      {
        id: 'l48-q1',
        question: '<ruby>部長<rt>ぶちょう</rt></ruby>は <ruby>山田<rt>やまだ</rt></ruby>さんに レポートを（ ）。',
        options: ['A. かかせました', 'B. かかれました', 'C. かきました', 'D. かけました'],
        correctIndex: 0,
        fullSentence: '<ruby>部長<rt>ぶちょう</rt></ruby>は <ruby>山田<rt>やまだ</rt></ruby>さんに レポートを <strong>かかせました</strong>。',
        plainSentence: '部長は山田さんにレポートを書かせました。',
        translation: 'Trưởng phòng đã bắt/cho phép anh Yamada viết bản báo cáo.',
        vocab: [
          { kanji: '部長', hira: 'ぶちょう', romaji: 'buchou', type: 'Danh từ', meaning: 'Trưởng phòng' },
          { kanji: '書かせました', hira: 'かかせました', romaji: 'kakasemashita', type: 'Thể sai khiến', meaning: 'Bắt viết / Cho phép viết' }
        ],
        grammar: 'Thể sai khiến (使役形) của động từ nhóm 1: chuyển hàng い sang hàng あ rồi thêm せます (かきます -> かかせます).'
      },
      {
        id: 'l49-q2',
        question: '<ruby>社長<rt>しゃちょう</rt></ruby>は もう お<ruby>帰<rt>かえ</rt></ruby>りに（ ）。',
        options: ['A. しました', 'B. なりました', 'C. くれました', 'D. いただきました'],
        correctIndex: 1,
        fullSentence: '<ruby>社長<rt>しゃちょう</rt></ruby>は もう お<ruby>帰<rt>かえ</rt></ruby>りに <strong>なりました</strong>。',
        plainSentence: '社長はもうお帰りになりました。',
        translation: 'Giám đốc đã về rồi ạ.',
        vocab: [
          { kanji: '社長', hira: 'しゃちょう', romaji: 'shachou', type: 'Danh từ', meaning: 'Giám đốc công ty' },
          { kanji: 'お帰りになります', hira: 'おかえりになります', romaji: 'okaeri ni narimasu', type: 'Tôn kính ngữ', meaning: 'Về (tôn kính ngữ của 帰ります)' }
        ],
        grammar: 'Công thức Tôn kính ngữ thông dụng: <b>お + V-ます (bỏ ます) + になります</b>. Dùng khi nói về hành động của cấp trên, khách hàng.'
      },
      {
        id: 'l50-q3',
        question: '<ruby>私<rt>わたし</rt></ruby>が <ruby>荷物<rt>にもつ</rt></ruby>を お<ruby>持<rt>も</rt></ruby>ち（ ）。',
        options: ['A. になります', 'B. します', 'C. されます', 'D. ください'],
        correctIndex: 1,
        fullSentence: '<ruby>私<rt>わたし</rt></ruby>が <ruby>荷物<rt>にもつ</rt></ruby>を お<ruby>持<rt>も</rt></ruby>ち <strong>します</strong>。',
        plainSentence: '私が荷物をお持ちします。',
        translation: 'Để tôi xách hành lý giúp ngài ạ.',
        vocab: [
          { kanji: '荷物', hira: 'にもつ', romaji: 'nimotsu', type: 'Danh từ', meaning: 'Hành lý, đồ đạc' },
          { kanji: 'お持ちします', hira: 'おもちします', romaji: 'omochi shimasu', type: 'Khiêm nhường ngữ', meaning: 'Cầm, xách giúp (khiêm nhường ngữ của 持ちます)' }
        ],
        grammar: 'Công thức Khiêm nhường ngữ: <b>お + V-ます (bỏ ます) + します</b>. Dùng khi người nói hạ mình để phục vụ hoặc thực hiện hành động liên quan đến đối phương.'
      }
    ]
  }
];

// Helper to get all questions flattened
export const getAllN4Questions = () => {
  const all: QuizQuestion[] = [];
  n4QuizTopics.forEach(topic => {
    if (topic.id !== 'infinite-n4-mode' && topic.id !== 'mock-test-n4') {
      all.push(...topic.questions);
    }
  });
  return all;
};
