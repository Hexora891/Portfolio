const Apps = (() => {
  function menu(items) {
    return `<div class="menubar">${items.map((i) => `<button>${i}</button>`).join("")}</div>`;
  }

  function tools(items) {
    return `<div class="toolbar">${items.map((t) => `<button class="tool" data-act="${t.act || ""}"><span class="g">${t.g}</span>${t.l}</button>`).join("")}</div>`;
  }

  function status(parts) {
    return `<div class="status-bar">${parts.map((p) => `<span>${p}</span>`).join("")}</div>`;
  }

  const PAINT_ICONS = {
    pencil: `<path d="M2 14l1.4-3.6 7-7 2.2 2.2-7 7z" fill="#f5c24d" stroke="#333" stroke-width="1"/><path d="M10.4 3.4l2.2 2.2" stroke="#333" stroke-width="1"/>`,
    brush: `<path d="M3 13.5c0-2.2 1.1-3.3 3.2-3.5l6-6 1.6 1.6-6 6c-.2 2.1-1.3 3.2-3.5 3.2z" fill="#c9a24b" stroke="#333" stroke-width="1"/>`,
    eraser: `<rect x="3.6" y="7.4" width="9" height="4.6" rx="1" transform="rotate(-35 8 9.7)" fill="#f0b8c8" stroke="#333" stroke-width="1"/>`,
    fill: `<path d="M3 8.2l4.6-4.6 4.6 4.6-4.6 4.6z" fill="#7bb7f0" stroke="#333" stroke-width="1"/><path d="M12.4 9.4c1.3 1.8 1.7 2.6 0 3.4s-1.3-1.6 0-3.4z" fill="#7bb7f0" stroke="#333" stroke-width="1"/>`,
    spray: `<g fill="#333"><circle cx="5" cy="4.6" r=".9"/><circle cx="8" cy="5.4" r=".9"/><circle cx="11" cy="4.8" r=".9"/><circle cx="4.4" cy="8" r=".9"/><circle cx="7" cy="8.6" r=".9"/><circle cx="10" cy="8" r=".9"/><circle cx="6" cy="11.6" r=".9"/><circle cx="9.4" cy="11.4" r=".9"/></g>`,
    line: `<path d="M3 13L13 3" stroke="#333" stroke-width="1.8"/>`,
    rect: `<rect x="3" y="4" width="10" height="8" fill="none" stroke="#333" stroke-width="1.8"/>`,
    ellipse: `<ellipse cx="8" cy="8" rx="5.4" ry="4" fill="none" stroke="#333" stroke-width="1.8"/>`,
    text: `<text x="8.4" y="12.4" text-anchor="middle" font-size="12" font-family="Georgia, serif" fill="#333">A</text>`
  };
  function paintIcon(name) {
    return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${PAINT_ICONS[name] || ""}</svg>`;
  }

  const renderers = {
    about(rec) {
      rec.body.innerHTML = `
        ${menu(["File", "View", "Help"])}
        ${tools([
          { g: "📄", l: "My Resume", act: "resume" },
          { g: "✉", l: "Contact Me", act: "contact" }
        ])}
        <div class="ie-addr">Address <input value="About Me" readonly></div>
        <div class="about-layout">
          <aside class="about-side">
            <div class="side-box">
              <h4>Social Links</h4>
              <ul>
                <li>🐙 <a href="#" data-open="github">GitHub</a></li>
                <li>in <a href="#" data-open="linkedin">LinkedIn</a></li>
                <li>✕ <a href="#" data-open="x">X / Twitter</a></li>
              </ul>
            </div>
            <div class="side-box">
              <h4>Skills</h4>
              <ul>${PROFILE.skills.map((s) => `<li>▸ ${s}</li>`).join("")}</ul>
            </div>
            <div class="side-box">
              <h4>Software</h4>
              <ul>${PROFILE.software.map((s) => `<li>▸ ${s}</li>`).join("")}</ul>
            </div>
          </aside>
          <main class="about-main">
            <h2>About ${PROFILE.name}</h2>
            ${PROFILE.bio.map((p) => `<p>${p}</p>`).join("")}
          </main>
        </div>
        ${status(["Done", PROFILE.title, PROFILE.location])}
      `;
      rec.body.querySelectorAll("[data-act]").forEach((b) => {
        if (b.dataset.act) b.onclick = () => WM.open(b.dataset.act);
      });
      rec.body.querySelectorAll("[data-open]").forEach((a) => {
        a.onclick = (e) => { e.preventDefault(); WM.open(a.dataset.open); };
      });
    },

    resume(rec) {
      rec.body.innerHTML = `
        ${menu(["File", "View", "Help"])}
        <div class="resume-view">
          <iframe class="resume-pdf" src="assets/Resume/Resume.pdf#zoom=90&navpanes=0&toolbar=0" title="${PROFILE.fullName} — Resume"></iframe>
        </div>
      `;
    },

    contact(rec) {
      rec.body.innerHTML = `
        ${menu(["File", "Edit", "View", "Tools", "Help"])}
        ${tools([
          { g: "➤", l: "Send Message", act: "send" },
          { g: "✉", l: "New Message", act: "new" },
          { g: "in", l: "LinkedIn", act: "linkedin" }
        ])}
        <form class="mail-form">
          <div class="mail-row"><label>To:</label><input value="${PROFILE.email}" readonly></div>
          <div class="mail-row"><label>From:</label><input name="from" placeholder="Your email address" required></div>
          <div class="mail-row"><label>Subject:</label><input name="subject" placeholder="Subject of your message"></div>
          <textarea name="body" placeholder="Write your message here"></textarea>
        </form>
        ${status(["Compose a message to " + PROFILE.name, "Ready"])}
      `;
      rec.body.querySelector('[data-act="send"]').onclick = () => {
        const from = rec.body.querySelector('[name="from"]').value.trim();
        const body = rec.body.querySelector('[name="body"]').value.trim();
        if (!from || !body) { Sounds.error(); WM.open("dialog", { uid: "mail-err", w: 360, h: 170, title: "Outlook Express", payload: { kind: "info", text: "Please enter your email and a message before sending." } }); return; }
        const sub = rec.body.querySelector('[name="subject"]').value || "Hello from Ayush XP";
        location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body + "\n\n— " + from)}`;
        Sounds.ding();
        WM.open("dialog", { uid: "mail-ok", w: 360, h: 170, title: "Message sent", payload: { kind: "info", text: "Your mail client should open with the message ready to send." } });
      };
      rec.body.querySelector('[data-act="new"]').onclick = () => {
        rec.body.querySelector('[name="from"]').value = "";
        rec.body.querySelector('[name="subject"]').value = "";
        rec.body.querySelector('[name="body"]').value = "";
      };
      rec.body.querySelector('[data-act="linkedin"]').onclick = () => WM.open("linkedin");
    },

    paint(rec) {
      rec.body.innerHTML = `
        ${menu(["File", "Edit", "View", "Image", "Colors", "Help"])}
        <div class="paint-wrap">
          <div class="paint-tools">
            <div class="paint-grid">
              <button data-tool="pencil" class="on" title="Pencil">${paintIcon("pencil")}</button>
              <button data-tool="brush" title="Brush">${paintIcon("brush")}</button>
              <button data-tool="eraser" title="Eraser">${paintIcon("eraser")}</button>
              <button data-tool="fill" title="Fill with color">${paintIcon("fill")}</button>
              <button data-tool="spray" title="Airbrush">${paintIcon("spray")}</button>
              <button data-tool="line" title="Line">${paintIcon("line")}</button>
              <button data-tool="rect" title="Rectangle">${paintIcon("rect")}</button>
              <button data-tool="ellipse" title="Ellipse">${paintIcon("ellipse")}</button>
              <button data-tool="text" title="Text">${paintIcon("text")}</button>
            </div>
            <div class="paint-sizes">
              <button data-size="1" class="on" title="1 px"><i style="height:2px"></i></button>
              <button data-size="3" title="3 px"><i style="height:4px"></i></button>
              <button data-size="6" title="6 px"><i style="height:7px"></i></button>
              <button data-size="12" title="12 px"><i style="height:12px"></i></button>
            </div>
            <label class="paint-fg" title="Foreground color"><input type="color" value="#000000"></label>
            <div class="paint-actions">
              <button data-undo title="Undo">Undo</button>
              <button data-redo title="Redo">Redo</button>
              <button data-clear title="Clear image">Clear</button>
              <button data-save title="Save as PNG">Save</button>
            </div>
          </div>
          <div class="paint-stage"><canvas></canvas></div>
          <div class="paint-palette"><div class="swatches"></div></div>
        </div>
      `;
      const host = rec.body.querySelector(".paint-stage");
      const canvas = host.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const fg = rec.body.querySelector(".paint-fg input");
      const colors = ["#000000","#7f7f7f","#800000","#808000","#008000","#008080","#000080","#800080","#ffffff","#c0c0c0","#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff","#ff8000","#804000","#ffc0cb","#e0e0ff"];
      let tool = "pencil", color = "#000000", size = 1, drawing = false, last = null, start = null, snapshot = null;
      const undoStack = [], redoStack = [];

      const sw = rec.body.querySelector(".swatches");
      colors.forEach((c) => {
        const i = document.createElement("i");
        i.style.background = c;
        i.title = c;
        i.onclick = () => { color = c; fg.value = c; };
        sw.appendChild(i);
      });
      fg.oninput = () => { color = fg.value; };

      function fit() {
        const w = Math.max(1, Math.floor(host.clientWidth));
        const h = Math.max(1, Math.floor(host.clientHeight));
        if (canvas.width === w && canvas.height === h) return;
        const copy = document.createElement("canvas");
        copy.width = canvas.width;
        copy.height = canvas.height;
        if (copy.width && copy.height) copy.getContext("2d").drawImage(canvas, 0, 0);
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        if (copy.width && copy.height) ctx.drawImage(copy, 0, 0);
        undoStack.length = 0; redoStack.length = 0; sync();
      }
      rec.onResize = fit;
      const ro = new ResizeObserver(() => fit());
      ro.observe(host);
      rec.onClose = () => ro.disconnect();
      requestAnimationFrame(fit);

      function sync() {
        rec.body.querySelector("[data-undo]").disabled = !undoStack.length;
        rec.body.querySelector("[data-redo]").disabled = !redoStack.length;
      }
      function snap() {
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (undoStack.length > 20) undoStack.shift();
        redoStack.length = 0;
        sync();
      }
      function restore(img) { ctx.putImageData(img, 0, 0); }
      function hexRgb(h) {
        h = h.replace("#", "");
        if (h.length === 3) h = h.split("").map((c) => c + c).join("");
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      function floodFill(x, y) {
        const w = canvas.width, h = canvas.height;
        x = Math.floor(x); y = Math.floor(y);
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        const img = ctx.getImageData(0, 0, w, h), d = img.data;
        const i0 = (y * w + x) * 4;
        const t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
        const f = hexRgb(color);
        if (t[0] === f[0] && t[1] === f[1] && t[2] === f[2]) return;
        const stack = [x, y];
        const near = (i) => Math.abs(d[i] - t[0]) < 24 && Math.abs(d[i + 1] - t[1]) < 24 && Math.abs(d[i + 2] - t[2]) < 24 && Math.abs(d[i + 3] - t[3]) < 24;
        while (stack.length) {
          const py = stack.pop(), pxx = stack.pop();
          if (pxx < 0 || py < 0 || pxx >= w || py >= h) continue;
          const i = (py * w + pxx) * 4;
          if (!near(i)) continue;
          d[i] = f[0]; d[i + 1] = f[1]; d[i + 2] = f[2]; d[i + 3] = 255;
          stack.push(pxx + 1, py, pxx - 1, py, pxx, py + 1, pxx, py - 1);
        }
        ctx.putImageData(img, 0, 0);
      }
      function strokeStyleFor() {
        if (tool === "eraser") return { c: "#ffffff", w: size * 3 };
        if (tool === "brush") return { c: color, w: size + 4 };
        return { c: color, w: size };
      }
      function dab(p) {
        const s = strokeStyleFor();
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, s.w / 2), 0, Math.PI * 2);
        ctx.fill();
      }
      function strokeTo(p) {
        const s = strokeStyleFor();
        ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      function spray(p) {
        ctx.fillStyle = color;
        const r = Math.max(5, size * 3);
        for (let k = 0; k < 16; k++) {
          const a = Math.random() * Math.PI * 2, dd = Math.random() * r;
          ctx.fillRect(p.x + Math.cos(a) * dd, p.y + Math.sin(a) * dd, 1.4, 1.4);
        }
      }
      function shape(a, b, square) {
        ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round";
        let x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
        if (square) { const s = Math.max(w, h); w = h = s; }
        ctx.beginPath();
        if (tool === "line") { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        else if (tool === "rect") ctx.rect(x, y, w, h);
        else ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      const pos = (e) => {
        const r = canvas.getBoundingClientRect();
        const sx = r.width ? canvas.width / r.width : 1;
        const sy = r.height ? canvas.height / r.height : 1;
        return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
      };

      canvas.onpointerdown = (e) => {
        canvas.setPointerCapture(e.pointerId);
        const p = pos(e);
        last = start = p;
        if (tool === "fill") { snap(); floodFill(p.x, p.y); return; }
        if (tool === "text") {
          const txt = window.prompt("Text to draw:");
          if (txt) {
            snap();
            ctx.fillStyle = color;
            ctx.font = `bold ${size * 4 + 10}px Tahoma, sans-serif`;
            ctx.textBaseline = "top";
            ctx.fillText(txt, p.x, p.y);
          }
          return;
        }
        drawing = true;
        snap();
        snapshot = undoStack[undoStack.length - 1];
        if (tool === "pencil" || tool === "brush" || tool === "eraser") dab(p);
        else if (tool === "spray") spray(p);
      };
      canvas.onpointermove = (e) => {
        if (!drawing) return;
        const p = pos(e);
        if (tool === "spray") { spray(p); last = p; return; }
        if (tool === "line" || tool === "rect" || tool === "ellipse") { restore(snapshot); shape(start, p, e.shiftKey); return; }
        strokeTo(p);
        last = p;
      };
      canvas.onpointerup = () => { if (drawing) { drawing = false; sync(); } };
      canvas.onpointercancel = () => { drawing = false; };

      rec.body.querySelectorAll("[data-tool]").forEach((b) => {
        b.onclick = () => {
          rec.body.querySelectorAll("[data-tool]").forEach((x) => x.classList.remove("on"));
          b.classList.add("on");
          tool = b.dataset.tool;
        };
      });
      rec.body.querySelectorAll("[data-size]").forEach((b) => {
        b.onclick = () => {
          rec.body.querySelectorAll("[data-size]").forEach((x) => x.classList.remove("on"));
          b.classList.add("on");
          size = +b.dataset.size;
        };
      });
      rec.body.querySelector("[data-undo]").onclick = () => {
        if (!undoStack.length) return;
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        restore(undoStack.pop());
        sync();
      };
      rec.body.querySelector("[data-redo]").onclick = () => {
        if (!redoStack.length) return;
        undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        restore(redoStack.pop());
        sync();
      };
      rec.body.querySelector("[data-clear]").onclick = () => {
        snap();
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      rec.body.querySelector("[data-save]").onclick = () => {
        const a = document.createElement("a");
        a.download = "untitled.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
      };
      sync();
    },

    mines(rec) {
      rec.body.innerHTML = `
        ${menu(["Game", "Help"])}
        <div class="mines-wrap">
          <div class="mines-hud">
            <span id="mine-count">010</span>
            <button class="face" id="mine-face">🙂</button>
            <span id="mine-time">000</span>
          </div>
          <div id="mine-grid"></div>
        </div>
      `;
      const W = 9, H = 9, MINES = 10;
      let grid, revealed, flagged, dead, won, start, timer;
      const gridEl = rec.body.querySelector("#mine-grid");
      const face = rec.body.querySelector("#mine-face");
      const countEl = rec.body.querySelector("#mine-count");
      const timeEl = rec.body.querySelector("#mine-time");

      function pad(n) { return String(Math.max(0, n)).padStart(3, "0"); }
      function reset() {
        clearInterval(timer); start = 0; timeEl.textContent = "000";
        dead = won = false; face.textContent = "🙂";
        grid = Array.from({ length: H }, () => Array(W).fill(0));
        revealed = Array.from({ length: H }, () => Array(W).fill(false));
        flagged = Array.from({ length: H }, () => Array(W).fill(false));
        let placed = 0;
        while (placed < MINES) {
          const x = Math.floor(Math.random() * W), y = Math.floor(Math.random() * H);
          if (grid[y][x] === -1) continue;
          grid[y][x] = -1; placed++;
        }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          if (grid[y][x] === -1) continue;
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < H && nx >= 0 && nx < W && grid[ny][nx] === -1) n++;
          }
          grid[y][x] = n;
        }
        draw();
      }
      function draw() {
        gridEl.innerHTML = "";
        let flags = 0;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const b = document.createElement("button");
          if (flagged[y][x]) { b.textContent = "🚩"; b.className = "f"; flags++; }
          if (revealed[y][x]) {
            b.classList.add("open");
            if (grid[y][x] === -1) { b.textContent = "💣"; b.classList.add("mine"); }
            else if (grid[y][x] > 0) {
              b.textContent = grid[y][x];
              b.style.color = ["","#00f","#008000","#f00","#000080","#800000","#008080","#000","#808080"][grid[y][x]];
            }
          }
          b.onpointerdown = (e) => {
            if (dead || won) return;
            if (!start) {
              start = Date.now();
              timer = setInterval(() => { timeEl.textContent = pad(Math.floor((Date.now() - start) / 1000)); }, 250);
            }
            if (e.button === 2 || e.shiftKey) {
              if (!revealed[y][x]) flagged[y][x] = !flagged[y][x];
              draw(); return;
            }
            open(x, y);
          };
          b.oncontextmenu = (e) => e.preventDefault();
          gridEl.appendChild(b);
        }
        countEl.textContent = pad(MINES - flags);
      }
      function open(x, y) {
        if (x < 0 || y < 0 || x >= W || y >= H || revealed[y][x] || flagged[y][x]) return;
        revealed[y][x] = true;
        if (grid[y][x] === -1) {
          dead = true; face.textContent = "💀";
          for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (grid[yy][xx] === -1) revealed[yy][xx] = true;
          Sounds.error(); draw(); return;
        }
        if (grid[y][x] === 0) {
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) open(x + dx, y + dy);
        }
        let left = 0;
        for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (!revealed[yy][xx] && grid[yy][xx] !== -1) left++;
        if (left === 0) { won = true; face.textContent = "😎"; Sounds.ding(); }
        draw();
      }
      face.onclick = reset;
      rec.body.querySelector(".menubar button").onclick = reset;
      reset();
    },

    snake(rec) {
      const COLS = 24, ROWS = 18, CELL = 20;
      rec.body.innerHTML = `
        <div class="game">
          <div class="game-hud">
            <span>Score <b data-score>0</b></span>
            <span>Best <b data-best>0</b></span>
            <button class="xp-btn" data-act="new">New Game</button>
          </div>
          <div class="game-stage"><canvas class="snake-canvas" width="${COLS * CELL}" height="${ROWS * CELL}"></canvas></div>
          <div class="game-help">Arrow keys or WASD to steer — Space to pause</div>
        </div>
      `;
      const canvas = rec.body.querySelector(".snake-canvas");
      const ctx = canvas.getContext("2d");
      const scoreEl = rec.body.querySelector("[data-score]");
      const bestEl = rec.body.querySelector("[data-best]");
      let snake, dir, nextDir, food, timer, score = 0, best = 0, over, paused, speed;

      function placeFood() {
        do { food = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 }; }
        while (snake.some((s) => s.x === food.x && s.y === food.y));
      }
      function draw() {
        ctx.fillStyle = "#0b1a0b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,.03)";
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if ((x + y) % 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        ctx.fillStyle = "#e4451b";
        ctx.beginPath();
        ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        snake.forEach((s, i) => {
          ctx.fillStyle = i === 0 ? "#9dffb0" : "#3c9b2e";
          ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
        });
        if (over || paused) {
          ctx.fillStyle = "rgba(0,0,0,.62)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.textAlign = "center";
          ctx.fillStyle = "#fff";
          ctx.font = "bold 30px Tahoma, sans-serif";
          ctx.fillText(over ? "Game Over" : "Paused", canvas.width / 2, canvas.height / 2 - 4);
          ctx.font = "14px Tahoma, sans-serif";
          ctx.fillStyle = "#bfe8bf";
          ctx.fillText(over ? "Press Space for a new game" : "Press Space to resume", canvas.width / 2, canvas.height / 2 + 24);
        }
      }
      function step() {
        if (over || paused) return;
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
        const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
        if (hitWall || hitSelf) {
          over = true;
          clearInterval(timer);
          if (score > best) { best = score; bestEl.textContent = best; }
          draw();
          return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score += 10;
          scoreEl.textContent = score;
          placeFood();
          if (speed > 70) { speed -= 5; clearInterval(timer); timer = setInterval(step, speed); }
        } else {
          snake.pop();
        }
        draw();
      }
      function reset() {
        snake = [{ x: 12, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 9 }];
        dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
        score = 0; over = false; paused = false; speed = 130;
        scoreEl.textContent = "0";
        placeFood();
        clearInterval(timer);
        timer = setInterval(step, speed);
        draw();
      }
      function turn(x, y) { if (!over && !(x === -dir.x && y === -dir.y)) nextDir = { x, y }; }
      const key = (e) => {
        if (rec.el.classList.contains("inactive") || rec.el.classList.contains("min")) return;
        const k = e.key.toLowerCase();
        if (k === "arrowup" || k === "w") turn(0, -1);
        else if (k === "arrowdown" || k === "s") turn(0, 1);
        else if (k === "arrowleft" || k === "a") turn(-1, 0);
        else if (k === "arrowright" || k === "d") turn(1, 0);
        else if (k === " ") { if (over) reset(); else { paused = !paused; draw(); } }
        else return;
        e.preventDefault();
      };
      document.addEventListener("keydown", key);
      rec.body.querySelector('[data-act="new"]').onclick = reset;
      rec.onClose = () => { clearInterval(timer); document.removeEventListener("keydown", key); };
      reset();
    },

    pong(rec) {
      const W = 640, H = 420, PW = 10, PH = 74, BR = 8;
      rec.body.innerHTML = `
        <div class="game">
          <div class="game-hud">
            <span>You <b data-you>0</b></span>
            <span>CPU <b data-cpu>0</b></span>
            <button class="xp-btn" data-act="new">New Game</button>
          </div>
          <div class="game-stage"><canvas class="pong-canvas" width="${W}" height="${H}"></canvas></div>
          <div class="game-help">Move with the mouse, or W / S (↑ / ↓)</div>
        </div>
      `;
      const canvas = rec.body.querySelector(".pong-canvas");
      const ctx = canvas.getContext("2d");
      const youEl = rec.body.querySelector("[data-you]");
      const cpuEl = rec.body.querySelector("[data-cpu]");
      let playerY, cpuY, ball, raf, you, cpu, running;

      function serve(dx) {
        ball = { x: W / 2, y: H / 2, vx: 5 * dx, vy: (Math.random() * 4 - 2) || 2.2 };
      }
      function draw() {
        ctx.fillStyle = "#0a1a2e"; ctx.fillRect(0, 0, W, H);
        ctx.setLineDash([8, 12]); ctx.strokeStyle = "#1e3a5a"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
        ctx.setLineDash([]);
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,.07)";
        ctx.font = "bold 64px Tahoma, sans-serif";
        ctx.fillText(you, W / 2 - 80, 76);
        ctx.fillText(cpu, W / 2 + 80, 76);
        ctx.fillStyle = "#7fd4ff"; ctx.fillRect(24, playerY, PW, PH);
        ctx.fillStyle = "#ff8a6a"; ctx.fillRect(W - 24 - PW, cpuY, PW, PH);
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(ball.x, ball.y, BR, 0, Math.PI * 2); ctx.fill();
      }
      function loop() {
        if (!running) return;
        cpuY += Math.max(-5, Math.min(5, ball.y - PH / 2 - cpuY));
        cpuY = Math.max(0, Math.min(H - PH, cpuY));
        ball.x += ball.vx; ball.y += ball.vy;
        if (ball.y < BR || ball.y > H - BR) { ball.vy *= -1; ball.y = Math.max(BR, Math.min(H - BR, ball.y)); }
        if (ball.vx < 0 && ball.x - BR < 24 + PW && ball.x > 24 && ball.y > playerY && ball.y < playerY + PH) {
          ball.vx = Math.min(13, Math.abs(ball.vx) * 1.06);
          ball.vy = Math.max(-9, Math.min(9, ball.vy + ((ball.y - (playerY + PH / 2)) / (PH / 2)) * 2));
          ball.x = 24 + PW + BR;
        }
        if (ball.vx > 0 && ball.x + BR > W - 24 - PW && ball.x < W - 24 && ball.y > cpuY && ball.y < cpuY + PH) {
          ball.vx = -Math.min(13, Math.abs(ball.vx) * 1.06);
          ball.vy = Math.max(-9, Math.min(9, ball.vy + ((ball.y - (cpuY + PH / 2)) / (PH / 2)) * 2));
          ball.x = W - 24 - PW - BR;
        }
        if (ball.x < -BR) { cpu++; cpuEl.textContent = cpu; serve(-1); }
        else if (ball.x > W + BR) { you++; youEl.textContent = you; serve(1); }
        draw();
        raf = requestAnimationFrame(loop);
      }
      function reset() {
        playerY = H / 2 - PH / 2; cpuY = H / 2 - PH / 2;
        you = 0; cpu = 0; youEl.textContent = "0"; cpuEl.textContent = "0";
        serve(Math.random() < 0.5 ? -1 : 1);
        running = true;
        cancelAnimationFrame(raf);
        loop();
      }
      canvas.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        if (!r.height) return;
        playerY = Math.max(0, Math.min(H - PH, (e.clientY - r.top) * (H / r.height) - PH / 2));
      });
      const key = (e) => {
        if (rec.el.classList.contains("inactive") || rec.el.classList.contains("min")) return;
        const k = e.key.toLowerCase();
        if (k === "w" || k === "arrowup") playerY = Math.max(0, playerY - 24);
        else if (k === "s" || k === "arrowdown") playerY = Math.min(H - PH, playerY + 24);
        else return;
        e.preventDefault();
      };
      document.addEventListener("keydown", key);
      rec.body.querySelector('[data-act="new"]').onclick = reset;
      rec.onClose = () => { running = false; cancelAnimationFrame(raf); document.removeEventListener("keydown", key); };
      reset();
    },

    g2048(rec) {
      const N = 4;
      rec.body.innerHTML = `
        <div class="g2048">
          <div class="g2048-hud">
            <div class="g2048-scores"><span>Score <b data-score>0</b></span><span>Best <b data-best>0</b></span></div>
            <button class="xp-btn" data-act="new">New Game</button>
          </div>
          <div class="g2048-board">${Array.from({ length: N * N }, () => `<div class="g2048-cell"></div>`).join("")}</div>
          <div class="game-help" data-help>Arrow keys or WASD to slide the tiles</div>
        </div>
      `;
      const cells = [...rec.body.querySelectorAll(".g2048-cell")];
      const scoreEl = rec.body.querySelector("[data-score]");
      const bestEl = rec.body.querySelector("[data-best]");
      const helpEl = rec.body.querySelector("[data-help]");
      let grid, score, best = 0, over, won;

      const empties = () => grid.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      function spawn() {
        const e = empties();
        if (!e.length) return;
        grid[e[(Math.random() * e.length) | 0]] = Math.random() < 0.9 ? 2 : 4;
      }
      function render() {
        grid.forEach((v, i) => {
          const c = cells[i];
          c.textContent = v || "";
          c.className = "g2048-cell" + (v ? " v" + (v > 2048 ? "big" : v) : "");
        });
        scoreEl.textContent = score;
        if (score > best) { best = score; bestEl.textContent = best; }
      }
      function lineIndices(dir) {
        const out = [];
        for (let i = 0; i < N; i++) {
          const line = [];
          for (let j = 0; j < N; j++) {
            if (dir === "left") line.push(i * N + j);
            else if (dir === "right") line.push(i * N + (N - 1 - j));
            else if (dir === "up") line.push(j * N + i);
            else line.push((N - 1 - j) * N + i);
          }
          out.push(line);
        }
        return out;
      }
      function canMove() {
        if (empties().length) return true;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const i = y * N + x;
          if (x < N - 1 && grid[i] === grid[i + 1]) return true;
          if (y < N - 1 && grid[i] === grid[i + N]) return true;
        }
        return false;
      }
      function move(dir) {
        if (over) return;
        const before = grid.slice();
        let gained = 0;
        lineIndices(dir).forEach((line) => {
          const vals = line.map((i) => grid[i]).filter((v) => v);
          const out = [];
          for (let i = 0; i < vals.length; i++) {
            if (vals[i] === vals[i + 1]) { const m = vals[i] * 2; out.push(m); gained += m; i++; }
            else out.push(vals[i]);
          }
          line.forEach((idx, k) => { grid[idx] = out[k] || 0; });
        });
        if (grid.some((v, i) => v !== before[i])) { score += gained; spawn(); }
        render();
        if (!won && grid.some((v) => v >= 2048)) { won = true; helpEl.textContent = "You reached 2048! Keep going for a higher score."; }
        if (!canMove()) { over = true; helpEl.textContent = "No moves left — press New Game to play again."; }
      }
      const key = (e) => {
        if (rec.el.classList.contains("inactive") || rec.el.classList.contains("min")) return;
        const k = e.key.toLowerCase();
        if (k === "arrowup" || k === "w") move("up");
        else if (k === "arrowdown" || k === "s") move("down");
        else if (k === "arrowleft" || k === "a") move("left");
        else if (k === "arrowright" || k === "d") move("right");
        else return;
        e.preventDefault();
      };
      document.addEventListener("keydown", key);
      function reset() {
        grid = Array(N * N).fill(0); score = 0; over = false; won = false;
        helpEl.textContent = "Arrow keys or WASD to slide the tiles";
        spawn(); spawn(); render();
      }
      rec.body.querySelector('[data-act="new"]').onclick = reset;
      rec.onClose = () => document.removeEventListener("keydown", key);
      reset();
    },

    viewer(rec) {
      const imgs = GALLERY;
      let i = 0, zoom = 1, rot = 0;
      rec.body.innerHTML = `
        <div class="pv-stage"><img class="pv-img" alt=""></div>
        <div class="pv-filmstrip">
          ${imgs.map((im, k) => `<button class="pv-thumb${k === 0 ? " on" : ""}" data-i="${k}"><img src="${im.src}" alt=""><span>${im.title}</span></button>`).join("")}
        </div>
        <div class="pv-toolbar">
          <button data-act="prev" title="Previous">◀</button>
          <button data-act="next" title="Next">▶</button>
          <span class="pv-sep"></span>
          <button data-act="zoomout" title="Zoom out">−</button>
          <button data-act="zoomin" title="Zoom in">＋</button>
          <button data-act="rotate" title="Rotate 90°">⟳</button>
          <button data-act="actual" title="Actual size">1:1</button>
          <span class="pv-name"></span>
          <button data-act="close" title="Close" class="pv-x">✕</button>
        </div>
      `;
      const img = rec.body.querySelector(".pv-img");
      const name = rec.body.querySelector(".pv-name");
      const thumbs = [...rec.body.querySelectorAll(".pv-thumb")];
      const apply = () => { img.style.transform = `scale(${zoom}) rotate(${rot}deg)`; };
      function show(k) {
        i = ((k % imgs.length) + imgs.length) % imgs.length;
        zoom = 1; rot = 0;
        img.src = imgs[i].src;
        name.textContent = `${imgs[i].title} (${i + 1}/${imgs.length})`;
        thumbs.forEach((t, x) => t.classList.toggle("on", x === i));
        apply();
      }
      rec.body.querySelectorAll("[data-act]").forEach((b) => {
        b.onclick = () => {
          const a = b.dataset.act;
          if (a === "prev") show(i - 1);
          else if (a === "next") show(i + 1);
          else if (a === "zoomin") { zoom = Math.min(4, zoom + 0.25); apply(); }
          else if (a === "zoomout") { zoom = Math.max(0.25, zoom - 0.25); apply(); }
          else if (a === "rotate") { rot = (rot + 90) % 360; apply(); }
          else if (a === "actual") { zoom = 1; rot = 0; apply(); }
          else if (a === "close") WM.close(rec.uid);
        };
      });
      thumbs.forEach((t) => { t.onclick = () => show(+t.dataset.i); });
      const key = (e) => {
        if (e.key === "ArrowLeft") show(i - 1);
        else if (e.key === "ArrowRight") show(i + 1);
        else if (e.key === "+" || e.key === "=") { zoom = Math.min(4, zoom + 0.25); apply(); }
        else if (e.key === "-") { zoom = Math.max(0.25, zoom - 0.25); apply(); }
      };
      document.addEventListener("keydown", key);
      rec.onClose = () => document.removeEventListener("keydown", key);
      show(0);
    },

    computer(rec) {
      rec.body.innerHTML = `
        ${menu(["File", "Edit", "View", "Help"])}
        <div class="explorer">
          <aside class="explorer-side">
            <b>System Tasks</b>
            <p>View system information</p>
            <p>Add or remove programs</p>
            <b>Other Places</b>
            <p>My Documents</p>
            <p>My Network Places</p>
          </aside>
          <div class="explorer-main">
            ${[
              ["about", "About Me"], ["resume", "My Resume"], ["contact", "Contact Me"]
            ].map(([id, l]) => `<button class="file-ico" data-id="${id}"><img src="${ICONS[id]}" alt=""><div>${l}</div></button>`).join("")}
          </div>
        </div>
        ${status([`C:\\Documents and Settings\\${PROFILE.name}\\Desktop`, "3 objects"])}
      `;
      rec.body.querySelectorAll(".file-ico").forEach((b) => { b.onclick = () => WM.open(b.dataset.id); });
    },

    properties(rec) {
      rec.body.innerHTML = `
        <div style="padding:12px;font-size:12px">
          <fieldset>
            <legend>Desktop</legend>
            <p>Wallpaper: Bliss (Ayush edition)</p>
            <p>Position: Stretch</p>
            <label><input type="checkbox" id="crt-check"> Enable CRT scanlines</label>
          </fieldset>
          <div class="dialog-actions"><button class="xp-btn" data-ok>OK</button></div>
        </div>
      `;
      const c = rec.body.querySelector("#crt-check");
      c.checked = document.body.classList.contains("crt");
      rec.body.querySelector("[data-ok]").onclick = () => {
        document.body.classList.toggle("crt", c.checked);
        WM.close(rec.uid);
      };
    },

    dialog(rec, opts) {
      const p = opts.payload || {};
      if (p.kind === "link") {
        rec.body.innerHTML = `
          <div class="dialog-body">
            <div class="ico">🌐</div>
            <div>Do you want to open a link to <b>${p.label}</b>?<br><small>${p.href}</small></div>
          </div>
          <div class="dialog-actions">
            <button class="xp-btn" data-go>Visit</button>
            <button class="xp-btn" data-no>Cancel</button>
          </div>
        `;
        rec.body.querySelector("[data-go]").onclick = () => { window.open(p.href, "_blank"); WM.close(rec.uid); };
        rec.body.querySelector("[data-no]").onclick = () => WM.close(rec.uid);
      } else {
        rec.body.innerHTML = `
          <div class="dialog-body">
            <div class="ico">ℹ️</div>
            <div>${p.text || ""}</div>
          </div>
          <div class="dialog-actions"><button class="xp-btn" data-ok>OK</button></div>
        `;
        rec.body.querySelector("[data-ok]").onclick = () => WM.close(rec.uid);
      }
    }
  };

  function mount(id, rec, opts) {
    const fn = renderers[id];
    if (fn) fn(rec, opts);
    else rec.body.innerHTML = `<div style="padding:16px">Unknown program: ${id}</div>`;
  }

  return { mount };
})();
