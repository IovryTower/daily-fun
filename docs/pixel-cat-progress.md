# Daily Fun — 开发进度

## 像素小猫经济系统

### 已完成 ✅

### v5 基础经济系统
- [x] 三层货币体系：🐾猫粮 / 🍖猫条 / 🥫猫罐头
- [x] 点击产出猫粮（受升级加成）
- [x] 自动产出升级（5级，花猫粮）
- [x] 点击加成升级（3级，花猫条）
- [x] 产出倍率升级（3级，花猫罐头）
- [x] 兑换：100猫粮→1猫条，100猫条→1猫罐头
- [x] 右上角货币显示栏
- [x] 左下角商店按钮+面板
- [x] 点击飘字 +N 🐾
- [x] 升级/兑换时小猫说话+粒子特效
- [x] localStorage 持久化
- [x] 商店按钮移到左下角（避免与置顶按钮重叠）

### P0 — 核心体验
- [x] 离线收益（重新打开页面计算离线产出，效率减半，上限8小时，欢迎气泡）
- [x] 批量兑换（x1 / x10 / xMax 模式切换按钮）

### P1 — 趣味性
- [x] 随机事件系统（6种：🐭老鼠/🌧️下雨/🎁礼物/🐱流浪猫/💤午觉/🐟钓鱼）
- [x] 成就系统（初始9个里程碑成就+奖励+金色弹窗通知+粒子特效，后续扩展至22个）

### P2 — 互动深度
- [x] 猫咪心情系统（0-100，影响产出效率，心情低罢工，🌿猫薄荷3猫条+🧸毛绒玩具1猫条）
- [x] 对话升级深化（根据经济状态/心情/闲置时间主动说话，升级后追加对话）

### P3 — 视觉差异化
- [x] 猫咪外观系统（6种装饰：🎀蝴蝶结/🎩礼帽/🕶️墨镜/👑皇冠/🧣围巾/🪄魔法帽，像素画叠加显示）

### Bug 修复 & 体验优化
- [x] 商店按钮与置顶按钮重叠 → 移至左下角
- [x] 函数嵌套作用域bug（doBuyCatnip/doBuyCosmetic/doEquipCosmetic 闭合括号修复）
- [x] 心情值未持久化 → defaultEconomy添加mood字段 + save/load同步
- [x] 点击面板外关闭商店
- [x] 定期自动保存（30秒间隔，主循环内计时器）

### P4 — 数据安全
- [x] 存档导出（复制JSON到剪贴板，fallback用prompt）
- [x] 存档导入（粘贴JSON恢复，格式校验）
- [x] 数据重置（二次确认：confirm+prompt输入yes，防误操作）
- [x] 粒子特效扩展（sparkle✨金色、sad💧蓝色）

### P5 — 移动端适配
- [x] 货币栏响应式（max-width约束 + 小屏字号缩小）
- [x] 商店面板响应式（max-width:calc(100vw-24px) + 小屏近全屏）
- [x] 商店按钮触摸优化（touch-action:manipulation + 小屏增大48px）
- [x] 商店面板滚动优化（-webkit-overflow-scrolling:touch）
- [x] 媒体查询样式注入（@media max-width:480px）

### P6 — 更多内容扩展
- [x] 3种新随机事件：🦋蝴蝶(心情+15+小猫粮)、🌙月光(3x产出20秒)、🎪马戏团(随机大奖)
- [x] 4个新成就：🏦万粮大亨(50k)、👗时尚达人、🎯事件猎人(25次)、🌈幸福满溢(持续30秒)
- [x] 事件计数器（eco.eventCount，用于成就追踪）
- [x] 猫咪等级系统（7级：小奶猫→学徒猫→打工猫→精英猫→猫老板→猫皇→猫神）
- [x] 等级显示在货币栏顶部
- [x] 等级提升通知（弹窗+粒子+对话）

