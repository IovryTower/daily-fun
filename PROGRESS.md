# Daily Fun — 开发进度表

> 每次开始工作时更新此文件

## 总体进度

| Phase | 内容 | 状态 | 完成日期 |
|-------|------|------|---------|
| 0 | 设计文档 | ✅ 已完成 | 2026-08-04 |
| 1 | 项目骨架 + 首页信息流 + 暗黑模式 + 首次部署 | ✅ 已完成 | 2026-08-04 |
| 2 | 分类/标签/关于/404/RSS + 多平台部署 | ✅ 已完成 | 2026-08-06 |
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
- [x] 双平台路径适配（import.meta.env.BASE_URL 动态前缀）
- [x] GitHub Pages CI 部署
- [x] Cloudflare Pages CI 部署（国内直连）
- [x] Vercel 自动部署

## Phase 6 详情（提前完成）

- [x] 图片同步脚本 `scripts/sync-images.mjs`
- [x] 操作指南 `scripts/SYNC-GUIDE.md`
- [x] 支持同一天多张图片自动编号
- [x] templates 目录移至项目根目录（不影响构建）

## 部署架构

| 平台 | 地址 | 国内访问 | 自动部署 |
|------|------|----------|----------|
| Cloudflare Pages | https://daily-fun.pages.dev | ✅ 直连 | ✅ CI |
| GitHub Pages | https://iovrytower.github.io/daily-fun/ | ❌ 需 VPN | ✅ CI |
| Vercel | https://daily-fun-psi.vercel.app | ❌ 需 VPN | ✅ 自动 |

> `git push` 后自动部署到三个平台，约 2 分钟生效

## CI 配置

- GitHub Secrets 需配置：
  - `CLOUDFLARE_API_TOKEN`（Cloudflare Pages:Edit 权限，Custom Token）
  - `CLOUDFLARE_ACCOUNT_ID`（Dashboard URL 中的 ID）
- CI 流程：build-github-pages → deploy-github-pages + deploy-cloudflare-pages（并行）
- Cloudflare 部署方式：`npm install -g wrangler@4` + `wrangler pages deploy`

## 关键技术决策

### 多平台 base 路径适配
- GitHub Pages 需要 `base: '/daily-fun'`，Cloudflare/Vercel 需要根路径
- `astro.config.mts` 通过 `CF_PAGES`/`VERCEL` 环境变量动态切换
- 所有组件链接用 `import.meta.env.BASE_URL` 替代硬编码 `/`

### 版本时间显示
- Footer 构建时间用 `timeZone: 'Asia/Shanghai'` 强制北京时间
- CI 环境默认 UTC，不加时区参数会显示比北京时间慢 8 小时

### 暗黑模式实现
- CSS custom properties + `@variant dark (&:where(.dark, .dark *))`
- ThemeToggle Island 通过 LocalStorage 持久化
- BaseLayout 内联 script 防止闪烁（FOUC）

## 踩坑记录

### 1. pnpm-lock.yaml 中文镜像导致 CI 失败
- **现象**：CI 中 `CERT_HAS_EXPIRED` 错误
- **根因**：本地 pnpm 全局配置了 `r.cnpmjs.org`，lockfile 记录了这些 URL
- **解决**：`pnpm config set registry https://registry.npmjs.org/` → 删除 lockfile → 重新生成
- **验证**：`grep -c "cnpmjs\|npmmirror" pnpm-lock.yaml` 必须为 0

### 2. npm 10 在 CI 中崩溃
- **现象**：`npm ci` / `npm install` 报 "Exit handler never called"
- **根因**：npm 10 + Node 22 的已知 bug
- **解决**：CI 改用 pnpm

### 3. Windows exFAT 不支持 symlink
- **现象**：`pnpm install` 报 symlink 错误
- **解决**：`.npmrc` 加 `node-linker=hoisted`；本地用 `npm install --ignore-scripts`

### 4. Cloudflare Workers ≠ Cloudflare Pages
- **现象**：部署到 Workers 后 CSS 404
- **根因**：Workers 是运行 JS 的，Pages 才是静态站托管
- **解决**：用 `wrangler pages project create` 创建 Pages 项目

### 5. Cloudflare API Token 权限错误
- **现象**：CI 中 wrangler/pages-action 部署失败
- **根因**：Token 选了 "API Tokens:Edit" 而非 "Cloudflare Pages:Edit"
- **解决**：创建 Custom Token，权限选 Account → Cloudflare Pages → Edit

### 6. wrangler-action 和 pages-action 在 CI 中失败
- **现象**：`cloudflare/wrangler-action@v3` 和 `cloudflare/pages-action@v1` 都失败
- **解决**：直接 `npm install -g wrangler@4` + `wrangler pages deploy` 命令行部署

### 7. GitHub/Vercel 国内被墙
- **现象**：`ERR_CONNECTION_RESET` / `Failed to connect to port 443`
- **根因**：SNI 阻断 + DNS 污染，`github.io` 和 `vercel.app` 域名被干扰
- **解决**：使用 Cloudflare Pages（`pages.dev` 域名国内可直连）

## 日常操作

```bash
# 图片同步
cd D:/idea_PROJECT/ivoryt
node scripts/sync-images.mjs
git add -A && git commit -m "feat: 同步今日图片" && git push

# 本地构建（Windows）
npm install --ignore-scripts && node node_modules/esbuild/install.js
node scripts/prebuild.mjs && node node_modules/astro/bin/astro.mjs build

# 手动部署到 Cloudflare Pages（紧急时用）
CF_PAGES=1 node node_modules/astro/bin/astro.mjs build
node node_modules/wrangler/bin/wrangler.js pages deploy dist --project-name daily-fun
```

## 已知问题

- Windows exFAT 不支持 symlink，本地必须 `npm install --ignore-scripts`
- 本地构建需 `node node_modules/astro/bin/astro.mjs build`（cmd 子进程找不到 node）
- GitHub / Vercel 国内需 VPN 访问，推荐使用 Cloudflare Pages
- GitHub 网络间歇性不通（SNI 阻断），git push 需多次重试

---
*最后更新：2026-08-06*
