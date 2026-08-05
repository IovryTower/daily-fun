# Daily Fun — 开发进度表

> 每次开始工作时更新此文件

## 总体进度

| Phase | 内容 | 状态 | 完成日期 |
|-------|------|------|---------|
| 0 | 第一阶段设计文档 | ✅ 已完成 | 2026-08-04 |
| 1 | 项目骨架 + 首页信息流 + 暗黑模式 + 首次部署 | ✅ 已完成 | 2026-08-04 |
| 2 | 分类/标签/关于/404/RSS + 刷新版本功能 | ✅ 代码完成 | 2026-08-05 |
| 3 | Lighthouse ≥ 95 优化 | ⬜ 未开始 | — |
| 4 | 点赞/收藏/随机/详情页 | ⬜ 未开始 | — |
| 5 | PWA + Pagefind 搜索 | ⬜ 未开始 | — |
| 6 | 内容管理 CLI 工具 | ✅ 已完成 | 2026-08-04 |
| 7 | 高级扩展（R2/Workers/AI） | ⬜ 未开始 | — |

## Phase 1 详情

- [x] 初始化 Astro 项目
- [x] 配置 TypeScript / ESLint / Prettier
- [x] 配置 Tailwind CSS 4.x
- [x] 创建 BaseLayout + BaseHead + Header + Footer
- [x] 创建 content.config.ts
- [x] 添加 5 条示例 Markdown
- [x] 实现首页信息流 (FunCard + FunFeed)
- [x] 实现暗黑模式切换 (ThemeToggle Island)
- [x] 配置 GitHub Actions deploy.yml
- [x] 首次部署到 GitHub Pages
- [x] 示例图片同步（4 张图片）
- [ ] Lighthouse 基线测试

## Phase 2 详情

- [x] 最新页 `/latest`
- [x] 分类列表页 `/category`
- [x] 分类详情页 `/category/[category]`
- [x] 标签详情页 `/tag/[tag]`
- [x] 关于页 `/about`
- [x] 404 页面
- [x] RSS Feed `/rss.xml`
- [x] Footer 刷新按钮 + 构建版本时间
- [x] SEO meta (OG/Twitter Card/canonical)
- [x] Sitemap 自动生成

## Phase 6 详情（提前完成）

- [x] 图片同步脚本 `scripts/sync-images.mjs`
- [x] 操作指南 `scripts/SYNC-GUIDE.md`
- [x] 支持同一天多张图片自动编号
- [x] templates 目录移至项目根目录（不影响构建）

## CI 部署状态

🔴 当前阻塞：CI 构建失败，正在修复

- 原因：Windows exFAT 不支持 symlink，导致本地/CI 环境差异
- 方案：CI 用 pnpm（Linux 正常），本地用 npm --ignore-scripts
- 待推送：commit `4c04d32` 需手动 `git push`

## 线上地址

https://iovrytower.github.io/daily-fun/

## 日常操作

```bash
# 图片同步
cd D:/idea_PROJECT/ivoryt
node scripts/sync-images.mjs
git add -A && git commit -m "feat: 同步今日图片" && git push

# 本地构建（Windows）
npm install --ignore-scripts && node node_modules/esbuild/install.js
node scripts/prebuild.mjs && node node_modules/astro/bin/astro.mjs build
```

## 已知问题

- Windows exFAT 不支持 symlink，本地必须 `npm install --ignore-scripts`
- 本地构建需 `node node_modules/astro/bin/astro.mjs build`（cmd 子进程找不到 node）
- `public/images/templates` 残留目录无法删除（Windows 文件锁）
- 浏览器可能缓存旧页面，需 Ctrl+Shift+R 强制刷新

---

*最后更新：2026-08-05*