### P7 — 社交/竞争功能
- [x] 每日签到系统（连续签到递增奖励：10+5x天数，上限50🐾，自动签到+手动补签）
- [x] 本地排行榜/个人记录（最高累计、当前等级、签到连续、总点击、事件触发）
- [x] 分享功能（复制猫咪状态文本卡片到剪贴板）
- [x] 2个新成就：📅坚持签到(14天)、🏅超越自我(200000最高记录)
- [x] highScore自动追踪（saveEconomy中更新）

### P8 — 代码重构
- [x] 配置常量集中（CAT_LEVELS/EVENTS 移至 Config 区，与 UPGRADES/EXCHANGE/COSMETICS/ACHIEVEMENTS 同区）
- [x] 状态变量集中（exchangeMode/autoAccum/sayTimeout 移至 State 区）
- [x] 统一分区标记格式（`── Category: Name ──`，25个分区清晰标注）
- [x] 文件顶部添加结构目录注释
- [x] 语法验证通过

### Bug 修复 (v5.1)
- [x] sayTimeout TDZ 错误（`Cannot access 'sayTimeout' before initialization`）→ 移至 State 区提前声明
- [x] 商店按钮+面板+货币栏移至右上角（商店按钮 top:12px/right:12px，面板向下展开，货币栏 top:56px）
- [x] 移动端媒体查询适配新位置

### P9 — 心情系统重平衡
- [x] 点击心情冷却3秒（MOOD_CLICK_COOLDOWN=3000，MOOD_CLICK_BOOST从5降为2）
- [x] 心情衰减加速（MOOD_DECAY_INTERVAL从5秒改为3秒，闲置5秒后开始衰减）
- [x] 猫薄荷增强：心情满+产出x1.5持续60秒（catnipBuff倒计时），价格从5降为3猫条
- [x] 新增🧸毛绒玩具道具：1猫条→心情+30，玩5秒
- [x] 货币栏显示猫薄荷buff倒计时

### P10 — 成就系统重平衡
- [x] 11个成就门槛提升（food100→500, food1000→5000, click500→2000, combo4→6, moodMax→持续30秒, eventHunter→25, food10k→50000, highScore→200000, checkin7→14, treat10→25, can5→10）
- [x] 5个新长期成就：💰十万粮王(100k)、🖱️点击之神(10k点击)、🎭收藏家(全装饰+全升级)、😻快乐猫生(心情80+累计1小时)、🌟命运之子(触发全部9种事件)
- [x] moodMax改为持续检测（eco.moodMaxTime，心情100累计30秒）
- [x] 事件种类追踪（eco.seenEvents，triggerEvent中记录unique id）
- [x] 快乐时长追踪（eco.totalHappyTime，心情>=80累计）
- [x] 连击系统升级：4连击→普通puff，6连击→成就puff

### P11 — 猫咪技能系统
- [x] 3个可升级技能（猫罐头购买）：🎯精准捕猎(+10/20/30%点击)、🍀幸运体质(-10/20/30%事件间隔)、💤优质睡眠(离线效率60/70/80%)
- [x] 技能效果实现：getEffectiveClickPower/calcOfflineEarnings/endEvent中应用
- [x] 商店新增🧬猫咪技能区（显示等级、效果、升级费用）
- [x] 新增成就：🧬技能全满(3技能全3级)

### P12 — 每日任务系统
- [x] 每日3个随机任务（5种任务池：点击/赚取/事件/猫薄荷/心情）
- [x] 任务进度追踪（点击/赚取/事件/猫薄荷/心情各对应updateQuestProgress）
- [x] 任务领取+全部完成额外奖励1猫罐头
- [x] 商店新增📋每日任务区（进度条+领取按钮）
- [x] 新增成就：📋任务达人(累计完成10组每日任务)
- [x] 每日自动重置（ensureDailyQuests检查日期）

