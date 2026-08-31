// 摸鱼猜词：词库 + 关联度算法（纯前端，无外部依赖）

export interface ThemeGroup {
  name: string;
  emoji: string;
  words: string[];
}

export const THEMES: ThemeGroup[] = [
  { name: '水果', emoji: '🍎', words: ['苹果', '香蕉', '橙子', '葡萄', '西瓜', '草莓', '菠萝', '桃子', '梨子', '柠檬', '樱桃', '芒果'] },
  { name: '动物', emoji: '🐱', words: ['猫', '狗', '兔子', '老虎', '大象', '熊猫', '猴子', '狐狸', '狮子', '长颈鹿', '企鹅', '海豚'] },
  { name: '食物', emoji: '🍜', words: ['米饭', '面条', '饺子', '包子', '火锅', '汉堡', '披萨', '炒饭', '汤圆', '粽子', '馒头', '豆腐'] },
  { name: '饮品', emoji: '☕', words: ['奶茶', '咖啡', '可乐', '果汁', '牛奶', '绿茶', '啤酒', '豆浆', '雪碧', '蜂蜜水', '柠檬茶', '酸奶'] },
  { name: '颜色', emoji: '🎨', words: ['红色', '蓝色', '绿色', '黄色', '黑色', '白色', '紫色', '橙色', '粉色', '灰色', '青色', '金色'] },
  { name: '自然', emoji: '🌿', words: ['太阳', '月亮', '星星', '云朵', '彩虹', '大海', '森林', '瀑布', '火山', '草原', '池塘', '沙漠'] },
  { name: '科技', emoji: '💻', words: ['电脑', '手机', '键盘', '鼠标', '网络', '芯片', '机器人', '屏幕', '耳机', '摄像头', '硬盘', '蓝牙'] },
  { name: '运动', emoji: '⚽', words: ['足球', '篮球', '游泳', '跑步', '乒乓球', '羽毛球', '跳绳', '滑雪', '滑板', '自行车', '拳击', '射箭'] },
  { name: '情绪', emoji: '😊', words: ['开心', '难过', '愤怒', '害怕', '惊喜', '自豪', '无聊', '兴奋', '平静', '焦虑', '满足', '尴尬'] },
  { name: '职业', emoji: '👨‍💻', words: ['医生', '老师', '警察', '厨师', '司机', '程序员', '护士', '律师', '设计师', '记者', '歌手', '飞行员'] },
  { name: '交通', emoji: '🚗', words: ['汽车', '火车', '地铁', '飞机', '轮船', '公交', '出租车', '自行车', '摩托车', '高铁', '电车', '三轮车'] },
  { name: '乐器', emoji: '🎸', words: ['钢琴', '吉他', '小提琴', '鼓', '笛子', '琵琶', '古筝', '萨克斯', '手风琴', '二胡', '贝斯', '口琴'] },
  { name: '文具', emoji: '✏️', words: ['铅笔', '钢笔', '橡皮', '尺子', '书包', '笔记本', '圆规', '剪刀', '胶水', '订书机', '文具盒', '蜡笔'] },
  { name: '家电', emoji: '🏠', words: ['电视', '冰箱', '洗衣机', '空调', '微波炉', '电饭煲', '风扇', '吸尘器', '烤箱', '吹风机', '扫地机', '热水器'] },
];

export function pickTarget(): string {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  return theme.words[Math.floor(Math.random() * theme.words.length)];
}

export function getHint(target: string): { themeName: string; emoji: string; length: number } {
  const theme = THEMES.find((t) => t.words.includes(target))!;
  return { themeName: theme.name, emoji: theme.emoji, length: target.length };
}

// 字符 n-gram Jaccard 相似度（用于同簇区分 + 词库外兜底）
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

const ALL_WORDS = new Set(THEMES.flatMap((t) => t.words));

function themeOf(word: string): ThemeGroup | undefined {
  return THEMES.find((t) => t.words.includes(word));
}

// 词库外短语映射：输入包含某个词库词时，取最长者（如"踢足球"→"足球"）
function bestSubstringMatch(input: string): string | null {
  const matches = THEMES.flatMap((t) => t.words).filter((w) => input.includes(w));
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.length - a.length)[0];
}

// 核心：计算输入词与目标词的关联度（0-100，确定性无随机）
export function calcRelation(input: string, target: string): number {
  const inputNorm = input.trim();
  if (!inputNorm) return 0;
  if (inputNorm === target) return 100;

  // 词库内直接用原词；词库外尝试包含映射（"踢足球"→"足球"），映射命中目标则视为猜中
  const mapped =
    ALL_WORDS.has(inputNorm) ? inputNorm : bestSubstringMatch(inputNorm) ?? inputNorm;
  if (mapped === target) return 100;

  const inTarget = themeOf(mapped);
  const tTheme = themeOf(target)!;

  if (inTarget) {
    if (inTarget.name === tTheme.name) {
      // 同簇：42-88，字符相似度拉开梯度（共享字越多越接近）
      return Math.min(88, 42 + charSimilarity(mapped, target) * 55);
    }
    // 不同簇：确定性低分，共享零星字符时略高
    return Math.min(24, 6 + charSimilarity(mapped, target) * 18);
  }

  // 词库外且无映射：字符相似度兜底
  return Math.min(35, charSimilarity(inputNorm, target) * 40);
}

// 用目标词构建调试用答案（可选拓展）——暂无