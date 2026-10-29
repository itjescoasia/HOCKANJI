/**
 * Japanese Verb Transitivity (Tha động từ - 他動詞 / Tự động từ - 自動詞)
 * Detection, Pair Mapping & Badge Styling Utility
 */

export type VerbTransitivity = 'transitive' | 'intransitive';

export interface VerbPairDetail {
  kanji: string;
  reading: string;
  transitivity: VerbTransitivity;
}

export interface VerbPairResult {
  transitivity: VerbTransitivity;
  counterpart?: VerbPairDetail;
}

// 1. Direct Transitive <-> Intransitive Pair Mapping
// [Intransitive (Tự ĐT), Transitive (Tha ĐT), Intransitive Reading, Transitive Reading]
const VERB_PAIRS_DATA: [string, string, string, string][] = [
  // -く / -かす
  ['乾く', '乾かす', 'かわく', 'かわかす'],
  ['渇く', '渇かす', 'かわく', 'かわかす'],
  ['沸く', '沸かす', 'わく', 'わかす'],
  ['動く', '動かす', 'うごく', 'うごかす'],
  ['鳴く', '鳴かす', 'なく', 'なかす'],
  ['飛ぶ', '飛ばす', 'とぶ', 'とばす'],
  ['減る', '減らす', 'へる', 'へらす'],
  ['散る', '散らす', 'ちる', 'ちらす'],
  ['照る', '照らす', 'てる', 'てらす'],
  ['転がる', '転がす', 'ころがる', 'ころがす'],
  ['散らかる', '散らかす', 'ちらかる', 'ちらかす'],

  // -る / -す
  ['直る', '直す', 'なおる', 'なおす'],
  ['治る', '治す', 'なおる', 'なおす'],
  ['戻る', '戻す', 'もどる', 'もどす'],
  ['残る', '残す', 'のこる', 'のこす'],
  ['回る', '回す', 'まわる', 'まわす'],
  ['渡る', '渡す', 'わたる', 'わたす'],
  ['通る', '通す', 'とおる', 'とおす'],
  ['下りる', '下ろす', 'おりる', 'おろす'],
  ['降りる', '降ろす', 'おりる', 'おろす'],
  ['落つ', '落とす', 'おつ', 'おとす'],
  ['落ちる', '落とす', 'おちる', 'おとす'],
  ['起きる', '起こす', 'おきる', 'おこす'],
  ['出る', '出す', 'でる', 'だす'],
  ['消える', '消す', 'きえる', 'けす'],
  ['冷える', '冷やす', 'ひえる', 'ひやす'],
  ['増える', '増やす', 'ふえる', 'ふやす'],
  ['燃える', '燃やす', 'もえる', 'もやす'],
  ['生える', '生やす', 'はえる', 'はやす'],
  ['枯れる', '枯らす', 'かれる', 'からす'],
  ['濡れる', '濡らす', 'ぬれる', 'ぬらす'],
  ['遅れる', '遅らす', 'おくれる', 'おくらす'],
  ['隠れる', '隠す', 'かくれる', 'かくす'],
  ['倒れる', '倒す', 'たおれる', 'たおす'],
  ['壊れる', '壊す', 'こわれる', 'こわす'],
  ['汚れる', '汚す', 'よごれる', 'よごす'],
  ['こぼれる', 'こぼす', 'こぼれる', 'こぼす'],
  ['乱れる', '乱す', 'みだれる', 'みだす'],
  ['外れる', '外す', 'はずれる', 'はずす'],
  ['外れる', '外す', 'はずれる', 'はずす'],
  ['外れる', '外す', 'はずれる', 'はずす'],
  ['零れる', '零す', 'こぼれる', 'こぼす'],
  ['現れる', '現す', 'あらわれる', 'あらわす'],
  ['表れる', '表す', 'あらわれる', 'あらわす'],
  ['なくなる', 'なくす', 'なくなる', 'なくす'],
  ['亡くなる', '亡くす', 'なくなる', 'なくす'],
  ['無くなる', '無くす', 'なくなる', 'なくす'],

  // -まる / -める
  ['集まる', '集める', 'あつまる', 'あつめる'],
  ['決まる', '決める', 'きまる', 'きめる'],
  ['止まる', '止める', 'とまる', 'とめる'],
  ['留まる', '留める', 'とまる', 'とめる'],
  ['閉まる', '閉める', 'しまる', 'しめる'],
  ['温まる', '温める', 'あたたまる', 'あたためる'],
  ['暖まる', '暖める', 'あたたまる', 'あたためる'],
  ['強まる', '強める', 'つよまる', 'つよめる'],
  ['弱まる', '弱める', 'よわまる', 'よわめる'],
  ['高まる', '高める', 'たかまる', 'たかめる'],
  ['早まる', '早める', 'はやまる', 'はやめる'],
  ['広まる', '広める', 'ひろまる', 'ひろめる'],
  ['深まる', '深める', 'ふかまる', 'ふかめる'],
  ['固まる', '固める', 'かたまる', 'かためる'],
  ['清まる', '清める', 'きよまる', 'きよめる'],
  ['静まる', '静める', 'しずまる', 'しずめる'],
  ['鎮まる', '鎮める', 'しずまる', 'しずめる'],
  ['縮まる', '縮める', 'ちぢまる', 'ちぢめる'],
  ['改まる', '改める', 'あらたまる', 'あらためる'],
  ['治まる', '治める', 'おさまる', 'おさめる'],
  ['収まる', '収める', 'おさまる', 'おさめる'],
  ['納まる', '納める', 'おさまる', 'おさめる'],
  ['極まる', '極める', 'きわまる', 'きわめる'],
  ['まとまる', 'まとめる', 'まとまる', 'まとめる'],
  ['ハマる', 'ハメる', 'はまる', 'はめる'],
  ['嵌まる', '嵌める', 'はまる', 'はめる'],

  // -る / -せる
  ['乗る', '乗せる', 'のる', 'のせる'],
  ['載る', '載せる', 'のる', 'のせる'],
  ['寄る', '寄せる', 'よる', 'よせる'],
  ['合わせる', '合う', 'あわせる', 'あう'],

  // -れる / -る
  ['割れる', '割る', 'われる', 'わる'],
  ['折れる', '折る', 'おれる', 'おる'],
  ['破れる', '破る', 'やぶれる', 'やぶる'],
  ['切れる', '切る', 'きれる', 'きる'],
  ['売れる', '売る', 'うれる', 'うる'],
  ['千切れる', '千切る', 'ちぎれる', 'ちぎる'],

  // -く / -ける
  ['開く', '開ける', 'あく', 'あける'],
  ['届く', '届ける', 'とどく', 'とどける'],
  ['付く', '付ける', 'つく', 'つける'],
  ['点く', '点ける', 'つく', 'つける'],
  ['片付く', '片付ける', 'かたづく', 'かたづける'],
  ['片づく', '片づける', 'かたづく', 'かたづける'],
  ['突く', '突ける', 'つく', 'つける'],
  ['続く', '続ける', 'つづく', 'つづける'],
  ['焼ける', '焼く', 'やける', 'やく'],
  ['抜ける', '抜く', 'ぬける', 'ぬく'],
  ['解ける', '解く', 'とける', 'とく'],
  ['溶ける', '溶かす', 'とける', 'とかす'],
  ['解ける', '解かす', 'とける', 'とかす'],

  // -かる / -ける
  ['見つかる', '見つける', 'みつかる', 'みつける'],
  ['助かる', '助ける', 'たすかる', 'たすける'],
  ['掛かる', '掛ける', 'かかる', 'かける'],
  ['預かる', '預ける', 'あずかる', 'あずける'],

  // -る / -す or -る / -れる
  ['入る', '入れる', 'はいる', 'いれる'],
  ['始まる', '始める', 'はじまる', 'はじめる'],
  ['変わる', '変える', 'かわる', 'かえる'],
  ['並ぶ', '並べる', 'ならぶ', 'ならべる'],
  ['育つ', '育てる', 'そだつ', 'そだてる'],
  ['建つ', '建てる', 'たつ', 'たてる'],
  ['立つ', '立てる', 'たつ', 'たてる'],
  ['剥がれる', '剥がす', 'はがれる', 'はがす'],
  ['驚く', '驚かす', 'おどろく', 'おどろかす'],
  ['見える', '見る', 'みえる', 'みる'],
  ['聞こえる', '聞く', 'きこえる', 'きく'],
  ['伝わる', '伝える', 'つたわる', 'つたえる'],
  ['教わる', '教える', 'おそわる', 'おしえる'],
  ['授かる', '授ける', 'さずかる', 'さずける']
];

