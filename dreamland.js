/* ==========================================================================
   Mel's Dress Up Studio | Dreamland
   Four magical scenes to tap and play in. Shows the character from the
   Home page (saved on this device) exploring the scene.
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.MEL_DATA || {}, App = window.MelApp, R = window.MelRender;
  var root = document.getElementById("dreamland");
  if (!root || !App) return;

  var scenes = DATA.scenes || {};
  var current = "stars";
  var saved = App.store.get("mel_character", null);
  var reduce = App.reduceMotion;

  var switcher = document.getElementById("scene-switcher");
  var box = document.getElementById("scene-box");
  var help = document.getElementById("scene-help");
  var layers = document.getElementById("dream-bg");

  function rand(a, b) { return a + Math.random() * (b - a); }
  function el(tag, cls, style) { var e = document.createElement(tag); if (cls) e.className = cls; if (style) e.setAttribute("style", style); return e; }
  function later(fn, ms) { setTimeout(fn, ms); }

  /* ---------- Page background: one layer per scene, cross-faded ---------- */
  layers.innerHTML = Object.keys(scenes).map(function (k) {
    var c = scenes[k].page;
    return '<div class="dream-layer" data-layer="' + k + '" style="background:linear-gradient(135deg,' + c[0] + "," + c[1] + "," + c[2] + ')"></div>';
  }).join("");

  /* ---------- Scene buttons ---------- */
  switcher.innerHTML = Object.keys(scenes).map(function (k) {
    return '<li><button type="button" class="scene-btn" data-scene="' + k + '" aria-pressed="false">' +
      App.icon(scenes[k].icon, "scene-icon", k === "stars") + "<span>" + App.esc(scenes[k].name) + "</span></button></li>";
  }).join("");
  switcher.addEventListener("click", function (e) {
    var b = e.target.closest("[data-scene]");
    if (b) show(b.getAttribute("data-scene"));
  });

  /* ---------- Your character ---------- */
  var explorer = document.getElementById("explorer");
  if (saved && saved.character && R) {
    explorer.innerHTML = R.svg(saved.character, saved.equippedItems || {});
    document.getElementById("with-character").hidden = false;
  } else {
    document.getElementById("no-character").hidden = false;
  }

  /* ---------- Scenes ---------- */
  var builders = {
    stars: function (stage) {
      stage.className = "scene scene-stars";
      var stars = [];
      for (var i = 0; i < 26; i++) {
        var s = { x: rand(4, 96), y: rand(4, 92), size: rand(10, 28), delay: rand(0, 3) };
        var b = el("button", "star-btn", "left:" + s.x + "%;top:" + s.y + "%;width:" + s.size + "px;height:" + s.size + "px;animation-delay:" + s.delay.toFixed(2) + "s");
        b.type = "button"; b.tabIndex = -1; b.setAttribute("aria-hidden", "true");
        b.innerHTML = App.icon("star", "icon", true);
        b.addEventListener("click", twinkle.bind(null, stage, b, s));
        stage.appendChild(b); stars.push({ b: b, s: s });
      }
      stage.appendChild(hint("✨ Tap stars to make them twinkle!", "hint-stars"));
      var shoot = el("button", "scene-action"); shoot.type = "button"; shoot.textContent = "🌠 Shoot!";
      shoot.addEventListener("click", function () {
        var t = el("div", "shooting-star", "left:" + rand(5, 55) + "%;top:" + rand(5, 45) + "%");
        stage.appendChild(t); later(function () { t.remove(); }, 1100);
      });
      var tw = el("button", "scene-action scene-action-left"); tw.type = "button"; tw.textContent = "⭐ Twinkle!";
      tw.addEventListener("click", function () { var p = stars[Math.floor(Math.random() * stars.length)]; twinkle(stage, p.b, p.s); });
      stage.appendChild(tw); stage.appendChild(shoot);
    },
    moon: function (stage) {
      stage.className = "scene scene-moon";
      for (var i = 0; i < 14; i++) {
        var sz = rand(4, 9);
        stage.appendChild(el("span", "firefly", "left:" + rand(10, 90) + "%;top:" + rand(20, 95) + "%;width:" + sz + "px;height:" + sz + "px;box-shadow:0 0 " + (sz * 2) + "px " + sz + "px rgba(254,255,192,.55);animation-duration:" + rand(3, 8).toFixed(1) + "s;animation-delay:" + rand(0, 5).toFixed(1) + "s"));
      }
      var moon = el("button", "moon"); moon.type = "button"; moon.setAttribute("aria-label", "Tap the moon to send moonbeams");
      moon.addEventListener("click", function () {
        moon.classList.remove("boop"); void moon.offsetWidth; moon.classList.add("boop");
        for (var r = 0; r < 4; r++) (function (d) {
          later(function () { var ring = el("span", "ripple"); stage.appendChild(ring); later(function () { ring.remove(); }, 1800); }, d * 250);
        })(r);
      });
      stage.appendChild(moon);
      stage.appendChild(hint("🌙 Tap the moon to send moonbeams!", "hint-moon"));
    },
    clouds: function (stage) {
      stage.className = "scene scene-clouds";
      var clouds = [];
      for (var i = 0; i < 8; i++) {
        var c = { x: 6 + i / 8 * 88, y: rand(10, 75), size: rand(45, 105) };
        var b = el("button", "cloud-btn", "left:" + c.x + "%;top:" + c.y + "%;width:" + c.size + "px;height:" + c.size + "px;animation-duration:" + (4 + i * 0.36).toFixed(1) + "s;animation-delay:" + (i * 0.48).toFixed(1) + "s");
        b.type = "button"; b.tabIndex = -1; b.setAttribute("aria-hidden", "true");
        b.innerHTML = App.icon("cloud", "icon", true);
        b.addEventListener("click", puff.bind(null, stage, b, c));
        stage.appendChild(b); clouds.push({ b: b, c: c });
      }
      stage.appendChild(hint("🌬️ Tap clouds to create wind!", "hint-clouds"));
      var p = el("button", "scene-action scene-action-dark"); p.type = "button"; p.textContent = "🌬️ Puff!";
      p.addEventListener("click", function () { var k = clouds[Math.floor(Math.random() * clouds.length)]; puff(stage, k.b, k.c); });
      stage.appendChild(p);
    },
    rainbow: function (stage) {
      stage.className = "scene scene-rainbow";
      var cols = ["#FF6B6B", "#FF9F43", "#FFD93D", "#6BCB77", "#4D96FF", "#A29BFE", "#FF6BDB"];
      cols.forEach(function (c, i) {
        var w = 170 + i * 55, h = 85 + i * 27;
        stage.appendChild(el("span", "arc", "width:" + w + "px;height:" + h + "px;margin-left:" + (-w / 2) + "px;border-color:" + c));
      });
      function burst(xPct, yPct) {
        for (var i = 0; i < 16; i++) {
          var a = i / 16 * Math.PI * 2, d = rand(40, 85), size = rand(7, 14), col = cols[i % cols.length];
          var dot = el("span", "burst", "left:" + xPct + "%;top:" + yPct + "%;width:" + size + "px;height:" + size + "px;background:" + col + ";box-shadow:0 0 8px " + col + ";--tx:" + (Math.cos(a) * d).toFixed(0) + "px;--ty:" + (Math.sin(a) * d).toFixed(0) + "px");
          stage.appendChild(dot);
          (function (dd) { later(function () { dd.remove(); }, 1050); })(dot);
        }
      }
      stage.addEventListener("click", function (e) {
        if (e.target.closest("button")) return;
        var r = stage.getBoundingClientRect();
        burst((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
      });
      stage.appendChild(hint("🌈 Tap anywhere for rainbow magic!", "hint-rainbow"));
      var b = el("button", "scene-action"); b.type = "button"; b.textContent = "🌈 Burst!";
      b.addEventListener("click", function () { burst(rand(20, 80), rand(20, 70)); });
      stage.appendChild(b);
    }
  };

  function hint(text, cls) { var h = el("p", "scene-hint " + cls); h.textContent = text; return h; }

  function twinkle(stage, b, s) {
    b.classList.add("is-lit");
    later(function () { b.classList.remove("is-lit"); }, 1200);
    var colors = ["#FFD700", "#FFFACD", "#FF69B4", "#E8E8FF", "#FFF5CC"];
    for (var i = 0; i < 8; i++) {
      var a = i / 8 * Math.PI * 2, d = rand(38, 68);
      var p = el("span", "spark", "left:" + s.x + "%;top:" + s.y + "%;background:" + colors[i % 5] + ";box-shadow:0 0 6px " + colors[i % 5] + ";--tx:" + (Math.cos(a) * d).toFixed(0) + "px;--ty:" + (Math.sin(a) * d).toFixed(0) + "px");
      stage.appendChild(p);
      (function (pp) { later(function () { pp.remove(); }, 900); })(p);
    }
  }
  function puff(stage, b, c) {
    b.classList.add("is-puffed");
    later(function () { b.classList.remove("is-puffed"); }, 700);
    for (var i = 0; i < 6; i++) {
      var g = el("span", "gust", "left:" + c.x + "%;top:calc(" + c.y + "% + " + ((i - 2.5) * 6) + "px);width:" + rand(40, 110).toFixed(0) + "px");
      stage.appendChild(g);
      (function (gg) { later(function () { gg.remove(); }, 850); })(g);
    }
  }

  function show(key) {
    if (!scenes[key]) return;
    current = key;
    Array.prototype.forEach.call(switcher.querySelectorAll("[data-scene]"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-scene") === key ? "true" : "false");
    });
    Array.prototype.forEach.call(layers.children, function (l) { l.classList.toggle("is-on", l.getAttribute("data-layer") === key); });
    box.innerHTML = "";
    var stage = el("div");
    box.appendChild(stage);
    builders[key](stage);
    stage.setAttribute("aria-label", scenes[key].name + " play area");
    stage.setAttribute("role", "group");
    help.textContent = saved ? "Your character is exploring " + scenes[key].name + "! 🌟" : scenes[key].help;
  }

  show(current);
})();
