# Daily Fun — 开发进度表

> 每次开始工作时更新此文件

## 总体进度

| Phase | 内容 | 状态 | 完成日期 |
|-------|------|------|---------|
| 0 | 第一阶段设计文档 | ✅ 已完成 | 2026-08-04 |
| 1 | 项目骨架 + 首页信息流 + 暗黑模式 + 首次部署 | ✅ 已完成 | 2026-08-04 |
| 2 | 分类/标签/关于/404/RSS + 刷新版本功能 | ✅ 已完成 | 2026-08-05 |
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

## Phase 2 详情

- [x] 最新页 `/latest`
- [x] 分类列表页 `/category`
- [x] 分类详情页 `/category/[category]`
- [x] 标签详情页 `/tag/[tag]`
- [x] 关于页 `/about`
- [x] 404 页面
- [x] RSS Feed `/rss.xml`
- [x] Footer 刷新按钮 + 构建版本时间（北京时间）
- [x] SEO meta (OG/Twitter Card/canonical)
- [x] Sitemap 自动生成
- [x] 双平台路径适配（GitHub Pages / Cloudflare Pages / Vercel）

## Phase 6 详情（提前完成）

- [x] 图片同步脚本 `scripts/sync-images.mjs`
- [x] 操作指南 `scripts/SYNC-GUIDE.md`
- [x] 支持同一天多张图片自动编号
- [x] templates 目录移至项目根目录（不影响构建）

## 部署架构

| 平台 | 地址 | 国内访问 | 自动部署 |
|------|------|----------|----------|
| Cloudflare Pages | https://daily-fun.pages.dev | ✅ 直连 | 🟡 CI 配置中 |
| GitHub Pages | https://iovrytower.github.io/daily-fun/ | ❌ 需 VPN | ✅ CI 已通 |
| Vercel | https://daily-fun-psi.vercel.app | ❌ 需 VPN | ✅ 自动 |

## CI 部署状态

- GitHub Pages: ✅ 正常（pnpm + Node 22 + 官方 registry）
- Cloudflare Pages: 🟡 CI 自动部署调试中（手动 wrangler 部署已验证可用）
- Vercel: ✅ 自动检测 git push 部署

## 日常操作

```bash
# 图片同步
cd D:/idea_PROJECT/ivoryt
node scripts/sync-images.mjs
git add -A && git commit -m "feat: 同步今日图片" && git push

# 本地构建（Windows）
npm install --ignore-scripts && node node_modules/esbuild/install.js
node scripts/prebuild.mjs && node node_modules/astro/bin/astro.mjs build

# 手动部署到 Cloudflare Pages
CF_PAGES=1 node node_modules/astro/bin/astro.mjs build
node node_modules/wrangler/bin/wrangler.js pages deploy dist --project-name daily-fun
```

## 已知问题

- Windows exFAT 不支持 symlink，本地必须 `npm install --ignore-scripts`
- 本地构建需 `node node_modules/astro/bin/astro.mjs build`（cmd 子进程找不到 node）
- GitHub / Vercel / GitHub Pages 国内需 VPN 访问
- Cloudflare Pages 国内可直连（推荐使用）

---
*最后更新：2026-08-05*
