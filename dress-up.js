/* ==========================================================================
   Mel's Dress Up Studio | Dress-up page (Home)
   Pick a friend, pick clothes, Start Over, Save My Creation!
   The look is remembered on this device (localStorage "mel_character"),
   which is also what Dreamland shows.
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.MEL_DATA || {}, App = window.MelApp, R = window.MelRender;
  var root = document.getElementById("dress-up");
  if (!root || !App || !R) return;

  var STATE_KEY = "mel_character";
  var SLOT_OF = { tops: "top", bottoms: "bottom", accessories: "accessory", shoes: "shoes" };
  var state = { character: "girl", equipped: {} };
  var activeCat = "tops";

  var picker = document.getElementById("character-picker");
  var tabs = document.getElementById("wardrobe-tabs");
  var grid = document.getElementById("wardrobe-grid");
  var stage = document.getElementById("character-display");
  var nameTag = document.getElementById("character-name");
  var live = document.getElementById("dress-live");

  /* ---------- Restore the last look ---------- */
  (function restore() {
    var saved = App.store.get(STATE_KEY, null);
    if (saved && R.character(saved.character) && R.character(saved.character).id === saved.character) {
      state.character = saved.character;
      state.equipped = cleanEquipped(saved.equippedItems || {});
    } else {
      state.equipped = { top: DATA.defaults.top, bottom: DATA.defaults.bottom };
    }
  })();

  // only keep items that still exist in data.js (or the built-in defaults)
  function cleanEquipped(eq) {
    var out = {}, all = wardrobeFor(state.character);
    Object.keys(eq).forEach(function (slot) {
      var it = eq[slot];
      if (!it) return;
      if (it.id === DATA.defaults.top.id || it.id === DATA.defaults.bottom.id) { out[slot] = it; return; }
      Object.keys(all).forEach(function (cat) {
        all[cat].forEach(function (x) { if (x.id === it.id) out[slot] = x; });
      });
    });
    return out;
  }
  function wardrobeFor(id) { return (DATA.wardrobe || {})[id] || {}; }
  function persist() { App.store.set(STATE_KEY, { character: state.character, equippedItems: state.equipped }); }

  /* ---------- Character picker ---------- */
  function renderPicker() {
    picker.innerHTML = (DATA.characters || []).map(function (c) {
      var on = c.id === state.character;
      return '<li><button type="button" class="friend' + (on ? " is-on" : "") + '" data-char="' + c.id + '" aria-pressed="' + on + '"' +
        (on ? ' style="background-image:linear-gradient(135deg,' + c.tint[0] + "," + c.tint[1] + ')"' : "") + ">" +
        '<span class="friend-emoji" aria-hidden="true">' + c.emoji + '</span><span class="friend-name">' + App.esc(c.name) + "</span>" +
        (on ? '<span class="friend-check" aria-hidden="true">✓</span>' : "") + "</button></li>";
    }).join("");
  }
  picker.addEventListener("click", function (e) {
    var b = e.target.closest("[data-char]");
    if (!b || b.getAttribute("data-char") === state.character) return;
    state.character = b.getAttribute("data-char");
    state.equipped = { top: DATA.defaults.top, bottom: DATA.defaults.bottom };
    renderPicker(); renderGrid(); renderStage(true); persist();
    var nb = picker.querySelector('[data-char="' + state.character + '"]');
    if (nb) nb.focus();
    announce("Picked " + R.character(state.character).label + "!");
  });

  /* ---------- Wardrobe tabs ---------- */
  function renderTabs() {
    tabs.innerHTML = (DATA.categories || []).map(function (c) {
      var on = c.id === activeCat;
      return '<button type="button" role="tab" class="wtab' + (on ? " is-on" : "") + '" id="tab-' + c.id + '" aria-selected="' + on + '" aria-controls="wardrobe-grid" tabindex="' + (on ? 0 : -1) + '" data-cat="' + c.id + '">' +
        App.icon(c.icon) + "<span>" + App.esc(c.label) + "</span></button>";
    }).join("");
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]");
    if (!b) return;
    activeCat = b.getAttribute("data-cat");
    renderTabs(); renderGrid();
    var nb = tabs.querySelector('[data-cat="' + activeCat + '"]'); if (nb) nb.focus();
  });
  tabs.addEventListener("keydown", function (e) {
    var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    var cats = DATA.categories.map(function (c) { return c.id; });
    activeCat = cats[(cats.indexOf(activeCat) + dir + cats.length) % cats.length];
    renderTabs(); renderGrid();
    tabs.querySelector('[data-cat="' + activeCat + '"]').focus();
  });

  /* ---------- Wardrobe grid ---------- */
  function renderGrid() {
    var items = wardrobeFor(state.character)[activeCat] || [];
    grid.setAttribute("aria-labelledby", "tab-" + activeCat);
    if (!items.length) { grid.innerHTML = '<p class="wempty">No items yet!</p>'; return; }
    grid.innerHTML = '<ul class="wgrid">' + items.map(function (it) {
      var on = !!(state.equipped[it.slot] && state.equipped[it.slot].id === it.id);
      var ink = R.textColorFor(it.color);
      return '<li><button type="button" class="witem' + (on ? " is-on" : "") + '" data-item="' + it.id + '" aria-pressed="' + on + '" style="background-color:' + it.color + ";color:" + ink + ";text-shadow:" + (ink === "#ffffff" ? "0 1px 2px rgba(60,10,40,.6)" : "0 1px 1px rgba(255,255,255,.6)") + '">' +
        App.icon("sparkles", "witem-spark") + '<span class="witem-name">' + App.esc(it.name) + "</span>" +
        (on ? '<span class="witem-check" aria-hidden="true">✓</span>' : "") + "</button></li>";
    }).join("") + "</ul>";
  }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-item]");
    if (!b) return;
    var id = b.getAttribute("data-item"), items = wardrobeFor(state.character)[activeCat] || [], it = null;
    items.forEach(function (x) { if (x.id === id) it = x; });
    if (!it) return;
    var slot = it.slot, wasOn = state.equipped[slot] && state.equipped[slot].id === it.id;
    state.equipped[slot] = wasOn ? null : it;
    renderGrid(); renderStage(true); persist();
    var nb = grid.querySelector('[data-item="' + id + '"]'); if (nb) nb.focus();
    announce(wasOn ? "Took off " + it.name + "." : "Now wearing " + it.name + "!");
  });

  /* ---------- Character stage ---------- */
  function renderStage(bounce) {
    var ch = R.character(state.character);
    stage.innerHTML = R.svg(state.character, state.equipped);
    nameTag.textContent = ch.label;
    if (bounce && !App.reduceMotion) {
      stage.classList.remove("pop"); void stage.offsetWidth; stage.classList.add("pop");
    }
  }
  function announce(msg) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 30); }

  /* ---------- Start Over ---------- */
  document.getElementById("start-over").addEventListener("click", function () {
    state.equipped = { top: DATA.defaults.top, bottom: DATA.defaults.bottom };
    renderGrid(); renderStage(true); persist();
    announce("All fresh! Pick new clothes.");
  });

  /* ---------- Save My Creation! ----------
     Downloads a picture and adds it to the Gallery on this device.
     Each save also earns Sparkles to spend in the Magical Shop. */
  var saveBtn = document.getElementById("save-look");
  saveBtn.addEventListener("click", function () {
    saveBtn.disabled = true;
    var ch = R.character(state.character);
    var stamp = new Date();
    var name = ch.label + "'s Look";
    R.toPNG(state.character, state.equipped, 1024, "image/png").then(function (png) {
      App.download(png, "mel-dressup-" + state.character + "-" + stamp.getTime() + ".png");
      return R.toPNG(state.character, state.equipped, 480, "image/jpeg");
    }).then(function (thumb) {
      var list = App.store.get(App.galleryKey, []);
      if (!Array.isArray(list)) list = [];
      list.unshift({ imageData: thumb, name: name, alt: R.describe(state.character, state.equipped), date: stamp.toLocaleDateString() });
      if (list.length > 40) list = list.slice(0, 40);
      var ok = App.store.set(App.galleryKey, list);
      if (!ok) { App.toast("Picture saved! Your Gallery is full, so remove an old one to add more."); return; }
      var shop = App.shopState();
      shop.sparkles += DATA.sparklesPerSave || 0;
      App.store.set(App.shopKey, shop);
      App.toast("Saved to your Gallery! +" + (DATA.sparklesPerSave || 0) + " Sparkles ✨");
    }).catch(function () {
      App.toast("Saving works on the website version. Ask a grown-up to open the site online.");
    }).then(function () { saveBtn.disabled = false; });
  });

  /* ---------- Start ---------- */
  renderPicker(); renderTabs(); renderGrid(); renderStage(false); persist();
  R.preload(); // gets pictures ready for Save
})();
