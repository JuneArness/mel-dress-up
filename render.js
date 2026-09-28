/* ==========================================================================
   Mel's Dress Up Studio | Character renderer
   Draws a character as one SVG picture:
   - "photo" characters: the 3D picture, with each piece of clothing
     recolored by an SVG filter through its mask (keeps the shading)
   - "art" characters: drawn with shapes, so every outfit works
   Accessories are drawn on top in both cases.
   Used by the Home page (dress up) and Dreamland (the explorer preview).
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.MEL_DATA || {};
  var uidCounter = 0;

  /* ---------- Color helpers ---------- */
  function hexToRgb(h) {
    h = String(h || "#000000").replace("#", "");
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(c) {
    return "#" + c.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join("");
  }
  function mix(hex, withHex, amt) {
    var a = hexToRgb(hex), b = hexToRgb(withHex);
    return rgbToHex([0, 1, 2].map(function (i) { return a[i] + (b[i] - a[i]) * amt; }));
  }
  function lighten(hex, amt) { return mix(hex, "#ffffff", amt); }
  function darken(hex, amt) { return mix(hex, "#1e0b2a", amt); }
  function luma(hex) {
    var c = hexToRgb(hex).map(function (v) { return v / 255; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function has(name, words) {
    var n = String(name || "").toLowerCase();
    for (var i = 0; i < words.length; i++) if (n.indexOf(words[i]) > -1) return true;
    return false;
  }

  /* ---------- Asset URLs ----------
     On a web server the pictures are turned into data URLs once, so saved
     creations can include them. Opened straight from a file, the normal file
     names are used (everything still shows; saving needs the web version). */
  var assetCache = {};
  function assetUrl(src) { return assetCache[src] || src; }
  function preload(srcs) {
    if (!window.fetch || location.protocol === "file:") return Promise.resolve(false);
    return Promise.all(srcs.map(function (src) {
      if (assetCache[src]) return true;
      return fetch(src).then(function (r) { if (!r.ok) throw new Error(src); return r.blob(); })
        .then(function (b) {
          return new Promise(function (res) {
            var fr = new FileReader();
            fr.onload = function () { assetCache[src] = fr.result; res(true); };
            fr.onerror = function () { res(false); };
            fr.readAsDataURL(b);
          });
        }).catch(function () { return false; });
    })).then(function (r) { return r.every(Boolean); });
  }
  function photoAssets() {
    var list = [];
    Object.keys(DATA.photos || {}).forEach(function (k) {
      var p = DATA.photos[k];
      list.push(p.image);
      Object.keys(p.masks).forEach(function (m) { list.push(p.masks[m]); });
    });
    return list;
  }

  /* ---------- Gradients (unique ids per picture) ---------- */
  function Ctx(uid) { this.uid = uid; this.defs = []; this.n = 0; }
  Ctx.prototype.id = function (p) { return this.uid + "-" + p + "-" + (this.n++); };
  Ctx.prototype.vgrad = function (color, light, dark) {
    var id = this.id("g");
    this.defs.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="0.35" y2="1">' +
      '<stop offset="0" stop-color="' + lighten(color, light == null ? 0.28 : light) + '"/>' +
      '<stop offset="0.55" stop-color="' + color + '"/>' +
      '<stop offset="1" stop-color="' + darken(color, dark == null ? 0.22 : dark) + '"/></linearGradient>');
    return "url(#" + id + ")";
  };
  Ctx.prototype.rgrad = function (color) {
    var id = this.id("r");
    this.defs.push('<radialGradient id="' + id + '" cx="0.38" cy="0.32" r="0.75">' +
      '<stop offset="0" stop-color="' + lighten(color, 0.35) + '"/>' +
      '<stop offset="0.6" stop-color="' + color + '"/>' +
      '<stop offset="1" stop-color="' + darken(color, 0.25) + '"/></radialGradient>');
    return "url(#" + id + ")";
  };
  Ctx.prototype.rainbow = function (vertical) {
    var id = this.id("rb");
    var cols = ["#FF6B6B", "#FF9F43", "#FFD93D", "#6BCB77", "#4D96FF", "#A29BFE", "#FF6BDB"];
    this.defs.push('<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vertical ? 0 : 1) + '" y2="' + (vertical ? 1 : 0) + '">' +
      cols.map(function (c, i) { return '<stop offset="' + (i / (cols.length - 1)) + '" stop-color="' + c + '"/>'; }).join("") + "</linearGradient>");
    return "url(#" + id + ")";
  };

  /* ==========================================================================
     ART CHARACTERS
     All share one body so clothes and accessories fit every friend.
     ========================================================================== */
  var ART = {
    princess: { skin: "#f6cdb5", hair: "#f3c04f", hairStyle: "long", eyes: "#3b6fb6", kind: "human" },
    fairy:    { skin: "#f8dccb", hair: "#f7cf5c", hairStyle: "bun",  eyes: "#2f8f7a", kind: "human", fairyWings: true },
    robot:    { skin: "#c9d3df", kind: "robot" },
    unicorn:  { skin: "#dccbf3", kind: "unicorn" },
    cat:      { skin: "#f4a35a", kind: "cat" },
    bear:     { skin: "#a86a3d", kind: "bear" },
    bunny:    { skin: "#f7f5f7", kind: "bunny" },
    girl:     { skin: "#9a5a38", hair: "#2b1a14", hairStyle: "afro", eyes: "#2b1a14", kind: "human" }
  };

  var ART_ANCHORS = {
    headTop: [512, 150], head: [512, 300], eyeY: 302, eyeL: 458, eyeR: 566,
    earL: [360, 322], earR: [664, 322], neck: [512, 446], handR: [712, 318],
    handL: [312, 318], wristR: [694, 356], back: [512, 540], scale: 1
  };

  function stroke(d, color, w) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  var ARM_L = "M428,482 Q372,430 336,356";
  var ARM_R = "M596,482 Q652,430 688,356";
  var LEG_L = "M482,648 L462,872";
  var LEG_R = "M542,648 L562,872";

  function drawLimbs(ctx, cfg, part) {
    var skin = cfg.kind === "robot" ? ctx.vgrad(cfg.skin, 0.3, 0.3) : cfg.skin;
    if (part === "legs") return stroke(LEG_L, skin, 52) + stroke(LEG_R, skin, 52);
    var hands = cfg.kind === "robot" ?
      '<circle cx="330" cy="344" r="30" fill="' + skin + '" stroke="#94a3b8" stroke-width="4"/><circle cx="694" cy="344" r="30" fill="' + skin + '" stroke="#94a3b8" stroke-width="4"/>' :
      '<circle cx="330" cy="344" r="31" fill="' + cfg.skin + '"/><circle cx="694" cy="344" r="31" fill="' + cfg.skin + '"/>';
    return stroke(ARM_L, skin, 46) + stroke(ARM_R, skin, 46) + hands;
  }

  /* ---------- Clothes ---------- */
  function decor(ctx, name, color, area) {
    // small prints that match the item's name
    var c = luma(color) > 0.6 ? darken(color, 0.35) : lighten(color, 0.55);
    var x = area[0], y = area[1];
    if (has(name, ["heart"])) return '<path d="M' + x + ',' + (y + 14) + ' c-26,-22 -26,-44 -8,-48 c10,-2 8,8 8,8 c0,0 -2,-10 8,-8 c18,4 18,26 -8,48z" fill="' + (luma(color) > 0.5 ? "#e11d48" : "#fff") + '" opacity="0.9"/>';
    if (has(name, ["star"])) return starPath(x, y, 18, 8, c, 0.95);
    if (has(name, ["sun"])) return '<circle cx="' + x + '" cy="' + y + '" r="16" fill="#fff7ae" stroke="#f59e0b" stroke-width="4"/>';
    if (has(name, ["leaf"])) return '<path d="M' + (x - 18) + ',' + (y + 14) + ' Q' + x + ',' + (y - 30) + ' ' + (x + 20) + ',' + (y - 14) + ' Q' + (x + 6) + ',' + (y + 20) + ' ' + (x - 18) + ',' + (y + 14) + 'z" fill="#4ade80" stroke="#15803d" stroke-width="3"/>';
    if (has(name, ["sparkle", "shimmer", "magic", "glitter"])) return sparkles([[x - 30, y - 10, 10], [x + 26, y + 16, 12], [x + 4, y - 28, 8]], "#ffffff");
    if (has(name, ["circuit"])) return '<path d="M' + (x - 40) + ',' + y + ' h30 v-20 h30 v34 h24" fill="none" stroke="#bbf7d0" stroke-width="5"/><circle cx="' + (x + 44) + '" cy="' + (y + 14) + '" r="6" fill="#bbf7d0"/>';
    return "";
  }
  function pattern(ctx, name, color, clipPath) {
    // stripes / spots / rainbow overlays clipped to the garment
    var id = ctx.id("clip"), out = "";
    if (has(name, ["stripe"])) {
      for (var i = 0; i < 12; i++) out += '<rect x="300" y="' + (430 + i * 36) + '" width="430" height="14" fill="' + lighten(color, 0.55) + '" opacity="0.85"/>';
    } else if (has(name, ["spot"])) {
      [[450, 520], [560, 560], [500, 610], [470, 700], [560, 720], [520, 800], [440, 810]].forEach(function (p) {
        out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="' + darken(color, 0.45) + '" opacity="0.7"/>';
      });
    } else if (has(name, ["rainbow"])) {
      out = '<rect x="280" y="420" width="470" height="480" fill="' + ctx.rainbow(true) + '" opacity="0.8"/>';
    } else return "";
    ctx.defs.push('<clipPath id="' + id + '"><path d="' + clipPath + '"/></clipPath>');
    return '<g clip-path="url(#' + id + ')">' + out + "</g>";
  }

  var TORSO = "M420,470 Q512,442 604,470 L620,652 Q512,676 404,652 Z";
  var DRESS = "M424,470 Q512,444 600,470 L612,560 Q690,700 700,800 Q512,842 324,800 Q334,700 412,560 Z";

  function drawTop(ctx, cfg, item) {
    var color = item.color, name = item.name, fill = ctx.vgrad(color);
    var edge = darken(color, 0.3);
    var isDress = has(name, ["dress", "gown", "ball", "royal"]);
    var isLong = has(name, ["coat", "hoodie", "sweater"]);
    var isRobot = cfg.kind === "robot" || has(name, ["chest", "plate", "metal", "steel", "circuit"]);
    var isFur = has(name, ["fur", "fluff"]);
    var sleeveEnd = isLong ? "M428,482 Q372,430 346,372" : "M428,482 Q400,456 384,430";
    var sleeveEnd2 = isLong ? "M596,482 Q652,430 678,372" : "M596,482 Q624,456 640,430";
    var out = "";
    out += stroke(sleeveEnd, fill, 56) + stroke(sleeveEnd2, fill, 56);
    if (isFur) {
      out += stroke(isLong ? "M346,372 L352,380" : "M384,430 L388,436", lighten(color, 0.45), 58) +
             stroke(isLong ? "M678,372 L672,380" : "M640,430 L636,436", lighten(color, 0.45), 58);
    }
    if (isDress) {
      out += '<path d="' + DRESS + '" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>';
      out += '<path d="M412,560 Q512,592 612,560" fill="none" stroke="' + lighten(color, 0.5) + '" stroke-width="10" stroke-linecap="round"/>';
      out += '<path d="M360,760 Q512,800 664,760" fill="none" stroke="' + lighten(color, 0.4) + '" stroke-width="6" opacity="0.7"/>';
      out += pattern(ctx, name, color, DRESS) + decor(ctx, name, color, [512, 520]);
      if (has(name, ["ball", "gown", "royal"])) out += sparkles([[400, 720, 9], [620, 700, 11], [520, 770, 8]], "#ffffff");
    } else {
      var shape = isRobot ? "M418,468 L606,468 L614,656 L410,656 Z" : TORSO;
      out += '<path d="' + shape + '" fill="' + fill + '" stroke="' + edge + '" stroke-width="4" stroke-linejoin="round"/>';
      if (isRobot) {
        out += '<rect x="450" y="500" width="124" height="96" rx="18" fill="' + darken(color, 0.12) + '" stroke="' + edge + '" stroke-width="4"/>';
        [[430, 486], [594, 486], [430, 636], [594, 636]].forEach(function (p) { out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + lighten(color, 0.6) + '"/>'; });
      } else {
        out += '<path d="M470,456 Q512,488 554,456" fill="none" stroke="' + edge + '" stroke-width="6" stroke-linecap="round"/>';
      }
      if (isFur) out += '<path d="M404,648 q17,18 34,0 q17,18 34,0 q17,18 34,0 q17,18 34,0 q17,18 34,0 q17,18 34,0 q17,18 36,0" fill="none" stroke="' + lighten(color, 0.45) + '" stroke-width="14" stroke-linecap="round"/>';
      if (isLong) out += '<path d="M512,462 L512,664" stroke="' + edge + '" stroke-width="4"/><circle cx="530" cy="520" r="6" fill="' + edge + '"/><circle cx="530" cy="580" r="6" fill="' + edge + '"/>';
      out += pattern(ctx, name, color, shape) + decor(ctx, name, color, [512, 556]);
    }
    if (cfg.kind === "robot") out += heart(512, 548, 26, "#f472b6");
    return out;
  }

  function drawBottom(ctx, cfg, item, dressOn) {
    var color = item.color, name = item.name, fill = ctx.vgrad(color), edge = darken(color, 0.3);
    var out = "";
    if (has(name, ["tail"])) {
      var tailFill = has(name, ["rainbow"]) ? ctx.rainbow(true) : ctx.rgrad(color);
      out += '<g data-layer="back">' + (has(name, ["rainbow"]) ?
        '<path d="M600,640 Q720,610 740,700 Q760,800 680,830 Q720,760 660,720 Q640,700 606,690 Z" fill="' + tailFill + '"/>' :
        '<circle cx="628" cy="668" r="46" fill="' + tailFill + '"/>') + "</g>";
      out += '<path d="M406,640 Q512,668 618,640 L612,712 Q512,730 412,712 Z" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>';
      return out;
    }
    if (dressOn) return ""; // a dress covers the bottom half
    var skirt = has(name, ["skirt", "tulle", "tutu", "layer", "trim"]);
    var shorts = has(name, ["short"]);
    var legs = has(name, ["legs", "parts", "gears"]);
    if (skirt) {
      var tutu = has(name, ["tutu", "tulle", "layer"]);
      var d = tutu ?
        "M404,636 Q512,662 620,636 L700,742 q-24,22 -48,0 q-24,22 -48,0 q-24,22 -48,0 q-24,22 -48,0 q-24,22 -48,0 q-24,22 -48,0 q-24,22 -48,0 Z" :
        "M404,636 Q512,662 620,636 L676,772 Q512,806 348,772 Z";
      out += '<path d="' + d + '" fill="' + fill + '" stroke="' + edge + '" stroke-width="4" stroke-linejoin="round"/>';
      if (tutu) out += '<path d="' + d + '" fill="' + lighten(color, 0.6) + '" opacity="0.35" transform="translate(0,-18)"/>';
      if (has(name, ["trim"])) out += '<path d="M352,768 Q512,802 672,768" fill="none" stroke="#f5c542" stroke-width="12"/>';
      out += pattern(ctx, name, color, d) + decor(ctx, name, color, [512, 720]);
      return out;
    }
    var legEnd = shorts ? 736 : 862;
    var lp = "M456," + legEnd + " L480,640 L512,652 L544,640 L568," + legEnd;
    out += stroke(LEG_L.replace("872", String(legEnd)), fill, 64) + stroke(LEG_R.replace("872", String(legEnd)), fill, 64);
    out += '<path d="M410,636 Q512,664 614,636 L612,690 Q512,706 412,690 Z" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>';
    if (has(name, ["jean"])) out += stroke("M470,700 L462,850", lighten(color, 0.35), 3) + stroke("M554,700 L562,850", lighten(color, 0.35), 3);
    if (has(name, ["cloud"])) out += '<path d="M430,700 q10,-16 24,-6 q10,-14 24,0" fill="none" stroke="#fff" stroke-width="6"/><path d="M540,760 q10,-16 24,-6 q10,-14 24,0" fill="none" stroke="#fff" stroke-width="6"/>';
    if (legs && cfg.kind === "robot") out += '<circle cx="470" cy="760" r="12" fill="' + lighten(color, 0.5) + '"/><circle cx="554" cy="760" r="12" fill="' + lighten(color, 0.5) + '"/>';
    if (has(name, ["gear"])) out += gear(470, 770, 20, lighten(color, 0.5)) + gear(556, 770, 20, lighten(color, 0.5));
    out += pattern(ctx, name, color, "M396,630 L628,630 L600," + (legEnd + 10) + " L420," + (legEnd + 10) + " Z") + decor(ctx, name, color, [512, 670]);
    return out;
  }

  function drawShoes(ctx, cfg, item) {
    var color = item ? item.color : null, name = item ? item.name : "";
    if (!item) {
      if (cfg.kind === "human") { color = "#ffffff"; name = "Sneakers"; }
      else if (cfg.kind === "robot") { color = "#94a3b8"; name = "Robot Feet"; }
      else if (cfg.kind === "unicorn") { color = "#8b7aa8"; name = "Hooves"; }
      else return foot(cfg.skin, 462, 880) + foot(cfg.skin, 562, 880);
    }
    var fill = ctx.vgrad(color), edge = darken(color, 0.35), out = "";
    [[462, 876], [562, 876]].forEach(function (p, i) {
      var x = p[0], y = p[1], dir = i === 0 ? -1 : 1;
      if (has(name, ["hoof", "hooves"])) {
        var hf = has(name, ["rainbow"]) ? ctx.rainbow(false) : fill;
        out += '<path d="M' + (x - 34) + ',' + (y - 20) + ' h68 l6,52 h-80 z" fill="' + hf + '" stroke="' + edge + '" stroke-width="4"/>';
        if (has(name, ["star"])) out += starPath(x, y + 8, 14, 6, "#fff7ae", 1);
      } else if (has(name, ["paw"])) {
        var pf = has(name, ["rainbow"]) ? ctx.rainbow(false) : fill;
        out += '<ellipse cx="' + x + '" cy="' + (y + 10) + '" rx="44" ry="30" fill="' + pf + '" stroke="' + edge + '" stroke-width="4"/>' +
          '<circle cx="' + (x - 18) + '" cy="' + (y + 2) + '" r="7" fill="' + lighten(color, 0.55) + '"/><circle cx="' + x + '" cy="' + (y - 4) + '" r="7" fill="' + lighten(color, 0.55) + '"/><circle cx="' + (x + 18) + '" cy="' + (y + 2) + '" r="7" fill="' + lighten(color, 0.55) + '"/>';
      } else if (has(name, ["boot"])) {
        out += '<path d="M' + (x - 32) + ',' + (y - 90) + ' h64 v78 q' + (dir * 30) + ',4 ' + (dir * 30) + ',34 h' + (-dir * 124) + ' v-34 z" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>';
        if (has(name, ["fuzz"])) out += '<rect x="' + (x - 38) + '" y="' + (y - 100) + '" width="76" height="24" rx="12" fill="' + lighten(color, 0.55) + '"/>';
      } else if (has(name, ["rocket", "booster"])) {
        out += '<path d="M' + (x - 34) + ',' + (y - 20) + ' h68 v38 h-68 z" rx="10" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>' +
          '<path d="M' + (x - 20) + ',' + (y + 20) + ' q20,46 40,0 z" fill="#fb923c"/><path d="M' + (x - 10) + ',' + (y + 20) + ' q10,26 20,0 z" fill="#fde047"/>';
      } else if (has(name, ["wheel"])) {
        out += '<rect x="' + (x - 36) + '" y="' + (y - 24) + '" width="72" height="28" rx="8" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>' +
          '<circle cx="' + x + '" cy="' + (y + 20) + '" r="22" fill="#475569"/><circle cx="' + x + '" cy="' + (y + 20) + '" r="9" fill="' + color + '"/>';
      } else if (has(name, ["hover"])) {
        out += '<rect x="' + (x - 40) + '" y="' + (y - 16) + '" width="80" height="26" rx="13" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>' +
          '<ellipse cx="' + x + '" cy="' + (y + 30) + '" rx="46" ry="10" fill="' + lighten(color, 0.5) + '" opacity="0.7"/>';
      } else if (has(name, ["heel", "slipper", "flat", "sandal"])) {
        var glass = has(name, ["glass"]);
        out += '<path d="M' + (x - 30 - (dir < 0 ? 16 : 0)) + ',' + (y + 4) + ' q0,-28 ' + (46) + ',-28 q' + 30 + ',0 ' + 32 + ',28 v12 h-78 z" fill="' + (glass ? "#e0f2fe" : fill) + '" stroke="' + (glass ? "#7dd3fc" : edge) + '" stroke-width="4" ' + (glass ? 'opacity="0.85"' : "") + "/>";
        if (has(name, ["heel"])) out += '<rect x="' + (x + (dir < 0 ? 8 : -14)) + '" y="' + (y + 12) + '" width="10" height="22" fill="' + edge + '"/>';
        if (glass) out += sparkles([[x + 10, y - 10, 7]], "#ffffff");
      } else {
        var sf = has(name, ["rainbow"]) ? ctx.rainbow(false) : fill;
        out += '<path d="M' + (x - 34 - (dir < 0 ? 14 : 0)) + ',' + (y + 10) + ' q0,-40 40,-40 q' + (38 + (dir > 0 ? 14 : 0)) + ',0 ' + (40 + (dir > 0 ? 14 : 0)) + ',40 z" fill="' + sf + '" stroke="' + edge + '" stroke-width="4"/>' +
          '<rect x="' + (x - 50) + '" y="' + (y + 8) + '" width="100" height="16" rx="8" fill="#ffffff" stroke="' + darken("#ffffff", 0.2) + '" stroke-width="3"/>';
      }
    });
    return out;
  }
  function foot(skin, x, y) {
    return '<ellipse cx="' + x + '" cy="' + (y + 8) + '" rx="42" ry="28" fill="' + skin + '" stroke="' + darken(skin, 0.25) + '" stroke-width="3"/>';
  }

  /* ---------- Heads ---------- */
  function eyesOpen(ctx, color, lashes) {
    var out = "";
    [458, 566].forEach(function (x) {
      out += '<ellipse cx="' + x + '" cy="302" rx="22" ry="28" fill="' + color + '"/>' +
        '<ellipse cx="' + x + '" cy="302" rx="13" ry="17" fill="#1f1027"/>' +
        '<circle cx="' + (x + 8) + '" cy="291" r="8" fill="#fff"/><circle cx="' + (x - 7) + '" cy="312" r="4" fill="#fff" opacity="0.9"/>';
      if (lashes) out += '<path d="M' + (x - 22) + ',258 Q' + x + ',244 ' + (x + 22) + ',258" stroke="#5b3a2e" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.7"/>';
    });
    return out;
  }
  function smile(y, wide) {
    var w = wide || 44;
    return '<path d="M' + (512 - w) + ',' + y + ' Q512,' + (y + 12) + ' ' + (512 + w) + ',' + y + ' Q' + (512 + w - 4) + ',' + (y + 56) + ' 512,' + (y + 58) + ' Q' + (512 - w + 4) + ',' + (y + 56) + ' ' + (512 - w) + ',' + y + 'z" fill="#8a2346"/>' +
      '<path d="M' + (512 - w + 8) + ',' + (y + 5) + ' Q512,' + (y + 16) + ' ' + (512 + w - 8) + ',' + (y + 5) + ' L' + (512 + w - 12) + ',' + (y + 16) + ' Q512,' + (y + 26) + ' ' + (512 - w + 12) + ',' + (y + 16) + 'z" fill="#fff"/>' +
      '<ellipse cx="512" cy="' + (y + 44) + '" rx="' + (w * 0.45) + '" ry="10" fill="#f47a98"/>';
  }
  function cheeks(c) {
    return '<ellipse cx="420" cy="350" rx="26" ry="16" fill="' + (c || "#ff8fab") + '" opacity="0.55"/><ellipse cx="604" cy="350" rx="26" ry="16" fill="' + (c || "#ff8fab") + '" opacity="0.55"/>';
  }

  function drawHead(ctx, cfg, part) {
    var skin = cfg.skin, k = cfg.kind, head = ctx.rgrad(skin), out = "";
    if (part === "back") {
      if (k === "human" && cfg.hairStyle === "long") {
        out += '<path d="M356,300 Q340,140 512,130 Q684,140 668,300 Q700,470 660,560 Q640,520 612,520 L412,520 Q384,520 364,560 Q324,470 356,300z" fill="' + ctx.vgrad(cfg.hair, 0.3, 0.2) + '"/>';
        out += '<path d="M372,420 q-20,40 0,90 M652,420 q20,40 0,90" stroke="' + darken(cfg.hair, 0.2) + '" stroke-width="8" fill="none" stroke-linecap="round"/>';
      }
      if (k === "human" && cfg.hairStyle === "bun") out += '<circle cx="512" cy="140" r="62" fill="' + ctx.rgrad(cfg.hair) + '"/>';
      if (k === "human" && cfg.hairStyle === "afro") out += '<circle cx="512" cy="270" r="210" fill="' + ctx.rgrad(cfg.hair) + '"/>';
      if (k === "bunny") out += '<path d="M430,190 Q392,20 440,10 Q490,20 478,190z" fill="' + skin + '" stroke="#e5dce5" stroke-width="4"/><path d="M438,170 Q420,50 442,40 Q462,50 462,170z" fill="#fbcfe8"/>' +
        '<path d="M546,190 Q534,20 584,10 Q632,20 594,190z" fill="' + skin + '" stroke="#e5dce5" stroke-width="4"/><path d="M562,170 Q562,50 582,40 Q604,50 586,170z" fill="#fbcfe8"/>';
      if (k === "cat") out += '<path d="M380,210 L396,90 L470,170z" fill="' + skin + '" stroke="' + darken(skin, 0.25) + '" stroke-width="4"/><path d="M398,176 L404,122 L444,164z" fill="#fda4af"/>' +
        '<path d="M644,210 L628,90 L554,170z" fill="' + skin + '" stroke="' + darken(skin, 0.25) + '" stroke-width="4"/><path d="M626,176 L620,122 L580,164z" fill="#fda4af"/>';
      if (k === "bear") out += '<circle cx="392" cy="176" r="48" fill="' + skin + '"/><circle cx="392" cy="176" r="24" fill="' + lighten(skin, 0.35) + '"/><circle cx="632" cy="176" r="48" fill="' + skin + '"/><circle cx="632" cy="176" r="24" fill="' + lighten(skin, 0.35) + '"/>';
      if (k === "unicorn") {
        out += '<path d="M600,160 Q720,200 700,330 Q690,420 640,470 Q660,380 620,320z" fill="' + ctx.rainbow(true) + '"/>';
        out += '<path d="M404,196 L392,110 L452,168z" fill="' + skin + '"/><path d="M620,196 L632,110 L572,168z" fill="' + skin + '"/>';
      }
      if (k === "robot") out += stroke("M512,150 L512,110", "#94a3b8", 8) + '<circle cx="512" cy="102" r="14" fill="#f472b6"/>';
      return out;
    }
    // front: neck, head, face
    if (k !== "robot") out += '<rect x="488" y="416" width="48" height="52" rx="18" fill="' + darken(skin, 0.08) + '"/>';
    if (k === "robot") {
      out += '<rect x="496" y="420" width="32" height="46" fill="#94a3b8"/>';
      out += '<rect x="364" y="164" width="296" height="262" rx="120" fill="' + ctx.vgrad(skin, 0.35, 0.3) + '" stroke="#94a3b8" stroke-width="6"/>';
      out += '<rect x="400" y="240" width="224" height="120" rx="60" fill="#1e293b"/>';
      out += '<circle cx="462" cy="298" r="26" fill="#4ade80"/><circle cx="562" cy="298" r="26" fill="#4ade80"/><circle cx="470" cy="290" r="8" fill="#dcfce7"/><circle cx="570" cy="290" r="8" fill="#dcfce7"/>';
      out += '<path d="M478,338 Q512,356 546,338" stroke="#4ade80" stroke-width="7" fill="none" stroke-linecap="round"/>';
      out += '<rect x="346" y="266" width="22" height="64" rx="10" fill="#94a3b8"/><rect x="656" y="266" width="22" height="64" rx="10" fill="#94a3b8"/>';
      return out;
    }
    out += '<circle cx="512" cy="300" r="152" fill="' + head + '" stroke="' + darken(skin, k === "bunny" ? 0.12 : 0.18) + '" stroke-width="4"/>';
    if (k === "human") {
      out += '<circle cx="364" cy="320" r="24" fill="' + skin + '"/><circle cx="660" cy="320" r="24" fill="' + skin + '"/>';
      out += eyesOpen(ctx, cfg.eyes, true) + cheeks() + smile(346, 44);
      if (cfg.hairStyle === "long") out += '<path d="M360,290 Q370,160 512,150 Q654,160 664,290 Q610,200 520,236 Q450,196 360,290z" fill="' + ctx.vgrad(cfg.hair, 0.35, 0.15) + '"/>';
      if (cfg.hairStyle === "bun") out += '<path d="M360,280 Q372,160 512,152 Q652,160 664,280 Q620,190 512,214 Q404,190 360,280z" fill="' + ctx.vgrad(cfg.hair, 0.35, 0.15) + '"/>';
      if (cfg.hairStyle === "afro") out += '<path d="M362,270 Q380,120 512,118 Q644,120 662,270 Q600,180 512,196 Q424,180 362,270z" fill="' + cfg.hair + '"/>';
    } else {
      if (k === "unicorn") {
        out += '<ellipse cx="512" cy="360" rx="92" ry="64" fill="' + lighten(skin, 0.35) + '"/><circle cx="482" cy="366" r="8" fill="#a78bca"/><circle cx="542" cy="366" r="8" fill="#a78bca"/>';
        out += '<path d="M380,190 Q460,110 560,150 Q470,150 420,240z" fill="' + ctx.rainbow(false) + '"/>';
        out += '<path d="M492,160 L512,40 L532,160z" fill="' + ctx.vgrad("#f5c542", 0.4, 0.2) + '" stroke="#d4a017" stroke-width="3"/><path d="M500,130 L524,118 M502,100 L522,90" stroke="#d4a017" stroke-width="4"/>';
        out += eyesOpen(ctx, "#6d4aa8", true) + cheeks("#f9a8d4");
        out += '<path d="M488,396 Q512,414 536,396" stroke="#7a1f3d" stroke-width="6" fill="none" stroke-linecap="round"/>';
      } else if (k === "cat") {
        out += '<path d="M420,236 l14,30 M470,210 l8,30 M604,236 l-14,30 M554,210 l-8,30" stroke="' + darken(skin, 0.3) + '" stroke-width="10" stroke-linecap="round"/>';
        out += '<ellipse cx="512" cy="362" rx="70" ry="50" fill="' + lighten(skin, 0.55) + '"/>';
        out += eyesOpen(ctx, "#65a30d", false) + cheeks();
        out += '<path d="M500,344 h24 l-12,14z" fill="#f472b6"/><path d="M512,358 v10 M512,368 q-16,14 -30,4 M512,368 q16,14 30,4" stroke="#7a1f3d" stroke-width="5" fill="none" stroke-linecap="round"/>';
        out += '<path d="M430,356 h-70 M430,370 l-66,14 M594,356 h70 M594,370 l66,14" stroke="#7a4a28" stroke-width="3"/>';
      } else if (k === "bear") {
        out += '<ellipse cx="512" cy="366" rx="74" ry="56" fill="' + lighten(skin, 0.4) + '"/>';
        out += eyesOpen(ctx, "#3b2314", false) + cheeks();
        out += '<ellipse cx="512" cy="346" rx="22" ry="15" fill="#3b2314"/><path d="M512,360 v12 M512,372 q-18,16 -32,4 M512,372 q18,16 32,4" stroke="#3b2314" stroke-width="5" fill="none" stroke-linecap="round"/>';
      } else if (k === "bunny") {
        out += '<ellipse cx="512" cy="364" rx="66" ry="48" fill="#ffffff"/>';
        out += eyesOpen(ctx, "#3b82f6", true) + cheeks("#f9a8d4");
        out += '<path d="M502,346 h20 l-10,12z" fill="#f472b6"/><path d="M512,358 v8 M512,366 q-14,12 -26,4 M512,366 q14,12 26,4" stroke="#7a1f3d" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="500" y="376" width="24" height="16" rx="3" fill="#fff" stroke="#e5dce5" stroke-width="2"/>';
      }
    }
    return out;
  }

  /* ---------- Small shapes ---------- */
  function starPath(cx, cy, R, r, fill, op) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var a = Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R;
      p.push((cx + Math.cos(a) * rad).toFixed(1) + "," + (cy - Math.sin(a) * rad).toFixed(1));
    }
    return '<polygon points="' + p.join(" ") + '" fill="' + fill + '" opacity="' + (op == null ? 1 : op) + '"/>';
  }
  function sparkles(list, fill) {
    return list.map(function (s) {
      var x = s[0], y = s[1], r = s[2];
      return '<path d="M' + x + ',' + (y - r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y + r) + ' Q' + x + ',' + y + ' ' + (x - r) + ',' + y + ' Q' + x + ',' + y + ' ' + x + ',' + (y - r) + 'z" fill="' + fill + '"/>';
    }).join("");
  }
  function heart(cx, cy, s, fill) {
    return '<path d="M' + cx + ',' + (cy + s * 0.9) + ' C' + (cx - s * 1.6) + ',' + (cy - s * 0.2) + ' ' + (cx - s * 0.7) + ',' + (cy - s * 1.3) + ' ' + cx + ',' + (cy - s * 0.4) + ' C' + (cx + s * 0.7) + ',' + (cy - s * 1.3) + ' ' + (cx + s * 1.6) + ',' + (cy - s * 0.2) + ' ' + cx + ',' + (cy + s * 0.9) + 'z" fill="' + fill + '"/>';
  }
  function gear(cx, cy, r, fill) {
    var out = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"/>';
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      out += '<rect x="' + (cx - 5) + '" y="' + (cy - r - 7) + '" width="10" height="12" fill="' + fill + '" transform="rotate(' + (a * 180 / Math.PI) + ' ' + cx + ' ' + cy + ')"/>';
    }
    return out + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.35) + '" fill="#475569"/>';
  }

  /* ==========================================================================
     ACCESSORIES  (one per character at a time, as in the original)
     Drawn around anchor points so they fit the art and the 3D pictures.
     Returns { back: "...", front: "..." }.
     ========================================================================== */
  function accessory(ctx, item, A) {
    var n = item.name, c = item.color, s = A.scale, fill = ctx.vgrad(c, 0.4, 0.25), edge = darken(c, 0.35);
    var ht = A.headTop, hx = ht[0], hy = ht[1];
    function tr(x, y, sc) { return 'transform="translate(' + x + ',' + y + ') scale(' + (sc || s) + ')"'; }
    var gold = ctx.vgrad("#f5c542", 0.45, 0.25);

    if (has(n, ["wing"])) {
      var b = A.back;
      return { back: '<g ' + tr(b[0], b[1] - 60) + ' opacity="0.9">' +
        '<path d="M-20,0 C-220,-240 -330,-40 -210,70 C-300,160 -170,250 -20,60z" fill="' + ctx.vgrad(lighten(c, 0.2), 0.5, 0.1) + '" stroke="' + edge + '" stroke-width="5"/>' +
        '<path d="M20,0 C220,-240 330,-40 210,70 C300,160 170,250 20,60z" fill="' + ctx.vgrad(lighten(c, 0.2), 0.5, 0.1) + '" stroke="' + edge + '" stroke-width="5"/>' +
        sparkles([[-170, -40, 14], [170, -40, 14], [-140, 120, 10], [140, 120, 10]], "#ffffff") + "</g>", front: "" };
    }
    if (has(n, ["wand"])) {
      var h = A.handR, star = has(n, ["star"]) || true;
      return { back: "", front: '<g ' + tr(h[0], h[1]) + ">" +
        '<path d="M0,40 L70,-110" stroke="' + darken("#f5c542", 0.2) + '" stroke-width="14" stroke-linecap="round"/>' +
        (star ? starPath(78, -128, 46, 20, gold, 1) : "") +
        '<circle cx="78" cy="-128" r="12" fill="' + c + '"/>' +
        sparkles([[140, -170, 14], [30, -180, 10], [150, -80, 9]], lighten(c, 0.4)) + "</g>" };
    }
    if (has(n, ["veil"])) {
      return { back: '<path d="M' + (hx - 120 * s) + ',' + (hy + 30 * s) + ' Q' + hx + ',' + (hy - 40 * s) + ' ' + (hx + 120 * s) + ',' + (hy + 30 * s) + ' L' + (hx + 230 * s) + ',' + (hy + 560 * s) + ' Q' + hx + ',' + (hy + 600 * s) + ' ' + (hx - 230 * s) + ',' + (hy + 560 * s) + 'z" fill="' + lighten(c, 0.3) + '" opacity="0.55"/>',
        front: '<path d="M' + (hx - 110 * s) + ',' + (hy + 40 * s) + ' Q' + hx + ',' + (hy - 10 * s) + ' ' + (hx + 110 * s) + ',' + (hy + 40 * s) + '" stroke="#f5c542" stroke-width="' + (10 * s) + '" fill="none"/>' + sparkles([[hx, hy + 10 * s, 12 * s]], "#fff") };
    }
    if (has(n, ["rainbow mane"])) {
      return { back: "", front: '<path d="M' + (hx - 150 * s) + ',' + (hy + 60 * s) + ' Q' + hx + ',' + (hy - 70 * s) + ' ' + (hx + 150 * s) + ',' + (hy + 60 * s) + ' Q' + (hx + 200 * s) + ',' + (hy + 200 * s) + ' ' + (hx + 150 * s) + ',' + (hy + 330 * s) + ' Q' + (hx + 120 * s) + ',' + (hy + 160 * s) + ' ' + hx + ',' + (hy + 40 * s) + ' Q' + (hx - 110 * s) + ',' + (hy + 160 * s) + ' ' + (hx - 150 * s) + ',' + (hy + 330 * s) + ' Q' + (hx - 200 * s) + ',' + (hy + 200 * s) + ' ' + (hx - 150 * s) + ',' + (hy + 60 * s) + 'z" fill="' + ctx.rainbow(false) + '" opacity="0.92"/>' };
    }
    if (has(n, ["star horn", "horn crown"])) {
      var hornOut = '<g ' + tr(hx, hy) + ">" + '<path d="M-26,10 L0,-120 L26,10z" fill="' + ctx.vgrad(c, 0.45, 0.2) + '" stroke="' + edge + '" stroke-width="4"/>';
      if (has(n, ["star"])) hornOut += starPath(0, -130, 30, 13, "#fff7ae", 1);
      if (has(n, ["crown"])) hornOut += '<path d="M-90,30 L-70,-20 L-40,16 L0,-30 L40,16 L70,-20 L90,30z" fill="' + gold + '" stroke="#b7791f" stroke-width="4"/>';
      return { back: "", front: hornOut + "</g>" };
    }
    if (has(n, ["flower crown", "rose crown"])) {
      var fl = "";
      for (var i = -3; i <= 3; i++) {
        var fx = i * 38, fy = Math.abs(i) * 12 + 10;
        fl += flower(fx, fy, 20, i % 2 ? lighten(c, 0.25) : c, has(n, ["rose"]));
      }
      return { back: "", front: '<g ' + tr(hx, hy + 20 * s) + ">" + '<path d="M-130,40 Q0,-10 130,40" stroke="#4ade80" stroke-width="8" fill="none"/>' + fl + "</g>" };
    }
    if (has(n, ["crown", "tiara"])) {
      var tiara = has(n, ["tiara"]), tiny = has(n, ["tiny"]), sc = tiny ? s * 0.6 : s;
      var body = tiara ?
        '<path d="M-100,30 Q-60,-10 -40,6 L-20,-30 L0,-60 L20,-30 L40,6 Q60,-10 100,30 Q0,6 -100,30z" fill="' + ctx.vgrad("#e5e7eb", 0.5, 0.2) + '" stroke="#94a3b8" stroke-width="4"/>' :
        '<path d="M-90,30 L-100,-50 L-50,-10 L0,-70 L50,-10 L100,-50 L90,30z" fill="' + gold + '" stroke="#b7791f" stroke-width="5" stroke-linejoin="round"/>';
      var gems = "";
      if (has(n, ["pearl"])) [-60, -30, 0, 30, 60].forEach(function (x) { gems += '<circle cx="' + x + '" cy="18" r="10" fill="#fffaf0" stroke="#e5e7eb" stroke-width="2"/>'; });
      else if (has(n, ["diamond"])) gems = '<path d="M0,-30 L22,0 L0,26 L-22,0z" fill="#bae6fd" stroke="#38bdf8" stroke-width="3"/>' + sparkles([[30, -40, 10]], "#fff");
      else gems = '<circle cx="0" cy="' + (tiara ? -22 : 4) + '" r="12" fill="' + (tiara ? c : "#ec4899") + '"/><circle cx="-50" cy="12" r="8" fill="#60a5fa"/><circle cx="50" cy="12" r="8" fill="#34d399"/>';
      return { back: "", front: '<g ' + tr(hx, hy + 6 * s, sc) + ">" + body + gems + "</g>" };
    }
    if (has(n, ["party hat"])) {
      return { back: "", front: '<g ' + tr(hx + 30 * s, hy - 10 * s) + ">" + '<path d="M-70,40 L0,-150 L70,40z" fill="' + fill + '" stroke="' + edge + '" stroke-width="5"/>' +
        '<path d="M-44,-30 L44,-30 M-60,10 L60,10" stroke="#fff" stroke-width="10"/><circle cx="0" cy="-156" r="18" fill="#fde047"/></g>' };
    }
    if (has(n, ["hat"])) {
      return { back: "", front: '<g ' + tr(hx, hy + 10 * s) + ">" + '<ellipse cx="0" cy="30" rx="190" ry="36" fill="' + fill + '" stroke="' + edge + '" stroke-width="5"/>' +
        '<path d="M-100,32 Q-100,-100 0,-100 Q100,-100 100,32z" fill="' + fill + '" stroke="' + edge + '" stroke-width="5"/>' +
        '<path d="M-100,8 Q0,24 100,8" stroke="' + lighten(c, 0.6) + '" stroke-width="18" fill="none"/>' + flower(80, 0, 20, "#fff", false) + "</g>" };
    }
    if (has(n, ["bow tie"])) {
      var nk = A.neck;
      return { back: "", front: '<g ' + tr(nk[0], nk[1] + 14 * s) + ">" + bow(c, edge, 0.7) + "</g>" };
    }
    if (has(n, ["bow"])) {
      return { back: "", front: '<g ' + tr(hx + 110 * s, hy + 50 * s) + ' ><g transform="rotate(18)">' + bow(fill, edge, 1) + "</g></g>" };
    }
    if (has(n, ["headband"])) {
      return { back: "", front: '<path d="M' + (hx - 160 * s) + ',' + (hy + 130 * s) + ' Q' + hx + ',' + (hy - 70 * s) + ' ' + (hx + 160 * s) + ',' + (hy + 130 * s) + '" stroke="' + fill + '" stroke-width="' + (30 * s) + '" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (hx - 160 * s) + ',' + (hy + 130 * s) + ' Q' + hx + ',' + (hy - 70 * s) + ' ' + (hx + 160 * s) + ',' + (hy + 130 * s) + '" stroke="' + lighten(c, 0.5) + '" stroke-width="' + (6 * s) + '" fill="none" stroke-dasharray="' + (14 * s) + ' ' + (18 * s) + '"/>' };
    }
    if (has(n, ["ear muff"])) {
      var eL = A.earL, eR = A.earR;
      return { back: "", front: '<path d="M' + eL[0] + ',' + eL[1] + ' Q' + hx + ',' + (hy - 80 * s) + ' ' + eR[0] + ',' + eR[1] + '" stroke="' + edge + '" stroke-width="' + (12 * s) + '" fill="none"/>' +
        '<circle cx="' + eL[0] + '" cy="' + eL[1] + '" r="' + (46 * s) + '" fill="' + ctx.rgrad(c) + '"/><circle cx="' + eR[0] + '" cy="' + eR[1] + '" r="' + (46 * s) + '" fill="' + ctx.rgrad(c) + '"/>' };
    }
    if (has(n, ["sunglass", "visor"])) {
      var ey = A.eyeY, gl = A.eyeL, gr = A.eyeR, r = 40 * s;
      if (has(n, ["visor"])) return { back: "", front: '<rect x="' + (gl - 70 * s) + '" y="' + (ey - 34 * s) + '" width="' + (gr - gl + 140 * s) + '" height="' + (68 * s) + '" rx="' + (34 * s) + '" fill="' + c + '" opacity="0.8" stroke="' + edge + '" stroke-width="' + (5 * s) + '"/>' + sparkles([[gr + 20 * s, ey - 12 * s, 10 * s]], "#fff") };
      var lens = c === "#000000" ? "#1f1027" : c;
      return { back: "", front: '<g>' +
        '<ellipse cx="' + gl + '" cy="' + ey + '" rx="' + (r * 1.15) + '" ry="' + r + '" fill="' + lens + '" opacity="0.92" stroke="#111" stroke-width="' + (6 * s) + '"/>' +
        '<ellipse cx="' + gr + '" cy="' + ey + '" rx="' + (r * 1.15) + '" ry="' + r + '" fill="' + lens + '" opacity="0.92" stroke="#111" stroke-width="' + (6 * s) + '"/>' +
        '<path d="M' + (gl + r * 1.15) + ',' + (ey - 4 * s) + ' Q' + ((gl + gr) / 2) + ',' + (ey - 16 * s) + ' ' + (gr - r * 1.15) + ',' + (ey - 4 * s) + '" stroke="#111" stroke-width="' + (6 * s) + '" fill="none"/>' +
        '<path d="M' + (gl - 18 * s) + ',' + (ey - 16 * s) + ' l' + (16 * s) + ',' + (-6 * s) + ' M' + (gr - 18 * s) + ',' + (ey - 16 * s) + ' l' + (16 * s) + ',' + (-6 * s) + '" stroke="#fff" stroke-width="' + (6 * s) + '" stroke-linecap="round" opacity="0.8"/></g>' };
    }
    if (has(n, ["led eyes"])) {
      return { back: "", front: '<circle cx="' + A.eyeL + '" cy="' + A.eyeY + '" r="' + (34 * s) + '" fill="' + c + '" opacity="0.45"/><circle cx="' + A.eyeR + '" cy="' + A.eyeY + '" r="' + (34 * s) + '" fill="' + c + '" opacity="0.45"/>' +
        heart(A.eyeL, A.eyeY, 18 * s, c) + heart(A.eyeR, A.eyeY, 18 * s, c) };
    }
    if (has(n, ["headlight"])) {
      return { back: "", front: [A.earL, A.earR].map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + (p[1] - 60 * s) + '" r="' + (26 * s) + '" fill="' + lighten(c, 0.5) + '" stroke="' + edge + '" stroke-width="' + (5 * s) + '"/><circle cx="' + p[0] + '" cy="' + (p[1] - 60 * s) + '" r="' + (44 * s) + '" fill="' + c + '" opacity="0.25"/>';
      }).join("") };
    }
    if (has(n, ["antenna"])) {
      return { back: "", front: '<path d="M' + (hx - 60 * s) + ',' + (hy + 20 * s) + ' L' + (hx - 90 * s) + ',' + (hy - 70 * s) + ' M' + (hx + 60 * s) + ',' + (hy + 20 * s) + ' L' + (hx + 90 * s) + ',' + (hy - 70 * s) + '" stroke="#94a3b8" stroke-width="' + (8 * s) + '"/>' +
        '<circle cx="' + (hx - 90 * s) + '" cy="' + (hy - 78 * s) + '" r="' + (18 * s) + '" fill="' + c + '"/><circle cx="' + (hx + 90 * s) + '" cy="' + (hy - 78 * s) + '" r="' + (18 * s) + '" fill="' + c + '"/>' };
    }
    if (has(n, ["bolt"])) {
      return { back: "", front: [A.earL, A.earR].map(function (p, i) {
        var x = p[0] + (i ? 30 : -30) * s, y = p[1] - 30 * s;
        return '<path d="M' + x + ',' + (y - 50 * s) + ' l' + (-24 * s) + ',' + (56 * s) + ' h' + (22 * s) + ' l' + (-10 * s) + ',' + (48 * s) + ' l' + (36 * s) + ',' + (-64 * s) + ' h' + (-22 * s) + ' z" fill="' + c + '" stroke="' + edge + '" stroke-width="' + (4 * s) + '"/>';
      }).join("") + sparkles([[A.earR[0] + 60 * s, A.earR[1] - 100 * s, 12 * s]], "#fff") };
    }
    if (has(n, ["necklace", "collar"])) {
      var nk2 = A.neck, collar = has(n, ["collar"]);
      var beads = "";
      for (var j = -4; j <= 4; j++) beads += '<circle cx="' + (j * 22) + '" cy="' + (Math.abs(j) > 0 ? 34 - Math.abs(j) * 4 + (collar ? -10 : 0) : 38) + '" r="' + (collar ? 0 : 7) + '" fill="' + lighten(c, 0.3) + '"/>';
      return { back: "", front: '<g ' + tr(nk2[0], nk2[1]) + ">" +
        '<path d="M-86,-4 Q0,' + (collar ? 44 : 64) + ' 86,-4" stroke="' + (collar ? c : gold) + '" stroke-width="' + (collar ? 22 : 6) + '" fill="none" stroke-linecap="round"/>' + beads +
        (collar ? '<circle cx="0" cy="36" r="14" fill="#f5c542"/>' : starPath(0, 52, 18, 8, c === "#FFD700" ? gold : c, 1)) + "</g>" };
    }
    if (has(n, ["scarf", "bandana"])) {
      var nk3 = A.neck, band = has(n, ["bandana"]);
      return { back: "", front: '<g ' + tr(nk3[0], nk3[1] - 6 * s) + ">" +
        '<path d="M-92,-6 Q0,40 92,-6 L96,22 Q0,70 -96,22z" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>' +
        (band ? '<path d="M-40,30 L0,96 L40,30z" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/>' :
          '<path d="M40,30 L66,150 L22,146 L14,40z" fill="' + fill + '" stroke="' + edge + '" stroke-width="4"/><path d="M26,140 v18 M40,142 v18 M54,144 v18" stroke="' + edge + '" stroke-width="4"/>') +
        '<circle cx="-50" cy="14" r="6" fill="#fff" opacity="0.8"/><circle cx="30" cy="24" r="6" fill="#fff" opacity="0.8"/></g>' };
    }
    if (has(n, ["earring"])) {
      return { back: "", front: [A.earL, A.earR].map(function (p) {
        return '<path d="M' + p[0] + ',' + (p[1] + 18 * s) + ' v' + (18 * s) + '" stroke="#f5c542" stroke-width="' + (4 * s) + '"/><circle cx="' + p[0] + '" cy="' + (p[1] + 50 * s) + '" r="' + (14 * s) + '" fill="' + ctx.rgrad(c) + '"/>';
      }).join("") };
    }
    if (has(n, ["bracelet"])) {
      var w = A.wristR;
      return { back: "", front: '<ellipse cx="' + w[0] + '" cy="' + w[1] + '" rx="' + (32 * s) + '" ry="' + (14 * s) + '" fill="none" stroke="' + c + '" stroke-width="' + (12 * s) + '" transform="rotate(-50 ' + w[0] + ' ' + w[1] + ')"/>' + sparkles([[w[0] + 30 * s, w[1] - 20 * s, 10 * s]], "#fff") };
    }
    if (has(n, ["carrot"])) {
      return { back: "", front: '<g ' + tr(hx + 100 * s, hy + 60 * s) + ' ><g transform="rotate(30)"><path d="M0,-40 L16,40 L-16,40z" fill="#fb923c" transform="rotate(180)"/><path d="M0,-40 l-14,-24 M0,-40 l0,-28 M0,-40 l14,-24" stroke="#22c55e" stroke-width="7" stroke-linecap="round"/></g></g>' };
    }
    if (has(n, ["flower", "clip"])) {
      var clip = has(n, ["clip"]), ear = has(n, ["ear"]);
      var p2 = ear ? A.earR : [hx + 100 * s, hy + 60 * s];
      if (clip) return { back: "", front: [[-110, 70], [100, 60]].map(function (o, k) {
        return '<rect x="' + (hx + o[0] * s - 30 * s) + '" y="' + (hy + o[1] * s - 9 * s) + '" width="' + (60 * s) + '" height="' + (18 * s) + '" rx="' + (9 * s) + '" fill="' + (k ? c : lighten(c, 0.3)) + '" transform="rotate(' + (k ? 20 : -20) + ' ' + (hx + o[0] * s) + ' ' + (hy + o[1] * s) + ')"/>';
      }).join("") };
      return { back: "", front: '<g ' + tr(p2[0], p2[1] - (ear ? 40 : 0) * s) + ">" + flower(0, 0, 30, c, false) + flower(-44, 22, 20, lighten(c, 0.3), false) + "</g>" };
    }
    return { back: "", front: sparkles([[hx - 80 * s, hy + 20 * s, 20 * s], [hx + 80 * s, hy + 10 * s, 16 * s]], c) };
  }
  function bow(fill, edge, sc) {
    return '<g transform="scale(' + sc + ')"><path d="M0,0 C-40,-60 -110,-40 -90,10 C-80,50 -30,40 0,0z" fill="' + fill + '" stroke="' + edge + '" stroke-width="5"/>' +
      '<path d="M0,0 C40,-60 110,-40 90,10 C80,50 30,40 0,0z" fill="' + fill + '" stroke="' + edge + '" stroke-width="5"/>' +
      '<circle cx="0" cy="0" r="20" fill="' + fill + '" stroke="' + edge + '" stroke-width="5"/></g>';
  }
  function flower(x, y, r, c, rose) {
    var out = "";
    if (rose) return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '" stroke="' + darken(c, 0.3) + '" stroke-width="3"/><path d="M' + (x - r * 0.5) + ',' + y + ' a' + (r * 0.5) + ',' + (r * 0.5) + ' 0 1,1 ' + r * 0.6 + ',' + (r * 0.3) + '" stroke="' + darken(c, 0.35) + '" stroke-width="3" fill="none"/>';
    for (var i = 0; i < 5; i++) {
      var a = i * Math.PI * 2 / 5;
      out += '<circle cx="' + (x + Math.cos(a) * r * 0.62).toFixed(1) + '" cy="' + (y + Math.sin(a) * r * 0.62).toFixed(1) + '" r="' + (r * 0.5) + '" fill="' + c + '" stroke="' + darken(c, 0.2) + '" stroke-width="2"/>';
    }
    return out + '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.35) + '" fill="#fde047"/>';
  }

  /* ==========================================================================
     BUILD THE PICTURE
     ========================================================================== */
  function withDefaults(equipped) {
    var e = equipped || {}, d = DATA.defaults || {};
    return { top: e.top || d.top, bottom: e.bottom || d.bottom, shoes: e.shoes || null, accessory: e.accessory || null };
  }

  function artSVG(ctx, charId, equipped) {
    var cfg = ART[charId] || ART.princess, e = withDefaults(equipped);
    var acc = e.accessory ? accessory(ctx, e.accessory, ART_ANCHORS) : { back: "", front: "" };
    var dressOn = e.top && has(e.top.name, ["dress", "gown", "ball", "royal"]);
    var bottom = e.bottom ? drawBottom(ctx, cfg, e.bottom, dressOn) : "";
    var bottomBack = "";
    bottom = bottom.replace(/<g data-layer="back">([\s\S]*?)<\/g>/, function (m, inner) { bottomBack = inner; return ""; });
    var out = '<ellipse cx="512" cy="948" rx="190" ry="24" fill="#d8a3c6" opacity="0.35"/>';
    if (cfg.fairyWings) out += '<g opacity="0.55"><path d="M500,520 C300,280 190,470 300,560 C220,650 360,720 500,560z" fill="#e0f2fe" stroke="#a5f3fc" stroke-width="4"/><path d="M524,520 C724,280 834,470 724,560 C804,650 664,720 524,560z" fill="#e0f2fe" stroke="#a5f3fc" stroke-width="4"/></g>';
    out += acc.back + bottomBack + drawHead(ctx, cfg, "back");
    out += drawLimbs(ctx, cfg, "legs") + drawShoes(ctx, cfg, e.shoes) + bottom;
    out += drawLimbs(ctx, cfg, "arms") + (e.top ? drawTop(ctx, cfg, e.top) : "");
    out += drawHead(ctx, cfg, "front") + acc.front;
    return out;
  }

  function photoSVG(ctx, charId, equipped) {
    var p = DATA.photos[charId], e = equipped || {}, out = "";
    var slots = { top: e.top || (DATA.defaults || {}).top, bottom: e.bottom || (DATA.defaults || {}).bottom, shoes: e.shoes };
    out += '<image href="' + assetUrl(p.image) + '" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid slice"/>';
    Object.keys(slots).forEach(function (slot) {
      var item = slots[slot];
      if (!item || !p.masks[slot]) return;
      var rgb = hexToRgb(item.color).map(function (v) { return v / 255; });
      var mean = (p.brightness || {})[slot] || 0.7, k = 1.15;
      var row = function (t) { return (0.2126 * k).toFixed(4) + " " + (0.7152 * k).toFixed(4) + " " + (0.0722 * k).toFixed(4) + " 0 " + (t - k * mean).toFixed(4); };
      var fid = ctx.id("f"), mid = ctx.id("m");
      ctx.defs.push('<filter id="' + fid + '" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="' +
        row(rgb[0]) + " " + row(rgb[1]) + " " + row(rgb[2]) + ' 0 0 0 1 0"/></filter>');
      ctx.defs.push('<mask id="' + mid + '" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><image href="' + assetUrl(p.masks[slot]) + '" x="0" y="0" width="1024" height="1024"/></mask>');
      out += '<g mask="url(#' + mid + ')"><image href="' + assetUrl(p.image) + '" x="0" y="0" width="1024" height="1024" filter="url(#' + fid + ')"/></g>';
    });
    if (e.accessory) {
      var acc = accessory(ctx, e.accessory, p.anchors);
      out += acc.back + acc.front;
    }
    return out;
  }

  function describe(charId, equipped) {
    var ch = findChar(charId), e = withDefaults(equipped), bits = [];
    if (e.top) bits.push(e.top.name); if (e.bottom) bits.push(e.bottom.name);
    if (e.shoes) bits.push(e.shoes.name); if (e.accessory) bits.push(e.accessory.name);
    return (ch ? ch.label : "Character") + " wearing " + (bits.join(", ") || "a fun outfit");
  }
  function findChar(id) {
    var list = DATA.characters || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  function svgString(charId, equipped, opts) {
    opts = opts || {};
    var uid = "mel" + (++uidCounter);
    var ctx = new Ctx(uid), ch = findChar(charId);
    var usePhoto = ch && ch.style === "photo" && DATA.photos && DATA.photos[ch.id];
    var body = usePhoto ? photoSVG(ctx, ch.id, equipped) : artSVG(ctx, ch ? ch.id : charId, equipped);
    var bg = "";
    if (opts.background) {
      var bgid = ctx.id("bg");
      ctx.defs.push('<linearGradient id="' + bgid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF0F8"/><stop offset="1" stop-color="#FFE8F5"/></linearGradient>');
      bg = '<rect width="1024" height="1024" fill="url(#' + bgid + ')"/>';
    }
    var label = describe(charId, equipped);
    return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"' +
      (opts.size ? ' width="' + opts.size + '" height="' + opts.size + '"' : "") +
      ' role="img" aria-label="' + label.replace(/"/g, "&quot;") + '"><title>' + label.replace(/</g, "&lt;") + "</title><defs>" + ctx.defs.join("") + "</defs>" + bg + body + "</svg>";
  }

  /* Turn the current picture into a PNG (for Save). Resolves to a data URL,
     or rejects if the browser blocks it (e.g. opened from a file). */
  function toPNG(charId, equipped, size, type) {
    size = size || 1024;
    return preload(photoAssets()).then(function () {
      var ch = findChar(charId);
      if (ch && ch.style === "photo" && !assetCache[DATA.photos[ch.id].image]) throw new Error("offline-file");
      var svg = svgString(charId, equipped, { background: true, size: size });
      return new Promise(function (resolve, reject) {
        var img = new Image();
        var url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
        img.onload = function () {
          try {
            var c = document.createElement("canvas");
            c.width = c.height = size;
            c.getContext("2d").drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);
            resolve(c.toDataURL(type || "image/png", 0.85));
          } catch (err) { reject(err); }
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("render")); };
        img.src = url;
      });
    });
  }

  window.MelRender = {
    svg: svgString,
    toPNG: toPNG,
    describe: describe,
    preload: function () { return preload(photoAssets()); },
    character: findChar,
    textColorFor: function (hex) {
      // pick whichever text color (white or deep pink) is easier to read on this tile
      function rl(h) {
        return hexToRgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
          .reduce(function (a, v, i) { return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0);
      }
      function cr(a, b) { var x = rl(a), y = rl(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
      return cr(hex, "#ffffff") >= cr(hex, "#5c1238") ? "#ffffff" : "#5c1238";
    }
  };
})();
