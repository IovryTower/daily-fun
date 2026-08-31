// 摸鱼猜词：词库 + 关联度算法（纯前端，无外部依赖）

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

// 语义联想梯度表：目标词 → [联想词, 关联度%]。
// 联想词位于词库外；输入命中联想词时返回对应分数，让词库外输入也有逼近感（"珍珠奶茶"对目标"奶茶"→92%）
export const ASSOCIATIONS: Record<string, [string, number][]> = {
  // 水果
  '苹果': [['红富士', 92], ['青苹果', 86], ['乔布斯', 78], ['脆甜', 52]],
  '西瓜': [['麒麟瓜', 90], ['解暑', 56], ['瓜子', 60]],
  '香蕉': [['芭蕉', 88], ['果皮', 54]],
  '橙子': [['脐橙', 90], ['维C', 58]],
  '葡萄': [['葡萄干', 84], ['葡萄酒', 66]],
  // 动物
  '熊猫': [['国宝', 92], ['竹子', 88], ['团子', 82], ['四川', 60]],
  '老虎': [['百兽之王', 90], ['东北虎', 86], ['森林之王', 92]],
  '猫': [['猫咪', 90], ['小鱼干', 64], ['喵星人', 84]],
  '狗': [['狗狗', 90], ['旺财', 74], ['看家', 58]],
  // 食物
  '火锅': [['鸳鸯锅', 92], ['麻辣烫', 86], ['串串香', 84], ['毛肚', 82], ['烫菜', 54]],
  '饺子': [['水饺', 90], ['馄饨', 78], ['馅儿', 72], ['冬至', 58]],
  '粽子': [['粽叶', 86], ['蛋黄粽', 78], ['屈原', 74]],
  '汤圆': [['元宵', 88], ['黑芝麻', 74], ['团圆', 70]],
  // 饮品
  '奶茶': [['珍珠奶茶', 92], ['奶盖', 86], ['珍珠', 82], ['下午茶', 68]],
  '咖啡': [['美式', 78], ['摩卡', 84], ['拿铁', 80], ['提神', 60]],
  '啤酒': [['扎啤', 88], ['小麦啤', 82], ['撸串', 70]],
  // 颜色（词库内联想走同簇逻辑，这里给跨域语义）
  '蓝色': [['天空', 70], ['大海', 66]],
  '金色': [['黄金', 80], ['土豪', 62]],
  // 自然
  '太阳': [['阳光', 90], ['温暖', 70], ['日晒', 62]],
  '月亮': [['月光', 92], ['圆月', 88], ['嫦娥', 84]],
  '彩虹': [['七色', 86], ['雨后', 70]],
  '大海': [['海洋', 90], ['沙滩', 74], ['海风', 70]],
  // 科技
  '电脑': [['笔记本', 88], ['台式机', 90], ['开机', 64]],
  '手机': [['智能手机', 90], ['苹果手机', 86], ['安卓', 78], ['刷机', 66]],
  '键盘': [['敲键盘', 86], ['打字', 70]],
  // 运动
  '足球': [['世界杯', 86], ['梅西', 76], ['进球', 70]],
  '篮球': [['NBA', 86], ['乔丹', 82], ['投篮', 76]],
  '跑步': [['慢跑', 86], ['晨跑', 82], ['马拉松', 84]],
  // 情绪
  '开心': [['快乐', 92], ['高兴', 90], ['愉悦', 88]],
  '难过': [['伤心', 92], ['悲伤', 90], ['泪目', 70]],
  '愤怒': [['生气', 92], ['暴躁', 78], ['怒火', 80]],
  // 职业
  '程序员': [['码农', 92], ['敲代码', 86], ['秃头', 72], ['加班', 68]],
  '医生': [['大夫', 90], ['白衣天使', 86], ['看病', 70]],
  '老师': [['教师', 90], ['上课', 74], ['讲课', 72]],
  '警察': [['公安', 86], ['抓小偷', 78], ['警车', 68]],
  // 交通
  '高铁': [['动车', 92], ['和谐号', 84], ['春运', 64]],
  '地铁': [['轨道交通', 92], ['早高峰', 72], ['刷码进站', 62]],
  // 节日
  '春节': [['过年', 92], ['除夕', 88], ['拜年', 82], ['春晚', 78]],
  '中秋节': [['月饼', 90], ['团圆', 82], ['赏月', 76]],
  '端午节': [['粽子', 88], ['赛龙舟', 90], ['屈原', 82]],
  // 建筑
  '长城': [['万里长城', 92], ['八达岭', 88], ['秦始皇', 70]],
  '大桥': [['跨海大桥', 90], ['港珠澳', 86], ['桥墩', 70]],
  '城堡': [['公主', 66], ['护城河', 76], ['碉堡', 62]],
  // 天气
  '暴雨': [['大雨', 92], ['雷阵雨', 86], ['洪水', 80], ['小雨', 70], ['雨伞', 50]],
  '下雪': [['堆雪人', 82], ['打雪仗', 84], ['雪景', 76]],
  '晴天': [['大晴天', 92], ['阳光', 84], ['好天气', 78]],
  // 星座（含跨簇：词库内"狮子"对"狮子座"）
  '狮子座': [['狮子', 74], ['狮王', 70]],
  '白羊座': [['羊', 60], ['牧羊', 58]],
  // 游戏
  '王者荣耀': [['英雄联盟', 88], ['打野', 80], ['排位赛', 82], ['峡谷', 70]],
  '原神': [['提瓦特', 86], ['香菱', 78], ['抽卡', 70]],
  '象棋': [['楚河汉界', 86], ['马走日', 78], ['将军', 74]],
  // 服装
  '牛仔裤': [['牛仔', 76], ['紧身裤', 66], ['修身', 62]],
  '毛衣': [['针织衫', 84], ['暖和', 58], ['羊绒', 78]],
  // 文具
  '橡皮': [['擦铅笔', 78], ['改正', 52]],
  '剪刀': [['咔嚓', 74], ['剪纸', 78]],
};

