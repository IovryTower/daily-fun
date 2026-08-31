// 摸鱼猜词：词库 + 关联度算法
// 语义相似度主力 = 词林(哈工大同义词词林扩展版)编码树距离，build 时生成 public/data/cilin-index.json，
// 浏览器加载后经 initCilinIndex 注入；未加载或目标词不在词林时回退字符/主题簇逻辑。

export interface ThemeGroup {
  name: string;
  emoji: string;
  words: string[];
}

export const THEMES: ThemeGroup[] = [
  { name: '水果', emoji: '🍎', words: ['苹果', '香蕉', '橙子', '葡萄', '西瓜', '草莓', '菠萝', '桃子', '梨子', '柠檬', '樱桃', '芒果', '哈密瓜', '山竹', '火龙果', '猕猴桃'] },
  { name: '动物', emoji: '🐱', words: ['猫', '狗', '兔子', '老虎', '大象', '熊猫', '猴子', '狐狸', '狮子', '长颈鹿', '企鹅', '海豚', '绵羊', '袋鼠', '刺猬', '鹦鹉'] },
  { name: '食物', emoji: '🍜', words: ['米饭', '面条', '饺子', '包子', '火锅', '汉堡', '披萨', '炒饭', '汤圆', '粽子', '馒头', '豆腐', '油条', '煎饼', '麻辣烫', '蛋炒饭'] },
  { name: '饮品', emoji: '☕', words: ['奶茶', '咖啡', '可乐', '果汁', '牛奶', '绿茶', '啤酒', '豆浆', '雪碧', '蜂蜜水', '柠檬茶', '酸奶', '拿铁', '椰子水', '橙汁', '酸梅汤'] },
  { name: '颜色', emoji: '🎨', words: ['红色', '蓝色', '绿色', '黄色', '黑色', '白色', '紫色', '橙色', '粉色', '灰色', '青色', '金色', '深蓝', '浅粉', '茶色', '墨绿'] },
  { name: '自然', emoji: '🌿', words: ['太阳', '月亮', '星星', '云朵', '彩虹', '大海', '森林', '瀑布', '火山', '草原', '池塘', '沙漠', '海浪', '山丘', '雨林', '极光'] },
  { name: '科技', emoji: '💻', words: ['电脑', '手机', '键盘', '鼠标', '网络', '芯片', '机器人', '屏幕', '耳机', '摄像头', '硬盘', '蓝牙', '平板', '路由器', '显示器', '音箱'] },
  { name: '运动', emoji: '⚽', words: ['足球', '篮球', '游泳', '跑步', '乒乓球', '羽毛球', '跳绳', '滑雪', '滑板', '自行车', '拳击', '射箭', '瑜伽', '登山', '泰拳', '马拉松'] },
  { name: '情绪', emoji: '😊', words: ['开心', '难过', '愤怒', '害怕', '惊喜', '自豪', '无聊', '兴奋', '平静', '焦虑', '满足', '尴尬', '害羞', '感激', '嫉妒', '困惑'] },
  { name: '职业', emoji: '👨‍💻', words: ['医生', '老师', '警察', '厨师', '司机', '程序员', '护士', '律师', '设计师', '记者', '歌手', '飞行员', '演员', '编辑', '画家', '商人'] },
  { name: '交通', emoji: '🚗', words: ['汽车', '火车', '地铁', '飞机', '轮船', '公交', '出租车', '摩托车', '高铁', '电车', '三轮车', '电瓶车', '轮渡', '缆车', '游船', '马车'] },
  { name: '乐器', emoji: '🎸', words: ['钢琴', '吉他', '小提琴', '鼓', '笛子', '琵琶', '古筝', '萨克斯', '手风琴', '二胡', '贝斯', '口琴', '大提琴', '架子鼓', '尤克里里', '长笛'] },
  { name: '文具', emoji: '✏️', words: ['铅笔', '钢笔', '橡皮', '尺子', '书包', '笔记本', '圆规', '剪刀', '胶水', '订书机', '文具盒', '蜡笔', '画笔', '彩铅', '修正带', '回形针'] },
  { name: '家电', emoji: '🏠', words: ['电视', '冰箱', '洗衣机', '空调', '微波炉', '电饭煲', '风扇', '吸尘器', '烤箱', '吹风机', '扫地机', '热水器', '咖啡机', '榨汁机', '加湿器', '空气净化器'] },
  { name: '天气', emoji: '⛅', words: ['晴天', '阴天', '下雨', '下雪', '刮风', '打雷', '起雾', '冰雹', '台风', '暴雨', '闪电', '闷热', '寒冷', '凉爽', '潮湿', '干燥'] },
  { name: '节日', emoji: '🎉', words: ['春节', '元宵节', '端午节', '中秋节', '七夕', '清明节', '国庆节', '劳动节', '元旦', '除夕', '重阳节', '腊八', '万圣节', '圣诞节', '儿童节', '母亲节'] },
  { name: '建筑', emoji: '🏛️', words: ['高楼', '大桥', '城堡', '宫殿', '寺庙', '灯塔', '凉亭', '隧道', '教堂', '别墅', '拱桥', '大厦', '四合院', '水塔', '阁楼', '码头'] },
  { name: '服装', emoji: '👕', words: ['T恤', '衬衫', '牛仔裤', '裙子', '外套', '毛衣', '帽子', '皮鞋', '运动鞋', '袜子', '手套', '泳衣', '睡衣', '背心', '皮带', '围巾'] },
  { name: '星座', emoji: '✨', words: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'] },
  { name: '游戏', emoji: '🎮', words: ['王者荣耀', '原神', '斗地主', '麻将', '象棋', '围棋', '五子棋', '跳棋', '扑克牌', '俄罗斯方块', '愤怒的小鸟', '我的世界'] },
];

// 语义联想锚点：词库外或跨域的特指词 → 目标词的预设分数（词林没有的现代词/网络词优先于此）
export const ASSOCIATIONS: Record<string, [string, number][]> = {
  '苹果': [['红富士', 92], ['青苹果', 86], ['乔布斯', 78]],
  '西瓜': [['麒麟瓜', 90], ['解暑', 56]],
  '香蕉': [['芭蕉', 88]],
  '橙子': [['脐橙', 90]],
  '熊猫': [['国宝', 92], ['团子', 82]],
  '猫': [['猫咪', 90], ['喵星人', 84]],
  '狗': [['狗狗', 90]],
  '火锅': [['鸳鸯锅', 92], ['串串香', 84]],
  '饺子': [['水饺', 90], ['馄饨', 78]],
  '汤圆': [['元宵', 88]],
  '奶茶': [['珍珠奶茶', 92], ['奶盖', 86], ['下午茶', 68]],
  '啤酒': [['扎啤', 88]],
  '太阳': [['阳光', 90]],
  '月亮': [['嫦娥', 84], ['圆月', 88]],
  '大海': [['海洋', 90]],
  '电脑': [['台式机', 90]],
  '手机': [['智能手机', 90], ['苹果手机', 86]],
  '足球': [['世界杯', 86]],
  '篮球': [['NBA', 86]],
  '跑步': [['马拉松', 84]],
  '开心': [['快乐', 92], ['高兴', 90]],
  '难过': [['伤心', 92]],
  '程序员': [['码农', 92], ['敲代码', 86]],
  '医生': [['大夫', 90]],
  '老师': [['教师', 90]],
  '春节': [['过年', 92]],
  '端午节': [['赛龙舟', 90]],
  '中秋节': [['月饼', 90]],
  '暴雨': [['雷阵雨', 86], ['洪水', 80]],
  '狮子座': [['狮子', 74], ['狮王', 70]],
  '王者荣耀': [['打野', 80]],
};

// 词库外短语映射：输入包含某个词库词时，取最长者（如"踢足球"→"足球"）
function bestSubstringMatch(input: string): string | null {
  const matches = THEMES.flatMap((t) => t.words).filter((w) => input.includes(w));
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.length - a.length)[0];
}

