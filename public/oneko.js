// AI Pixel Cat — v4 (wander-first, proximity follow, sleep, combo, drag)
(function pixelCat() {
  "use strict";

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

  // Inject animations
  const style = document.createElement("style");
  style.textContent = [
    "@keyframes zFloat{0%{transform:translate(0,0) scale(.6);opacity:0}30%{opacity:1}100%{transform:translate(6px,-18px) scale(1);opacity:0}}",
    "@keyframes particleBurst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0}}",
  ].join("");
  document.head.appendChild(style);

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

  // Position
  let catX = window.innerWidth - 100;
  let catY = window.innerHeight - 100;
  let mouseX = catX;
  let mouseY = catY;
  let frame = 0;
  let lastTs = 0;
  let facing = 1;

  // Behavior state machine
  // idle → wander → idle → ... → drowsy → sleep
  // mouse nearby → follow → mouse leaves → idle
  // click/drag interrupts everything
  let behavior = "idle"; // idle, follow, wander, sleep
  let state = "sit";     // sit, wash, stretch, belly, sniff, lick, roll, yawn, puff, drag, sleep
  let stateTimer = 0;
  let idleTime = 0;      // time since last interaction (click/drag)
  let idleActionCooldown = 0;

  // Sleep
  let sleepPhase = 0;    // 0=awake, 1=drowsy, 2=asleep
  let wakeAnim = 0;

  // Wander
  let wanderTargetX = catX;
  let wanderTargetY = catY;
  let wanderPause = 0;
  let wanderSegment = 0;
  let wanderCooldown = 0; // minimum idle time before next wander

  // Drag
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let wasDragged = false;

  // Double-click combo
  let lastClickTime = 0;
  let comboCount = 0;
  let comboTimer = 0;

  // Landing bounce
  let landBounce = 0;

  // Zzz
  let zzzTimer = 0;

  // Proximity thresholds
  const FOLLOW_DIST = 150;  // mouse within this → follow
  const CLOSE_DIST = 40;    // mouse this close → stop following, just idle

  function box(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  }

  // --- Drawing ---
  function drawCat() {
    ctx.clearRect(0, 0, 64, 64);
    ctx.save();

    // Breathing
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

    // Landing bounce
    if (landBounce > 0) {
      const t = landBounce / 300;
      const sy = 1 - Math.sin(t * Math.PI) * 0.3;
      const sx = 1 + Math.sin(t * Math.PI) * 0.2;
      ctx.translate(32, 64);
      ctx.scale(sx, sy);
      ctx.translate(-32, -64);
    }

    // Drag shake
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

    // Eyes — always track mouse visually
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

  // --- Speech bubble ---
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

  // --- Zzz ---
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

  // --- Particles ---
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

  // --- Wander ---
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

  // --- Wake up ---
  function wakeUp() {
    if (sleepPhase === 0) return;
    sleepPhase = 0;
    behavior = "idle";
    state = "sit";
    wakeAnim = 300;
    say("嗯...?");
    idleTime = 0;
  }

  // --- Enter sleep ---
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

  // --- Pointer events ---
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

  // --- Click / double-click combo ---
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    if (wasDragged) return;

    if (sleepPhase >= 1) { wakeUp(); return; }

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

  // Track mouse position (for eye follow + proximity check)
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

  // --- Main loop ---
  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(ts - lastTs, 100);
    lastTs = ts;

    // Combo decay
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) comboCount = 0;
    }

    // State timer (for timed actions like wash, stretch, etc.)
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

    // --- Behavior logic (only when not dragging) ---
    if (!isDragging) {
      const dx = mouseX - catX;
      const dy = mouseY - catY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Proximity check: mouse nearby interrupts sleep/wander
      if (dist < FOLLOW_DIST && sleepPhase >= 1) {
        wakeUp();
      }

      // Determine behavior based on mouse proximity and current state
      if (sleepPhase >= 2) {
        // Sleeping — don't move
        behavior = "sleep";
      } else if (dist < CLOSE_DIST) {
        // Mouse very close — just sit and look at it
        if (behavior === "follow") {
          behavior = "idle";
          state = "sit";
        }
        idleTime += dt;
      } else if (dist < FOLLOW_DIST) {
        // Mouse nearby — follow it
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
        // Mouse far away — cat does its own thing
        idleTime += dt;

        if (behavior === "follow") {
          // Mouse just left proximity — go back to idle
          behavior = "idle";
          state = "sit";
        }

        // Idle actions
        if (sleepPhase === 0 && state === "sit" && idleActionCooldown <= 0 && idleTime > 3000 && idleTime < 12000) {
          const actions = ["wash", "stretch", "sniff", "lick"];
          state = actions[Math.floor(Math.random() * actions.length)];
          const msgs = { wash: "洗脸中~", stretch: "伸懒腰~", sniff: "嗅嗅...", lick: "舔舔~" };
          say(msgs[state] || "喵~");
          stateTimer = 3000;
          idleActionCooldown = 6000;
        }

        // Start wandering
        if (sleepPhase === 0 && behavior !== "wander" && wanderCooldown <= 0 && idleTime > 5000) {
          startWander();
        }

        // Sleep progression
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

    // Update Zzz
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

  requestAnimationFrame(tick);
})();
