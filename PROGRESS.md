# Daily Fun — 开发进度表

> 每次开始工作时更新此文件

## 总体进度

| Phase | 内容 | 状态 | 完成日期 |
|-------|------|------|---------|
| 0 | 第一阶段设计文档 | ✅ 已完成 | 2026-08-04 |
| 1 | 项目骨架 + 首页信息流 + 暗黑模式 + 首次部署 | ✅ 已完成 | 2026-08-04 |
| 2 | 分类/标签/关于/404/RSS/SEO | 🔄 进行中 | — |
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
- [x] 添加 3-5 条示例 Markdown
- [x] 实现首页信息流 (FunCard + FunFeed)
- [x] 实现暗黑模式切换 (ThemeToggle Island)
- [x] 配置 GitHub Actions deploy.yml
- [x] 首次部署到 GitHub Pages
- [x] 示例图片同步（4 张图片已分配到内容）
- [ ] Lighthouse 基线测试（需浏览器在线测试）

## Phase 6 详情（提前完成）

- [x] 图片同步脚本 `scripts/sync-images.mjs`
- [x] 操作指南 `scripts/SYNC-GUIDE.md`
- [x] 支持同一天多张图片自动编号
- [x] 自动生成 Markdown + 移动图片 + 清空 templates

## Phase 2 详情

- [ ] 最新页 `/latest`
- [ ] 分类列表页 `/category`
- [ ] 分类详情页 `/category/[category]`
- [ ] 标签详情页 `/tag/[tag]`
- [ ] 关于页 `/about`
- [ ] 404 页面
- [ ] RSS Feed `/rss.xml`
- [ ] SEO meta 完善
- [ ] 补充更多示例内容

## 线上地址

https://iovrytower.github.io/daily-fun/

## 日常操作

```bash
cd D:/idea_PROJECT/ivoryt
node scripts/sync-images.mjs
git add -A && git commit -m "feat: 同步今日图片" && git push
```

## 已知问题

- Windows exFAT 环境下 pnpm 需使用 `node-linker=hoisted`
- `pnpm build` 需用 `node node_modules/astro/bin/astro.mjs build`
- 本地网络无法直连 GitHub，需代理访问
- 浏览器可能缓存旧页面，需 Ctrl+Shift+R 强制刷新

---

*最后更新：2026-08-04*