// 联想锚点：输入命中目标词的联想表（精确或作为子串）→ 返回预设分数；否则 null
function matchAssociation(input: string, target: string): number | null {
  const assoc = ASSOCIATIONS[target];
  if (!assoc) return null;
  const exact = assoc.find(([w]) => w === input);
  if (exact) return exact[1];
  const sub = assoc.find(([w]) => w.length >= 2 && input.includes(w));
  if (sub) return sub[1];
  return null;
}

const ALL_WORDS = new Set(THEMES.flatMap((t) => t.words));

function themeOf(word: string): ThemeGroup | undefined {
  return THEMES.find((t) => t.words.includes(word));
}

// 字符 n-gram Jaccard 相似度（词林覆盖不到时兜底）
function charSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const grams = (s: string, n: number) => {
    const set = new Set<string>();
    for (let i = 0; i + n <= s.length; i++) set.add(s.slice(i, i + n));
    return set;
  };
  const uniA = grams(a, 1), uniB = grams(b, 1);
  const biA = grams(a, 2), biB = grams(b, 2);
  const jac = (x: Set<string>, y: Set<string>) => {
    if (x.size === 0 && y.size === 0) return 0;
    let inter = 0;
    for (const g of x) if (y.has(g)) inter++;
    const union = x.size + y.size - inter;
    return union === 0 ? 0 : inter / union;
  };
  return 0.6 * jac(uniA, uniB) + 0.4 * jac(biA, biB);
}

