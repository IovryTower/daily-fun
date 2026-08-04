import { readdir, rename, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, extname } from 'node:path';

const TEMPLATES_DIR = 'templates';
const MEMES_DIR = 'public/images/memes';
const CONTENT_DIR = 'content/fun';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

async function main() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  let files;
  try {
    files = await readdir(TEMPLATES_DIR);
  } catch {
    console.log('❌ templates 目录不存在或为空');
    return;
  }

  const imageFiles = files.filter(
    (f) => IMAGE_EXTS.has(extname(f).toLowerCase()) && !f.startsWith('.'),
  );

  if (imageFiles.length === 0) {
    console.log('📭 templates 目录中没有图片，无需同步');
    return;
  }

  console.log(`📦 发现 ${imageFiles.length} 张图片，开始同步...`);

  await mkdir(MEMES_DIR, { recursive: true });

  for (let i = 0; i < imageFiles.length; i++) {
    const originalName = imageFiles[i];
    const ext = extname(originalName).toLowerCase();
    const index = i + 1;
    const newImageName = `${dateStr}-${index}${ext}`;
    const newMdName = `${dateStr}-meme-${index}.md`;

    const srcPath = join(TEMPLATES_DIR, originalName);
    const dstPath = join(MEMES_DIR, newImageName);
    await rename(srcPath, dstPath);
    console.log(`  🖼️  ${originalName} → memes/${newImageName}`);

    const imagePath = `/images/memes/${newImageName}`;
    const mdContent = `---
title: "今日梗图 ${index}"
date: ${dateStr}
category: meme
tags: [梗图, 搞笑]
image: ${imagePath}
imageAlt: 搞笑梗图
description: "今日份的快乐源泉"
---
`;
    const mdPath = join(CONTENT_DIR, newMdName);
    await writeFile(mdPath, mdContent, 'utf-8');
    console.log(`  📝 创建 ${newMdName}`);
  }

  console.log(`\n✅ 同步完成！${imageFiles.length} 张图片已处理`);
  console.log('💡 接下来执行:');
  console.log('   git add -A && git commit -m "feat: 同步今日图片" && git push');
}

main().catch(console.error);
