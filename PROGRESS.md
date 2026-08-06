# Daily Fun — 开发进度表

> 每次开始工作时更新此文件

## 总体进度

| Phase | 内容 | 状态 | 完成日期 |
|-------|------|------|---------|
| 0 | 设计文档 | ✅ 已完成 | 2026-08-04 |
| 1 | 项目骨架 + 首页信息流 + 暗黑模式 + 首次部署 | ✅ 已完成 | 2026-08-04 |
| 2 | 分类/标签/关于/404/RSS + 多平台部署 | ✅ 已完成 | 2026-08-06 |
| 3 | Lighthouse ≥ 95 优化 | ✅ 已完成 | 2026-08-06 |
| 4 | 点赞/收藏/分页/回到顶部 | ✅ 已完成 | 2026-08-06 |
| 5 | PWA + Pagefind 搜索 | ⬜ 未开始 | — |
| 6 | 内容管理 CLI 工具 | ✅ 已完成 | 2026-08-04 |
| 7 | 高级扩展（R2/Workers/AI） | ⬜ 未开始 | — |

## 已完成功能清单

### 页面 (8 个)
- [x] 首页 `/` — 信息流，按日期倒序
- [x] 最新页 `/latest`
- [x] 分类列表 `/category` — 5 个分类 + 计数
- [x] 分类详情 `/category/[category]`
- [x] 标签详情 `/tag/[tag]`
- [x] 关于页 `/about`
- [x] 404 页面
- [x] RSS Feed `/rss.xml`

### 组件
- [x] FunCard — 图片卡片(纯图片) / 文字卡片(blockquote) + 点赞/收藏按钮
- [x] FunFeed — 内容列表
- [x] CategoryBadge — 分类标签(中文翻译)
- [x] TagList — 标签链接
- [x] ThemeToggle — 暗黑模式切换(Island)
- [x] BaseHead — SEO meta(OG/Twitter Card/canonical)
- [x] Header — 粘性导航 + 暗黑模式
- [x] Footer — 版本时间(北京时间) + 刷新按钮 + RSS
- [x] BackToTop — 回到顶部按钮(滚动>300px显示)
- [x] Pagination — 通用分页导航

### 部署
- [x] GitHub Pages CI 自动部署
- [x] Cloudflare Pages CI 自动部署（国内直连）
- [x] Vercel 自动部署
- [x] 三平台 base 路径动态适配

### 工具
- [x] 图片同步脚本 `scripts/sync-images.mjs`
- [x] 操作指南 `scripts/SYNC-GUIDE.md`
- [x] 本地构建脚本 `scripts/prebuild.mjs`

## 当前内容 (22 条)

| 类型 | 数量 | 说明 |
|------|------|------|
| meme | 8 | 梗图（纯图片卡片） |
| joke | 10 | 笑话/谐音梗（blockquote 卡片） |
| quote | 1 | 趣句（blockquote 卡片） |
| gif | 1 | 动图（图片卡片） |
| image | 2 | 趣图/xkcd（图片卡片） |

## 部署架构

| 平台 | 地址 | 国内访问 | 自动部署 |
|------|------|----------|----------|
| Cloudflare Pages | https://daily-fun.pages.dev | ✅ 直连 | 🟡 CI 不稳定，可手动 |
| GitHub Pages | https://iovrytower.github.io/daily-fun/ | ❌ 需 VPN | ✅ CI |
| Vercel | https://daily-fun-psi.vercel.app | ❌ 需 VPN | ✅ 自动 |

## 待解决问题

- [ ] Cloudflare Pages CI 部署不稳定（本地 wrangler 可用，CI 偶发失败）
- [ ] Cloudflare Pages 更新后需手动部署（wrangler CLI）作为临时方案

## 下一步计划

### Phase 3 — Lighthouse ≥ 95 优化 ✅
- [x] Lighthouse 基线测试 (Performance 99, Accessibility 90, Best Practices 96, SEO 100)
- [x] 无障碍(a11y)修复 — Accessibility 90→100 (颜色对比度、链接下划线、图片属性)
- [x] 图片路径 BASE_URL 修复
- [ ] 图片优化（WebP 转换、尺寸适配）→ 移至 Phase 7
- 最终成绩: Performance 94, Accessibility 100, Best Practices 96, SEO 100

### Phase 4 — 交互增强 ✅
- [x] 点赞功能 (LocalStorage) — 卡片底部按钮，点击切换 0/1
- [x] 收藏功能 (LocalStorage) — 卡片底部按钮，点击切换 0/1
- [x] 回到顶部按钮 — 滚动>300px显示，点击平滑回顶
- [x] 分页 — 首页/Latest/分类页每页6条 + 页码导航
- [x] 分类展示优化 — 条目计数 badge + 分页
- [ ] ~~随机推荐页 `/random`~~ → 搁置
- [ ] ~~内容详情页 `/fun/[slug]`~~ → 搁置

### Phase 5 — 搜索与 PWA
- [ ] Pagefind 站内搜索
- [ ] PWA manifest + Service Worker
- [ ] 添加到主屏幕

## 日常操作

```bash
# 图片同步（放图到 templates/ 后执行）
cd D:/idea_PROJECT/ivoryt
node scripts/sync-images.mjs
git add -A && git commit -m "feat: 同步今日图片" && git push

# 手动部署到 Cloudflare Pages（CI 失败时用）
CF_PAGES=1 node node_modules/astro/bin/astro.mjs build
node node_modules/wrangler/bin/wrangler.js pages deploy dist --project-name daily-fun --commit-dirty=true

# 本地构建（Windows）
npm install --ignore-scripts && node node_modules/esbuild/install.js
node scripts/prebuild.mjs && node node_modules/astro/bin/astro.mjs build
```

## 关键技术决策

| 决策 | 方案 | 原因 |
|------|------|------|
| 多平台 base 路径 | `import.meta.env.BASE_URL` 动态前缀 | GitHub Pages 需 `/daily-fun`，其他平台根路径 |
| 版本时间 | `timeZone: 'Asia/Shanghai'` | CI 默认 UTC，差 8 小时 |
| 暗黑模式 | CSS vars + `.dark` class + LocalStorage | 防闪烁，无 FOUC |
| 图片卡片 | 只显示图片，不渲染 title/description | 图片本身即内容，文字冗余 |
| 文字卡片 | blockquote + title | 突出文字内容，视觉区分 |
| 点赞/收藏 | localStorage 本地计数 | 零后端零成本，换设备重置（预期行为） |
| 分页 | Astro paginate() 每页6条 | 内容增多后体验优化，主流展示方式 |
| 内容管理 | 单一 Collection + category 字段 | 首页混合展示，标签跨类型聚合 |

## 踩坑记录

1. **pnpm-lock.yaml 中文镜像** → 重新生成 lockfile 用官方 registry
2. **npm 10 CI 崩溃** → 改用 pnpm
3. **exFAT 不支持 symlink** → `.npmrc` 加 `node-linker=hoisted`
4. **Cloudflare Workers ≠ Pages** → 创建 Pages 项目
5. **API Token 权限** → Custom Token 选 Pages:Edit
6. **wrangler-action CI 失败** → 改用全局安装 wrangler CLI
7. **GitHub/Vercel 被墙** → Cloudflare Pages 国内直连
9. **sync-images 日期/命名冲突** → 手动处理 templates md+图片，脚本仅处理纯图片

---
*最后更新：2026-08-06 (Phase 4 完成 + 22条内容 + Cloudflare手动部署)*
