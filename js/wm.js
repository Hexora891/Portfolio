const WM = (() => {
  let z = 40;
  const wins = new Map();
  let counter = 0;

  const titles = {
    about: "About Me",
    resume: "My Resume",
    contact: "Contact Me",
    paint: "untitled - Paint",
    mines: "Minesweeper",
    snake: "Snake",
    pong: "Pong",
    g2048: "2048",
    viewer: "Windows Picture and Fax Viewer",
    computer: "My Computer",
    properties: "Display Properties",
    dialog: "Ayush XP"
  };

  function iconFor(id) {
    return ICONS[id] || ICONS.folder;
  }

  function makeResizeHandles(el) {
    ["n", "s", "e", "w", "ne", "nw", "se", "sw"].forEach((dir) => {
      const h = document.createElement("div");
      h.className = `resize ${dir}`;
      h.dataset.dir = dir;
      el.appendChild(h);
    });
  }

  function cascadePos() {
    const n = wins.size;
    return { x: 48 + (n % 8) * 28, y: 28 + (n % 8) * 24 };
  }

  function centerPos(w, h) {
    const d = document.getElementById("desktop").getBoundingClientRect();
    const dw = d.width || innerWidth;
    const dh = d.height || innerHeight - 30;
    return {
      x: Math.max(8, Math.round((dw - w) / 2)),
      y: Math.max(8, Math.round((dh - h) / 2))
    };
  }

  function create(id, opts = {}) {
    const uid = opts.uid || id;
    if (wins.has(uid)) {
      restore(uid);
      focus(uid);
      return wins.get(uid);
    }

    const sizes = {
      about: [780, 500], resume: [920, 900],
      contact: [560, 380], mines: [260, 320], paint: [680, 460],
      snake: [520, 470], pong: [600, 440], g2048: [420, 540],
      viewer: [660, 520],
      computer: [640, 420],
      properties: [380, 230], dialog: [400, 190]
    };
    const [dw, dh] = sizes[id] || [640, 420];
    const def = {
      w: opts.w || dw,
      h: opts.h || dh,
      title: opts.title || titles[id] || id,
      icon: opts.icon || iconFor(id)
    };
    const centered = opts.center != null ? opts.center : id === "dialog";
    const pos = opts.pos || (centered ? centerPos(def.w, def.h) : cascadePos());
    const el = document.createElement("div");
    el.className = "xp-window";
    el.dataset.uid = uid;
    el.style.width = def.w + "px";
    el.style.height = def.h + "px";
    el.style.left = pos.x + "px";
    el.style.top = pos.y + "px";
    el.innerHTML = `
      <div class="title-bar">
        <img src="${def.icon}" alt="">
        <div class="title-bar-text">${def.title}</div>
        <div class="title-btns">
          <button data-act="min" aria-label="Minimize">_</button>
          <button data-act="max" aria-label="Maximize">□</button>
          <button data-act="close" class="close" aria-label="Close">✕</button>
        </div>
      </div>
      <div class="window-body"></div>
    `;
    makeResizeHandles(el);
    document.getElementById("windows").appendChild(el);

    const rec = { id, uid, el, body: el.querySelector(".window-body"), def, maximized: false, prev: null, noDrag: opts.drag === false };
    wins.set(uid, rec);
    bindWindow(rec);
    Apps.mount(id, rec, opts);
    addTask(rec);
    focus(uid);
    clamp(el);
    return rec;
  }

  function bindWindow(rec) {
    const { el } = rec;
    el.addEventListener("pointerdown", () => focus(rec.uid));
    el.querySelector('[data-act="close"]').onclick = () => close(rec.uid);
    el.querySelector('[data-act="min"]').onclick = () => minimize(rec.uid);
    el.querySelector('[data-act="max"]').onclick = () => toggleMax(rec.uid);

    el.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      const bar = e.target.closest(".title-bar");
      if (!bar) return;
      if (rec.noDrag || rec.maximized) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - r.left;
      const dy = e.clientY - r.top;
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => {
        el.style.left = ev.clientX - dx + "px";
        el.style.top = Math.max(0, ev.clientY - dy) + "px";
      };
      const up = () => {
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        clamp(el);
      };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
    });
    el.querySelector(".title-bar")?.addEventListener("dblclick", () => { if (!rec.noDrag) toggleMax(rec.uid); });

    el.querySelectorAll(".resize").forEach((h) => {
      h.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        if (rec.maximized) return;
        const dir = h.dataset.dir;
        const r = el.getBoundingClientRect();
        const sx = e.clientX, sy = e.clientY;
        h.setPointerCapture(e.pointerId);
        const move = (ev) => {
          let l = r.left, t = r.top, w = r.width, hgt = r.height;
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (dir.includes("e")) w = Math.max(280, r.width + dx);
          if (dir.includes("s")) hgt = Math.max(160, r.height + dy);
          if (dir.includes("w")) { w = Math.max(280, r.width - dx); l = r.left + dx; }
          if (dir.includes("n")) { hgt = Math.max(160, r.height - dy); t = r.top + dy; }
          el.style.left = l + "px";
          el.style.top = Math.max(0, t) + "px";
          el.style.width = w + "px";
          el.style.height = hgt + "px";
        };
        const up = () => {
          h.removeEventListener("pointermove", move);
          h.removeEventListener("pointerup", up);
          rec.onResize?.();
        };
        h.addEventListener("pointermove", move);
        h.addEventListener("pointerup", up);
      });
    });
  }

  function clamp(el) {
    const desk = document.getElementById("desktop").getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.left < -r.width + 80) el.style.left = "-40px";
    if (r.top < 0) el.style.top = "0px";
    if (r.left > desk.width - 80) el.style.left = desk.width - 80 + "px";
    if (r.top > desk.height - 40) el.style.top = desk.height - 40 + "px";
  }

  function focus(uid) {
    wins.forEach((w) => w.el.classList.add("inactive"));
    const rec = wins.get(uid);
    if (!rec) return;
    rec.el.classList.remove("inactive", "min");
    rec.el.style.zIndex = ++z;
    document.querySelectorAll(".task-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.uid === uid);
      b.classList.toggle("min", wins.get(b.dataset.uid)?.el.classList.contains("min"));
    });
  }

  function close(uid) {
    const rec = wins.get(uid);
    if (!rec) return;
    rec.onClose?.();
    rec.el.remove();
    wins.delete(uid);
    document.querySelector(`.task-btn[data-uid="${uid}"]`)?.remove();
    const last = [...wins.values()].pop();
    if (last) focus(last.uid);
  }

  function minimize(uid) {
    const rec = wins.get(uid);
    if (!rec) return;
    rec.el.classList.add("min");
    Sounds.minimize();
    document.querySelector(`.task-btn[data-uid="${uid}"]`)?.classList.add("min");
  }

  function restore(uid) {
    const rec = wins.get(uid);
    if (!rec) return;
    rec.el.classList.remove("min");
  }

  function toggleMax(uid) {
    const rec = wins.get(uid);
    if (!rec) return;
    if (!rec.maximized) {
      rec.prev = { left: rec.el.style.left, top: rec.el.style.top, w: rec.el.style.width, h: rec.el.style.height };
      rec.el.style.left = "0px";
      rec.el.style.top = "0px";
      rec.el.style.width = "100%";
      rec.el.style.height = "100%";
      rec.el.classList.add("max");
      rec.maximized = true;
    } else {
      Object.assign(rec.el.style, { left: rec.prev.left, top: rec.prev.top, width: rec.prev.w, height: rec.prev.h });
      rec.el.classList.remove("max");
      rec.maximized = false;
    }
    requestAnimationFrame(() => rec.onResize?.());
  }

  function addTask(rec) {
    const b = document.createElement("button");
    b.className = "task-btn";
    b.dataset.uid = rec.uid;
    b.innerHTML = `<img src="${rec.def.icon}" alt=""> ${rec.def.title}`;
    b.onclick = () => {
      if (rec.el.classList.contains("min")) restore(rec.uid);
      else if (!rec.el.classList.contains("inactive")) minimize(rec.uid);
      focus(rec.uid);
    };
    document.getElementById("tasks").appendChild(b);
  }

  function open(id, opts) {
    if (id === "github" || id === "linkedin" || id === "x") {
      const href = { github: PROFILE.github, linkedin: PROFILE.linkedin, x: PROFILE.x }[id];
      return create("dialog", {
        uid: "link-" + (++counter),
        w: 380, h: 180, title: "Open Link",
        drag: false,
        payload: { kind: "link", href, label: id }
      });
    }
    return create(id, opts);
  }

  function closeAll() {
    [...wins.keys()].forEach(close);
  }

  return { open, close, focus, minimize, restore, toggleMax, closeAll, wins };
})();