// 主题"外延词"表：词库外的常见同域成员。命中后仍算同域，给非零且分族的关联分，
// 让"羚羊/树懒/河马"等词库外输入不再一律 0%。subs 为子分类（如动物的哺乳/鸟/水陆），同子类给梯度奖分。
export const THEME_EXT: Record<string, { aliases: string[]; subs?: Record<string, string[]> }> = {
  动物: {
    aliases: ['考拉', '羚羊', '树懒', '河马', '鲸鱼', '斑马', '松鼠', '小猪', '猎豹', '麋鹿', '老鼠', '麻雀', '老鹰', '母鸡', '公鸡', '小鸡', '大鹅', '蛇', '乌龟', '虾', '螃蟹', '青蛙', '蝌蚪', '鲤鱼', '草鱼', '鲈鱼', '鲨鱼', '金鱼', '河豚', '鱿鱼', '乌贼', '蚊子', '苍蝇', '蟑螂', '蚂蚁', '蝴蝶', '蜜蜂', '蚯蚓', '蝙蝠', '狼', '鹿', '骆驼', '山羊', '牛', '马', '猪', '鸡', '鸭', '鹅', '鳄鱼', '鱼', '鱼类', '鸟', '小鸟'],
    subs: {
      哺乳: ['猫', '狗', '兔子', '老虎', '大象', '熊猫', '猴子', '狐狸', '狮子', '长颈鹿', '海豚', '绵羊', '袋鼠', '刺猬', '考拉', '羚羊', '树懒', '河马', '鲸鱼', '斑马', '松鼠', '小猪', '猎豹', '麋鹿', '老鼠', '蝙蝠', '狼', '鹿', '骆驼', '山羊', '牛', '马', '猪'],
      鸟: ['企鹅', '鹦鹉', '麻雀', '老鹰', '母鸡', '公鸡', '小鸡', '大鹅', '鸡', '鸭', '鹅'],
      水陆: ['蛇', '乌龟', '虾', '螃蟹', '青蛙', '蝌蚪', '鲤鱼', '草鱼', '鲈鱼', '鲨鱼', '金鱼', '河豚', '鱿鱼', '乌贼', '蚊子', '苍蝇', '蟑螂', '蚂蚁', '蝴蝶', '蜜蜂', '蚯蚓', '鳄鱼', '鱼'],
    },
  },
  水果: { aliases: ['榴莲', '车厘子', '杨梅', '荔枝', '龙眼', '枇杷', '石榴', '甘蔗', '桑葚', '山楂', '牛油果', '圣女果', '沙田柚', '青提'] },
  食物: { aliases: ['烧烤', '回锅肉', '酸菜鱼', '麻辣香锅', '兰州拉面', '烤鸭', '东坡肉', '小笼包', '生煎', '肉夹馍', '关东煮'] },
  饮品: { aliases: ['冰红茶', '椰子汁', '燕麦奶', '卡布奇诺', '美式咖啡', '豆奶', '芒果汁', '柚子茶'] },
  颜色: { aliases: ['天蓝', '湖绿', '酒红', '米白', '焦糖', '月白', '雾霾蓝', '荧光绿'] },
  自然: { aliases: ['露珠', '流云', '晚霞', '朝阳', '潮汐', '彗星', '冰川', '陨石', '地震'] },
  科技: { aliases: ['服务器', '显卡', '打印机', '传真机', '游戏机', '充电器', '智能手表', '无人机'] },
  运动: { aliases: ['举重', '击剑', '摔跤', '体操', '高尔夫', '棒球', '橄榄球', '网球', '台球', '攀岩'] },
  情绪: { aliases: ['欣喜', '郁闷', '忐忑', '委屈', '烦躁', '憧憬', '知足'] },
  职业: { aliases: ['会计', '工程师', '保安', '导演', '编剧', '模特', '翻译', '主持人'] },
  交通: { aliases: ['自驾', '共享单车', '直升飞机', '热气球', '帆船', '皮划艇'] },
  乐器: { aliases: ['唢呐', '洞箫', '扬琴', '三弦', '木琴', '定音鼓'] },
  文具: { aliases: ['文件夹', '便利贴', '涂改液', '三角板', '铅笔盒'] },
  家电: { aliases: ['投影仪', '洗碗机', '烘干机', '净水器', '电热毯', '暖风机'] },
  天气: { aliases: ['晴空', '阵雨', '毛毛雨', '梅雨', '沙尘暴', '龙卷风', '寒潮', '雾霾'] },
  节日: { aliases: ['情人节', '妇女节', '植树节', '教师节', '护士节', '小年'] },
  建筑: { aliases: ['摩天大楼', '金字塔', '天安门', '布达拉宫', '废墟', '木屋'] },
  服装: { aliases: ['风衣', '短裤', '连衣裙', '卫衣', '夹克', '雨衣'] },
  星座: { aliases: ['水瓶', '双鱼', '白羊', '金牛', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯'] },
  游戏: { aliases: ['吃鸡', '英雄联盟', '塞尔达', '宝可梦', '阴阳师', '跑跑卡丁车', '扫雷'] },
};

const ALL_ALIASES = new Set(Object.values(THEME_EXT).flatMap((e) => e.aliases));

function aliasThemeOf(word: string): ThemeGroup | undefined {
  for (const [name, ext] of Object.entries(THEME_EXT)) {
    if (ext.aliases.includes(word)) {
      const t = THEMES.find((x) => x.name === name);
      if (t) return t;
    }
  }
  return undefined;
}

// 外延词子串映射：输入包含某个外延词时取最长者（"一只大鹅"→"大鹅"）
function bestAliasSubstringMatch(input: string): string | null {
  const matches = ALL_ALIASES.size > 0
    ? [...ALL_ALIASES].filter((a) => input.includes(a))
    : [];
  if (matches.length === 0) return null;
  return matches.sort((a, b) => b.length - a.length)[0];
}

// 词所属子分类（遍历 all ext 的 subs）
function aliasSubOf(word: string): string | null {
  for (const ext of Object.values(THEME_EXT)) {
    if (!ext.subs) continue;
    for (const [key, list] of Object.entries(ext.subs)) {
      if (list.includes(word)) return key;
    }
  }
  return null;
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

// 联想梯度：输入命中目标词的联想表（精确或作为子串）→ 返回预设分数；否则 null
function matchAssociation(input: string, target: string): number | null {
  const assoc = ASSOCIATIONS[target];
  if (!assoc) return null;
  const exact = assoc.find(([w]) => w === input);
  if (exact) return exact[1];
  const sub = assoc.find(([w]) => w.length >= 2 && input.includes(w));
  if (sub) return sub[1];
  return null;
}

// 核心：计算输入词与目标词的关联度（0-100，确定性无随机）
export function calcRelation(input: string, target: string): number {
  const inputNorm = input.trim();
  if (!inputNorm) return 0;
  if (inputNorm === target) return 100;

  // 语义联想（优先级高于字符兜底；词库内词也能靠联想获得跨簇高分，如"狮子"对"狮子座"）
  const assocScore = matchAssociation(inputNorm, target);
  if (assocScore !== null) return assocScore;

  // 词库内直接用原词；词库外优先词库词子串映射，再外延词子串映射
  let mapped: string;
  let mappedIsAlias = false;
  if (ALL_WORDS.has(inputNorm)) {
    mapped = inputNorm;
  } else {
    const libSub = bestSubstringMatch(inputNorm);
    if (libSub) {
      mapped = libSub;
    } else {
      const aliasSub = bestAliasSubstringMatch(inputNorm);
      if (aliasSub) {
        mapped = aliasSub;
        mappedIsAlias = true;
      } else {
        mapped = inputNorm;
      }
    }
  }
  if (mapped === target) return 100;

  const tTheme = themeOf(target)!;
  const tSub = aliasSubOf(target);

  // 外延词：同域给非零且分族的梯度分，让词库外输入也有"亲疏"可循
  if (mappedIsAlias) {
    const th = aliasThemeOf(mapped);
    if (th) {
      if (th.name === tTheme.name) {
        let s = 16 + charSimilarity(mapped, target) * 35;
        const ms = aliasSubOf(mapped);
        if (tSub && ms && tSub === ms) s += 12;
        return Math.min(58, s);
      }
      return Math.min(14, 4 + charSimilarity(mapped, target) * 10);
    }
    return Math.min(35, charSimilarity(mapped, target) * 40);
  }

  // 词库内
  const inTarget = themeOf(mapped);
  if (inTarget) {
    if (inTarget.name === tTheme.name) {
      // 同簇：42-88，字符相似度拉开梯度；同子类（如同为哺乳动物）额外加成
      let s = 42 + charSimilarity(mapped, target) * 55;
      const ms = aliasSubOf(mapped);
      if (tSub && ms && tSub === ms) s += 18;
      return Math.min(88, s);
    }
    // 不同簇：确定性低分，共享零星字符时略高
    return Math.min(24, 6 + charSimilarity(mapped, target) * 18);
  }

  // 词库外且无联想、无映射：字符相似度兜底
  return Math.min(35, charSimilarity(inputNorm, target) * 40);
}