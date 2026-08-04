# Daily Fun — 开发进度表

> 每次开始工作时更新此文件

## 总体进度

| Phase | 内容 | 状态 | 完成日期 |
|-------|------|------|---------|
| 0 | 第一阶段设计文档 | ✅ 已完成 | 2026-08-04 |
| 1 | 项目骨架 + 首页信息流 + 暗黑模式 + 首次部署 | ✅ 已完成 | 2026-08-04 |
| 2 | 分类/标签/关于/404/RSS/SEO | ⬜ 未开始 | — |
| 3 | Lighthouse ≥ 95 优化 | ⬜ 未开始 | — |
| 4 | 点赞/收藏/随机/详情页 | ⬜ 未开始 | — |
| 5 | PWA + Pagefind 搜索 | ⬜ 未开始 | — |
| 6 | 内容管理 CLI 工具 | ⬜ 未开始 | — |
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
- [ ] Lighthouse 基线测试（需浏览器在线测试）

## 线上地址

https://iovrytower.github.io/daily-fun/

## 已知问题

- Windows exFAT 环境下 pnpm 需使用 `node-linker=hoisted`
- `pnpm build` 在 Windows cmd 子进程中找不到 node，需用 `node node_modules/astro/bin/astro.mjs build`
- 示例图片尚未添加（Markdown 中引用的图片路径无实际文件）
- 本地网络无法直连 GitHub，需代理访问

---

*最后更新：2026-08-04*