### P13A — 猫咪地产系统
- [x] 5级地产（🏠小窝50K/🌳猫薄荷园200K/🏪猫粮商店1M/🏰猫咪城堡5M/🌌猫咪星球50M）
- [x] 地产效果：小窝自动心情+1/10秒，猫薄荷园每5分钟免费猫薄荷，商店兑换80:1，城堡+25%产出，星球+50%产出
- [x] `getEstateBonus()` 产出加成计算（城堡+25%，星球+50%）
- [x] `getExchangeRate()` 动态兑换比例（拥有商店地产后80猫粮→1猫条）
- [x] `doBuyEstate()` 地产购买逻辑
- [x] 星球地产解锁"星际猫"外观
- [x] 商店新增🏠猫咪地产区
- [x] 3个新成就：🏠安居乐业(小窝)/🏰城堡之主(城堡)/🌌星际猫神(星球)

### P13B — 猫咪抽奖系统
- [x] 普通抽奖(2罐头)和豪华抽奖(10罐头)两种
- [x] 加权随机奖池：猫粮/猫条/罐头/装饰碎片/空
- [x] 3种碎片收集外观：🌈彩虹猫/👻幽灵猫/🔥火焰猫（各需10碎片）
- [x] `rollGacha()` 加权随机抽奖，`doGacha()` 执行抽奖+碎片收集
- [x] `showGachaResult()` 浮动通知显示结果
- [x] 彩虹/幽灵/火焰/星际猫像素画渲染
- [x] 商店新增🎰猫咪抽奖区 + 碎片外观在装饰区
- [x] 3个新成就：🎰赌猫(首次抽奖)/🌈彩虹猫(收集)/👻幽灵猫(收集)

### saveVersion 升级
- [x] v4 → v5，defaultEconomy新增：skillHunt/skillLuck/skillSleep/moodMaxTime/totalHappyTime/seenEvents/dailyQuests/questsCompleted/achievedCombo6
- [x] v5 → v6，defaultEconomy新增：ownedEstate/gachaShards/gachaCosmetics/estateGardenTimer

### P14A — 修复hover闪烁 + 购买反馈
- [x] 删除死代码 `@keyframes shopItemHover`
- [x] 增量更新替代全量重建：`renderShop()` → `buildShopTab()` + `updateShopData()`
- [x] tick中500ms调用改为 `updateShopData()`，不再重建DOM
- [x] 购买反馈动画：`@keyframes buyFlash`(缩放+绿色闪烁) + `@keyframes buyFail`(抖动)
- [x] 购买冷却：`buyCooldown` 400ms，防止连点
- [x] 所有购买函数改为返回 boolean
- [x] `spawnBuyParticles()` 在item位置生成购买粒子

### P14B — 商店Tab重构
- [x] 4个Tab：🛒商店/📋任务/🏆成就/⚙️设置
- [x] 商店Tab：兑换+心情道具+装饰+升级x3+技能+地产+抽奖
- [x] 任务Tab：每日签到+每日任务
- [x] 成就Tab：全部28个成就(含未解锁)+个人记录+分享
- [x] 设置Tab：导出/导入/重置
- [x] Tab栏CSS：flex均分+active底部accent边框
- [x] `bindShopEvents()` + `bindTabBodyEvents()` 分层事件绑定

### P14C — 地产视觉反馈
- [x] `estateWrap` 容器（小猫canvas周围，96x96区域）
- [x] `ESTATE_ICONS` 配置（5种地产emoji+位置+大小）
- [x] `updateEstateDisplay()` 渲染已购地产emoji图标
- [x] `@keyframes estateFloat` 浮动动画（2-3s周期）
- [x] 购买地产后+页面加载时调用

### P14D — 货币栏交互
- [x] 移除 `pointer-events:none`，添加 `cursor:pointer`
- [x] 点击折叠/展开：折叠显示等级+货币一行，展开显示完整信息
- [x] 商店打开时自动折叠，关闭时恢复展开
- [x] CSS transition 动画

## 文件
- `public/oneko.js` — 全部逻辑（单文件自包含，v7）
- `src/layouts/BaseLayout.astro` — 引入 oneko.js

