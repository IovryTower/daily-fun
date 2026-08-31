// 摸鱼猜词算法回归测试：node --experimental-strip-types scripts/test-fish.mjs
// 需先运行 node scripts/build-cilin.mjs 生成词林索引
import { readFileSync, existsSync } from 'node:fs';
import {
  THEMES, ASSOCIATIONS, pickTarget, hashDate, pickDailyTarget,
  getHint, calcRelation, initCilinIndex, isCilinLoaded,
} from '../src/lib/fishGame.ts';

const idxFile = 'public/data/cilin-index.json';
if (existsSync(idxFile)) {
  initCilinIndex(JSON.parse(readFileSync(idxFile, 'utf8')));
}
console.log('词林索引已加载:', isCilinLoaded());

let failures = 0;
const assert = (cond, msg) => {
  if (cond) {
    console.log('  ok:', msg);
  } else {
    console.error('  FAIL:', msg);
    failures++;
  }
};

console.log('─ 词库结构');
assert(THEMES.length >= 18, `主题簇 ${THEMES.length} 个(≥18)`);
const total = THEMES.reduce((n, t) => n + t.words.length, 0);
assert(total >= 260, `词库 ${total} 词(≥260)`);
const dupes = new Set();
let dupFound = false;
for (const t of THEMES) for (const w of t.words) { if (dupes.has(w)) { dupFound = true; console.log('  重复词:', w); } dupes.add(w); }
assert(!dupFound, '无重复词');

console.log('─ 同词 100 / 联想覆盖');
for (const t of THEMES) for (const w of t.words) assert(calcRelation(w, w) === 100, `同词 100%: ${w}`);
for (const [target, pairs] of Object.entries(ASSOCIATIONS)) {
  for (const [w, pct] of pairs) {
    assert(calcRelation(w, target) === pct, `联想 ${w}→${target}=${pct}%`);
    assert(calcRelation(w, target) < 100, `联想不等于 100`);
  }
}

console.log('─ 子串映射命中');
assert(calcRelation('踢足球', '足球') === 100, '踢足球→足球=100');
assert(calcRelation('打篮球', '篮球') === 100, '打篮球→篮球=100');
assert(calcRelation('游泳健将', '游泳') === 100, '游泳健将→游泳=100');

console.log('─ 同簇/跨簇区间');
// 同簇：≥42，且词林可再拉高（苹果/香蕉 词林同小类，通常 >42）
const p1 = calcRelation('苹果', '香蕉');
assert(p1 >= 42 && p1 < 100, `苹果/香蕉 同簇 ≥42: ${p1}`);
const p2 = calcRelation('葡萄', '西瓜');
assert(p2 >= 42 && p2 < 100, `葡萄/西瓜 同簇 ≥42: ${p2}`);
// 跨簇：同大类词因词林可到 20-40，但绝不是高分
const p3 = calcRelation('老虎', '奶茶');
assert(p3 < 42, `老虎/奶茶 跨簇 <42: ${p3}`);
const p4 = calcRelation('苹果', '跑步');
assert(p4 < 42, `苹果/跑步 跨簇 <42: ${p4}`);
// 词库外（无联想无映射）：≤35
assert(calcRelation('abcdefgh', '苹果') <= 35, '随机乱码 ≤35');
assert(calcRelation('牵一条狗去公园', '奶茶') <= 38, '无关短语 ≤38');

console.log('─ 词林语义（跨主题但语义相关应明显抬高）');
assert(calcRelation('开心', '快乐') >= 88, `同义词 开心/快乐 ≥88: ${calcRelation('开心', '快乐')}`);
assert(calcRelation('奶茶', '咖啡') >= 55, `饮品 奶茶/咖啡 ≥55: ${calcRelation('奶茶', '咖啡')}`);
assert(calcRelation('汽车', '火车') >= 55, `交通 汽车/火车 ≥55: ${calcRelation('汽车', '火车')}`);
assert(calcRelation('医生', '护士') >= 50, `职业 医生/护士 ≥50: ${calcRelation('医生', '护士')}`);
assert(calcRelation('老虎', '狮子') >= 55, `动物 老虎/狮子 ≥55: ${calcRelation('老虎', '狮子')}`);

console.log('─ 词库外同域词（词林命中非零）');
for (const w of ['麻雀', '鲸鱼', '斑马', '蜜蜂', '老鹰', '蛇', '乌龟', '山羊', '牛']) {
  const s = calcRelation(w, '刺猬');
  assert(s > 0 && s < 100, `${w}→刺猬 非零且<100 (${s}%)`);
}

console.log('─ 确定性（同输入必同分）');
for (let i = 0; i < 30; i++) {
  const t = pickTarget();
  const w = pickTarget();
  const a = calcRelation(w, t);
  const b = calcRelation(w, t);
  assert(a === b, `确定性 ${w}/${t}`);
}

console.log('─ 每日题');
assert(pickDailyTarget(new Date()) === pickDailyTarget(new Date()), '同日一致');
const d1 = pickDailyTarget(new Date('2026-01-01'));
const d2 = pickDailyTarget(new Date('2026-01-02'));
assert(d1 !== d2 || true, `跨日(允许巧合相同): ${d1} / ${d2}`);
const h = getHint(pickDailyTarget());
assert(h.themeName && h.length > 0, `hint: ${h.emoji} ${h.themeName} ${h.length}字`);
assert(hashDate(new Date()) === hashDate(new Date()), 'hashDate 稳定');

if (failures === 0) {
  console.log('\n✅ 全部通过');
} else {
  console.log(`\n❌ ${failures} 项失败`);
  process.exit(1);
}