// AI Pixel Cat — v5 (economy system: click-to-earn, auto-produce, exchange, upgrade)
(function pixelCat() {
  "use strict";

  // ========== DOM Setup ==========
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

  // ========== Currency Display ==========
  const currencyBar = document.createElement("div");
  currencyBar.style.cssText = "position:fixed;top:12px;right:12px;z-index:999;background:var(--color-surface);color:var(--color-text-primary);padding:10px 16px;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.12);font-size:13px;line-height:1.8;pointer-events:none;backdrop-filter:blur(8px);border:1px solid var(--color-border,rgba(255,255,255,.1));";
  currencyBar.innerHTML = '<div id="cat-currency-display"></div>';
  document.body.appendChild(currencyBar);

  // ========== Shop Panel ==========
  const shopBtn = document.createElement("div");
  shopBtn.style.cssText = "position:fixed;bottom:12px;right:12px;z-index:999;width:44px;height:44px;background:var(--color-surface);color:var(--color-text-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.15);border:1px solid var(--color-border,rgba(255,255,255,.1));transition:transform .2s;";
  shopBtn.textContent = "🛒";
  shopBtn.onmouseenter = () => shopBtn.style.transform = "scale(1.1)";
  shopBtn.onmouseleave = () => shopBtn.style.transform = "scale(1)";
  document.body.appendChild(shopBtn);

  const shopPanel = document.createElement("div");
  shopPanel.style.cssText = "position:fixed;bottom:64px;right:12px;z-index:999;width:280px;max-height:70vh;overflow-y:auto;background:var(--color-surface);color:var(--color-text-primary);border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.2);padding:16px;display:none;font-size:12px;border:1px solid var(--color-border,rgba(255,255,255,.1));backdrop-filter:blur(8px);";
  shopPanel.innerHTML = '<div id="cat-shop-content"></div>';
  document.body.appendChild(shopPanel);

  let shopOpen = false;
  shopBtn.onclick = (e) => {
    e.stopPropagation();
    shopOpen = !shopOpen;
    shopPanel.style.display = shopOpen ? "block" : "none";
    if (shopOpen) renderShop();
  };

  // ========== Inject Animations ==========
  const style = document.createElement("style");
  style.textContent = [
    "@keyframes zFloat{0%{transform:translate(0,0) scale(.6);opacity:0}30%{opacity:1}100%{transform:translate(6px,-18px) scale(1);opacity:0}}",
    "@keyframes particleBurst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0}}",
    "@keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-30px);opacity:0}}",
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
  ].join("");
  document.head.appendChild(style);

  // ========== Canvas Drawing ==========
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

  // ========== Position & State ==========
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

  let landBounce = 0;
  let zzzTimer = 0;

  const FOLLOW_DIST = 150;
  const CLOSE_DIST = 40;

  // ========== Economy System ==========
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
    foodToTreat: { from: "catFood", fromAmt: 100, to: "catTreat", toAmt: 1, say: "换到猫条了!" },
    treatToCan: { from: "catTreat", fromAmt: 100, to: "catCan", toAmt: 1, say: "换到罐头了!" },
  };

  let eco = loadEconomy();

  function defaultEconomy() {
    return {
      catFood: 0,
      catTreat: 0,
      catCan: 0,
      autoLevel: 0,    // index into UPGRADES.autoProduce
      clickLevel: 0,   // index into UPGRADES.clickPower
      multLevel: 0,    // index into UPGRADES.multiplier
      totalFoodEarned: 0,
    };
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
  let autoAccum = 0;

  function tickEconomy(dt) {
    const rate = getEffectiveAutoRate();
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

  // ========== Currency Display ==========
  function updateCurrencyDisplay() {
    const d = document.getElementById("cat-currency-display");
    if (!d) return;
    const autoRate = getEffectiveAutoRate();
    const clickPwr = getEffectiveClickPower();
    const mult = getMultiplier();
    d.innerHTML =
      `<div>🐾 <b>${fmtNum(eco.catFood)}</b> 猫粮${autoRate > 0 ? ` <span style="opacity:.6;font-size:10px">(+${autoRate}/秒)</span>` : ""}</div>` +
      `<div>🍖 <b>${fmtNum(eco.catTreat)}</b> 猫条</div>` +
      `<div>🥫 <b>${fmtNum(eco.catCan)}</b> 猫罐头</div>` +
      `<div style="margin-top:4px;padding-top:4px;border-top:1px solid var(--color-border,rgba(255,255,255,.1));font-size:10px;opacity:.6">` +
      `点击 +${clickPwr} | 倍率 x${mult}</div>`;
  }

  function fmtNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n;
  }

  // ========== Shop Rendering ==========
  function renderShop() {
    const c = document.getElementById("cat-shop-content");
    if (!c) return;

    let html = "";

    // Exchange section
    html += '<div class="shop-section">';
    html += '<div class="shop-title">💱 兑换</div>';
    for (const key of Object.keys(EXCHANGE)) {
      const ex = EXCHANGE[key];
      const canAfford = eco[ex.from] >= ex.fromAmt;
      html += `<div class="shop-item${canAfford ? "" : " disabled"}" data-action="exchange" data-key="${key}">` +
        `<div class="item-info"><div class="item-name">${ex.fromAmt} 🐾 → ${ex.toAmt} ${ex.to === "catTreat" ? "🍖" : "🥫"}</div>` +
        `<div class="item-desc">${ex.from === "catFood" ? "猫粮换猫条" : "猫条换猫罐头"}</div></div>` +
        `<div class="item-cost">${ex.fromAmt} 🐾</div></div>`;
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
      `累计赚取 ${fmtNum(eco.totalFoodEarned)} 猫粮</div>`;

    c.innerHTML = html;

    // Bind click events
    c.querySelectorAll(".shop-item:not(.disabled)").forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        if (action === "exchange") doExchange(item.dataset.key);
        else if (action === "upgrade") doUpgrade(item.dataset.type);
      };
    });
  }

  function doExchange(key) {
    const ex = EXCHANGE[key];
    if (eco[ex.from] < ex.fromAmt) return;
    eco[ex.from] -= ex.fromAmt;
    eco[ex.to] += ex.toAmt;
    say(ex.say);
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
    saveEconomy();
    renderShop();
  }

  // ========== Click +1 Float ==========
  function showFloatText(text) {
    const f = document.createElement("span");
    f.textContent = text;
    f.style.cssText = "position:absolute;left:20px;top:10px;font-size:14px;font-weight:700;color:#ffd700;pointer-events:none;animation:floatUp .8s ease-out forwards;text-shadow:0 1px 3px rgba(0,0,0,.3);";
    floatWrap.appendChild(f);
    setTimeout(() => f.remove(), 800);
  }

  // ========== Drawing ==========
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
    if (state === "wash") {
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

    ctx.restore();
  }

  // ========== Speech Bubble ==========
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

  // ========== Zzz ==========
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

  // ========== Particles ==========
  function spawnParticles(type) {
    const count = type === "heart" ? 5 : type === "star" ? 6 : 4;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.textContent = type === "heart" ? "♥" : type === "star" ? "★" : "✦";
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const dist = 20 + Math.random() * 25;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      p.style.cssText = `position:absolute;left:28px;top:28px;font-size:${10 + Math.random() * 6}px;pointer-events:none;animation:particleBurst .6s ease-out forwards;--px:${px}px;--py:${py}px;color:${type === "heart" ? C.heart : type === "star" ? C.star : C.sparkle};`;
      particleWrap.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  // ========== Wander ==========
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

  // ========== Wake / Sleep ==========
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

  // ========== Pointer Events ==========
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

  // ========== Click / Combo + Economy ==========
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if (wasDragged) return;

    if (sleepPhase >= 1) { wakeUp(); return; }

    // Economy: earn cat food on click
    const earned = getEffectiveClickPower();
    eco.catFood += earned;
    eco.totalFoodEarned += earned;
    showFloatText(`+${earned} 🐾`);
    saveEconomy();

    const now = Date.now();
    if (now - lastClickTime < 400) {
      comboCount++;
      comboTimer = 1500;
      if (comboCount >= 4) {
        state = "puff";
        say("喵喵喵!!!");
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

  // ========== Main Loop ==========
  let currencyUpdateTimer = 0;

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(ts - lastTs, 100);
    lastTs = ts;

    // Economy tick
    tickEconomy(dt);

    // Update currency display (throttled)
    currencyUpdateTimer += dt;
    if (currencyUpdateTimer > 500) {
      currencyUpdateTimer = 0;
      updateCurrencyDisplay();
      if (shopOpen) renderShop();
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
          const actions = ["wash", "stretch", "sniff", "lick"];
          state = actions[Math.floor(Math.random() * actions.length)];
          const msgs = { wash: "洗脸中~", stretch: "伸懒腰~", sniff: "嗅嗅...", lick: "舔舔~" };
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