---

## 内容系统

### 已完成 ✅

#### 弱智吧语录（2026-08-11）
- [x] 15条弱智吧语录迁移至内容集合（`content/fun/2026-08-11-quote-1~15.md`）
- [x] 分类：quote，标签：弱智吧+诗意/哲学/脑洞/毒鸡汤
- [x] `templates/语录.txt` 清空，保留追加模板说明
- [x] 跳过1条敏感内容

#### 分类页增强
- [x] `categoryMeta` 统一（icon+label+desc），替代旧 `categoryLabels`（4处重复）
- [x] 分类首页：emoji图标+描述+条数卡片布局
- [x] 分类详情页：icon+label+desc+条数头部展示
- [x] CategoryBadge：emoji+标签名内联显示
- [x] FunCard quote展示：❝装饰引号 + 斜体 + 大字号 + accent左边框

### 涉及文件
- `src/pages/category/index.astro` — 分类首页
- `src/pages/category/[category].astro` — 分类详情（第1页）
- `src/pages/category/[category]/[page].astro` — 分类详情（分页）
- `src/components/CategoryBadge.astro` — 分类徽章
- `src/components/FunCard.astro` — 内容卡片
- `content/fun/2026-08-11-quote-*.md` — 15条语录内容

#### 关于页完善（2026-08-11）
- [x] 新增"像素小猫"功能介绍区（经济系统、事件、心情、装饰、技能、任务、成就、等级）
- [x] 技术栈改为卡片式展示（Astro 7 / Tailwind CSS 4 / TypeScript / Content Collections / Canvas / localStorage）
- [x] 新增"部署"区（Cloudflare Pages主站 + Vercel + GitHub Pages三平台）
- [x] 新增"开源"说明

## 网页管理后台（CMS，2026-08-24）

### 已完成 ✅
- [x] **架构**：Cloudflare Pages Functions（`functions/` 目录）+ GitHub Contents API 写回仓库 `IovryTower/daily-fun`，push 自动触发三平台 CI
- [x] **鉴权**：`/api/login` 输入 `ADMIN_PASSWORD` → 签发 HMAC token（12h 过期，`ADMIN_SECRET` 签名）；其余接口验 `Authorization: Bearer`；恒定时间比较
- [x] **接口**（`functions/api/`）：
  - `_lib.js` — 共享工具（hmac/token、github 封装、ghPath 段编码、UTF-8 base64、frontmatter 解析/生成）
  - `login.js` / `list.js` / `get.js` / `publish.js` / `delete.js`
- [x] **管理页** `/admin`（`src/pages/admin.astro`）：
  - 登录 → 内容列表（编辑/删除）→ 新建/编辑表单
  - 表单字段：标题/日期/分类(6类)/slug(中文)/标签/图片(png/jpg/gif/webp ≤5MB+预览)/alt/描述/来源/正文
  - slug 由标题自动生成；编辑时锁定 slug 与文件路径
- [x] **安全**：内容路径 `content/fun/{date}-{slug}.md` 白名单正则、图片路径白名单+5MB、frontmatter 字段白名单构建、GITHUB_TOKEN 仅存服务端 env
- [x] **本地验证**（wrangler pages dev）：
  - login 错误/正确密码、无 token 401、非法 slug/分类/path 参数校验、Unicode 路径校验均通过
  - `node node_modules/astro/bin/astro.mjs build` 构建 80 页 OK（pnpm 在 exFAT 上 install 破损，绕过 pnpm 直调 node）

### 待完成 ⏳
- [ ] 配置线上 CF Pages env：`ADMIN_PASSWORD` / `ADMIN_SECRET` / `GITHUB_TOKEN`(Contents 读写) / `GITHUB_REPO=IovryTower/daily-fun`
- [ ] 用真实 GITHUB_TOKEN 完整验证 publish→get→delete 写路径（本地 `.dev.vars` 或线上）
