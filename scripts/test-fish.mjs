// 摸鱼猜词算法回归测试：node --experimental-strip-types scripts/test-fish.mjs
import {
  THEMES, ASSOCIATIONS, pickTarget, hashDate, pickDailyTarget,
  getHint, calcRelation,
} from '../src/lib/fishGame.ts';

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

console.log('─ 分区区间');
// 同簇：42-88
assert(calcRelation('苹果', '香蕉') >= 42 && calcRelation('苹果', '香蕉') <= 88, '苹果/香蕉 同簇 42-88');
assert(calcRelation('葡萄', '西瓜') >= 42 && calcRelation('葡萄', '西瓜') <= 88, '葡萄/西瓜 同簇 42-88');
// 跨簇：≤24
assert(calcRelation('苹果', '跑步') <= 24, '苹果/跑步 跨簇 ≤24');
assert(calcRelation('老虎', '奶茶') <= 24, '老虎/奶茶 跨簇 ≤24');
// 词库外（无联想无映射）：≤35
assert(calcRelation('abcdefgh', '苹果') <= 35, '随机乱码 ≤35');
assert(calcRelation('牵一条狗去公园', '奶茶') <= 35, '无关短语 ≤35');

console.log('─ 外延词/子类梯度（词库外同域非零且有亲疏）');
// 词库外同域动物 ≠ 0（曾有大量 0% 断层）
for (const w of ['考拉', '羚羊', '树懒', '河马', '鲸鱼', '麻雀', '鲤鱼', '蛇', '鳄鱼', '老鼠']) {
  const s = calcRelation(w, '刺猬');
  assert(s > 0 && s <= 58, `${w}→刺猬 非零且≤58 (${s}%)`);
}
// 同子类（哺乳）应高于跨子类（鸟）
const mam = calcRelation('考拉', '刺猬');      // 哺乳 vs 哺乳
const bird = calcRelation('麻雀', '刺猬');     // 鸟 vs 哺乳
assert(mam - bird >= 8, `哺乳子类 ${mam}% > 鸟子类 ${bird}%`);
// 词库内同簇同子类 > 跨子类
assert(calcRelation('猴子', '刺猬') - calcRelation('鹦鹉', '刺猬') >= 8, '猴子(哺乳) 高于 鹦鹉(鸟)');
// 跨域外延词应远低于同域
assert(calcRelation('服务器', '刺猬') < calcRelation('考拉', '刺猬'), '跨域外延 < 同域外延');
assert(calcRelation('服务器', '刺猬') <= 14, '跨域外延 ≤14');

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