// Mapping lookup maps
const TRANSITIVE_PAIRS = new Map<string, VerbPairDetail>();
const INTRANSITIVE_PAIRS = new Map<string, VerbPairDetail>();

VERB_PAIRS_DATA.forEach(([intraK, transK, intraR, transR]) => {
  // Transitive verb points to Intransitive counterpart
  TRANSITIVE_PAIRS.set(transK, { kanji: intraK, reading: intraR, transitivity: 'intransitive' });
  TRANSITIVE_PAIRS.set(transR, { kanji: intraK, reading: intraR, transitivity: 'intransitive' });

  // Intransitive verb points to Transitive counterpart
  INTRANSITIVE_PAIRS.set(intraK, { kanji: transK, reading: transR, transitivity: 'transitive' });
  INTRANSITIVE_PAIRS.set(intraR, { kanji: transK, reading: transR, transitivity: 'transitive' });
});

// Comprehensive Transitive Verbs (Tha động từ - 他動詞)
const TRANSITIVE_VERBS = new Set([
  // Basic & daily verbs
  '食べる', 'たべる',
  '飲む', 'のむ',
  '読む', 'よむ',
  '書く', 'かく',
  '聞く', 'きく',
  '見る', 'みる',
  '話す', 'はなす',
  '言う', 'いう',
  '買う', 'かう',
  '売る', 'うる',
  '待つ', 'まつ',
  '呼ぶ', 'よぶ',
  '教える', 'おしえる',
  '覚える', 'おぼえる',
  '忘れる', 'わすれる',
  '調べる', 'しらべる',
  '考える', 'かんがえる',
  '作る', 'つくる',
  '造る', 'つくる',
  '使う', 'つかう',
  '知る', 'しる',
  '思う', 'おもう',
  '持つ', 'もつ',
  '取る', 'とる',
  '撮る', 'とる',
  '送る', 'おくる',
  '洗う', 'あらう',
  '払う', 'はらう',
  '手伝う', 'てつだう',
  '運ぶ', 'はこぶ',
  '閉じる', 'とじる',
  '押す', 'おす',
  '引く', 'ひく',
  '頼む', 'たのむ',
  '貸す', 'かす',
  '借りる', 'かりる',
  '返す', 'かえす',
  '迎える', 'むかえる',
  '拾う', 'ひろう',
  '捨てる', 'すてる',
  '選ぶ', 'えらぶ',
  '探す', 'さがす',
  '捜す', 'さがす',
  '直す', 'なおす',
  '治す', 'なおす',
  '乾かす', 'かわかす',
  '沸かす', 'わかす',
  '冷やす', 'ひやす',
  '溶かす', 'とかす',
  '起こす', 'おこす',
  '落とす', 'おとす',
  '動かす', 'うごかす',
  '壊す', 'こわす',
  '出す', 'だす',
  '入れる', 'いれる',
  '始める', 'はじめる',
  '止める', 'とめる',
  '閉める', 'しめる',
  '開ける', 'あける',
  'つける', '点ける', '付ける',
  '消す', 'けす',
  '汚す', 'よごす',
  '残す', 'のこす',
  '倒す', 'たおす',
  '割る', 'わる',
  '折る', 'おる',
  '破る', 'やぶる',
  '助ける', 'たすける',
  '届ける', 'とどける',
  '戻す', 'もどす',
  '鳴らす', 'ならす',
  '見つける', 'みつける',
  '集める', 'あつめる',
  '変える', 'かえる',
  '決める', 'きめる',
  '続ける', 'つづける',
  '減らす', 'へらす',
  '増やす', 'ふやす',
  '並べる', 'ならべる',
  '育てる', 'そだてる',
  '濡らす', 'ぬらす',
  '散らかす', 'ちらかす',
  '片づける', 'かたづける',
  '片付ける', 'かたづける',
  '預ける', 'あずける',
  '驚かす', 'おどろかす',
  '剥がす', 'はがす',
  '散らす', 'ちらす',
  '転がす', 'ころがす',
  'こぼす', '零す', '溢す',
  '切る', 'きる',
  '建てる', 'たてる',
  '立てる', 'たてる',
  '見せる', 'みせる',
  '掛ける', 'かける',
  '乗せる', 'のせる',
  '載せる', 'のせる',
  '渡す', 'わたす',
  '下ろす', 'おろす',
  '降ろす', 'おろす',
  '外す', 'はずす',
  'なくす', '無くす', '亡くす',
  '見送る', 'みおくる',
  '受ける', 'うける',
  '愛する', 'あいする',
  '守る', 'まもる',
  '信じる', 'しんじる',
  '望む', 'のぞむ',
  '祈る', 'いのる',
  '願う', 'ねがう',
  '許す', 'ゆるす',
  '断る', 'ことわる',
  '断ち切る', 'たちきる',
  '奪う', 'うばう',
  '与える', 'あたえる',
  '受け取る', 'うけとる',
  '支える', 'ささえる',
  '抱く', 'だく',
  '抱える', 'かかえる',
  '握る', 'にぎる',
  '掴む', 'つかむ',
  '踏む', 'ふむ',
  '蹴る', 'ける',
  '殴る', 'なぐる',
  '叩く', 'たたく',
  '撫でる', 'なでる',
  '包む', 'つつむ',
  '覆う', 'おおう',
  '敷く', 'しく',
  '注ぐ', 'つぐ', 'そそぐ',
  '撒く', 'まく',
  '植える', 'うえる',
  '刈る', 'かる',
  '掘る', 'ほる',
  '埋める', 'うめる',
  '塞ぐ', 'ふさぐ',
  '積む', 'つむ',
  '重ねる', 'かさねる',
  '削る', 'けずる',
  '磨く', 'みがく',
  '拭く', 'ふく',
  '縛る', 'しばる',
  '結ぶ', 'むすぶ',
  '繋ぐ', 'つなぐ',
  '縫う', 'ぬう',
  '編む', 'あむ',
  '織る', 'おる',
  '染める', 'そめる',
  '塗る', 'ぬる',
  '貼る', 'はる',
  '剥く', 'むく',
  '刻む', 'きざむ',
  '砕く', 'くだく',
  '潰す', 'つぶす',
  '挟む', 'はさむ',
  '絞る', 'しぼる',
  '搾る', 'しぼる',
  'すする', '啜る',
  '噛む', 'かむ',
  '舐める', 'なめる',
  '味わう', 'あじわう',
  '嗅ぐ', 'かぐ',
  '睨む', 'にらむ',
  '見つめる', 'みつめる',
  '見上げる', 'みあげる',
  '見下ろす', 'みおろす',
  '見渡す', 'みわたす',
  '見失う', 'みうしなう',
  '見極める', 'みきわめる',
  '見抜く', 'みぬく',
  '聞き取る', 'ききとる',
  '聞き流す', 'ききながす',
  '打ち明ける', 'うちあける',
  '告げる', 'つげる',
  '述べる', 'のべる',
  '語る', 'かたる',
  '説く', 'とく',
  '諭す', 'さとす',
  '促す', 'うながす',
  '指す', 'さす',
  '示す', 'しめす',
  '表す', 'あらわす',
  '描く', 'えがく', 'かく',
  '写す', 'うつす',
  '映す', 'うつす',
  '録音する', 'ろくおんする',
  '録画する', 'ろくがする',
  '企む', 'たくらむ',
  '企てる', 'くわだてる',
  '計画する', 'けいかくする',
  '約束する', 'やくそくする',
  '契約する', 'けいやくする',
  '用意する', 'よういする',
  '準備する', 'じゅんびする'
]);

