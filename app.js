/* ==========================================================================
   Mel's Dress Up Studio | Shared script
   Icons, floating stars, safe storage, toasts, the "Play Anytime" install
   card, offline support, and the Gallery and Shop pages.
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var DATA = window.MEL_DATA || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Icons (Lucide, same set as the original) ---------- */
  var ICONS = {
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
    footprints: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    rainbow: '<path d="M22 17a10 10 0 0 0-20 0"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M10 17a2 2 0 0 1 4 0"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>'
  };
  function icon(name, cls, filled) {
    return '<svg class="' + (cls || "icon") + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="' + (filled ? "currentColor" : "none") +
      '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }
  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Safe storage (private windows can block it) ---------- */
  var store = {
    get: function (key, fallback) {
      try { var v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    }
  };

  /* ---------- Toast messages ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-shown"); }, 3200);
  }

  /* ---------- Put icons into [data-icon] placeholders ---------- */
  $all("[data-icon]").forEach(function (el) {
    el.insertAdjacentHTML("afterbegin", icon(el.getAttribute("data-icon"), el.getAttribute("data-icon-class") || "icon", el.hasAttribute("data-icon-filled")));
  });

  /* ---------- Floating stars in the background ---------- */
  var sky = $(".sky");
  if (sky) {
    var count = +(sky.getAttribute("data-stars") || 8);
    var html = "";
    for (var i = 0; i < count; i++) {
      html += '<span class="sky-star" style="top:' + (Math.random() * 100).toFixed(1) + "%;left:" + (Math.random() * 100).toFixed(1) +
        "%;width:" + (12 + Math.random() * 16).toFixed(0) + "px;animation-delay:" + (i * 0.2).toFixed(1) + 's">' + icon("star", "icon", true) + "</span>";
    }
    sky.insertAdjacentHTML("beforeend", html);
  }

  /* ---------- Offline support + "Play Anytime!" install card ----------
     The card appears only when the browser says the app can be installed,
     and stays hidden after "×" is tapped. */
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }
  var installPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    installPrompt = e;
    if (store.get("mel_install_dismissed", false)) return;
    showInstall();
  });
  function showInstall() {
    if ($(".install")) return;
    var box = document.createElement("aside");
    box.className = "install";
    box.setAttribute("aria-label", "Install the app");
    box.innerHTML = '<div class="install-row"><span class="install-icon">' + icon("download") + '</span><div class="install-text"><p class="install-title">Play Anytime!</p><p>Add to your device for offline fun!</p></div>' +
      '<button type="button" class="install-close" aria-label="Close">&times;</button></div>' +
      '<button type="button" class="install-btn">Install Now ✨</button>';
    document.body.appendChild(box);
    $(".install-close", box).addEventListener("click", function () { store.set("mel_install_dismissed", true); box.remove(); });
    $(".install-btn", box).addEventListener("click", function () {
      if (!installPrompt) return;
      installPrompt.prompt();
      installPrompt.userChoice.then(function (c) { if (c.outcome === "accepted") box.remove(); installPrompt = null; });
    });
  }

  /* ==========================================================================
     GALLERY PAGE
     Creations saved from the Home page, kept on this device.
     ========================================================================== */
  var GALLERY_KEY = "melDressUpGallery";
  var galleryGrid = $("#gallery-grid");
  var galleryItems = [];
  var lb = $("#lightbox"), lbIndex = 0, lbReturn = null;

  function download(dataUrl, filename) {
    var a = document.createElement("a");
    a.href = dataUrl; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function fileName(item) {
    return String(item.name || "mel-creation").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + ".jpg";
  }

  function renderGallery() {
    galleryItems = store.get(GALLERY_KEY, []);
    if (!Array.isArray(galleryItems)) galleryItems = [];
    if (!galleryItems.length) {
      galleryGrid.innerHTML = '<div class="panel empty">' + icon("image", "empty-icon") +
        '<h2>No creations yet!</h2><p>Create and save your characters from the Home page</p>' +
        '<a class="btn btn-primary" href="./index.html">' + icon("sparkles") + "Start dressing up</a></div>";
      return;
    }
    galleryGrid.innerHTML = '<ul class="gallery-grid">' + galleryItems.map(function (g, i) {
      return '<li class="panel gallery-card">' +
        '<button type="button" class="gallery-open" data-index="' + i + '" aria-label="View bigger: ' + esc(g.name) + '">' +
        '<img src="' + esc(g.imageData) + '" alt="' + esc(g.alt || g.name) + '" loading="lazy"></button>' +
        '<p class="gallery-name">' + esc(g.name) + '</p><p class="gallery-date">' + esc(g.date) + "</p>" +
        '<div class="gallery-actions"><button type="button" class="btn btn-primary btn-sm" data-save="' + i + '">' + icon("download") + "Save</button>" +
        '<button type="button" class="btn btn-outline btn-sm btn-icon" data-delete="' + i + '" aria-label="Delete ' + esc(g.name) + '">' + icon("trash") + "</button></div></li>";
    }).join("") + "</ul>";
  }
  if (galleryGrid) {
    renderGallery();
    galleryGrid.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-save")) { var g = galleryItems[+b.getAttribute("data-save")]; download(g.imageData, fileName(g)); }
      else if (b.hasAttribute("data-delete")) {
        var idx = +b.getAttribute("data-delete");
        if (!window.confirm("Remove this creation from your gallery?")) return;
        galleryItems.splice(idx, 1);
        store.set(GALLERY_KEY, galleryItems);
        renderGallery();
        toast("Removed from your gallery.");
        var next = $("[data-delete]", galleryGrid) || $(".btn", galleryGrid);
        if (next) next.focus();
      } else if (b.hasAttribute("data-index")) openLightbox(+b.getAttribute("data-index"), b);
    });
  }

  function showSlide(i) {
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    var g = galleryItems[lbIndex];
    var img = $("img", lb);
    img.src = g.imageData; img.alt = g.alt || g.name;
    $("figcaption", lb).textContent = g.name + (g.date ? " · " + g.date : "");
    $(".lightbox-count", lb).textContent = (lbIndex + 1) + " / " + galleryItems.length;
    var multi = galleryItems.length > 1;
    $(".lightbox-prev", lb).hidden = !multi;
    $(".lightbox-next", lb).hidden = !multi;
  }
  function openLightbox(i, from) {
    lbReturn = from; showSlide(i);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    document.body.classList.add("no-scroll");
    $(".lightbox-close", lb).focus();
  }
  function closeLightbox() {
    if (!lb || lb.hidden) return;
    lb.classList.remove("is-open"); lb.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lbReturn && document.body.contains(lbReturn)) lbReturn.focus();
  }
  if (lb) {
    $(".lightbox-close", lb).addEventListener("click", closeLightbox);
    $(".lightbox-prev", lb).addEventListener("click", function () { showSlide(lbIndex - 1); });
    $(".lightbox-next", lb).addEventListener("click", function () { showSlide(lbIndex + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showSlide(lbIndex - 1);
      else if (e.key === "ArrowRight") showSlide(lbIndex + 1);
      else if (e.key === "Tab") {
        var f = $all("button:not([hidden])", lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) showSlide(lbIndex + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ==========================================================================
     SHOP PAGE  (play money only: Sparkles)
     ========================================================================== */
  var SHOP_KEY = "mel_shop";
  function shopState() {
    var s = store.get(SHOP_KEY, null);
    if (!s || typeof s.sparkles !== "number") s = { sparkles: DATA.startingSparkles || 500, owned: [] };
    return s;
  }
  var shopGrid = $("#shop-grid");
  function renderShop() {
    var s = shopState();
    $("#sparkle-count").textContent = s.sparkles;
    shopGrid.innerHTML = (DATA.shop || []).map(function (item) {
      var owned = s.owned.indexOf(item.id) > -1, canBuy = s.sparkles >= item.price;
      var action;
      if (owned) action = '<p class="shop-status is-owned">✓ Owned</p>';
      else if (item.locked) action = '<p class="shop-status is-soon">Coming Soon</p>';
      else action = '<button type="button" class="btn btn-block ' + (canBuy ? "btn-primary" : "btn-disabled") + '" data-buy="' + item.id + '"' + (canBuy ? "" : " disabled") + ">" +
        (canBuy ? "Buy Now" : "Not Enough Sparkles") + '<span class="sr-only"> ' + esc(item.name) + "</span></button>";
      var art = item.icon === "wand" ? '<span class="shop-art shop-art-svg">' + icon("wand") + "</span>" : '<span class="shop-art" aria-hidden="true">' + item.icon + "</span>";
      return '<li class="panel shop-card' + (item.locked ? " is-locked" : "") + '">' + art +
        (item.locked ? '<span class="shop-lock">' + icon("lock") + '<span class="sr-only">Locked</span></span>' : "") +
        "<h2>" + esc(item.name) + '</h2><p class="shop-price">✨ ' + item.price + '<span class="sr-only"> sparkles</span></p>' + action + "</li>";
    }).join("");
  }
  if (shopGrid) {
    renderShop();
    shopGrid.addEventListener("click", function (e) {
      var b = e.target.closest("[data-buy]");
      if (!b) return;
      var id = +b.getAttribute("data-buy"), s = shopState();
      var item = (DATA.shop || []).filter(function (x) { return x.id === id; })[0];
      if (!item || s.sparkles < item.price || s.owned.indexOf(id) > -1) return;
      s.sparkles -= item.price; s.owned.push(id);
      store.set(SHOP_KEY, s);
      renderShop();
      toast("You got the " + item.name + "! ✨");
      var card = $all(".shop-card", shopGrid)[(DATA.shop || []).indexOf(item)];
      if (card && !reduceMotion) { card.classList.add("pop"); }
      var next = $("[data-buy]:not([disabled])", shopGrid);
      if (next) next.focus();
    });
  }

  /* ---------- Shared helpers for other scripts ---------- */
  window.MelApp = {
    icon: icon, esc: esc, store: store, toast: toast, download: download,
    reduceMotion: reduceMotion, galleryKey: GALLERY_KEY, shopKey: SHOP_KEY, shopState: shopState
  };
})();