// ── 词林编码树相似度 ──────────────────────────────────────────────
// 索引格式：{ 词: ["Aa01A01=", ...] }，编码后缀 = 同义 / # 相关 / @ 独立
let CILIN_INDEX: Record<string, string[]> | null = null;

export function initCilinIndex(idx: Record<string, string[]> | null): void {
  CILIN_INDEX = idx;
}
export function isCilinLoaded(): boolean {
  return CILIN_INDEX !== null;
}

// 两个词林的编码串的相似度（0-1）。同编码：= 义项 0.96 / # 相关 0.86；否则按前缀逐层推断
function codeSim(a: string, b: string): number {
  if (a === b) {
    if (a.endsWith('=')) return 0.96;
    if (a.endsWith('#')) return 0.86;
    return 0.9; // @ 独立词（同编码通常即同词，已被 100 短路）
  }
  const A = a.slice(0, -1);
  const B = b.slice(0, -1);
  if (A[0] !== B[0]) return 0.1; // 不同大类
  if (A[1] !== B[1]) return 0.25; // 同类不同中类
  if (A.slice(2, 4) !== B.slice(2, 4)) return 0.45; // 同中类不同小类
  if (A[4] !== B[4]) return 0.62; // 同小类不同词群
  return 0.82; // 同词群，仅义项序号不同
}

// 取自两个词在词林中的最大编码对相似度；任一侧无编码返回 null
function cilinSimRaw(a: string, b: string): number | null {
  if (!CILIN_INDEX) return null;
  const ca = CILIN_INDEX[a];
  const cb = CILIN_INDEX[b];
  if (!ca || !cb) return null;
  let best = 0;
  for (const x of ca) {
    for (const y of cb) {
      const s = codeSim(x, y);
      if (s > best) best = s;
    }
  }
  return best;
}

export function pickTarget(): string {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  return theme.words[Math.floor(Math.random() * theme.words.length)];
}

// 以日期为种子的目标词：当天所有玩家同一题，跨天翻新
export function hashDate(date = new Date()): number {
  const s = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickDailyTarget(date = new Date()): string {
  const h = hashDate(date);
  const theme = THEMES[h % THEMES.length];
  const w = (h >>> 8) % theme.words.length;
  return theme.words[w];
}

export function getHint(target: string): { themeName: string; emoji: string; length: number } {
  const theme = THEMES.find((t) => t.words.includes(target))!;
  return { themeName: theme.name, emoji: theme.emoji, length: target.length };
}

// 核心：输入词与目标词的关联度（0-100，确定性无随机）
export function calcRelation(input: string, target: string): number {
  const inputNorm = input.trim();
  if (!inputNorm) return 0;
  if (inputNorm === target) return 100;

  // 1. 语义锚点联想（词林没有的现代词/网络词在这里拿高分）
  const assocScore = matchAssociation(inputNorm, target);
  if (assocScore !== null) return assocScore;

  // 2. 词库外短语映射到词库词（"踢足球"→"足球"）
  const inLib = ALL_WORDS.has(inputNorm);
  let base = inLib ? inputNorm : bestSubstringMatch(inputNorm) ?? inputNorm;
  if (base === target) return 100;

  // 3. 主题簇 + 字符兜底分
  let score: number;
  const baseTheme = themeOf(base);
  const tTheme = themeOf(target);
  if (baseTheme && tTheme && baseTheme.name === tTheme.name) {
    score = 42 + charSimilarity(base, target) * 55; // 同簇 42-88
  } else if (baseTheme) {
    score = 6 + charSimilarity(base, target) * 18; // 跨簇 ≤24
  } else {
    score = Math.min(35, charSimilarity(base, target) * 40); // 词库外兜底
  }
  score = Math.min(score, baseTheme && tTheme && baseTheme.name === tTheme.name ? 88 : baseTheme ? 24 : 35);

  // 4. 词林通用语义增强：两词都在词林时取较大者，跨主题的语义相关（如 奶茶→咖啡）
  const c = cilinSimRaw(base, target);
  if (c !== null) {
    const cilinScore = 12 + c * 85;
    if (cilinScore > score) score = cilinScore;
  }

  return Math.round(score);
}