// Comprehensive Intransitive Verbs (Tự động từ - 自動詞)
const INTRANSITIVE_VERBS = new Set([
  // Basic movement & state
  '行く', 'いく',
  '来る', 'くる',
  '帰る', 'かえる',
  '歩く', 'あるく',
  '走る', 'はしる',
  '泳ぐ', 'およぐ',
  '座る', 'すわる',
  '立つ', 'たつ',
  '寝る', 'ねる',
  '起きる', 'おきる',
  '休む', 'やすむ',
  '住む', 'すむ',
  '通う', 'かよう',
  '働く', 'はたらく',
  '死ぬ', 'しぬ',
  '生きる', 'いきる',
  '咲く', 'さく',
  '泣く', 'なく',
  '笑う', 'わらう',
  '困る', 'こまる',
  '迷う', 'まよう',
  '驚く', 'おどろく',
  '喜ぶ', 'よろこぶ',
  '怒る', 'おこる',
  '急ぐ', 'いそぐ',
  '間に合う', 'まにあう',
  '遅れる', 'おくれる',
  '勝つ', 'かつ',
  '負ける', 'まける',
  '太る', 'ふとる',
  '痩せる', 'やせる',
  '晴れる', 'はれる',
  '曇る', 'くもる',
  '降る', 'ふる',
  '吹く', 'ふく',
  '止む', 'やむ',
  '滑る', 'すべる',
  '光る', 'ひかる',
  '鳴る', 'なる',
  '響く', 'ひびく',
  '乾く', 'かわく',
  '渇く', 'かわく',
  '沸く', 'わく',
  '冷える', 'ひえる',
  '溶ける', 'とける',
  '解ける', 'とける',
  '落ちる', 'おちる',
  '動く', 'うごく',
  '壊れる', 'こわれる',
  '直る', 'なおる',
  '治る', 'なおる',
  '出る', 'でる',
  '入る', 'はいる',
  '始まる', 'はじまる',
  '止まる', 'とまる',
  '閉まる', 'しまる',
  '開く', 'あく',
  'つく', '点く', '付く',
  '消える', 'きえる',
  '汚れる', 'よごれる',
  '残る', 'のこる',
  '倒れる', 'たおれる',
  '割れる', 'われる',
  '折れる', 'おれる',
  '破れる', 'やぶれる',
  '助かる', 'たすかる',
  '届く', 'とどく',
  '戻る', 'もどる',
  '見つかる', 'みつかる',
  '集まる', 'あつまる',
  '変わる', 'かわる',
  '決まる', 'きまる',
  '続く', 'つづく',
  '減る', 'へる',
  '増える', 'ふえる',
  '並ぶ', 'ならぶ',
  '育つ', 'そだつ',
  '濡れる', 'ぬれる',
  '散らかる', 'ちらかる',
  '片づく', 'かたづく',
  '片付く', 'かたづく',
  '預かる', 'あずかる',
  '剥がれる', 'はがれる',
  '散る', 'ちる',
  '転がる', 'ころがる',
  'こぼれる', '零れる', '溢れる',
  '切れる', 'きれる',
  '建つ', 'たつ',
  '見える', 'みえる',
  '聞こえる', 'きこえる',
  '掛かる', 'かかる',
  '乗る', 'のる',
  '載る', 'のる',
  '渡る', 'わたる',
  '下りる', 'おりる',
  '降りる', 'おりる',
  '外れる', 'はずれる',
  'なくなる', '無くなる', '亡くなる',
  '飛ぶ', 'とぶ',
  '跳ぶ', 'とぶ',
  '沈む', 'しずむ',
  '浮く', 'うく',
  '溺れる', 'おぼれる',
  '流れる', 'ながれる',
  '溢れる', 'あふれる',
  '溢れる', 'こぼれる',
  '凍る', 'こおる',
  '蒸発する', 'じょうはつする',
  '乾く', 'かわく',
  '湿る', 'しめる',
  '濁る', 'にごる',
  '澄む', 'すむ',
  '荒れる', 'あれる',
  '揺れる', 'ゆれる',
  '震える', 'ふるえる',
  '崩れる', 'くずれる',
  '潰れる', 'つぶれる',
  '砕ける', 'くだける',
  '裂ける', 'さける',
  '千切れる', 'ちぎれる',
  '縮む', 'ちぢむ',
  '伸びる', 'のびる',
  '膨らむ', 'ふくらむ',
  '尖る', 'とがる',
  '狂う', 'くるう',
  '歪む', 'ゆがむ',
  '傾く', 'かたむく',
  '捻れる', 'ねじれる',
  '逸れる', 'それる',
  '外れる', 'はずれる',
  '逸脱する', 'いつだつする',
  '外れる', 'はずれる',
  '出会う', 'であう',
  'ぶつかる', '打つかる',
  'すれ違う', 'すれちがう',
  '追いつく', 'おいつく',
  '及ぶ', 'およぶ',
  '至る', 'いたる',
  '達する', 'たっする',
  '留まる', 'とどまる',
  '留まる', 'とまる',
  '佇む', 'たたずむ',
  '潜む', 'ひそむ',
  '隠れる', 'かくれる',
  '現れる', 'あらわれる',
  '消え去る', 'きえさる',
  '滅びる', 'ほろびる',
  '衰える', 'おとろえる',
  '栄える', 'さかえる',
  '繁盛する', 'はんじょうする',
  '進む', 'すすむ',
  '退く', 'しりぞく',
  '登る', 'のぼる',
  '上る', 'のぼる',
  '昇る', 'のぼる',
  '降る', 'くだる',
  '這う', 'はう',
  '滑る', 'すべる',
  '躓く', 'つまずく',
  '転ぶ', 'ころぶ'
]);

