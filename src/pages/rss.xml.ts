import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const allFun = await getCollection('fun');
  const sortedFun = allFun.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'Daily Fun',
    description: '每日搞笑图片、文字、GIF、Meme — 适合摸鱼放松的轻量级网站',
    site: context.site!,
    items: sortedFun.map((item) => ({
      title: item.data.title,
      pubDate: item.data.date,
      description: item.data.description || '',
      link: `/category/${item.data.category}`,
      categories: item.data.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
