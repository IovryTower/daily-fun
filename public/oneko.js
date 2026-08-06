// AI Pixel Cat — 自由移动版
// 改编自 AI-Pixel-Cat-v5.html
(function pixelCat() {
  "use strict";

  const el = document.createElement("div");
  el.id = "pixel-cat";
  el.ariaHidden = "true";
  el.style.cssText = "position:fixed;pointer-events:auto;z-index:998;cursor:pointer;";
  document.body.appendChild(el);

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  canvas.style.cssText = "width:64px;height:64px;image-rendering:pixelated;";
  el.appendChild(canvas);

  const sayEl = document.createElement("div");
  sayEl.style.cssText = "position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:var(--color-surface);color:var(--color-text-primary);padding:4px 10px;border-radius:12px;font-size:11px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.15);display:none;pointer-events:none;";
  el.appendChild(sayEl);

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const isDark = document.documentElement.classList.contains("dark");
  const C = {
    outline: "#20242b",
    fur: isDark ? "#bfc7d2" : "#bfc7d2",
    light: "#f5f6f8",
    shadow: "#77818e",
    stripe: "#555d69",
    eye: "#8eb95c",
    dark: "#182015",
    pink: "#e4a0aa",
  };

  let catX = window.innerWidth - 100;
  let catY = window.innerHeight - 100;
  let mouseX = catX;
  let mouseY = catY;
  let frame = 0;
  let state = "sit";
  let idleTime = 0;
  let lastTs = 0;
  let facing = 1; // 1=right, -1=left

  function box(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  }

  function drawCat() {
    ctx.clearRect(0, 0, 64, 64);
    ctx.save();

    const b = Math.sin(frame / 20) * 0.5;
    ctx.translate(0, b);

    // Tail
    const tailWag = Math.sin(frame / 15) * 1;
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
    box(20, 6, 8, 9, C.outline);
    box(37, 6, 8, 9, C.outline);
    box(22, 9, 4, 5, C.pink);
    box(39, 9, 4, 5, C.pink);

    // M marking
    [[25, 17], [28, 19], [36, 17], [33, 19]].forEach(p => box(p[0], p[1], 3, 3, C.stripe));

    // Eyes — follow mouse
    const dx = mouseX - catX;
    const dy = mouseY - catY;
    const ox = Math.max(-2, Math.min(2, dx / 80));
    const oy = Math.max(-1, Math.min(1, dy / 80));

    if (state === "sleep") {
      // Closed eyes
      box(23 + ox, 24, 7, 2, C.stripe);
      box(34 + ox, 24, 7, 2, C.stripe);
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

    // State-specific animations
    if (state === "wash") {
      box(18, 20, 5, 5, C.pink); // paw up
    } else if (state === "stretch") {
      box(14, 31, 5, 3, C.fur); // extended paw
    } else if (state === "belly") {
      box(27, 42, 11, 8, C.light); // exposed belly
    }

    ctx.restore();
  }

  function say(t) {
    sayEl.textContent = t;
    sayEl.style.display = "block";
    setTimeout(() => { sayEl.style.display = "none"; }, 2000);
  }

  function onClick(e) {
    e.stopPropagation();
    const arr = ["wash", "stretch", "belly"];
    state = arr[Math.floor(Math.random() * arr.length)];
    const msgs = { wash: "洗脸中~", stretch: "伸懒腰~", belly: "摸肚肚~" };
    say(msgs[state] || "喵~");
    idleTime = 0;
    setTimeout(() => { state = "sit"; idleTime = 0; }, 3000);
  }

  el.addEventListener("click", onClick);
  el.addEventListener("touchstart", onClick, { passive: true });

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    idleTime = 0;
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
    idleTime = 0;
  }, { passive: true });

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    const dx = mouseX - catX;
    const dy = mouseY - catY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 60) {
      // Move towards mouse
      const speed = Math.min(dist * 0.03, 3);
      catX += (dx / dist) * speed;
      catY += (dy / dist) * speed;
      facing = dx > 0 ? 1 : -1;
      if (state !== "wash" && state !== "stretch" && state !== "belly") {
        state = "sit";
      }
    } else {
      idleTime += dt;
      if (idleTime > 8000) {
        state = "sleep";
      } else if (idleTime > 4000 && state === "sit") {
        const actions = ["wash", "stretch"];
        state = actions[Math.floor(Math.random() * actions.length)];
        say(state === "wash" ? "洗脸中~" : "伸懒腰~");
      }
    }

    // Keep cat in viewport
    catX = Math.max(32, Math.min(window.innerWidth - 32, catX));
    catY = Math.max(32, Math.min(window.innerHeight - 32, catY));

    el.style.left = (catX - 32) + "px";
    el.style.top = (catY - 32) + "px";

    // Flip cat based on facing
    canvas.style.transform = facing === -1 ? "scaleX(-1)" : "";

    drawCat();
    frame++;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