/**
 * Detects whether a verb is a Transitive (Tha động từ) or Intransitive (Tự động từ) verb.
 */
export function getVerbTransitivity(
  kanji?: string,
  reading?: string,
  meaning?: string,
  wordType?: string
): VerbTransitivity | null {
  const combined = `${wordType || ''} ${meaning || ''}`.toLowerCase();

  // 1. Explicit mention in wordType or meaning
  if (
    combined.includes('tha động từ') ||
    combined.includes('tha đt') ||
    combined.includes('tha động') ||
    combined.includes('他動詞') ||
    combined.includes('(tha)') ||
    combined.includes('tha:') ||
    combined.includes('transitive')
  ) {
    return 'transitive';
  }

  if (
    combined.includes('tự động từ') ||
    combined.includes('tự đt') ||
    combined.includes('tự động') ||
    combined.includes('自動詞') ||
    combined.includes('(tự)') ||
    combined.includes('tự:') ||
    combined.includes('intransitive')
  ) {
    return 'intransitive';
  }

  // 2. Dictionary lookup by kanji or reading
  const cleanKanji = (kanji || '').trim();
  const cleanReading = (reading || '').trim();

  if (cleanKanji && TRANSITIVE_PAIRS.has(cleanKanji)) return 'transitive';
  if (cleanReading && TRANSITIVE_PAIRS.has(cleanReading)) return 'transitive';
  if (cleanKanji && INTRANSITIVE_PAIRS.has(cleanKanji)) return 'intransitive';
  if (cleanReading && INTRANSITIVE_PAIRS.has(cleanReading)) return 'intransitive';

  if (cleanKanji && TRANSITIVE_VERBS.has(cleanKanji)) return 'transitive';
  if (cleanReading && TRANSITIVE_VERBS.has(cleanReading)) return 'transitive';
  if (cleanKanji && INTRANSITIVE_VERBS.has(cleanKanji)) return 'intransitive';
  if (cleanReading && INTRANSITIVE_VERBS.has(cleanReading)) return 'intransitive';

  // 3. Morphological heuristics for Japanese verb forms
  const isVerbContext = (wordType || '').includes('Động từ') || !wordType;

  if (isVerbContext) {
    // Verbs ending in -かす / -わかす / -やす / -おす / -がす / -す (e.g. 乾かす, 冷やす, 沸かす, 落とす)
    if (
      cleanKanji.endsWith('かす') || cleanReading.endsWith('かす') ||
      cleanKanji.endsWith('わかす') || cleanReading.endsWith('わかす') ||
      cleanKanji.endsWith('やす') || cleanReading.endsWith('やす') ||
      cleanKanji.endsWith('おす') || cleanReading.endsWith('おす') ||
      cleanKanji.endsWith('がす') || cleanReading.endsWith('がす') ||
      cleanKanji.endsWith('す') || cleanReading.endsWith('す')
    ) {
      return 'transitive';
    }

    // Verbs ending in -まる (e.g. 集まる, 止まる, 閉まる, 温まる)
    if (cleanKanji.endsWith('まる') || cleanReading.endsWith('まる')) {
      return 'intransitive';
    }

    // Verbs ending in -める (e.g. 集める, 止める, 閉める, 温める)
    if (cleanKanji.endsWith('める') || cleanReading.endsWith('める')) {
      return 'transitive';
    }

    // Verbs ending in -れる paired with action (e.g. 壊れる, 割れる, 倒れる, 折れる)
    if (cleanKanji.endsWith('れる') || cleanReading.endsWith('れる')) {
      return 'intransitive';
    }
  }

  // 4. Vietnamese Semantic Clues in Meaning
  const cleanM = (meaning || '').toLowerCase();
  if (isVerbContext && cleanM) {
    // Transitive clues
    if (
      cleanM.startsWith('làm ') ||
      cleanM.includes(' làm ') ||
      cleanM.includes('khiến ') ||
      cleanM.includes('bắt ') ||
      cleanM.includes('cho vào') ||
      cleanM.includes('lấy ra') ||
      cleanM.includes('mở (cửa') ||
      cleanM.includes('đóng (cửa') ||
      cleanM.includes('bật (đèn') ||
      cleanM.includes('tắt (đèn') ||
      cleanM.startsWith('ăn ') ||
      cleanM.startsWith('uống ') ||
      cleanM.startsWith('đọc ') ||
      cleanM.startsWith('viết ') ||
      cleanM.startsWith('mua ') ||
      cleanM.startsWith('bán ') ||
      cleanM.startsWith('xem ') ||
      cleanM.startsWith('nghe ') ||
      cleanM.startsWith('nấu ') ||
      cleanM.startsWith('học ') ||
      cleanM.startsWith('dạy ')
    ) {
      return 'transitive';
    }

    // Intransitive clues
    if (
      cleanM.startsWith('tự ') ||
      cleanM.includes(' tự ') ||
      cleanM.startsWith('bị ') ||
      cleanM.includes(' bị ') ||
      cleanM.startsWith('được ') ||
      cleanM.includes('đi lại') ||
      cleanM.startsWith('chạy') ||
      cleanM.startsWith('bơi') ||
      cleanM.startsWith('ngủ') ||
      cleanM.startsWith('thức') ||
      cleanM.startsWith('ngồi') ||
      cleanM.startsWith('đứng') ||
      cleanM.startsWith('ở ') ||
      cleanM.startsWith('sống') ||
      cleanM.startsWith('chết') ||
      cleanM.includes('rơi') ||
      cleanM.includes('rụng') ||
      cleanM.includes('chảy')
    ) {
      return 'intransitive';
    }
  }

  return null;
}

