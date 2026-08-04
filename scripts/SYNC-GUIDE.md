# 图片同步操作指南

## 使用方法

1. 将图片放入 `public/images/templates/` 目录
2. 在项目根目录执行同步脚本
3. 推送到 GitHub，自动部署

## 快速执行

```bash
cd D:/idea_PROJECT/ivoryt
node scripts/sync-images.mjs
git add -A && git commit -m "feat: 同步今日图片" && git push
```

## 脚本行为

- 扫描 `public/images/templates/` 下所有图片（png/jpg/jpeg/gif/webp）
- 按当天日期自动创建 Markdown 内容文件
- 同一天多张图片自动编号（如 2026-08-04-meme-1.md、2026-08-04-meme-2.md）
- 图片移动到 `public/images/memes/` 并重命名（日期+编号）
- 清空 `public/images/templates/` 目录
- 自动 git add + commit + push

## 文件命名规则

| 原文件 (templates/) | 移动后 (memes/) | 对应 Markdown |
|---------------------|-----------------|---------------|
| 任意名.png | 2026-08-04-1.png | 2026-08-04-meme-1.md |
| 任意名.jpg | 2026-08-04-2.jpg | 2026-08-04-meme-2.md |

## 注意事项

- 执行前确保图片已放入 templates 目录
- 执行后 templates 目录会被清空
- 日期取当前系统日期
- 如需修改标题/标签，编辑 content/fun/ 下对应 Markdown 即可
