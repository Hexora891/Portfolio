(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function clock() {
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const am = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    $("#clock").textContent = `${h}:${m} ${am}`;
  }

  const CELL_W = 88, CELL_H = 98, ORIGIN = 8;
  let autoArrange = true;
  let alignGrid = true;
  let sortBy = "default";
  let menuTarget = null;
  const iconPos = {};

  function iconList() {
    const list = DESKTOP_ICONS.slice();
    if (sortBy === "name") list.sort((a, b) => a.label.localeCompare(b.label));
    else if (sortBy === "type") list.sort((a, b) => a.id.localeCompare(b.id));
    else if (sortBy === "size") list.sort((a, b) => a.label.length - b.label.length || a.label.localeCompare(b.label));
    return list;
  }

  function deskHeight() {
    const h = $("#desktop").getBoundingClientRect().height;
    return h > 40 ? h : Math.max(200, innerHeight - 30);
  }

  function packIcons(list) {
    const rows = Math.max(1, Math.floor((deskHeight() - ORIGIN - 8) / CELL_H));
    list.forEach((ic, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      iconPos[ic.id] = { x: ORIGIN + col * CELL_W, y: ORIGIN + row * CELL_H };
    });
  }

  function snap(v, cell, origin) {
    return origin + Math.round((v - origin) / cell) * cell;
  }

  function buildIcons() {
    const root = $("#icons");
    const list = iconList();
    if (autoArrange) packIcons(list);
    root.innerHTML = "";
    list.forEach((ic) => {
      if (!iconPos[ic.id]) iconPos[ic.id] = { x: ORIGIN, y: ORIGIN };
      const b = document.createElement("button");
      b.className = "desk-icon";
      b.dataset.id = ic.id;
      b.style.left = iconPos[ic.id].x + "px";
      b.style.top = iconPos[ic.id].y + "px";
      b.innerHTML = `<img src="${ic.icon}" alt=""><span>${ic.label}</span>`;
      root.appendChild(b);
    });
  }

  function buildStart() {
    $("#start-left").innerHTML = START_LEFT.map((it) => `
      <button class="start-item" data-id="${it.id}">
        <img src="${it.icon}" alt="">
        <span>${it.sub ? `<b>${it.label}</b><small>${it.sub}</small>` : it.label}</span>
      </button>
    `).join("") + `
      <div class="start-sep"></div>
      <button class="start-item start-all" id="all-programs-btn">
        <img src="${ICONS.folder}" alt="">
        <span><b>All Programs</b></span>
        <span class="arrow">▶</span>
      </button>
    `;
    $("#start-right").innerHTML = START_RIGHT.map((it) => `
      <button class="start-item" data-id="${it.id}" ${it.href ? `data-href="${it.href}"` : ""}>
        <img src="${it.icon}" alt="">
        <span>${it.label}</span>
      </button>
    `).join("");

    const menu = $("#start-menu");
    let fly = $("#all-programs");
    if (!fly) {
      fly = document.createElement("div");
      fly.id = "all-programs";
      fly.className = "start-flyout";
      menu.appendChild(fly);
    }
    fly.innerHTML = ALL_PROGRAMS.map((it) => `
      <button class="start-item" data-id="${it.id}">
        <img src="${it.icon}" alt="">
        <span>${it.label}</span>
      </button>
    `).join("");
  }

  function openApp(id) {
    closeStart();
    Sounds.click();
    WM.open(id);
  }

  function isTouch() {
    return matchMedia("(pointer: coarse)").matches || innerWidth < 720;
  }

  function bindDesktop() {
    let last = 0, lastId = null;
    $("#icons").addEventListener("click", (e) => {
      const ic = e.target.closest(".desk-icon");
      if (!ic) {
        $$(".desk-icon").forEach((x) => x.classList.remove("sel"));
        return;
      }
      if (ic.dataset.dragged === "1") {
        ic.dataset.dragged = "";
        return;
      }
      $$(".desk-icon").forEach((x) => x.classList.toggle("sel", x === ic));
      const now = Date.now();
      if (isTouch() || (lastId === ic.dataset.id && now - last < 450)) openApp(ic.dataset.id);
      last = now; lastId = ic.dataset.id;
    });
    $("#icons").addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const ic = e.target.closest(".desk-icon");
      if (!ic || autoArrange) return;
      const startX = e.clientX, startY = e.clientY;
      const orig = iconPos[ic.dataset.id];
      let moved = false;
      ic.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        if (!moved && Math.hypot(dx, dy) < 4) return;
        moved = true;
        ic.dataset.dragged = "1";
        let x = orig.x + dx, y = orig.y + dy;
        x = Math.max(0, x);
        y = Math.max(0, y);
        ic.style.left = x + "px";
        ic.style.top = y + "px";
        iconPos[ic.dataset.id] = { x, y };
      };
      const up = () => {
        ic.removeEventListener("pointermove", move);
        ic.removeEventListener("pointerup", up);
        if (moved && alignGrid) {
          const p = iconPos[ic.dataset.id];
          p.x = Math.max(0, snap(p.x, CELL_W, ORIGIN));
          p.y = Math.max(0, snap(p.y, CELL_H, ORIGIN));
          ic.style.left = p.x + "px";
          ic.style.top = p.y + "px";
        }
      };
      ic.addEventListener("pointermove", move);
      ic.addEventListener("pointerup", up);
    });

    $("#start-btn").onclick = (e) => {
      e.stopPropagation();
      $("#start-menu").classList.toggle("show");
      $("#start-btn").classList.toggle("open");
      if (!$("#start-menu").classList.contains("show")) toggleAllPrograms(false);
    };
    $("#start-menu").addEventListener("click", (e) => {
      const it = e.target.closest(".start-item");
      if (!it) return;
      if (it.id === "all-programs-btn") { toggleAllPrograms(); return; }
      if (it.dataset.id) openApp(it.dataset.id);
    });
    $("#logoff-btn").onclick = logOff;
    $("#shutdown-btn").onclick = shutDown;

    document.addEventListener("pointerdown", (e) => {
      if (e.button === 2) return;
      if (!e.target.closest("#start-menu") && !e.target.closest("#start-btn")) closeStart();
      if (!e.target.closest("#context-menu")) hideMenu();
    });

    $("#desktop").addEventListener("contextmenu", (e) => {
      if (e.target.closest(".xp-window")) return;
      e.preventDefault();
      const ic = e.target.closest(".desk-icon");
      if (ic) {
        $$(".desk-icon").forEach((x) => x.classList.toggle("sel", x === ic));
        menuTarget = { id: ic.dataset.id, label: ic.querySelector("span").textContent };
        showMenu(e.clientX, e.clientY, iconMenu());
      } else {
        $$(".desk-icon").forEach((x) => x.classList.remove("sel"));
        menuTarget = null;
        showMenu(e.clientX, e.clientY, desktopMenu());
      }
    });
    $("#context-menu").addEventListener("click", (e) => {
      if (e.target.closest(".has-sub") && !e.target.closest(".xp-submenu [data-act]")) return;
      const item = e.target.closest("[data-act]");
      if (!item || item.classList.contains("disabled")) return;
      runMenu(item.dataset.act);
      hideMenu();
    });

    $("#tray-vol").onclick = () => {
      const m = Sounds.toggleMute();
      $("#tray-vol").title = m ? "Muted" : "Volume";
      $("#tray-vol").style.opacity = m ? 0.4 : 1;
    };
    $("#tray-crt").onclick = () => document.body.classList.toggle("crt");

    $("#balloon-x").onclick = () => $("#balloon").classList.add("hidden");
    addEventListener("resize", () => { if (autoArrange) buildIcons(); });
  }

  function closeStart() {
    $("#start-menu").classList.remove("show");
    $("#start-btn").classList.remove("open");
    toggleAllPrograms(false);
  }

  function toggleAllPrograms(force) {
    const fly = $("#all-programs");
    const btn = $("#all-programs-btn");
    if (!fly || !btn) return;
    const show = force != null ? force : !fly.classList.contains("show");
    fly.classList.toggle("show", show);
    btn.classList.toggle("open", show);
  }

  function item(label, act, extra = "") {
    return `<button class="xp-menu-item ${extra}" data-act="${act || ""}">${label}</button>`;
  }
  function sub(label, inner) {
    return `<div class="xp-menu-item has-sub">${label}<span class="arrow">▶</span><div class="xp-submenu">${inner}</div></div>`;
  }
  function sep() { return `<div class="xp-menu-sep"></div>`; }
  function dis(label) { return `<button class="xp-menu-item disabled">${label}</button>`; }

  function desktopMenu() {
    return [
      sub("Arrange Icons By", [
        item("Default", "arrange-default"),
        item("Name", "arrange-name")
      ].join("")),
      sep(),
      dis("Paste"),
      sep(),
      item("Reset Desktop", "reset-desktop"),
      item("Show Desktop", "show-desktop"),
      sep(),
      item("Refresh Page", "refresh"),
      item("CRT Effect", "crt"),
      item("Fullscreen", "fullscreen")
    ].join("");
  }

  function iconMenu() {
    return [
      item("Open", "open"),
      sep(),
      dis("Cut"),
      dis("Copy"),
      sep(),
      dis("Create Shortcut"),
      dis("Delete"),
      dis("Rename"),
      sep(),
      item("Properties", "icon-props")
    ].join("");
  }

  function showMenu(x, y, html) {
    const m = $("#context-menu");
    m.innerHTML = html;
    m.hidden = false;
    const pad = 4;
    const w = m.offsetWidth, h = m.offsetHeight;
    m.style.left = Math.min(x, innerWidth - w - pad) + "px";
    m.style.top = Math.min(y, innerHeight - h - pad) + "px";
    m.querySelectorAll(".has-sub").forEach((el) => {
      let leaveTimer;
      const place = () => {
        const sm = el.querySelector(".xp-submenu");
        const r = el.getBoundingClientRect();
        sm.classList.toggle("flip", r.right + 170 > innerWidth);
      };
      el.addEventListener("pointerenter", () => {
        clearTimeout(leaveTimer);
        m.querySelectorAll(".has-sub").forEach((x) => x.classList.remove("open"));
        el.classList.add("open");
        place();
      });
      el.addEventListener("pointerleave", (ev) => {
        if (ev.relatedTarget && el.contains(ev.relatedTarget)) return;
        leaveTimer = setTimeout(() => el.classList.remove("open"), 120);
      });
    });
  }

  function hideMenu() {
    $("#context-menu").hidden = true;
    $("#context-menu").innerHTML = "";
  }

  function runMenu(act) {
    if (act === "refresh") {
      location.reload();
      return;
    }
    if (act === "open" && menuTarget) openApp(menuTarget.id);
    if (act === "icon-props" && menuTarget) {
      WM.open("dialog", {
        uid: "icon-props",
        title: menuTarget.label + " Properties",
        payload: { kind: "info", text: `<b>${menuTarget.label}</b><br>Type: Shortcut<br>Location: Desktop` }
      });
    }
    if (act === "arrange-name") {
      sortBy = "name";
      autoArrange = true;
      buildIcons();
    }
    if (act === "arrange-default") {
      sortBy = "default";
      autoArrange = true;
      buildIcons();
    }
    if (act === "reset-desktop") {
      sortBy = "default";
      autoArrange = true;
      alignGrid = true;
      Object.keys(iconPos).forEach((id) => delete iconPos[id]);
      buildIcons();
    }
    if (act === "show-desktop") {
      [...WM.wins.keys()].forEach((uid) => WM.minimize(uid));
    }
    if (act === "crt") document.body.classList.toggle("crt");
    if (act === "fullscreen") {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function showDesktop() {
    $("#boot").classList.add("hidden");
    $("#login").classList.add("hidden");
    $("#desktop").classList.remove("hidden");
    $("#taskbar").classList.remove("hidden");
    buildIcons();
    Sounds.startup();
    setTimeout(() => $("#balloon").classList.remove("hidden"), 600);
    setTimeout(() => $("#balloon").classList.add("hidden"), 8000);
  }

  function boot(thenLogin = true) {
    $("#shutdown").classList.remove("show");
    $("#desktop").classList.add("hidden");
    $("#taskbar").classList.add("hidden");
    $("#login").classList.add("hidden");
    $("#boot").classList.remove("hidden");
    closeStart();
    WM.closeAll();
    setTimeout(() => {
      if (thenLogin) {
        $("#boot").classList.add("hidden");
        $("#login").classList.remove("hidden");
      } else showDesktop();
    }, 2800);
  }

  function logOff() {
    Sounds.logoff();
    closeStart();
    WM.closeAll();
    $("#desktop").classList.add("hidden");
    $("#taskbar").classList.add("hidden");
    $("#login").classList.remove("hidden");
  }

  function shutDown() {
    Sounds.logoff();
    closeStart();
    WM.closeAll();
    $("#desktop").classList.add("hidden");
    $("#taskbar").classList.add("hidden");
    $("#shutdown").classList.add("show");
    $("#shutdown").querySelector("h2").textContent = "Windows is shutting down...";
    $("#shutdown").querySelector("p").textContent = "";
    setTimeout(() => {
      $("#shutdown").querySelector("h2").textContent = "It is now safe to turn off your computer.";
      $("#shutdown").querySelector("p").textContent = "Click anywhere to restart " + PROFILE.brand + " XP.";
    }, 1400);
  }

  function bindLogin() {
    $("#user-tile").onclick = () => {
      Sounds.unlock();
      showDesktop();
    };
    $("#restart-link").onclick = () => boot(true);
    $("#shutdown").onclick = () => boot(true);
  }

  function fillChrome() {
    $$("[data-brand]").forEach((el) => { el.textContent = PROFILE.brand; });
    $$("[data-name]").forEach((el) => { el.textContent = PROFILE.name; });
    $$("[data-title]").forEach((el) => { el.textContent = PROFILE.title; });
    $$("[data-fullname]").forEach((el) => { el.textContent = PROFILE.fullName; });
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillChrome();
    buildIcons();
    buildStart();
    bindDesktop();
    bindLogin();
    clock();
    setInterval(clock, 1000);
    const hash = location.hash.replace("#", "");
    if (hash === "desktop" || hash === "demo") {
      showDesktop();
      if (hash === "demo") {
        $("#balloon").classList.add("hidden");
        WM.open("about", { w: 700, h: 460, pos: { x: 90, y: 24 } });
        WM.open("resume", { w: 920, h: 900, pos: { x: 200, y: 40 } });
        WM.open("contact", { w: 500, h: 320, pos: { x: 460, y: 210 } });
        $("#start-menu").classList.add("show");
        $("#start-btn").classList.add("open");
      }
    } else if (hash === "menu") {
      showDesktop();
      $("#balloon").classList.add("hidden");
      showMenu(220, 80, desktopMenu());
      const sub = $("#context-menu .has-sub");
      if (sub) sub.classList.add("open");
    } else if (hash === "arrange-name") {
      showDesktop();
      $("#balloon").classList.add("hidden");
      sortBy = "name";
      autoArrange = true;
      buildIcons();
    } else if (hash === "app-paint-max") {
      showDesktop();
      $("#balloon").classList.add("hidden");
      const rec = WM.open("paint");
      WM.toggleMax(rec.uid);
    } else if (hash.startsWith("app-")) {
      showDesktop();
      $("#balloon").classList.add("hidden");
      WM.open(hash.slice(4), { w: 720, h: 500, pos: { x: 160, y: 40 } });
    } else if (hash === "login") {
      $("#boot").classList.add("hidden");
      $("#login").classList.remove("hidden");
    } else boot(true);
  });
})();
