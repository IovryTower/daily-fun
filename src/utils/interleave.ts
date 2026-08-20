interface FunLike {
  data: { date: Date; image?: string };
}

// 图片类与文字类交替排列
function interleaveByType<T extends FunLike>(items: T[]): T[] {
  const images: T[] = [];
  const texts: T[] = [];
  for (const item of items) {
    if (item.data.image) images.push(item);
    else texts.push(item);
  }
  const result: T[] = [];
  const max = Math.max(images.length, texts.length);
  for (let i = 0; i < max; i++) {
    if (i < images.length) result.push(images[i]);
    if (i < texts.length) result.push(texts[i]);
  }
  return result;
}

// 按日期分组(保持传入顺序)，组内图/文交叉，日期越新越靠前
export function interleaveByDate<T extends FunLike>(items: T[]): T[] {
  const groups = new Map<number, T[]>();
  for (const item of items) {
    const key = item.data.date.getTime();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  const result: T[] = [];
  for (const group of groups.values()) {
    result.push(...interleaveByType(group));
  }
  return result;
}