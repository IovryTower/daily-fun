// AI Pixel Cat — v5 (economy system: click-to-earn, auto-produce, exchange, upgrade)
// Structure: DOM → Config → State → Save/Load → Economy → Check-in → Achievements
//            → AI Dialogue → UI → Drawing → Events → Behavior → Interaction → Main Loop
(function pixelCat() {
  "use strict";

  // ── DOM: Cat Element ──
  const el = document.createElement("div");
  el.id = "pixel-cat";
  el.ariaHidden = "true";
  el.style.cssText = "position:fixed;pointer-events:auto;z-index:998;cursor:pointer;user-select:none;touch-action:none;";
  document.body.appendChild(el);

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  canvas.style.cssText = "width:64px;height:64px;image-rendering:pixelated;";
  el.appendChild(canvas);

  // Speech bubble
  const sayEl = document.createElement("div");
  sayEl.style.cssText = "position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:var(--color-surface);color:var(--color-text-primary);padding:4px 10px;border-radius:12px;font-size:11px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.15);display:none;pointer-events:none;transition:opacity .3s;";
  el.appendChild(sayEl);

  // Zzz container
  const zzzWrap = document.createElement("div");
  zzzWrap.style.cssText = "position:absolute;top:-24px;right:-12px;pointer-events:none;display:none;width:40px;height:40px;";
  el.appendChild(zzzWrap);

  // Particle container
  const particleWrap = document.createElement("div");
  particleWrap.style.cssText = "position:absolute;top:0;left:0;width:64px;height:64px;pointer-events:none;overflow:visible;";
  el.appendChild(particleWrap);

  // Click +1 floating text container
  const floatWrap = document.createElement("div");
  floatWrap.style.cssText = "position:absolute;top:0;left:0;width:64px;height:64px;pointer-events:none;overflow:visible;";
  el.appendChild(floatWrap);

  // ── DOM: Currency Bar ──
  const currencyBar = document.createElement("div");
  currencyBar.style.cssText = "position:fixed;top:12px;right:12px;z-index:999;background:var(--color-surface);color:var(--color-text-primary);padding:10px 16px;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.12);font-size:13px;line-height:1.8;pointer-events:none;backdrop-filter:blur(8px);border:1px solid var(--color-border,rgba(255,255,255,.1));max-width:calc(100vw - 24px);";
  currencyBar.innerHTML = '<div id="cat-currency-display"></div>';
  document.body.appendChild(currencyBar);

  // ── UI: Shop Panel ──
  const shopBtn = document.createElement("div");
  shopBtn.className = "neko-shop-btn";
  shopBtn.style.cssText = "position:fixed;bottom:12px;left:12px;z-index:999;width:44px;height:44px;background:var(--color-surface);color:var(--color-text-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.15);border:1px solid var(--color-border,rgba(255,255,255,.1));transition:transform .2s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;";
  shopBtn.textContent = "🛒";
  shopBtn.onmouseenter = () => shopBtn.style.transform = "scale(1.1)";
  shopBtn.onmouseleave = () => shopBtn.style.transform = "scale(1)";
  document.body.appendChild(shopBtn);

  const shopPanel = document.createElement("div");
  shopPanel.className = "neko-shop-panel";
  shopPanel.style.cssText = "position:fixed;bottom:64px;left:12px;z-index:999;width:280px;max-width:calc(100vw - 24px);max-height:70vh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--color-surface);color:var(--color-text-primary);border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.2);padding:16px;display:none;font-size:12px;border:1px solid var(--color-border,rgba(255,255,255,.1));backdrop-filter:blur(8px);";
  shopPanel.innerHTML = '<div id="cat-shop-content"></div>';
  document.body.appendChild(shopPanel);

  let shopOpen = false;
  shopBtn.onclick = (e) => {
    e.stopPropagation();
    shopOpen = !shopOpen;
    shopPanel.style.display = shopOpen ? "block" : "none";
    if (shopOpen) renderShop();
  };
  // Close shop when clicking outside
  document.addEventListener("click", (e) => {
    if (shopOpen && !shopPanel.contains(e.target) && e.target !== shopBtn) {
      shopOpen = false;
      shopPanel.style.display = "none";
    }
  });

  // ── UI: Styles & Animations ──
  const style = document.createElement("style");
  style.textContent = [
    "@keyframes zFloat{0%{transform:translate(0,0) scale(.6);opacity:0}30%{opacity:1}100%{transform:translate(6px,-18px) scale(1);opacity:0}}",
    "@keyframes particleBurst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0}}",
    "@keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-30px);opacity:0}}",
    "@keyframes achieveIn{0%{transform:translate(-50%,-50%) scale(.5);opacity:0}60%{transform:translate(-50%,-50%) scale(1.1)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}",
    "@keyframes shopItemHover{0%{background-position:0% 50%}100%{background-position:100% 50%}}",
    "#cat-shop-content .shop-section{margin-bottom:12px}",
    "#cat-shop-content .shop-title{font-size:13px;font-weight:700;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--color-border,rgba(255,255,255,.1))}",
    "#cat-shop-content .shop-item{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin:4px 0;border-radius:8px;cursor:pointer;transition:background .2s;gap:6px}",
    "#cat-shop-content .shop-item:hover{background:var(--color-border,rgba(255,255,255,.08))}",
    "#cat-shop-content .shop-item.disabled{opacity:.4;cursor:not-allowed}",
    "#cat-shop-content .shop-item .item-info{flex:1;min-width:0}",
    "#cat-shop-content .shop-item .item-name{font-weight:600;font-size:12px}",
    "#cat-shop-content .shop-item .item-desc{font-size:10px;opacity:.7}",
    "#cat-shop-content .shop-item .item-cost{font-size:11px;white-space:nowrap;font-weight:600}",
    "#cat-shop-content .shop-item .item-owned{font-size:10px;opacity:.6;margin-left:4px}",
    "@media(max-width:480px){#cat-currency-display{font-size:11px!important;line-height:1.6!important}#cat-currency-display span{font-size:9px!important}}",
    "@media(max-width:480px){#cat-shop-content .shop-item{padding:8px 6px}#cat-shop-content .shop-title{font-size:12px}}",
    "@media(max-width:480px){.neko-shop-btn{width:48px!important;height:48px!important;font-size:22px!important;bottom:16px!important}}",
    "@media(max-width:480px){.neko-shop-panel{width:calc(100vw - 24px)!important;left:12px!important;bottom:72px!important;max-height:60vh!important}}",
  ].join("");
  document.head.appendChild(style);

  // ── Drawing: Canvas Setup ──
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const isDark = document.documentElement.classList.contains("dark");
  const C = {
    outline: "#20242b",
    fur: isDark ? "#c8d0da" : "#bfc7d2",
    light: "#f5f6f8",
    shadow: "#77818e",
    stripe: "#555d69",
    eye: "#8eb95c",
    dark: "#182015",
    pink: "#e4a0aa",
    heart: "#ff6b8a",
    star: "#ffd700",
    sparkle: "#fff",
  };

  // ── State: Position & Behavior ──
  let catX = window.innerWidth - 100;
  let catY = window.innerHeight - 100;
  let mouseX = catX;
  let mouseY = catY;
  let frame = 0;
  let lastTs = 0;
  let facing = 1;

  let behavior = "idle";
  let state = "sit";
  let stateTimer = 0;
  let idleTime = 0;
  let idleActionCooldown = 0;

  let sleepPhase = 0;
  let wakeAnim = 0;

  let wanderTargetX = catX;
  let wanderTargetY = catY;
  let wanderPause = 0;
  let wanderSegment = 0;
  let wanderCooldown = 0;

  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let wasDragged = false;

  let lastClickTime = 0;
  let comboCount = 0;
  let comboTimer = 0;
  let lastCatLevel = "";

  let landBounce = 0;
  let zzzTimer = 0;

  // Random events
  let eventTimer = 0;
  let eventCooldown = 30000 + Math.random() * 60000; // 30-90s until first event
  let activeEvent = null; // null or event object
  let eventRemaining = 0;
  let eventBonusMult = 1; // temporary multiplier from events
  let eventPaused = false; // true if production paused by event

  // Mood system
  let mood = 80; // 0-100, starts happy (will be overridden by eco.mood if saved)
  let moodDecayTimer = 0;
  const MOOD_DECAY_INTERVAL = 5000; // lose 1 mood every 5s idle
  const MOOD_CLICK_BOOST = 5;
  const MOOD_FEED_BOOST = 15; // feeding via shop

  // Contextual dialogue
  let dialogueTimer = 0;
  let dialogueCooldown = 15000 + Math.random() * 15000; // 15-30s between auto-dialogues

  const FOLLOW_DIST = 150;
  const CLOSE_DIST = 40;

  // Economy state
  let exchangeMode = "x1"; // x1, x10, max
  let autoAccum = 0;

  // ── Config: Economy ──
  const SAVE_KEY = "pixelCatEconomy";

  // Upgrade definitions
  const UPGRADES = {
    // Auto-produce upgrades (cost: catFood)
    autoProduce: [
      { name: "打工猫", desc: "+1 猫粮/秒", rate: 1, cost: 50, say: "打工啦~" },
      { name: "勤劳猫", desc: "+2 猫粮/秒", rate: 2, cost: 200, say: "更努力了!" },
      { name: "猫经理", desc: "+5 猫粮/秒", rate: 5, cost: 800, say: "我升职了!" },
      { name: "猫老板", desc: "+12 猫粮/秒", rate: 12, cost: 3000, say: "我是老板!" },
      { name: "猫首富", desc: "+30 猫粮/秒", rate: 30, cost: 10000, say: "富可敌国!" },
    ],
    // Click power upgrades (cost: catTreat)
    clickPower: [
      { name: "美味猫条", desc: "点击 +2 猫粮", power: 2, cost: 5, say: "好吃~" },
      { name: "豪华猫条", desc: "点击 +5 猫粮", power: 5, cost: 20, say: "太香了!" },
      { name: "顶级猫条", desc: "点击 +12 猫粮", power: 12, cost: 80, say: "人间美味!" },
    ],
    // Multiplier upgrades (cost: catCan)
    multiplier: [
      { name: "金枪鱼罐头", desc: "全部产出 x2", mult: 2, cost: 3, say: "高级货!" },
      { name: "龙虾罐头", desc: "全部产出 x3", mult: 3, cost: 10, say: "奢华!" },
      { name: "鱼子酱罐头", desc: "全部产出 x5", mult: 5, cost: 30, say: "顶级享受!" },
    ],
  };

  // Exchange rates
  const EXCHANGE = {
    foodToTreat: { from: "catFood", fromAmt: 100, to: "catTreat", toAmt: 1, say: "换到猫条了!", fromIcon: "🐾", toIcon: "🍖" },
    treatToCan: { from: "catTreat", fromAmt: 100, to: "catCan", toAmt: 1, say: "换到罐头了!", fromIcon: "🍖", toIcon: "🥫" },
  };

  // Batch exchange modes
  // exchangeMode moved to state section

  // ── Config: Cosmetics ──
  const COSMETICS = [
    { id: "bow",      name: "🎀 蝴蝶结", cost: 2, desc: "头顶蝴蝶结" },
    { id: "tophat",   name: "🎩 礼帽",   cost: 3, desc: "戴帽子" },
    { id: "shades",   name: "🕶️ 墨镜",   cost: 3, desc: "酷猫墨镜" },
    { id: "crown",    name: "👑 皇冠",   cost: 8, desc: "猫皇加冕" },
    { id: "scarf",    name: "🧣 围巾",   cost: 2, desc: "保暖围巾" },
    { id: "wizhat",   name: "🪄 魔法帽", cost: 5, desc: "巫师帽+魔法粒子" },
  ];

  const CAT_LEVELS = [
    { name: "小奶猫",   minFood: 0,      icon: "🐱" },
    { name: "学徒猫",   minFood: 500,    icon: "😺" },
    { name: "打工猫",   minFood: 2000,   icon: "😸" },
    { name: "精英猫",   minFood: 5000,   icon: "😻" },
    { name: "猫老板",   minFood: 15000,  icon: "😼" },
    { name: "猫皇",     minFood: 50000,  icon: "👑" },
    { name: "猫神",     minFood: 200000, icon: "✨" },
  ];

  const EVENTS = [
    { id: "mouse",  icon: "🐭", name: "老鼠出没",  weight: 25, duration: 5000,  say: "有老鼠!!" },
    { id: "rain",   icon: "🌧️", name: "下雨了",    weight: 15, duration: 10000, say: "好大的雨..." },
    { id: "gift",   icon: "🎁", name: "神秘礼物",  weight: 10, duration: 0,     say: "哇!礼物!" },
    { id: "visit",  icon: "🐱", name: "流浪猫来访", weight: 15, duration: 30000, say: "有朋友来了!" },
    { id: "nap",    icon: "💤", name: "午觉时间",  weight: 20, duration: 15000, say: "好困...睡一会" },
    { id: "fish",   icon: "🐟", name: "钓鱼",      weight: 15, duration: 0,     say: "抓到鱼了!" },
    { id: "butterfly", icon: "🦋", name: "蝴蝶飞舞", weight: 12, duration: 8000, say: "好漂亮的蝴蝶!" },
    { id: "moonlight", icon: "🌙", name: "月光祝福", weight: 8,  duration: 20000, say: "月光好美~" },
    { id: "circus", icon: "🎪", name: "马戏团巡演", weight: 5,  duration: 0,     say: "马戏团来了!" },
  ];

  // ── Config: Achievements ──
  const ACHIEVEMENTS = [
    { id: "firstJob",     name: "初次打工",   icon: "⚒️", desc: "购买第一个自动产出",   check: () => eco.autoLevel >= 1,   reward: { catFood: 20 },  say: "打工第一天!" },
    { id: "food100",      name: "百粮大户",   icon: "💰", desc: "累计赚取 100 猫粮",    check: () => eco.totalFoodEarned >= 100, reward: { catFood: 50 }, say: "小有积蓄!" },
    { id: "food1000",     name: "千粮富翁",   icon: "💎", desc: "累计赚取 1000 猫粮",   check: () => eco.totalFoodEarned >= 1000, reward: { catTreat: 1 }, say: "猫粮自由!" },
    { id: "treat10",      name: "猫条自由",   icon: "🍖", desc: "同时持有 10 猫条",     check: () => eco.catTreat >= 10,   reward: { catTreat: 2 },  say: "猫条管够!" },
    { id: "can5",         name: "罐头收藏家", icon: "🥫", desc: "同时持有 5 猫罐头",    check: () => eco.catCan >= 5,      reward: { catCan: 1 },    say: "罐头大户!" },
    { id: "click500",     name: "点击狂人",   icon: "👆", desc: "累计点击 500 次",      check: () => (eco.totalClicks || 0) >= 500, reward: { catFood: 100 }, say: "手速惊人!" },
    { id: "combo4",       name: "连击大师",   icon: "⚡", desc: "达成 4 连击",          check: () => eco.achievedCombo4,   reward: { catFood: 50 },  say: "连击达人!" },
    { id: "allAuto",      name: "全职猫工",   icon: "🏭", desc: "解锁全部自动产出",     check: () => eco.autoLevel >= 5,   reward: { catTreat: 5 },  say: "打工皇帝!" },
    { id: "allUpgrades",  name: "猫生巅峰",   icon: "👑", desc: "全部升级解锁",         check: () => eco.autoLevel >= 5 && eco.clickLevel >= 3 && eco.multLevel >= 3, reward: { catCan: 10 }, say: "猫生巅峰!" },
    { id: "food10k",      name: "万粮大亨",   icon: "🏦", desc: "累计赚取 10000 猫粮",  check: () => eco.totalFoodEarned >= 10000, reward: { catCan: 3 }, say: "万粮大亨!" },
    { id: "cosmeticAll",  name: "时尚达人",   icon: "👗", desc: "收集全部装饰",         check: () => eco.ownedCosmetics && eco.ownedCosmetics.length >= COSMETICS.length, reward: { catCan: 5 }, say: "时尚达人!" },
    { id: "eventHunter",  name: "事件猎人",   icon: "🎯", desc: "触发 10 次随机事件",    check: () => (eco.eventCount || 0) >= 10, reward: { catTreat: 5 }, say: "事件猎人!" },
    { id: "moodMax",      name: "幸福满溢",   icon: "🌈", desc: "心情达到 100",         check: () => mood >= 100, reward: { catFood: 200 }, say: "幸福满溢!" },
    { id: "checkin7",     name: "坚持签到",   icon: "📅", desc: "连续签到 7 天",        check: () => (eco.checkinStreak || 0) >= 7, reward: { catCan: 2 }, say: "坚持就是胜利!" },
    { id: "highScore",    name: "超越自我",   icon: "🏅", desc: "最高记录超过 50000",    check: () => (eco.highScore || 0) >= 50000, reward: { catCan: 5 }, say: "超越自我!" },
  ];

  function checkAchievements() {
    if (!eco.unlockedAch) eco.unlockedAch = [];
    for (const ach of ACHIEVEMENTS) {
      if (eco.unlockedAch.includes(ach.id)) continue;
      if (ach.check()) {
        eco.unlockedAch.push(ach.id);
        // Grant reward
        if (ach.reward.catFood) { eco.catFood += ach.reward.catFood; eco.totalFoodEarned += ach.reward.catFood; }
        if (ach.reward.catTreat) eco.catTreat += ach.reward.catTreat;
        if (ach.reward.catCan) eco.catCan += ach.reward.catCan;
        // Show notification
        showAchievement(ach);
        saveEconomy();
      }
    }
  }

  function showAchievement(ach) {
    const notif = document.createElement("div");
    let rewardText = "";
    if (ach.reward.catFood) rewardText += `+${ach.reward.catFood}🐾 `;
    if (ach.reward.catTreat) rewardText += `+${ach.reward.catTreat}🍖 `;
    if (ach.reward.catCan) rewardText += `+${ach.reward.catCan}🥫 `;
    notif.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#20242b;padding:16px 28px;border-radius:16px;text-align:center;box-shadow:0 4px 24px rgba(255,215,0,.4);font-size:14px;font-weight:700;pointer-events:none;animation:achieveIn .5s ease-out;";
    notif.innerHTML = `<div style="font-size:28px;margin-bottom:4px">${ach.icon}</div><div>${ach.name}</div><div style="font-size:11px;font-weight:400;opacity:.7;margin-top:2px">${ach.desc}</div><div style="font-size:12px;margin-top:6px;color:#8b4513">${rewardText}</div>`;
    document.body.appendChild(notif);
    say(ach.say);
    spawnParticles("star");
    setTimeout(() => { notif.style.opacity = "0"; notif.style.transition = "opacity .5s"; }, 2500);
    setTimeout(() => notif.remove(), 3000);
  }

  let eco = loadEconomy();

  // ── Economy: Offline Earnings ──
  function calcOfflineEarnings() {
    const now = Date.now();
    const last = eco.lastOnline || 0;
    if (!last || last >= now) { eco.lastOnline = now; saveEconomy(); return; }
    const offlineMs = now - last;
    const maxOfflineMs = 8 * 3600 * 1000; // 8 hours cap
    const effectiveMs = Math.min(offlineMs, maxOfflineMs);
    const rate = getEffectiveAutoRate();
    if (rate <= 0) { eco.lastOnline = now; saveEconomy(); return; }
    const earned = Math.floor(rate * 0.5 * effectiveMs / 1000); // 50% efficiency offline
    if (earned <= 0) { eco.lastOnline = now; saveEconomy(); return; }
    eco.catFood += earned;
    eco.totalFoodEarned += earned;
    eco.lastOnline = now;
    saveEconomy();
    // Show welcome back after a short delay
    const hours = (effectiveMs / 3600000).toFixed(1);
    setTimeout(() => {
      say(`你不在${hours}小时，我赚了${fmtNum(earned)}猫粮！`);
      spawnParticles("star");
    }, 800);
  }
  calcOfflineEarnings();

  // Restore mood from save
  if (typeof eco.mood === "number") mood = eco.mood;

  // Initialize level tracking
  lastCatLevel = getCatLevel().name;

  // ── Economy: Daily Check-in ──
  function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function doCheckin() {
    const today = getTodayStr();
    if (eco.lastCheckin === today) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (eco.lastCheckin === yStr) {
      eco.checkinStreak = (eco.checkinStreak || 0) + 1;
    } else {
      eco.checkinStreak = 1;
    }
    eco.lastCheckin = today;
    // Streak bonus: base 10 food, +5 per streak day, max 50
    const bonus = Math.min(10 + (eco.checkinStreak - 1) * 5, 50);
    eco.catFood += bonus;
    eco.totalFoodEarned += bonus;
    mood = Math.min(100, mood + 5);
    say(`签到第${eco.checkinStreak}天! +${bonus}🐾`);
    spawnParticles("sparkle");
    saveEconomy();
    return true;
  }

  // Auto check-in on load
  const checkedIn = doCheckin();
  if (checkedIn) {
    setTimeout(() => {
      showAchievement({ icon: "📅", name: `每日签到`, desc: `连续${eco.checkinStreak}天，+${Math.min(10 + (eco.checkinStreak - 1) * 5, 50)}🐾` });
    }, 2000);
  }

  function defaultEconomy() {
    return {
      catFood: 0,
      catTreat: 0,
      catCan: 0,
      autoLevel: 0,    // index into UPGRADES.autoProduce
      clickLevel: 0,   // index into UPGRADES.clickPower
      multLevel: 0,    // index into UPGRADES.multiplier
      totalFoodEarned: 0,
      lastOnline: Date.now(),
      totalClicks: 0,
      unlockedAch: [],
      achievedCombo4: false,
      ownedCosmetics: [],  // purchased cosmetic ids
      equippedCosmetic: null, // currently worn cosmetic id
      mood: 80,            // persisted mood
      eventCount: 0,       // total events triggered
      lastCheckin: "",     // last check-in date (YYYY-MM-DD)
      checkinStreak: 0,    // consecutive check-in days
      highScore: 0,        // highest totalFoodEarned ever
      saveVersion: 4,
    };
  }

  function getCatLevel() {
    let lv = CAT_LEVELS[0];
    for (const l of CAT_LEVELS) {
      if (eco.totalFoodEarned >= l.minFood) lv = l;
    }
    return lv;
  }

  function loadEconomy() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        return { ...defaultEconomy(), ...d };
      }
    } catch (e) { /* ignore */ }
    return defaultEconomy();
  }

  function saveEconomy() {
    try {
      eco.lastOnline = Date.now();
      eco.mood = mood;
      if (eco.totalFoodEarned > eco.highScore) eco.highScore = eco.totalFoodEarned;
      localStorage.setItem(SAVE_KEY, JSON.stringify(eco));
    } catch (e) { /* ignore */ }
  }

  function getAutoRate() {
    let rate = 0;
    for (let i = 0; i < eco.autoLevel; i++) rate += UPGRADES.autoProduce[i].rate;
    return rate;
  }

  function getClickPower() {
    return 1 + (eco.clickLevel > 0 ? UPGRADES.clickPower[eco.clickLevel - 1].power : 0);
  }

  function getMultiplier() {
    return eco.multLevel > 0 ? UPGRADES.multiplier[eco.multLevel - 1].mult : 1;
  }

  function getEffectiveAutoRate() {
    return getAutoRate() * getMultiplier();
  }

  function getEffectiveClickPower() {
    return getClickPower() * getMultiplier();
  }

  // Auto-produce accumulator (sub-second precision)
  // autoAccum moved to state section

  function getMoodMultiplier() {
    if (mood >= 80) return 1.5;
    if (mood >= 50) return 1.0;
    if (mood >= 20) return 0.5;
    return 0; // mood < 20: on strike
  }

  function tickEconomy(dt) {
    if (eventPaused) return;
    const rate = getEffectiveAutoRate() * eventBonusMult * getMoodMultiplier();
    if (rate > 0) {
      autoAccum += rate * dt / 1000;
      if (autoAccum >= 1) {
        const earned = Math.floor(autoAccum);
        eco.catFood += earned;
        eco.totalFoodEarned += earned;
        autoAccum -= earned;
      }
    }
  }

  function tickMood(dt) {
    // Mood decays when idle (no clicks for a while)
    if (idleTime > 10000) {
      moodDecayTimer += dt;
      if (moodDecayTimer >= MOOD_DECAY_INTERVAL) {
        moodDecayTimer -= MOOD_DECAY_INTERVAL;
        mood = Math.max(0, mood - 1);
      }
    } else {
      moodDecayTimer = 0;
    }
  }

  // ── AI: Contextual Dialogue ──
  function getContextualDialogue() {
    // Priority: mood > wealth > idle > random
    if (mood < 20) return pick(["不想打工...", "好累...", "罢工!", "没心情..."]);
    if (mood < 50) return pick(["有点无聊...", "嗯...", "还好吧..."]);
    if (eco.catFood > 5000) return pick(["好多粮!", "我是富猫!", "粮仓满了~"]);
    if (eco.catFood > 1000) return pick(["粮不少了!", "继续赚~", "小有积蓄!"]);
    if (eco.catTreat > 5) return pick(["给我吃猫条~", "猫条好香!", "还有猫条吗?"]);
    if (eco.catCan > 0) return pick(["罐头是我的!", "好高级~", "想吃罐头!"]);
    if (idleTime > 15000) return pick(["来玩嘛~", "无聊...", "点我呀!", "主人?"]);
    if (idleTime > 8000) return pick(["嗯...?", "在吗?", "喵~"]);
    // Random idle
    return pick(["喵~", "喵喵!", "嗯哼~", "呼噜~", "蹭蹭~"]);
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function tickDialogue(dt) {
    if (sleepPhase >= 2 || isDragging || state !== "sit") return;
    dialogueTimer += dt;
    if (dialogueTimer >= dialogueCooldown) {
      dialogueTimer = 0;
      dialogueCooldown = 15000 + Math.random() * 20000;
      say(getContextualDialogue());
    }
  }

  // ── UI: Currency Display ──
  function updateCurrencyDisplay() {
    const d = document.getElementById("cat-currency-display");
    if (!d) return;
    const autoRate = getEffectiveAutoRate();
    const moodMult = getMoodMultiplier();
    const effectiveRate = eventPaused ? 0 : autoRate * eventBonusMult * moodMult;
    const clickPwr = getEffectiveClickPower();
    const mult = getMultiplier();
    let eventLine = "";
    if (activeEvent) {
      if (eventPaused) eventLine = `<div style="color:#ff6b6b;font-size:10px">🌧️ 下雨中，产出暂停</div>`;
      else if (eventBonusMult > 1) eventLine = `<div style="color:#8eb95c;font-size:10px">🐱 流浪猫来访，产出x${eventBonusMult}!</div>`;
      else eventLine = `<div style="color:#ffd700;font-size:10px">${activeEvent.icon} ${activeEvent.name}</div>`;
    }
    const moodColor = mood >= 80 ? "#8eb95c" : mood >= 50 ? "#ffd700" : mood >= 20 ? "#ff8c42" : "#ff6b6b";
    const moodLabel = mood >= 80 ? "开心" : mood >= 50 ? "一般" : mood >= 20 ? "低落" : "罢工";
    const catLv = getCatLevel();
    if (lastCatLevel && lastCatLevel !== catLv.name) {
      say(`升级了! ${catLv.icon} ${catLv.name}!`);
      spawnParticles("star");
      showAchievement({ icon: catLv.icon, name: `等级提升: ${catLv.name}`, desc: `累计赚取 ${fmtNum(eco.totalFoodEarned)} 猫粮` });
    }
    lastCatLevel = catLv.name;
    d.innerHTML =
      `<div style="font-weight:700;margin-bottom:2px">${catLv.icon} ${catLv.name}</div>` +
      `<div>🐾 <b>${fmtNum(eco.catFood)}</b> 猫粮${effectiveRate > 0 ? ` <span style="opacity:.6;font-size:10px">(+${effectiveRate}/秒)</span>` : eventPaused ? ` <span style="color:#ff6b6b;font-size:10px">(暂停)</span>` : moodMult === 0 ? ` <span style="color:#ff6b6b;font-size:10px">(罢工)</span>` : ""}</div>` +
      `<div>🍖 <b>${fmtNum(eco.catTreat)}</b> 猫条</div>` +
      `<div>🥫 <b>${fmtNum(eco.catCan)}</b> 猫罐头</div>` +
      `<div style="margin-top:2px">❤️ <span style="color:${moodColor}">${moodLabel}</span> <span style="font-size:10px;opacity:.6">(${Math.round(mood)})</span></div>` +
      eventLine +
      `<div style="margin-top:4px;padding-top:4px;border-top:1px solid var(--color-border,rgba(255,255,255,.1));font-size:10px;opacity:.6">` +
      `点击 +${clickPwr} | 倍率 x${mult}</div>`;
  }

  function fmtNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n;
  }

  // ── UI: Shop Rendering ──
  function renderShop() {
    const c = document.getElementById("cat-shop-content");
    if (!c) return;

    let html = "";

    // Exchange section
    html += '<div class="shop-section">';
    html += '<div class="shop-title" style="display:flex;align-items:center;justify-content:space-between">💱 兑换';
    html += `<div style="display:flex;gap:3px">`;
    for (const m of ["x1", "x10", "max"]) {
      const active = exchangeMode === m;
      html += `<button data-action="setMode" data-mode="${m}" style="padding:1px 6px;border-radius:4px;border:1px solid var(--color-border,rgba(255,255,255,.2));background:${active ? "var(--color-text-primary)" : "transparent"};color:${active ? "var(--color-surface)" : "var(--color-text-primary)"};font-size:10px;cursor:pointer;font-weight:600">${m === "max" ? "MAX" : m}</button>`;
    }
    html += `</div></div>`;
    for (const key of Object.keys(EXCHANGE)) {
      const ex = EXCHANGE[key];
      const count = getExchangeCount(key);
      const canAfford = count > 0;
      const cost = ex.fromAmt * (count || 1);
      const gain = ex.toAmt * (count || 1);
      html += `<div class="shop-item${canAfford ? "" : " disabled"}" data-action="exchange" data-key="${key}">` +
        `<div class="item-info"><div class="item-name">${cost} ${ex.fromIcon} → ${gain} ${ex.toIcon}${count > 1 ? ` x${count}` : ""}</div>` +
        `<div class="item-desc">${ex.from === "catFood" ? "猫粮换猫条" : "猫条换猫罐头"}</div></div>` +
        `<div class="item-cost">${fmtNum(cost)} ${ex.fromIcon}</div></div>`;
    }
    html += '</div>';

    // Mood items
    html += '<div class="shop-section">';
    html += '<div class="shop-title">🌿 心情道具</div>';
    const catnipCost = 5;
    const canAffordCatnip = eco.catTreat >= catnipCost;
    html += `<div class="shop-item${canAffordCatnip ? "" : " disabled"}" data-action="buyCatnip">` +
      `<div class="item-info"><div class="item-name">🌿 猫薄荷</div>` +
      `<div class="item-desc">心情瞬间满！滚地5秒</div></div>` +
      `<div class="item-cost">${catnipCost} 🍖</div></div>`;
    html += `<div style="font-size:10px;opacity:.5;text-align:center">当前心情: ${Math.round(mood)}/100</div>`;
    html += '</div>';

    // Cosmetics
    html += '<div class="shop-section">';
    html += '<div class="shop-title">🎩 外观装饰</div>';
    for (const cos of COSMETICS) {
      const owned = (eco.ownedCosmetics || []).includes(cos.id);
      const equipped = eco.equippedCosmetic === cos.id;
      if (owned) {
        html += `<div class="shop-item" data-action="equip" data-cosid="${cos.id}">` +
          `<div class="item-info"><div class="item-name">${cos.name}</div>` +
          `<div class="item-desc">${cos.desc}</div></div>` +
          `<div style="font-size:11px;white-space:nowrap;font-weight:600">${equipped ? "✅ 穿戴中" : "点击穿戴"}</div></div>`;
      } else {
        const canAfford = eco.catCan >= cos.cost;
        html += `<div class="shop-item${canAfford ? "" : " disabled"}" data-action="buyCosmetic" data-cosid="${cos.id}">` +
          `<div class="item-info"><div class="item-name">${cos.name}</div>` +
          `<div class="item-desc">${cos.desc}</div></div>` +
          `<div class="item-cost">${cos.cost} 🥫</div></div>`;
      }
    }
    html += '</div>';

    // Auto-produce upgrades
    html += '<div class="shop-section">';
    html += '<div class="shop-title">⚙️ 自动产出</div>';
    if (eco.autoLevel < UPGRADES.autoProduce.length) {
      const up = UPGRADES.autoProduce[eco.autoLevel];
      const canAfford = eco.catFood >= up.cost;
      html += `<div class="shop-item${canAfford ? "" : " disabled"}" data-action="upgrade" data-type="autoProduce">` +
        `<div class="item-info"><div class="item-name">${up.name}</div>` +
        `<div class="item-desc">${up.desc}</div></div>` +
        `<div class="item-cost">${fmtNum(up.cost)} 🐾</div></div>`;
    } else {
      html += '<div style="opacity:.5;text-align:center;padding:6px;font-size:11px">✅ 已全部解锁</div>';
    }
    if (eco.autoLevel > 0) {
      html += `<div style="font-size:10px;opacity:.5;text-align:center">当前: +${getAutoRate()}/秒 (x${getMultiplier()} = +${getEffectiveAutoRate()}/秒)</div>`;
    }
    html += '</div>';

    // Click power upgrades
    html += '<div class="shop-section">';
    html += '<div class="shop-title">👆 点击加成</div>';
    if (eco.clickLevel < UPGRADES.clickPower.length) {
      const up = UPGRADES.clickPower[eco.clickLevel];
      const canAfford = eco.catTreat >= up.cost;
      html += `<div class="shop-item${canAfford ? "" : " disabled"}" data-action="upgrade" data-type="clickPower">` +
        `<div class="item-info"><div class="item-name">${up.name}</div>` +
        `<div class="item-desc">${up.desc}</div></div>` +
        `<div class="item-cost">${up.cost} 🍖</div></div>`;
    } else {
      html += '<div style="opacity:.5;text-align:center;padding:6px;font-size:11px">✅ 已全部解锁</div>';
    }
    if (eco.clickLevel > 0) {
      html += `<div style="font-size:10px;opacity:.5;text-align:center">当前: 点击 +${getClickPower()} (x${getMultiplier()} = +${getEffectiveClickPower()})</div>`;
    }
    html += '</div>';

    // Multiplier upgrades
    html += '<div class="shop-section">';
    html += '<div class="shop-title">🥫 产出倍率</div>';
    if (eco.multLevel < UPGRADES.multiplier.length) {
      const up = UPGRADES.multiplier[eco.multLevel];
      const canAfford = eco.catCan >= up.cost;
      html += `<div class="shop-item${canAfford ? "" : " disabled"}" data-action="upgrade" data-type="multiplier">` +
        `<div class="item-info"><div class="item-name">${up.name}</div>` +
        `<div class="item-desc">${up.desc}</div></div>` +
        `<div class="item-cost">${up.cost} 🥫</div></div>`;
    } else {
      html += '<div style="opacity:.5;text-align:center;padding:6px;font-size:11px">✅ 已全部解锁</div>';
    }
    if (eco.multLevel > 0) {
      html += `<div style="font-size:10px;opacity:.5;text-align:center">当前: x${getMultiplier()}</div>`;
    }
    html += '</div>';

    // Stats
    html += '<div style="font-size:10px;opacity:.4;text-align:center;margin-top:8px;padding-top:8px;border-top:1px solid var(--color-border,rgba(255,255,255,.1))">' +
      `累计赚取 ${fmtNum(eco.totalFoodEarned)} 猫粮 | 点击 ${eco.totalClicks || 0} 次</div>`;

    // Achievements
    if (eco.unlockedAch && eco.unlockedAch.length > 0) {
      html += '<div class="shop-section">';
      html += '<div class="shop-title">🏆 成就</div>';
      for (const ach of ACHIEVEMENTS) {
        const unlocked = eco.unlockedAch.includes(ach.id);
        html += `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:11px;${unlocked ? "" : "opacity:.3"}">` +
          `<span>${ach.icon}</span><span style="font-weight:600">${ach.name}</span>` +
          `<span style="font-size:9px;opacity:.6;margin-left:auto">${unlocked ? "✅" : ach.desc}</span></div>`;
      }
      html += '</div>';
    }

    // Daily Check-in
    const today = getTodayStr();
    const alreadyChecked = eco.lastCheckin === today;
    const streak = eco.checkinStreak || 0;
    const checkinBonus = Math.min(10 + streak * 5, 50); // after signing, streak becomes streak+1, bonus = 10+streak*5
    const nextBonus = Math.min(10 + (streak + 1) * 5, 50);
    html += '<div class="shop-section">';
    html += '<div class="shop-title">📅 每日签到</div>';
    if (alreadyChecked) {
      html += `<div style="font-size:11px;opacity:.7">今日已签到 · 连续${streak}天</div>`;
      html += `<div style="font-size:10px;opacity:.5;margin-top:2px">明日可领 +${nextBonus}🐾</div>`;
    } else {
      html += `<div style="font-size:11px">连续${streak}天 · 本次可领 +${checkinBonus}🐾</div>`;
      html += `<button data-action="checkin" style="margin-top:4px;width:100%;padding:6px;border-radius:8px;border:1px solid var(--color-border,rgba(255,255,255,.2));background:var(--color-text-primary);color:var(--color-surface);font-size:12px;cursor:pointer;font-weight:600">📅 签到领取 +${checkinBonus}🐾</button>`;
    }
    html += '</div>';

    // Leaderboard (local)
    const lv = getCatLevel();
    html += '<div class="shop-section">';
    html += '<div class="shop-title">🏆 个人记录</div>';
    html += `<div style="font-size:11px;display:flex;justify-content:space-between"><span>最高累计</span><b>${fmtNum(eco.highScore || 0)} 🐾</b></div>`;
    html += `<div style="font-size:11px;display:flex;justify-content:space-between"><span>当前等级</span><b>${lv.icon} ${lv.name}</b></div>`;
    html += `<div style="font-size:11px;display:flex;justify-content:space-between"><span>签到连续</span><b>${streak} 天</b></div>`;
    html += `<div style="font-size:11px;display:flex;justify-content:space-between"><span>总点击</span><b>${fmtNum(eco.totalClicks || 0)}</b></div>`;
    html += `<div style="font-size:11px;display:flex;justify-content:space-between"><span>事件触发</span><b>${eco.eventCount || 0}</b></div>`;
    html += '</div>';

    // Share
    html += '<div class="shop-section">';
    html += '<div class="shop-title">📤 分享</div>';
    html += '<button data-action="share" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--color-border,rgba(255,255,255,.2));background:transparent;color:var(--color-text-primary);font-size:11px;cursor:pointer">📋 复制猫咪状态</button>';
    html += '</div>';

    // Settings
    html += '<div class="shop-section">';
    html += '<div class="shop-title">⚙️ 设置</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    html += '<button data-action="exportSave" style="flex:1;min-width:70px;padding:4px 8px;border-radius:6px;border:1px solid var(--color-border,rgba(255,255,255,.2));background:transparent;color:var(--color-text-primary);font-size:10px;cursor:pointer">📤 导出</button>';
    html += '<button data-action="importSave" style="flex:1;min-width:70px;padding:4px 8px;border-radius:6px;border:1px solid var(--color-border,rgba(255,255,255,.2));background:transparent;color:var(--color-text-primary);font-size:10px;cursor:pointer">📥 导入</button>';
    html += '<button data-action="resetSave" style="flex:1;min-width:70px;padding:4px 8px;border-radius:6px;border:1px solid rgba(255,80,80,.4);background:transparent;color:#ff5050;font-size:10px;cursor:pointer">🗑️ 重置</button>';
    html += '</div></div>';

    c.innerHTML = html;

    // Bind click events
    c.querySelectorAll(".shop-item:not(.disabled)").forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        if (action === "exchange") doExchange(item.dataset.key);
        else if (action === "upgrade") doUpgrade(item.dataset.type);
        else if (action === "buyCatnip") doBuyCatnip();
        else if (action === "buyCosmetic") doBuyCosmetic(item.dataset.cosid);
        else if (action === "equip") doEquipCosmetic(item.dataset.cosid);
      };
    });
    // Bind mode toggle buttons
    c.querySelectorAll("[data-action='setMode']").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        exchangeMode = btn.dataset.mode;
        renderShop();
      };
    });
    // Bind settings buttons
    c.querySelectorAll("[data-action='exportSave']").forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); doExportSave(); };
    });
    c.querySelectorAll("[data-action='importSave']").forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); doImportSave(); };
    });
    c.querySelectorAll("[data-action='resetSave']").forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); doResetSave(); };
    });
    c.querySelectorAll("[data-action='checkin']").forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); doCheckin(); renderShop(); };
    });
    c.querySelectorAll("[data-action='share']").forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); doShare(); };
    });
  }

  function doExportSave() {
    try {
      const data = JSON.stringify(eco);
      navigator.clipboard.writeText(data).then(() => {
        say("存档已复制到剪贴板~");
        spawnParticles("sparkle");
      }).catch(() => {
        // Fallback: prompt
        prompt("复制存档数据：", data);
      });
    } catch (e) {
      say("导出失败喵...");
    }
  }

  function doImportSave() {
    const input = prompt("粘贴存档数据：");
    if (!input) return;
    try {
      const data = JSON.parse(input);
      if (typeof data.catFood !== "number" || typeof data.saveVersion !== "number") {
        say("存档格式不对喵!");
        return;
      }
      Object.assign(eco, defaultEconomy(), data);
      mood = typeof data.mood === "number" ? data.mood : 80;
      saveEconomy();
      say("存档恢复成功~");
      spawnParticles("sparkle");
      renderShop();
      updateCurrencyDisplay();
    } catch (e) {
      say("存档数据损坏喵...");
    }
  }

  function doResetSave() {
    const confirmed = confirm("确定要重置所有数据吗？猫咪会伤心的！\n\n再次确认：输入 yes 重置");
    if (!confirmed) return;
    // Use a second check via prompt for safety
    const input = prompt('输入 "yes" 确认重置：');
    if (input !== "yes") { say("还好你反悔了~"); return; }
    Object.assign(eco, defaultEconomy());
    mood = 80;
    saveEconomy();
    say("一切从头开始...");
    spawnParticles("sad");
    renderShop();
    updateCurrencyDisplay();
  }

  function doShare() {
    const lv = getCatLevel();
    const text = [
      `${lv.icon} ${lv.name} · 像素小猫`,
      `🐾 猫粮: ${fmtNum(eco.catFood)} | 🍖 猫条: ${fmtNum(eco.catTreat)} | 🥫 猫罐头: ${fmtNum(eco.catCan)}`,
      `❤️ 心情: ${Math.round(mood)} | 📅 签到: ${eco.checkinStreak || 0}天`,
      `🏆 最高: ${fmtNum(eco.highScore || 0)}🐾 | 👆 点击: ${fmtNum(eco.totalClicks || 0)}`,
      `✨ 成就: ${(eco.unlockedAch || []).length}/${ACHIEVEMENTS.length}`,
    ].join("\n");
    try {
      navigator.clipboard.writeText(text).then(() => {
        say("状态已复制~快去分享!");
        spawnParticles("sparkle");
      }).catch(() => {
        prompt("复制猫咪状态：", text);
      });
    } catch (e) {
      prompt("复制猫咪状态：", text);
    }
  }

  function doBuyCatnip() {
    const cost = 5;
    if (eco.catTreat < cost) return;
    eco.catTreat -= cost;
    mood = 100;
    state = "roll";
    say("喵喵喵~好嗨!");
    spawnParticles("heart");
    setTimeout(() => { state = "sit"; }, 5000);
    saveEconomy();
    renderShop();
  }

  function doBuyCosmetic(cosId) {
    const cos = COSMETICS.find(c => c.id === cosId);
    if (!cos || eco.catCan < cos.cost) return;
    if ((eco.ownedCosmetics || []).includes(cosId)) return;
    eco.catCan -= cos.cost;
    if (!eco.ownedCosmetics) eco.ownedCosmetics = [];
    eco.ownedCosmetics.push(cosId);
    eco.equippedCosmetic = cosId;
    say("好看吗~?");
    spawnParticles("star");
    saveEconomy();
    renderShop();
  }

  function doEquipCosmetic(cosId) {
    if (eco.equippedCosmetic === cosId) {
      eco.equippedCosmetic = null;
      say("脱掉了~");
    } else {
      eco.equippedCosmetic = cosId;
      say("换上新装!");
    }
    saveEconomy();
    renderShop();
  }

  function getExchangeCount(key) {
    const ex = EXCHANGE[key];
    const available = Math.floor(eco[ex.from] / ex.fromAmt);
    if (exchangeMode === "x1") return Math.min(1, available);
    if (exchangeMode === "x10") return Math.min(10, available);
    return available; // max
  }

  function doExchange(key) {
    const ex = EXCHANGE[key];
    const count = getExchangeCount(key);
    if (count <= 0) return;
    eco[ex.from] -= ex.fromAmt * count;
    eco[ex.to] += ex.toAmt * count;
    say(count > 1 ? `${count}x ${ex.say}` : ex.say);
    spawnParticles("star");
    saveEconomy();
    renderShop();
  }

  function doUpgrade(type) {
    const list = UPGRADES[type];
    let levelKey;
    if (type === "autoProduce") levelKey = "autoLevel";
    else if (type === "clickPower") levelKey = "clickLevel";
    else if (type === "multiplier") levelKey = "multLevel";
    else return;

    const lvl = eco[levelKey];
    if (lvl >= list.length) return;
    const up = list[lvl];

    // Check currency
    let currencyKey;
    if (type === "autoProduce") currencyKey = "catFood";
    else if (type === "clickPower") currencyKey = "catTreat";
    else if (type === "multiplier") currencyKey = "catCan";
    else return;

    if (eco[currencyKey] < up.cost) return;
    eco[currencyKey] -= up.cost;
    eco[levelKey]++;

    say(up.say);
    spawnParticles(type === "autoProduce" ? "sparkle" : type === "clickPower" ? "heart" : "star");
    // Follow-up dialogue after upgrade
    const followUps = {
      autoProduce: ["打工使我快乐!", "今天也要加油!", "赚钱赚钱!", "冲鸭!"],
      clickPower: ["更有劲了!", "爪子变强了!", "嗷呜!", "力量!"],
      multiplier: ["起飞了!", "倍倍倍!", "暴富路线!", "翻翻翻!"],
    };
    setTimeout(() => { if (state === "sit") say(pick(followUps[type] || ["喵~"])); }, 3000);
    saveEconomy();
    renderShop();
  }

  // ── UI: Float Text ──
  function showFloatText(text) {
    const f = document.createElement("span");
    f.textContent = text;
    f.style.cssText = "position:absolute;left:20px;top:10px;font-size:14px;font-weight:700;color:#ffd700;pointer-events:none;animation:floatUp .8s ease-out forwards;text-shadow:0 1px 3px rgba(0,0,0,.3);";
    floatWrap.appendChild(f);
    setTimeout(() => f.remove(), 800);
  }

  // ── Drawing: Cat Sprite ──
  function box(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  }

  function drawCat() {
    ctx.clearRect(0, 0, 64, 64);
    ctx.save();

    let b = 0;
    if (sleepPhase >= 2) {
      b = Math.sin(frame / 30) * 2;
    } else if (sleepPhase === 1) {
      b = Math.sin(frame / 25) * 1;
    } else if (state === "drag") {
      b = 0;
    } else {
      b = Math.sin(frame / 20) * 0.5;
    }
    ctx.translate(0, b);

    if (landBounce > 0) {
      const t = landBounce / 300;
      const sy = 1 - Math.sin(t * Math.PI) * 0.3;
      const sx = 1 + Math.sin(t * Math.PI) * 0.2;
      ctx.translate(32, 64);
      ctx.scale(sx, sy);
      ctx.translate(-32, -64);
    }

    if (state === "drag") {
      ctx.translate(Math.sin(frame * 0.8) * 1.5, 0);
    }

    // Tail
    const tailWag = sleepPhase >= 2 ? 0
      : state === "drag" ? Math.sin(frame * 1.2) * 3
      : Math.sin(frame / 15) * 1.5;
    box(46 + tailWag, 39, 6, 6, C.fur);
    box(50, 34, 5, 8, C.shadow);

    // Body
    box(19, 31, 26, 24, C.outline);
    box(21, 33, 22, 20, C.fur);
    box(27, 39, 11, 13, C.light);
    [[23, 35], [38, 35], [24, 44], [39, 44]].forEach(p => box(p[0], p[1], 4, 3, C.stripe));

    // Head
    box(16, 10, 33, 28, C.outline);
    box(18, 14, 28, 20, C.fur);

    // Ears
    const earDroop = sleepPhase >= 2 ? 3 : sleepPhase === 1 ? 1 : 0;
    box(20, 6 + earDroop, 8, 9 - earDroop, C.outline);
    box(37, 6 + earDroop, 8, 9 - earDroop, C.outline);
    box(22, 9 + earDroop, 4, 5 - earDroop, C.pink);
    box(39, 9 + earDroop, 4, 5 - earDroop, C.pink);

    // M marking
    [[25, 17], [28, 19], [36, 17], [33, 19]].forEach(p => box(p[0], p[1], 3, 3, C.stripe));

    // Eyes
    const dx = mouseX - catX;
    const dy = mouseY - catY;
    const ox = Math.max(-2, Math.min(2, dx / 80));
    const oy = Math.max(-1, Math.min(1, dy / 80));

    if (sleepPhase >= 2) {
      box(23, 25, 7, 2, C.stripe);
      box(34, 25, 7, 2, C.stripe);
    } else if (sleepPhase === 1) {
      box(23 + ox, 25, 7, 4, C.eye);
      box(34 + ox, 25, 7, 4, C.eye);
      box(26 + ox, 26, 2, 3, C.dark);
      box(37 + ox, 26, 2, 3, C.dark);
      box(23 + ox, 25, 7, 2, C.fur);
      box(34 + ox, 25, 7, 2, C.fur);
    } else if (state === "roll") {
      box(23 + ox, 24, 7, 6, C.eye);
      box(34 + ox, 24, 7, 6, C.eye);
      box(25 + ox, 25, 3, 1, C.dark);
      box(26 + ox, 26, 1, 3, C.dark);
      box(36 + ox, 25, 3, 1, C.dark);
      box(37 + ox, 26, 1, 3, C.dark);
    } else if (state === "yawn") {
      box(23 + ox, 25, 7, 2, C.stripe);
      box(34 + ox, 25, 7, 2, C.stripe);
      box(29, 31, 6, 4, C.pink);
      box(30, 32, 4, 2, C.dark);
    } else if (state === "puff") {
      box(22 + ox, 23, 9, 8, C.eye);
      box(33 + ox, 23, 9, 8, C.eye);
      box(25 + ox, 25, 4, 5, C.dark);
      box(36 + ox, 25, 4, 5, C.dark);
      box(23 + ox, 24, 2, 2, "white");
      box(34 + ox, 24, 2, 2, "white");
    } else if (state === "drag") {
      box(22 + ox, 23, 8, 7, C.eye);
      box(33 + ox, 23, 8, 7, C.eye);
      box(25 + ox, 25, 3, 4, C.dark);
      box(36 + ox, 25, 3, 4, C.dark);
      box(23 + ox, 24, 2, 2, "white");
      box(34 + ox, 24, 2, 2, "white");
    } else if (wakeAnim > 0) {
      const openness = Math.min(6, (300 - wakeAnim) / 50);
      box(23 + ox, 25, 7, openness, C.eye);
      box(34 + ox, 25, 7, openness, C.eye);
      if (openness >= 4) {
        box(26 + ox, 26, 2, Math.min(5, openness - 1), C.dark);
        box(37 + ox, 26, 2, Math.min(5, openness - 1), C.dark);
      }
    } else {
      box(23 + ox, 24, 7, 6, C.eye);
      box(34 + ox, 24, 7, 6, C.eye);
      box(26 + ox, 25, 2, 5, C.dark);
      box(37 + ox, 25, 2, 5, C.dark);
      box(24 + ox, 25, 1, 1, "white");
      box(35 + ox, 25, 1, 1, "white");
    }

    // Nose
    box(30, 30, 4, 3, C.pink);

    // State-specific body mods
    if (state === "chase") {
      // Chase: lean forward, paws out
      box(14, 33, 5, 3, C.fur);
      box(44, 33, 5, 3, C.fur);
      box(30, 32, 4, 3, C.pink);
    } else if (state === "wash") {
      box(18, 20, 5, 5, C.pink);
    } else if (state === "stretch") {
      box(14, 31, 5, 3, C.fur);
      box(44, 31, 5, 3, C.fur);
    } else if (state === "belly") {
      box(27, 42, 11, 8, C.light);
    } else if (state === "roll") {
      box(24, 44, 16, 6, C.light);
      box(22, 42, 4, 3, C.fur);
      box(38, 42, 4, 3, C.fur);
    } else if (state === "sniff") {
      box(30 + Math.sin(frame * 0.5) * 1, 30, 4, 3, C.pink);
    } else if (state === "lick") {
      box(30, 32, 3, 3, "#ff8fa3");
      box(18, 22, 5, 4, C.pink);
    } else if (state === "puff") {
      box(17, 30, 30, 26, C.outline);
      box(15, 10, 36, 28, C.outline);
      for (let i = 0; i < 5; i++) box(17 + i * 7, 8, 3, 4, C.fur);
    }

    // Cosmetics overlay
    const cos = eco.equippedCosmetic;
    if (cos === "bow") {
      box(18, 5, 4, 4, "#ff6b8a");
      box(22, 5, 4, 4, "#ff6b8a");
      box(20, 7, 4, 3, "#ff4070");
    } else if (cos === "tophat") {
      box(22, 0, 20, 6, "#1a1a2e");
      box(18, 6, 28, 4, "#1a1a2e");
      box(24, 2, 4, 2, "#c0c0c0");
    } else if (cos === "shades") {
      box(22 + ox, 23, 9, 5, "#1a1a2e");
      box(33 + ox, 23, 9, 5, "#1a1a2e");
      box(31 + ox, 24, 2, 2, "#1a1a2e");
      box(24 + ox, 24, 3, 2, "#4a90d9");
      box(35 + ox, 24, 3, 2, "#4a90d9");
    } else if (cos === "crown") {
      box(20, 0, 24, 6, "#ffd700");
      box(22, -3, 3, 5, "#ffd700");
      box(30, -4, 3, 6, "#ffd700");
      box(38, -3, 3, 5, "#ffd700");
      box(23, -1, 1, 1, "#ff6b8a");
      box(31, -2, 1, 1, "#4a90d9");
      box(39, -1, 1, 1, "#8eb95c");
    } else if (cos === "scarf") {
      box(17, 37, 30, 4, "#e74c3c");
      box(17, 37, 30, 1, "#c0392b");
      box(44, 39, 5, 8, "#e74c3c");
      box(44, 39, 5, 1, "#c0392b");
    } else if (cos === "wizhat") {
      box(24, -4, 16, 10, "#6c3483");
      box(20, 6, 24, 4, "#6c3483");
      box(28, -8, 8, 6, "#6c3483");
      box(30, -9, 4, 3, "#ffd700");
      // Magic sparkle
      if (frame % 20 < 10) {
        box(28 + Math.sin(frame * 0.3) * 3, -6 + Math.cos(frame * 0.4) * 2, 2, 2, "#fff");
      }
    }

    ctx.restore();
  }

  // ── UI: Speech Bubble ──
  let sayTimeout = null;
  function say(t) {
    sayEl.textContent = t;
    sayEl.style.display = "block";
    sayEl.style.opacity = "1";
    if (sayTimeout) clearTimeout(sayTimeout);
    sayTimeout = setTimeout(() => {
      sayEl.style.opacity = "0";
      setTimeout(() => { sayEl.style.display = "none"; }, 300);
    }, 2000);
  }

  // ── UI: Sleep Zzz ──
  function updateZzz(dt) {
    if (sleepPhase >= 2) {
      zzzWrap.style.display = "block";
      zzzTimer += dt;
      if (zzzTimer > 800) {
        zzzTimer = 0;
        const z = document.createElement("span");
        z.textContent = "Z";
        z.style.cssText = "position:absolute;font-size:10px;color:var(--color-text-secondary);opacity:0;animation:zFloat 1.8s ease-out forwards;";
        z.style.left = (Math.random() * 20) + "px";
        z.style.top = (10 + Math.random() * 10) + "px";
        z.style.fontSize = (8 + Math.random() * 6) + "px";
        zzzWrap.appendChild(z);
        setTimeout(() => z.remove(), 1800);
      }
    } else {
      zzzWrap.style.display = "none";
      zzzTimer = 0;
    }
  }

  // ── UI: Particles ──
  function spawnParticles(type) {
    const count = type === "heart" ? 5 : type === "star" ? 6 : type === "sparkle" ? 8 : type === "sad" ? 4 : 4;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.textContent = type === "heart" ? "♥" : type === "star" ? "★" : type === "sparkle" ? "✨" : type === "sad" ? "💧" : "✦";
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const dist = 20 + Math.random() * 25;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      const color = type === "heart" ? C.heart : type === "star" ? C.star : type === "sparkle" ? "#ffd700" : type === "sad" ? "#6eb5ff" : C.sparkle;
      p.style.cssText = `position:absolute;left:28px;top:28px;font-size:${10 + Math.random() * 6}px;pointer-events:none;animation:particleBurst .6s ease-out forwards;--px:${px}px;--py:${py}px;color:${color};`;
      particleWrap.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  // ── Events: Random ──
  function pickRandomEvent() {
    const total = EVENTS.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const e of EVENTS) {
      r -= e.weight;
      if (r <= 0) return e;
    }
    return EVENTS[0];
  }

  function triggerEvent(evt) {
    activeEvent = evt;
    eco.eventCount = (eco.eventCount || 0) + 1;
    say(evt.say);
    spawnParticles("sparkle");

    switch (evt.id) {
      case "mouse": {
        // Chase mouse: earn 10-30 cat food
        const earned = 10 + Math.floor(Math.random() * 21);
        eco.catFood += earned;
        eco.totalFoodEarned += earned;
        state = "chase";
        showFloatText(`+${earned} 🐾`);
        setTimeout(() => { state = "sit"; endEvent(); }, evt.duration);
        break;
      }
      case "rain": {
        // Rain: production paused for duration
        eventPaused = true;
        setTimeout(() => { eventPaused = false; endEvent(); }, evt.duration);
        break;
      }
      case "gift": {
        // Random gift: 1-5 treats or 1 can
        if (Math.random() < 0.8) {
          const treats = 1 + Math.floor(Math.random() * 5);
          eco.catTreat += treats;
          say(`获得 ${treats} 猫条!`);
        } else {
          eco.catCan += 1;
          say("获得 1 猫罐头!");
        }
        spawnParticles("star");
        endEvent();
        break;
      }
      case "visit": {
        // Visitor: 2x production for duration
        eventBonusMult = 2;
        setTimeout(() => { eventBonusMult = 1; endEvent(); }, evt.duration);
        break;
      }
      case "nap": {
        // Nap: forced sleep, wake up with mood boost
        sleepPhase = 2;
        state = "sleep";
        behavior = "sleep";
        setTimeout(() => { wakeUp(); mood = Math.min(100, mood + 20); endEvent(); }, evt.duration);
        break;
      }
      case "fish": {
        // Fish: instant 20-50 cat food
        const earned = 20 + Math.floor(Math.random() * 31);
        eco.catFood += earned;
        eco.totalFoodEarned += earned;
        showFloatText(`+${earned} 🐾`);
        endEvent();
        break;
      }
      case "butterfly": {
        // Butterfly: chase it, mood +15, small food bonus
        mood = Math.min(100, mood + 15);
        const bf = 5 + Math.floor(Math.random() * 11);
        eco.catFood += bf;
        eco.totalFoodEarned += bf;
        state = "chase";
        showFloatText(`+${bf} 🐾 ❤️`);
        setTimeout(() => { state = "sit"; endEvent(); }, evt.duration);
        break;
      }
      case "moonlight": {
        // Moonlight: 3x production for duration
        eventBonusMult = 3;
        setTimeout(() => { eventBonusMult = 1; endEvent(); }, evt.duration);
        break;
      }
      case "circus": {
        // Circus: random big reward
        const r = Math.random();
        if (r < 0.4) {
          const ce = 50 + Math.floor(Math.random() * 51);
          eco.catFood += ce; eco.totalFoodEarned += ce;
          say(`马戏团赏了 ${ce} 猫粮!`);
          showFloatText(`+${ce} 🐾`);
        } else if (r < 0.75) {
          const ct = 2 + Math.floor(Math.random() * 4);
          eco.catTreat += ct;
          say(`马戏团送了 ${ct} 猫条!`);
          showFloatText(`+${ct} 🍖`);
        } else {
          eco.catCan += 1;
          say("马戏团奖励 1 猫罐头!");
          showFloatText("+1 🥫");
        }
        spawnParticles("star");
        endEvent();
        break;
      }
    }
    saveEconomy();
  }

  function endEvent() {
    activeEvent = null;
    eventCooldown = 30000 + Math.random() * 90000; // 30-120s until next
    eventTimer = 0;
  }

  function tickEvents(dt) {
    if (activeEvent) {
      eventRemaining -= dt;
      return;
    }
    eventTimer += dt;
    if (eventTimer >= eventCooldown) {
      eventTimer = 0;
      if (sleepPhase < 2 && !isDragging) {
        triggerEvent(pickRandomEvent());
      } else {
        eventCooldown = 10000 + Math.random() * 20000;
      }
    }
  }

  // ── Behavior: Wander ──
  function pickWanderTarget() {
    const margin = 80;
    const range = 100 + Math.random() * 200;
    wanderTargetX = Math.max(margin, Math.min(window.innerWidth - margin,
      catX + (Math.random() - 0.5) * range));
    wanderTargetY = Math.max(margin, Math.min(window.innerHeight - margin,
      catY + (Math.random() - 0.5) * range));
  }

  function startWander() {
    if (behavior === "wander" || isDragging || sleepPhase >= 1) return;
    behavior = "wander";
    wanderSegment = 0;
    wanderPause = 0;
    pickWanderTarget();
  }

  // ── Behavior: Wake / Sleep ──
  function wakeUp() {
    if (sleepPhase === 0) return;
    sleepPhase = 0;
    behavior = "idle";
    state = "sit";
    wakeAnim = 300;
    say("嗯...?");
    idleTime = 0;
  }

  function enterSleep() {
    sleepPhase = 1;
    say("好困...");
    setTimeout(() => {
      if (sleepPhase === 1 && idleTime > 6000) {
        sleepPhase = 2;
        state = "sleep";
        behavior = "sleep";
      }
    }, 2000);
  }

  // ── Interaction: Pointer ──
  function onPointerDown(e) {
    e.stopPropagation();
    e.preventDefault();
    isDragging = true;
    wasDragged = false;
    const rect = el.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    el.style.cursor = "grabbing";
    if (sleepPhase >= 1) {
      sleepPhase = 0;
      wakeAnim = 0;
      zzzWrap.style.display = "none";
    }
    behavior = "idle";
    state = "drag";
    idleTime = 0;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    wasDragged = true;
    catX = e.clientX - dragOffsetX + 32;
    catY = e.clientY - dragOffsetY + 32;
    catX = Math.max(32, Math.min(window.innerWidth - 32, catX));
    catY = Math.max(32, Math.min(window.innerHeight - 32, catY));
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    el.style.cursor = "pointer";
    if (wasDragged) {
      landBounce = 300;
      state = "sit";
      say("喵!");
      setTimeout(() => { wasDragged = false; }, 50);
    } else {
      state = "sit";
    }
    behavior = "idle";
    idleTime = 0;
  }

  el.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerup", onPointerUp, { passive: true });

  // ── Interaction: Click & Combo ──
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if (wasDragged) return;

    if (sleepPhase >= 1) { wakeUp(); return; }

    // Economy: earn cat food on click
    const earned = getEffectiveClickPower();
    const moodMult = getMoodMultiplier();
    const actualEarned = moodMult > 0 ? Math.max(1, Math.round(earned * moodMult)) : 0;
    eco.catFood += actualEarned;
    eco.totalFoodEarned += actualEarned;
    eco.totalClicks = (eco.totalClicks || 0) + 1;
    mood = Math.min(100, mood + MOOD_CLICK_BOOST);
    showFloatText(actualEarned > 0 ? `+${actualEarned} 🐾` : "罢工中!");
    saveEconomy();

    const now = Date.now();
    if (now - lastClickTime < 400) {
      comboCount++;
      comboTimer = 1500;
      if (comboCount >= 4) {
        state = "puff";
        say("喵喵喵!!!");
        eco.achievedCombo4 = true;
        spawnParticles("star");
        setTimeout(() => { state = "sit"; idleTime = 0; comboCount = 0; }, 2000);
      } else if (comboCount === 3) {
        state = "yawn";
        say("哈~~~");
        spawnParticles("sparkle");
        setTimeout(() => { state = "sit"; idleTime = 0; }, 2000);
      } else {
        state = "roll";
        say("翻肚肚~");
        spawnParticles("heart");
        setTimeout(() => { state = "sit"; idleTime = 0; }, 2500);
      }
      lastClickTime = 0;
    } else {
      lastClickTime = now;
      const actions = ["wash", "stretch", "belly", "sniff", "lick"];
      state = actions[Math.floor(Math.random() * actions.length)];
      const msgs = { wash: "洗脸中~", stretch: "伸懒腰~", belly: "摸肚肚~", sniff: "嗅嗅...", lick: "舔舔~" };
      say(msgs[state] || "喵~");
      stateTimer = 3000;
    }
    behavior = "idle";
    idleTime = 0;
  });

  // Track mouse position
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  // ── Main Loop ──
  let currencyUpdateTimer = 0;
  let autoSaveTimer = 0;

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(ts - lastTs, 100);
    lastTs = ts;

    // Economy tick
    tickEconomy(dt);

    // Random events tick
    tickEvents(dt);

    // Mood tick
    tickMood(dt);

    // Contextual dialogue tick
    tickDialogue(dt);

    // Update currency display (throttled)
    currencyUpdateTimer += dt;
    if (currencyUpdateTimer > 500) {
      currencyUpdateTimer = 0;
      updateCurrencyDisplay();
      checkAchievements();
      if (shopOpen) renderShop();
    }

    // Auto-save every 30s
    autoSaveTimer += dt;
    if (autoSaveTimer > 30000) {
      autoSaveTimer = 0;
      saveEconomy();
    }

    // Combo decay
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) comboCount = 0;
    }

    // State timer
    if (stateTimer > 0) {
      stateTimer -= dt;
      if (stateTimer <= 0 && state !== "drag" && state !== "sleep" && sleepPhase === 0) {
        state = "sit";
      }
    }

    // Wake animation
    if (wakeAnim > 0) {
      wakeAnim -= dt;
      if (wakeAnim <= 0) wakeAnim = 0;
    }

    // Landing bounce
    if (landBounce > 0) {
      landBounce -= dt;
      if (landBounce <= 0) landBounce = 0;
    }

    // Idle action cooldown
    if (idleActionCooldown > 0) idleActionCooldown -= dt;

    // Wander cooldown
    if (wanderCooldown > 0) wanderCooldown -= dt;

    // --- Behavior logic ---
    if (!isDragging) {
      const dx = mouseX - catX;
      const dy = mouseY - catY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < FOLLOW_DIST && sleepPhase >= 1) {
        wakeUp();
      }

      if (sleepPhase >= 2) {
        behavior = "sleep";
      } else if (dist < CLOSE_DIST) {
        if (behavior === "follow") {
          behavior = "idle";
          state = "sit";
        }
        idleTime += dt;
      } else if (dist < FOLLOW_DIST) {
        if (behavior !== "follow") {
          behavior = "follow";
          if (state === "sit" || state === "wash" || state === "stretch" || state === "sniff" || state === "lick") {
            state = "sit";
            stateTimer = 0;
          }
        }
        const speed = Math.min(dist * 0.04, 3);
        catX += (dx / dist) * speed;
        catY += (dy / dist) * speed;
        facing = dx > 0 ? 1 : -1;
        idleTime = 0;
      } else {
        idleTime += dt;

        if (behavior === "follow") {
          behavior = "idle";
          state = "sit";
        }

        if (sleepPhase === 0 && state === "sit" && idleActionCooldown <= 0 && idleTime > 3000 && idleTime < 12000) {
          const actions = mood < 20 ? ["sniff"] : ["wash", "stretch", "sniff", "lick"];
          state = actions[Math.floor(Math.random() * actions.length)];
          const msgs = mood < 20
            ? { sniff: "不想动..." }
            : { wash: "洗脸中~", stretch: "伸懒腰~", sniff: "嗅嗅...", lick: "舔舔~" };
          say(msgs[state] || "喵~");
          stateTimer = 3000;
          idleActionCooldown = 6000;
        }

        if (sleepPhase === 0 && behavior !== "wander" && wanderCooldown <= 0 && idleTime > 5000) {
          startWander();
        }

        if (idleTime > 20000 && sleepPhase === 0 && state === "sit" && behavior !== "wander") {
          enterSleep();
        }
      }

      // Wander movement
      if (behavior === "wander" && sleepPhase === 0) {
        if (wanderPause > 0) {
          wanderPause -= dt;
          if (state === "sit" && Math.random() < 0.003) {
            state = "sniff";
            stateTimer = 1500;
          }
        } else {
          const wx = wanderTargetX - catX;
          const wy = wanderTargetY - catY;
          const wd = Math.sqrt(wx * wx + wy * wy);
          if (wd > 8) {
            const ws = 0.8 + Math.random() * 0.4;
            catX += (wx / wd) * ws;
            catY += (wy / wd) * ws;
            facing = wx > 0 ? 1 : -1;
            if (state === "sniff" || state === "wash" || state === "lick") {
              state = "sit";
              stateTimer = 0;
            }
          } else {
            wanderSegment++;
            if (wanderSegment < 3 || Math.random() < 0.5) {
              pickWanderTarget();
              wanderPause = 800 + Math.random() * 2000;
            } else {
              behavior = "idle";
              wanderSegment = 0;
              wanderCooldown = 3000 + Math.random() * 5000;
              idleTime = 0;
              state = "sit";
            }
          }
        }
      }
    }

    updateZzz(dt);

    // Keep in viewport
    catX = Math.max(32, Math.min(window.innerWidth - 32, catX));
    catY = Math.max(32, Math.min(window.innerHeight - 32, catY));

    el.style.left = (catX - 32) + "px";
    el.style.top = (catY - 32) + "px";
    canvas.style.transform = facing === -1 ? "scaleX(-1)" : "";

    drawCat();
    frame++;
    requestAnimationFrame(tick);
  }

  // Initial display
  updateCurrencyDisplay();
  requestAnimationFrame(tick);
})();