/**
 * Returns verb transitivity and counterpart pair detail if known
 */
export function getVerbPairInfo(
  kanji?: string,
  reading?: string,
  meaning?: string,
  wordType?: string
): VerbPairResult | null {
  const transitivity = getVerbTransitivity(kanji, reading, meaning, wordType);
  if (!transitivity) return null;

  const cleanKanji = (kanji || '').trim();
  const cleanReading = (reading || '').trim();

  let counterpart: VerbPairDetail | undefined;

  if (transitivity === 'transitive') {
    counterpart = TRANSITIVE_PAIRS.get(cleanKanji) || TRANSITIVE_PAIRS.get(cleanReading);
  } else {
    counterpart = INTRANSITIVE_PAIRS.get(cleanKanji) || INTRANSITIVE_PAIRS.get(cleanReading);
  }

  return { transitivity, counterpart };
}

/**
 * Extracts the base group name (e.g. "Động từ nhóm I") from wordType
 * even if it contains "(Tha động từ)" or "(Tự động từ)".
 */
export function getBaseWordType(wordType?: string): string {
  if (!wordType) return '';
  return wordType.replace(/\s*\([^)]*(tha|tự|động từ|transitive|intransitive)[^)]*\)/gi, '').trim();
}

/**
 * Badge styling for Transitivity
 */
export function getTransitivityBadgeStyle(transitivity: VerbTransitivity): string {
  if (transitivity === 'transitive') {
    return 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/35 whitespace-nowrap shadow-2xs';
  }
  return 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/35 whitespace-nowrap shadow-2xs';
}

/**
 * Badge label for Transitivity
 */
export function getTransitivityBadgeLabel(transitivity: VerbTransitivity): string {
  return transitivity === 'transitive' ? 'Tha động từ' : 'Tự động từ';
}

/**
 * Detailed description for helper tooltip or banner
 */
export function getTransitivityDescription(transitivity: VerbTransitivity): string {
  if (transitivity === 'transitive') {
    return 'Tha động từ (他動詞): Hành động có chủ ý tác động lên đối tượng/tân ngữ, thường đi với trợ từ を.';
  }
  return 'Tự động từ (自動詞): Diễn tả trạng thái hoặc hành động tự thân của chủ ngữ/sự vật, thường đi với trợ từ が.';
}
