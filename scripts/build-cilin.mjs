// 词林索引生成：解析 src/data/cilin.txt → public/data/cilin-index.json
// 索引为 { 词: ["Aa01A01=", ...] }，编码串含组类型(=同义/#相关/@独立)用于同义组判分
// 运行：node scripts/build-cilin.mjs
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = resolve('src/data/cilin.txt');
const OUT = resolve('public/data/cilin-index.json');

const text = readFileSync(SRC, 'utf8');
const index = new Map();
let lines = 0, skipped = 0;

for (const line of text.split('\n')) {
  const m = line.match(/^([A-Za-z][A-Za-z0-9]\d{1,2}[A-Za-z0-9]\d{1,2})([=#@])\s?(.*)$/);
  if (!m) { skipped++; continue; }
  lines++;
  const [_, code, type, rest] = m;
  for (const w of rest.split(/\s+/)) {
    if (!w) continue;
    // 仅保留纯中文词（1-8字），过滤生僻符号/字母/数字混排，控制体积
    if (!/^[㐀-鿿]{1,8}$/.test(w)) { skipped += 0; continue; }
    if (!index.has(w)) index.set(w, []);
    const arr = index.get(w);
    const entry = code + type;
    if (arr[arr.length - 1] !== entry) arr.push(entry);
  }
}

mkdirSync(resolve('public/data'), { recursive: true });
const out = JSON.stringify(Object.fromEntries(index));
writeFileSync(OUT, out);
const size = (statSync(OUT).size / 1024).toFixed(0);
console.log(`词林索引完成: ${lines} 行(跳过${skipped}行), ${index.size} 个唯一词 → public/data/cilin-index.json (${size} KB)`);