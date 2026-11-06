/* AWS Daily Report — landing page 11 model (v1.0.9)
 * BERKAS INI DIBANGKITKAN oleh build_landing.js dari model landing situs Sentosa.
 * Jangan disunting langsung; ubah landing_content.js / landing_mount.js lalu bangkitkan ulang. */
/* ===== Ilustrasi bawaan (SVG dihasilkan kode) — pengganti foto sampai admin mengunggah foto sendiri ===== */
(function (g) {
  'use strict';
  function rng(s) { s = (s >>> 0) || 1; return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var PAL = {
    day: { sky: ['#bfe3ee', '#f3f8ef'], sun: '#fffbe0', hill: ['#a9c9b4', '#86b095', '#5f9877'], g: ['#2f7d3c', '#3a8c45'], gl: ['#8cc27a', '#a6d28b'], bg: '#e9f3e6' },
    gold: { sky: ['#f6bf7a', '#fff1d0'], sun: '#fff7dd', hill: ['#d9a56a', '#a9a85f', '#6f9a4f'], g: ['#2b6b34', '#3a8140'], gl: ['#9cbf62', '#c3d57a'], bg: '#fbefd6' },
    mist: { sky: ['#d5ddd8', '#f2f4f1'], sun: '#fafafa', hill: ['#b9c4bb', '#93a597', '#6d8573'], g: ['#3d5a43', '#4c6c52'], gl: ['#8aa28c', '#a9bda9'], bg: '#e6ebe6' },
    dark: { sky: ['#233629', '#4a6552'], sun: '#d8e3d4', hill: ['#3a5240', '#2f4535', '#243829'], g: ['#1c3523', '#274630'], gl: ['#4d7a58', '#5f8f6a'], bg: '#1d3022' }
  };
  var TEA = { green: ['#6d8f3a', '#86a84b', '#4f7a2c', '#9bb85a'], black: ['#2c2420', '#3d2f27', '#1e1a17', '#4a3a2f'], white: ['#d8d6c0', '#c9cbb0', '#e6e4d0', '#bfc49c'], oolong: ['#5c6b35', '#46502a', '#7b8442', '#3d4a24'], melati: ['#7d9a4b', '#f6f3e2', '#fffdf2', '#a8bd73'], rooibos: ['#9c3b1f', '#7a2c17', '#b4532f', '#c4623b'], herbal: ['#b04a6a', '#d6a13a', '#6f8f3a', '#8c3a52'] };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function terrace(r, p, topY) {
    var s = '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky[0] + '"/><stop offset="1" stop-color="' + p.sky[1] + '"/></linearGradient>' +
      '<linearGradient id="ms" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky[1] + '" stop-opacity="0"/><stop offset="1" stop-color="' + p.sky[1] + '" stop-opacity=".85"/></linearGradient></defs>' +
      '<rect width="1600" height="900" fill="url(#sk)"/>';
    s += '<circle cx="' + (300 + r() * 1000 | 0) + '" cy="' + (140 + r() * 80 | 0) + '" r="' + (60 + r() * 30 | 0) + '" fill="' + p.sun + '" opacity=".92"/>';
    var base = topY || 330;
    p.hill.forEach(function (c, i) {
      var y = base + i * 45, d = 'M0 ' + y;
      for (var x = 0; x < 1600; x += 200) d += ' Q' + (x + 100) + ' ' + (y - 50 - (r() * 90 | 0)) + ' ' + (x + 200) + ' ' + (y + (r() * 30 | 0));
      s += '<path d="' + d + ' V900 H0Z" fill="' + c + '" opacity=".9"/>';
    });
    var n = 26, start = base + 110;
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), y = start + Math.pow(t, 1.5) * (900 - start + 40), w = 7 + t * 42, a = 12 + t * 70, j = r() * 10;
      var col = p.g[i % 2];
      var d = 'M-60 ' + y.toFixed(0) + ' C400 ' + (y - a + j).toFixed(0) + ' 1000 ' + (y + a - j).toFixed(0) + ' 1660 ' + (y - a * .3).toFixed(0);
      s += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"/>';
      s += '<path d="' + d.replace(/ (\d+) /g, function (m) { return m; }) + '" fill="none" stroke="' + p.gl[i % 2] + '" stroke-width="' + (w * .32).toFixed(1) + '" stroke-linecap="round" opacity=".55" transform="translate(0,' + (-w * .22).toFixed(1) + ')"/>';
    }
    s += '<rect y="' + (base + 40) + '" width="1600" height="190" fill="url(#ms)" opacity=".75"/>';
    return s;
  }
  function figure(x, y, k, shirt) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' +
      '<rect x="-24" y="-8" width="18" height="90" rx="8" fill="#2d3b57"/><rect x="6" y="-8" width="18" height="90" rx="8" fill="#26334d"/>' +
      '<rect x="-30" y="-100" width="60" height="104" rx="22" fill="' + shirt + '"/>' +
      '<rect x="26" y="-86" width="40" height="52" rx="10" fill="#8a5a2b"/><rect x="26" y="-86" width="40" height="12" rx="6" fill="#a8712f"/>' +
      '<circle cx="0" cy="-118" r="17" fill="#a8714a"/>' +
      '<ellipse cx="0" cy="-130" rx="66" ry="11" fill="#d9b66a"/><path d="M-50 -130 L0 -184 L50 -130Z" fill="#e7c77c"/></g>';
  }
  function factory(r, p) {
    var s = terrace(r, p, 300);
    s += '<rect x="0" y="690" width="1600" height="210" fill="' + p.g[0] + '" opacity=".92"/>';
    s += '<rect x="360" y="470" width="880" height="250" fill="#ece5d2"/><rect x="360" y="470" width="880" height="26" fill="#d8cfb6"/>';
    s += '<path d="M340 470 L440 380 L440 470 L540 380 L540 470 L640 380 L640 470 L740 380 L740 470 L840 380 L840 470 L940 380 L940 470 L1040 380 L1040 470 L1140 380 L1140 470 L1260 380 L1260 470Z" fill="#b9553a"/>';
    s += '<rect x="1130" y="190" width="56" height="200" fill="#a8a08b"/><rect x="1122" y="182" width="72" height="18" fill="#8d866f"/>';
    for (var i = 0; i < 5; i++) s += '<circle cx="' + (1160 + i * 34) + '" cy="' + (150 - i * 30) + '" r="' + (26 + i * 12) + '" fill="#fff" opacity="' + (.75 - i * .12).toFixed(2) + '"/>';
    for (var k = 0; k < 7; k++) s += '<rect x="' + (410 + k * 112) + '" y="520" width="70" height="70" rx="6" fill="#9fc4d3"/><rect x="' + (410 + k * 112) + '" y="520" width="70" height="70" rx="6" fill="none" stroke="#7f6f52" stroke-width="5"/>';
    s += '<rect x="760" y="610" width="120" height="110" rx="6" fill="#6b4a2c"/><path d="M700 722 H940" stroke="#bda97d" stroke-width="10"/>';
    return s;
  }
  function cup(r, p) {
    var s = '<defs><radialGradient id="rg" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="' + p.bg + '"/></radialGradient></defs><rect width="1600" height="900" fill="url(#rg)"/>';
    for (var i = 0; i < 9; i++) s += '<g transform="translate(' + (r() * 1500 | 0) + ' ' + (r() * 800 | 0) + ') rotate(' + (r() * 360 | 0) + ') scale(' + (.4 + r() * .5).toFixed(2) + ')"><path d="M0 0 C60 -70 190 -80 270 -10 C190 55 60 60 0 0Z" fill="' + p.g[i % 2] + '" opacity=".75"/><path d="M0 0 L250 -8" stroke="' + p.gl[0] + '" stroke-width="5" fill="none"/></g>';
    s += '<ellipse cx="800" cy="800" rx="520" ry="46" fill="#000" opacity=".08"/>';
    s += '<path d="M430 520 C250 470 250 640 420 640" fill="none" stroke="#6e3f27" stroke-width="30" stroke-linecap="round"/>';
    s += '<path d="M1010 540 C1110 520 1150 440 1230 430 L1250 470 C1190 490 1150 590 1050 640Z" fill="#6e3f27"/>';
    s += '<ellipse cx="720" cy="560" rx="300" ry="230" fill="#7d4a2e"/><ellipse cx="720" cy="340" rx="150" ry="36" fill="#6e3f27"/>';
    s += '<ellipse cx="720" cy="318" rx="130" ry="30" fill="#8a5535"/><circle cx="720" cy="280" r="28" fill="#6e3f27"/>';
    s += '<ellipse cx="610" cy="500" rx="80" ry="140" fill="#fff" opacity=".1"/>';
    s += '<ellipse cx="1180" cy="760" rx="170" ry="40" fill="#6e3f27"/><path d="M1020 650 H1340 C1330 740 1260 790 1180 790 C1100 790 1030 740 1020 650Z" fill="#7d4a2e"/><ellipse cx="1180" cy="650" rx="160" ry="30" fill="#d79a3b"/>';
    s += '<circle cx="1390" cy="700" r="70" fill="#f5d44c"/><circle cx="1390" cy="700" r="54" fill="#fbe98a"/><path d="M1390 700 L1390 646 M1390 700 L1440 680 M1390 700 L1440 722 M1390 700 L1390 754 M1390 700 L1340 722 M1390 700 L1340 680" stroke="#f5d44c" stroke-width="4"/>';
    return s;
  }
  function leaf(r, p) {
    var s = '<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.hill[0] + '"/><stop offset="1" stop-color="' + p.hill[2] + '"/></linearGradient></defs><rect width="1600" height="900" fill="url(#lg)"/>';
    for (var i = 0; i < 7; i++) {
      var x = 200 + r() * 1200, y = 160 + r() * 600, a = -40 + r() * 80 + (i % 2 ? 180 : 0), k = .8 + r() * 1.1;
      s += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + a.toFixed(0) + ') scale(' + k.toFixed(2) + ')"><path d="M0 0 C70 -110 250 -130 380 -20 C250 90 70 100 0 0Z" fill="' + p.g[i % 2] + '"/><path d="M0 0 C120 -6 260 -14 372 -20" stroke="' + p.gl[1] + '" stroke-width="6" fill="none" opacity=".8"/>';
      for (var v = 1; v < 6; v++) s += '<path d="M' + (v * 60) + ' -8 L' + (v * 60 + 40) + ' -52 M' + (v * 60) + ' -8 L' + (v * 60 + 40) + ' 34" stroke="' + p.gl[0] + '" stroke-width="3" fill="none" opacity=".5"/>';
      s += '</g>';
    }
    s += '<g transform="translate(1120 640)"><path d="M0 0 C10 -80 20 -120 60 -190" stroke="#355f2d" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M60 -190 C20 -250 90 -290 120 -240 C110 -200 90 -190 60 -190Z" fill="#b8d96a"/><path d="M60 -190 C120 -200 170 -160 160 -120 C120 -130 80 -150 60 -190Z" fill="#9cc653"/></g>';
    return s;
  }
  function box(r, p) {
    var s = '<defs><radialGradient id="rg" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="' + p.bg + '"/></radialGradient></defs><rect width="1600" height="900" fill="url(#rg)"/><ellipse cx="800" cy="780" rx="320" ry="40" fill="#000" opacity=".12"/>';
    s += '<rect x="560" y="170" width="480" height="590" rx="40" fill="' + p.g[0] + '"/><rect x="560" y="170" width="480" height="70" rx="30" fill="' + p.g[1] + '"/><rect x="560" y="226" width="480" height="14" fill="#000" opacity=".12"/>';
    s += '<rect x="610" y="300" width="380" height="360" rx="20" fill="#fbf6e6"/><path d="M800 380 C850 330 930 340 940 400 C890 450 830 440 800 380Z" fill="' + p.g[1] + '"/><path d="M800 380 L925 395" stroke="#fbf6e6" stroke-width="4"/>';
    s += '<rect x="660" y="500" width="280" height="22" rx="8" fill="' + p.g[0] + '"/><rect x="700" y="545" width="200" height="14" rx="6" fill="' + p.gl[0] + '"/><rect x="720" y="580" width="160" height="14" rx="6" fill="' + p.gl[0] + '"/>';
    s += '<rect x="580" y="190" width="30" height="560" rx="14" fill="#fff" opacity=".12"/>';
    return s;
  }
  function ink(r) {
    var s = '<defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f0e2"/><stop offset="1" stop-color="#e6ecde"/></linearGradient><linearGradient id="mi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f0e2" stop-opacity="0"/><stop offset="1" stop-color="#f6f0e2" stop-opacity=".95"/></linearGradient></defs><rect width="1600" height="900" fill="url(#ig)"/><circle cx="1180" cy="230" r="80" fill="#c8442f" opacity=".85"/>';
    var cols = ['#9aa89a', '#6f8574', '#44604f', '#2c4636'];
    for (var l = 0; l < 4; l++) {
      var y = 360 + l * 90, d = 'M0 ' + (y + 80);
      for (var x = 0; x <= 1600; x += 160) d += ' L' + x + ' ' + (y - (r() * 190 | 0) + (l ? 0 : -60));
      s += '<path d="' + d + ' L1600 900 L0 900Z" fill="' + cols[l] + '" opacity="' + (.5 + l * .14).toFixed(2) + '"/><rect y="' + (y + 20) + '" width="1600" height="120" fill="url(#mi)"/>';
    }
    return s;
  }
  function tea(r, kind) {
    var cols = TEA[kind] || TEA.green;
    var s = '<rect width="400" height="400" fill="#f6f3ea"/><circle cx="200" cy="200" r="186" fill="#fff"/><circle cx="200" cy="200" r="186" fill="none" stroke="#e5dfcf" stroke-width="3"/>';
    for (var i = 0; i < 150; i++) {
      var a = r() * Math.PI * 2, d = Math.sqrt(r()) * 150, x = 200 + Math.cos(a) * d, y = 200 + Math.sin(a) * d;
      var c = cols[(r() * cols.length) | 0], w = 10 + r() * 20, h = 4 + r() * 8;
      s += '<ellipse cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" rx="' + w.toFixed(0) + '" ry="' + h.toFixed(0) + '" fill="' + c + '" transform="rotate(' + (r() * 180 | 0) + ' ' + x.toFixed(0) + ' ' + y.toFixed(0) + ')"/>';
    }
    return s;
  }

  var cache = {};
  function art(ref) {
    if (cache[ref]) return cache[ref];
    var pt = ref.split(':'), kind = pt[1], pal = pt[2] || 'day', seed = parseInt(pt[3], 10) || 1, r = rng(seed * 7919 + kind.length * 31), p = PAL[pal] || PAL.day, body, vb = '0 0 1600 900', pr = 'xMidYMid slice';
    if (kind === 'tea') { vb = '0 0 400 400'; body = tea(r, pal); }
    else if (kind === 'terrace') body = terrace(r, p);
    else if (kind === 'picker') body = terrace(r, p) + figure(1050, 800, 3.2, '#c4572e') + figure(560, 640, 1.9, '#2f6ea8');
    else if (kind === 'factory') body = factory(r, p);
    else if (kind === 'cup') body = cup(r, p);
    else if (kind === 'leaf') body = leaf(r, p);
    else if (kind === 'box') body = box(r, p);
    else if (kind === 'ink') body = ink(r);
    else body = terrace(r, p);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="' + pr + '">' + body + '</svg>';
    return (cache[ref] = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg).replace(/'/g, '%27'));
  }
  g.AWSL = g.AWSL || {};
  g.AWSL.art = art;
  g.AWSL.ART_KINDS = [['terrace', 'Hamparan kebun'], ['picker', 'Pemetik teh'], ['factory', 'Pabrik teh'], ['cup', 'Teko & cangkir'], ['leaf', 'Daun teh'], ['box', 'Kemasan'], ['ink', 'Gunung tinta']];
  g.AWSL.ART_PALS = [['day', 'Siang'], ['gold', 'Senja'], ['mist', 'Kabut'], ['dark', 'Gelap']];
  g.AWSL.TEA_KINDS = [['green', 'Teh hijau'], ['black', 'Teh hitam'], ['white', 'Teh putih'], ['oolong', 'Oolong'], ['melati', 'Melati'], ['rooibos', 'Rooibos'], ['herbal', 'Herbal']];
})(typeof window !== 'undefined' ? window : globalThis);

/* ===== Inti: data bawaan, router, 11 model landing ===== */
(function (g) {
  'use strict';
  var AWS = g.AWSL = g.AWSL || {};
  var S = AWS.S = { cfg: null, media: {}, timers: [], editing: false };

  /* ---------- util ---------- */
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var nl = function (s) { return esc(s).replace(/\n/g, '<br>'); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  AWS.esc = esc; AWS.clone = clone;

  var IC = {
    leaf: 'M5 19C5 10 10 5 20 5c0 10-5 15-14 15M5 19c3-5 6-8 10-10',
    factory: 'M3 21V10l6 4v-4l6 4V6h3v15zM7 17h2M12 17h2',
    truck: 'M2 6h11v10H2zM13 10h5l3 3v3h-8M6 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3M17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3',
    cup: 'M4 8h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 9h2a2 2 0 010 5h-2M7 3v2M11 3v2',
    sun: 'M12 8a4 4 0 100 8 4 4 0 000-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
    drop: 'M12 3C8 9 6 12 6 15a6 6 0 0012 0c0-3-2-6-6-12z',
    award: 'M12 3a6 6 0 100 12 6 6 0 000-12M8.5 14L7 21l5-3 5 3-1.5-7',
    users: 'M9 11a3 3 0 100-6 3 3 0 000 6M3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 100-6M18 15c2 .5 3 2 3 5',
    shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM8.5 12l2.5 2.5L16 9.5',
    map: 'M12 21s7-6 7-11a7 7 0 00-14 0c0 5 7 11 7 11M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
    mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
    clock: 'M12 4a8 8 0 100 16 8 8 0 000-16M12 8v4l3 2',
    check: 'M5 12l5 5L20 7',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
    search: 'M11 4a7 7 0 100 14 7 7 0 000-14M16 16l5 5',
    cart: 'M3 4h3l2 11h10l2-8H7M9 20a1 1 0 100-2 1 1 0 000 2M17 20a1 1 0 100-2 1 1 0 000 2',
    menu: 'M4 7h16M4 12h16M4 17h16',
    chev: 'M6 9l6 6 6-6',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8M4 21c0-4 4-6 8-6s8 2 8 6',
    heart: 'M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11',
    ig: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4M12 8a4 4 0 100 8 4 4 0 000-8M17.5 6.5v.01',
    fb: 'M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z',
    yt: 'M3 8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3zM10 9l5 3-5 3z',
    wa: 'M4 20l1.3-4.2A8 8 0 1112 20a8 8 0 01-3.8-1zM9 9c0 3 3 6 6 6l1.5-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z'
  };
  function ico(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (IC[n] || IC.leaf) + '"/></svg>'; }
  AWS.ICONS = Object.keys(IC);
  IC.phone = IC.shield; IC.mail = IC.users;   /* kontak AWS tidak menampilkan telepon/email */

  function U(ref) {
    if (!ref) return '';
    if (ref.indexOf('art:') === 0) return AWS.art(ref);
    if (ref.indexOf('media:') === 0) { var m = S.media[ref.slice(6)]; return m ? m.url : ''; }
    return String(ref).replace(/"/g, '%22').replace(/'/g, '%27').replace(/\s/g, '%20');
  }
  AWS.U = U;
  function im(ref, cls) { return '<div class="im ' + (cls || '') + '" style=\'background-image:url("' + U(ref) + '")\'></div>'; }
  function lk(l) { l = String(l || '').trim(); if (!l) return '#'; if (/^(javascript|data|vbscript):/i.test(l)) return '#'; return esc(l); }
  function btn(o, cls) { return o && o.label ? '<a class="btn ' + (cls || '') + '" href="' + lk(o.link) + '"><span>' + esc(o.label) + '</span>' + ico('arrow') + '</a>' : ''; }
  function head(o, cls) { if (!o || !o.title) return ''; return '<div class="sh ' + (cls || '') + '">' + (o.eyebrow ? '<div class="eb">' + esc(o.eyebrow) + '</div>' : '') + '<h2>' + esc(o.title) + '</h2>' + (o.text ? '<p>' + nl(o.text) + '</p>' : '') + '</div>'; }
  function show(c, k) { return !c.show || c.show[k] !== false; }
  function hasStats(c) { return (c.stats || []).some(function (s) { return String(s.num || '').trim(); }); }
  function social(cfg) {
    var s = cfg.social || {}, o = '';
    [['instagram', 'ig'], ['facebook', 'fb'], ['youtube', 'yt'], ['whatsapp', 'wa']].forEach(function (k) { if (s[k[0]]) o += '<a class="soc" target="_blank" rel="noopener" href="' + lk(s[k[0]]) + '" aria-label="' + k[0] + '">' + ico(k[1]) + '</a>'; });
    return o;
  }
  function brand(cfg, cls) {
    var b = cfg.brand;
    return '<a class="brand ' + (cls || '') + '" href="#/">' + (b.logo ? '<img src="' + U(b.logo) + '" alt="' + esc(b.name) + '">' : '<span class="bm">' + ico('leaf') + '</span>') + '<span class="bt"><b>' + esc(b.name) + '</b><small>' + esc(b.tagline) + '</small></span></a>';
  }
  function norm(cfg, l) { l = l || ''; return (l === '#/' || l === '') ? '#/p/' + (cfg.pages[0] ? cfg.pages[0].id : '') : l; }
  function navItems(cfg, ctx) {
    var cur = ctx.cur;
    return '<ul class="nv">' + cfg.menu.map(function (m) {
      var kids = m.children && m.children.length, on = norm(cfg, m.link) === cur || (kids && m.children.some(function (c) { return norm(cfg, c.link) === cur; }));
      return '<li class="' + (kids ? 'has ' : '') + (on ? 'cur' : '') + '"><a href="' + lk(m.link) + '">' + esc(m.label) + (kids ? ico('chev', 'chv') : '') + '</a>' +
        (kids ? '<ul class="sub">' + m.children.map(function (c) { return '<li class="' + (norm(cfg, c.link) === cur ? 'cur' : '') + '"><a href="' + lk(c.link) + '">' + esc(c.label) + '</a></li>'; }).join('') + '</ul>' : '') + '</li>';
    }).join('') + '</ul>';
  }
  function hb() { return '<button class="hb" type="button" aria-label="Menu" data-act="menu">' + ico('menu') + '</button>'; }
  function navBar(cfg, ctx, o) {
    o = o || {};
    return '<header class="hd ' + (o.cls || '') + '"><div class="wrap hd-in">' + brand(cfg) + '<nav class="nav">' + navItems(cfg, ctx) + '</nav>' + (o.cta || '') + hb() + '</div></header>';
  }
  function heroMedia(c) {
    var v = String(c.video || '').trim();
    if (v) {
      var yt = v.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
      if (yt) return '<iframe class="vid" src="https://www.youtube.com/embed/' + yt[1] + '?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&playlist=' + yt[1] + '" allow="autoplay; encrypted-media" allowfullscreen loading="lazy" title="video"></iframe>';
      var u = U(v);
      return '<video class="vid" src="' + u + '" autoplay muted loop playsinline></video>';
    }
    var arr = (c.hero || []).filter(Boolean);
    if (!arr.length) arr = ['art:terrace:day:1'];
    return '<div class="slides" data-n="' + arr.length + '">' + arr.map(function (r, i) { return '<div class="sl' + (i === 0 ? ' on' : '') + '" style=\'background-image:url("' + U(r) + '")\'></div>'; }).join('') + '</div>';
  }
  function foot(cfg, ctx, cls) {
    var k = cfg.contact, links = cfg.menu.map(function (m) { return '<li><a href="' + lk(m.link) + '">' + esc(m.label) + '</a></li>'; }).join('');
    return '<footer class="ft ' + (cls || '') + '"><div class="wrap ft-in"><div class="ft-b">' + brand(cfg, 'inv') + '<p>' + esc(cfg.brand.tagline) + '</p><div class="socs">' + social(cfg) + '</div></div>' +
      '<div><h4>Menu</h4><ul>' + links + '</ul></div><div><h4>Kontak</h4><ul class="ct"><li>' + ico('map') + '<span>' + esc(k.address) + '</span></li><li>' + ico('phone') + '<span>' + esc(k.phone) + '</span></li><li>' + ico('mail') + '<span>' + esc(k.email) + '</span></li><li>' + ico('clock') + '<span>' + esc(k.hours) + '</span></li></ul></div></div>' +
      '<div class="ft-bot"><div class="wrap">' + esc(cfg.footer.text) + ' <a class="adm" href="#/masuk">Masuk</a></div></div></footer>';
  }

  /* ---------- bagian bersama ---------- */
  function sAbout(c, o) {
    if (!show(c, 'about')) return ''; o = o || {}; var a = c.about, b = a.badge || {};
    return '<section class="sec about ' + (o.cls || '') + '"><div class="wrap ab-g"><div class="ab-im">' + im(a.image, 'ab1') + (a.image2 ? im(a.image2, 'ab2') : '') + (b.num ? '<div class="badge"><b>' + esc(b.num) + '</b><span>' + esc(b.label) + '</span></div>' : '') + '</div>' +
      '<div class="ab-tx">' + (a.eyebrow ? '<div class="eb">' + esc(a.eyebrow) + '</div>' : '') + '<h2>' + esc(a.title) + '</h2><p>' + nl(a.text) + '</p>' + (a.text2 ? '<p>' + nl(a.text2) + '</p>' : '') +
      '<ul class="ck">' + (a.bullets || []).filter(Boolean).map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' + (o.btn === false ? '' : btn(c.cta2, 'solid')) + '</div></div></section>';
  }
  function sFeatures(c, o) {
    if (!show(c, 'features')) return ''; o = o || {};
    return '<section class="sec feat ' + (o.cls || '') + '"><div class="wrap">' + head(c.featuresTitle, o.hc) + '<div class="grid fg">' + (c.features || []).slice(0, o.n || 4).map(function (f) {
      return '<article class="fc">' + (o.img ? im(f.image, 'fc-im') : '') + '<span class="fc-ic">' + ico(f.icon) + '</span><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p>' + (o.more ? '<a class="more" href="' + lk(c.cta.link) + '">Selengkapnya ' + ico('arrow') + '</a>' : '') + '</article>';
    }).join('') + '</div></div></section>';
  }
  function sStats(c, o) {
    if (!show(c, 'stats') || !hasStats(c)) return ''; o = o || {};
    return '<section class="sec stats ' + (o.cls || '') + '"><div class="wrap grid sg">' + c.stats.filter(function (s) { return s.num; }).map(function (s, i) { return '<div class="st"><span class="st-i">' + ico(['leaf', 'users', 'award', 'sun'][i % 4]) + '</span><b>' + esc(s.num) + '</b><span>' + esc(s.label) + '</span></div>'; }).join('') + '</div></section>';
  }
  function pCard(p, c, o) {
    return '<article class="pc">' + '<div class="pc-i">' + im(p.image, 'pc-im') + (p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') + '</div><div class="pc-b">' + (o && o.cat ? '<small>' + esc(p.cat) + '</small>' : '') + '<h3>' + esc(p.name) + '</h3>' + (o && o.desc === false ? '' : '<p>' + esc(p.desc) + '</p>') +
      '<div class="pc-f"><span class="price">' + (p.price ? esc(p.price) : 'Tersedia di aplikasi') + '</span><a class="btn mini" href="' + lk(c.cta.link) + '"><span>' + (o && o.label || 'Buka') + '</span></a></div></div></article>';
  }
  function sProducts(c, o) {
    if (!show(c, 'products')) return ''; o = o || {};
    return '<section class="sec prod ' + (o.cls || '') + '"><div class="wrap">' + head(c.productsTitle, o.hc) + '<div class="grid pg">' + (c.products || []).slice(o.from || 0, (o.from || 0) + (o.n || 6)).map(function (p) { return pCard(p, c, o); }).join('') + '</div></div></section>';
  }
  function sSteps(c, o) {
    if (!show(c, 'steps')) return ''; o = o || {};
    return '<section class="sec steps ' + (o.cls || '') + '"><div class="wrap">' + head(c.steps, o.hc) + '<div class="grid sp">' + (c.steps.items || []).map(function (s, i) { return '<div class="sp-i"><span class="num">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></div>'; }).join('') + '</div></div></section>';
  }
  function sGallery(c, o) {
    if (!show(c, 'gallery')) return ''; o = o || {};
    return '<section class="sec gal ' + (o.cls || '') + '"><div class="wrap">' + head({ title: c.gallery.title, eyebrow: c.gallery.eyebrow }, o.hc) + '<div class="gl">' + (c.gallery.images || []).filter(Boolean).slice(0, o.n || 6).map(function (r) { return im(r, 'gi'); }).join('') + '</div></div></section>';
  }
  function sTesti(c, o) {
    if (!show(c, 'testi') || !(c.testi.items || []).length) return ''; o = o || {};
    return '<section class="sec testi ' + (o.cls || '') + '"><div class="wrap">' + head({ title: c.testi.title }, o.hc) + '<div class="grid tg">' + c.testi.items.map(function (t) { return '<blockquote class="tq"><p>' + esc(t.text) + '</p><footer><b>' + esc(t.name) + '</b><small>' + esc(t.role) + '</small></footer></blockquote>'; }).join('') + '</div></div></section>';
  }
  function sFaq(c, o) {
    if (!show(c, 'faq') || !(c.faq.items || []).length) return ''; o = o || {};
    return '<section class="sec faq ' + (o.cls || '') + '"><div class="wrap">' + head({ title: c.faq.title, eyebrow: c.faq.eyebrow }, o.hc) + '<div class="fq">' + c.faq.items.map(function (q, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q.q) + ico('chev', 'chv') + '</summary><p>' + nl(q.a) + '</p></details>'; }).join('') + '</div></div></section>';
  }
  function sCta(c, o) {
    if (!show(c, 'cta')) return ''; o = o || {};
    return '<section class="sec cta ' + (o.cls || '') + '">' + (o.bg ? im(o.bg, 'cta-bg') : '') + '<div class="wrap cta-in"><div><h2>' + esc(c.cta.title) + '</h2><p>' + esc(c.cta.text) + '</p></div>' + btn({ label: c.cta.label, link: c.cta.link }, o.btn || 'solid') + '</div></section>';
  }
  function contactBlock(cfg) {
    var k = cfg.contact;
    return '<ul class="ct">' + [['map', k.address], ['phone', k.phone], ['mail', k.email], ['clock', k.hours]].map(function (r) { return '<li>' + ico(r[0]) + '<span>' + esc(r[1]) + '</span></li>'; }).join('') + '</ul>';
  }

  /* ---------- 11 model ---------- */
  var M = {};
  AWS.MODELS = [
    { k: 'donal', n: 'Donal — Hijau & Kuning Tegas', d: 'Bilah kontak, hero besar, kartu bertumpuk di pita kuning.', c: ['#14532d', '#f6b91a', '#fffdf4'] },
    { k: 'josie', n: 'Josie — Terang & Segar', d: 'Hero terbelah, ikon ringkas, kartu putih berbayang.', c: ['#4a7c1f', '#f2c230', '#ffffff'] },
    { k: 'terrain', n: 'Terrain — Kartu Bulat Hijau', d: 'Hero bingkai bulat dengan kartu kaca, langkah di latar hijau tua.', c: ['#0f5a38', '#f4e43a', '#e5efe6'] },
    { k: 'chaya', n: 'Chaya — Minimalis Putih', d: 'Banyak ruang kosong, huruf serif, deretan jenis teh bundar.', c: ['#6f8a2d', '#8a4b2a', '#ffffff'] },
    { k: 'oolong', n: 'Oolong — Kartu Kertas', d: 'Latar kebun penuh, kolom kertas di tengah, kolase bundar.', c: ['#8a9a2a', '#6b3f26', '#fbf8ef'] },
    { k: 'garten', n: 'Garten — Blok Slide', d: 'Blok hijau-kuning berselang-seling bergaya presentasi.', c: ['#2f9e2f', '#f5b800', '#ffffff'] },
    { k: 'lawn', n: 'Lawn — Zaitun Gelap', d: 'Nav melayang, layanan bundar, galeri heksagon, paket harga.', c: ['#8a9a2c', '#233640', '#f4f6e6'] },
    { k: 'kabut', n: 'Kabut — Hijau Gelap', d: 'Rel samping, tipografi renggang, panel footage vertikal.', c: ['#52634f', '#8fa38a', '#f1f3ee'] },
    { k: 'kedai', n: 'Kedai — Toko Teh Klasik', d: 'Bilah utilitas, nav gelap, sidebar kategori, grid produk.', c: ['#7a9a12', '#1a1a1a', '#ffffff'] },
    { k: 'rempah', n: 'Rempah — Katalog Bersih', d: 'Pencarian, nav hitam, filter A–Z, grid produk kotak.', c: ['#7cb342', '#222222', '#ffffff'] },
    { k: 'chun', n: 'Chun — Festival Teh Tinta', d: 'Gunung tinta, huruf 茶, panel hijau berbingkai.', c: ['#2e6b3a', '#c8442f', '#f6f0e2'] }
  ];

  M.donal = function (cfg, pg, ctx) {
    var c = pg.c, k = cfg.contact, h = '';
    h += '<div class="tb"><div class="wrap tb-in"><span>' + esc(cfg.brand.tagline) + '</span><span class="tb-c">' + ico('phone') + esc(k.phone) + ico('mail') + esc(k.email) + ico('map') + esc(k.address) + '</span><span class="tb-s">' + social(cfg) + '</span></div></div>';
    h += navBar(cfg, ctx, { cls: 'white', cta: btn(c.cta, 'pill dark') });
    h += '<section class="hero"><div class="hero-bg">' + heroMedia(c) + '</div><div class="wrap hero-in"><div class="eb script">' + esc(c.eyebrow) + '</div><h1>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta2, 'pill white') + '</div></section>';
    h += '<section class="band"><div class="wrap g3">' + [0, 1, 2].map(function (i) { var f = c.features[i] || {}; return '<a class="bcard" href="' + lk(c.cta.link) + '">' + im(f.image || (c.gallery.images || [])[i]) + '<span class="lbl">' + esc(f.title) + '</span></a>'; }).join('') + '</div></section>';
    if (show(c, 'about')) {
      var a = c.about, b = a.badge || {};
      h += '<section class="sec about"><div class="wrap dn-g"><div class="dn-l">' + (a.eyebrow ? '<div class="eb">' + esc(a.eyebrow) + '</div>' : '') + '<h2>' + esc(a.title) + '</h2><p>' + nl(a.text) + '</p>' + (a.text2 ? '<p>' + nl(a.text2) + '</p>' : '') + btn(c.cta2, 'pill dark') + im(a.image, 'dn-img') + '</div>' +
        '<div class="dn-r">' + (b.num ? '<div class="ybox"><span class="yi">' + ico('leaf') + '</span><b>' + esc(b.num) + '</b><span>' + esc(b.label) + '</span></div>' : '') +
        '<div class="gbox"><ul class="ck">' + (a.bullets || []).filter(Boolean).map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul><hr>' + (c.features || []).slice(0, 2).map(function (f) { return '<div class="gi"><span>' + ico(f.icon) + '</span><b>' + esc(f.title) + '</b></div>'; }).join('') + '<a class="rd" href="' + lk(c.cta2.link) + '">Selengkapnya</a></div></div></div></section>';
    }
    h += sFeatures(c, { cls: 'beige', hc: 'center' }) + sStats(c, { cls: 'dark' }) + sProducts(c, { n: 4, cls: 'cards' }) + sTesti(c) + sCta(c, { cls: 'yellow', btn: 'pill dark' });
    return h + foot(cfg, ctx, 'dark');
  };

  M.josie = function (cfg, pg, ctx) {
    var c = pg.c, h = '';
    h += '<div class="tb"><div class="wrap tb-in"><span class="tb-s">' + social(cfg) + '</span><span class="tb-c">' + ico('mail') + esc(cfg.contact.email) + ico('clock') + esc(cfg.contact.hours) + '</span></div></div>';
    h += navBar(cfg, ctx, { cta: btn(c.cta, 'pill yellow') });
    h += '<section class="hero"><div class="wrap hero-g"><div class="hero-t"><div class="eb">' + esc(c.eyebrow) + '</div><h1>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta, 'pill yellow') + '</div><div class="hero-i">' + heroMedia(c) + '</div></div></section>';
    h += '<section class="strip"><div class="wrap g3">' + c.features.slice(0, 3).map(function (f) { return '<div class="si"><span>' + ico(f.icon) + '</span><div><b>' + esc(f.title) + '</b><p>' + esc(f.text) + '</p></div></div>'; }).join('') + '</div></section>';
    h += sAbout(c, { cls: 'jo' });
    h += '<section class="pbn"><div class="pbn-bg">' + im((c.gallery.images || [])[0]) + '</div><div class="wrap"><h2>' + esc(c.steps.title) + '</h2><p>' + esc(c.cta.text) + '</p>' + btn(c.cta2, 'pill yellow') + '</div></section>';
    h += sProducts(c, { n: 3, cls: 'jo3', label: 'Pelajari', hc: 'center' }) + sStats(c, { cls: 'light' }) + sTesti(c) + sFaq(c);
    return h + foot(cfg, ctx, 'dark');
  };

  M.terrain = function (cfg, pg, ctx) {
    var c = pg.c, a = c.about, h = '';
    h += navBar(cfg, ctx, { cls: 'plain', cta: '<a class="phone" href="#/masuk">' + ico('phone') + '<span>Masuk</span></a>' });
    h += '<section class="hero"><div class="wrap"><div class="hero-card"><div class="hero-bg">' + heroMedia(c) + '</div><div class="hero-in"><h1>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta, 'pill dk') + '</div><div class="glass"><b>' + esc(c.eyebrow) + '</b><p>' + esc((a.text || '').slice(0, 110)) + '…</p><a href="' + lk(c.cta2.link) + '">Selengkapnya</a></div></div></div></section>';
    h += '<section class="sec mission"><div class="wrap"><div class="mi-t">' + (a.eyebrow ? '<div class="eb">' + esc(a.eyebrow) + '</div>' : '') + '<h2>' + esc(a.title) + '</h2><p>' + nl(a.text) + '</p>' + btn(c.cta2, 'pill dk') + '</div><div class="grid mi-g">' + c.features.slice(0, 4).map(function (f, i) { return '<div class="mc' + (i === 2 ? ' y' : '') + '">' + im(f.image, 'mc-im') + '<div class="mc-b"><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p></div></div>'; }).join('') + '</div></div></section>';
    h += '<section class="sec projects"><div class="wrap">' + head(c.productsTitle, 'center') + '<div class="grid pj">' + c.products.slice(0, 3).map(function (p) { return '<a class="pjc" href="' + lk(c.cta.link) + '">' + im(p.image, 'pjc-im') + '<span class="lbl">' + esc(p.name) + '</span></a>'; }).join('') + '</div></div></section>';
    if (show(c, 'about')) h += '<section class="sec why"><div class="wrap wy-g"><div><div class="eb">' + esc(c.featuresTitle.eyebrow || '') + '</div><h2>' + esc(c.featuresTitle.title) + '</h2><p>' + esc(c.featuresTitle.text) + '</p><ul class="ck">' + (a.bullets || []).filter(Boolean).map(function (x) { return '<li>' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' + btn(c.cta, 'pill dk') + '</div><div class="wy-im">' + im(a.image, 'wy1') + im(a.image2 || a.image, 'wy2') + (a.badge && a.badge.num ? '<div class="badge"><b>' + esc(a.badge.num) + '</b><span>' + esc(a.badge.label) + '</span></div>' : '') + '</div></div></section>';
    h += sSteps(c, { cls: 'dk', hc: 'center' }) + sStats(c, { cls: 'light' }) + sFaq(c) + sTesti(c) + sCta(c, { cls: 'img', bg: (c.gallery.images || [])[1], btn: 'pill y' });
    return h + foot(cfg, ctx, 'dk');
  };

  M.chaya = function (cfg, pg, ctx) {
    var c = pg.c, a = c.about, h = '';
    h += '<header class="hd"><div class="wrap hd-in">' + hb() + '<nav class="nav">' + navItems(cfg, ctx) + '</nav>' + brand(cfg, 'ctr') + '<div class="hd-r"><span class="tel">' + esc(cfg.contact.phone) + '</span>' + ico('user') + '</div></div></header>';
    h += '<section class="hero"><div class="hero-bg">' + heroMedia(c) + '</div><div class="wrap hero-g"><div class="hero-t"><small>' + esc(c.eyebrow) + '</small><h1>« ' + esc(c.title) + ' »</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta, 'sq') + '</div><div class="hero-i">' + im('art:cup:day:3', 'cupart') + '</div></div></section>';
    if (show(c, 'products')) h += '<section class="sec kinds"><div class="wrap"><h2>' + esc(c.productsTitle.title) + '</h2><div class="kd">' + c.products.slice(0, 5).map(function (p) { return '<a class="kd-i" href="' + lk(c.cta.link) + '"><span class="bowl">' + im(p.image, 'kd-im') + '</span><b>' + esc(p.name) + '</b></a>'; }).join('') + '</div></div></section>';
    if (show(c, 'about')) h += '<section class="sec split"><div class="wrap sp2"><div class="sp-im">' + im(a.image, 'sp-img') + '</div><div class="sp-tx"><h2>' + esc(a.title) + '</h2><p>' + nl(a.text) + '</p>' + (a.text2 ? '<p>' + nl(a.text2) + '</p>' : '') + btn(c.cta2, 'sq') + '</div></div></section>';
    h += sFeatures(c, { cls: 'soft', hc: 'center' }) + sProducts(c, { n: 3, from: 5, cls: 'soft2', hc: 'center' }) + sFaq(c) + sCta(c, { cls: 'soft', btn: 'sq' });
    return h + foot(cfg, ctx, 'light');
  };

  M.oolong = function (cfg, pg, ctx) {
    var c = pg.c, a = c.about, h = '';
    h += '<div class="bgf">' + im('art:terrace:gold:5') + '</div><div class="paper">';
    h += '<header class="hd"><div class="hd-top">' + brand(cfg) + '<div class="socs">' + social(cfg) + '</div>' + hb() + '</div><nav class="nav">' + navItems(cfg, ctx) + '</nav></header>';
    h += '<section class="col"><div class="hero-bg">' + heroMedia(c) + '</div><div class="otitle"><div class="eb">' + esc(c.eyebrow) + '</div><h1>' + esc(c.title) + '</h1></div><div class="collage">' + [0, 1, 2].map(function (i) { return '<div class="cir c' + i + '">' + im((c.gallery.images || [])[i] || c.hero[0]) + '</div>'; }).join('') + im('art:tea:green:4', 'pile') + [0, 1, 2].map(function (i) { var f = c.features[i] || {}; return '<div class="lab l' + i + '"><b>' + esc(f.title) + '</b><small>' + esc(f.text) + '</small></div>'; }).join('') + '</div></section>';
    h += '<section class="col pill"><div class="pill-bg">' + im((c.gallery.images || [])[3] || 'art:cup:gold:2') + '</div><div class="pill-in"><h3>' + esc(c.cta.title) + '</h3><p>' + esc(c.subtitle) + '</p>' + btn({ label: c.cta.label, link: c.cta.link }, 'out') + '</div></section>';
    if (show(c, 'products')) h += '<section class="col"><h2 class="mid">' + esc(c.productsTitle.title) + '</h2><div class="gp5">' + c.products.slice(0, 10).map(function (p) { return '<a class="p5" href="' + lk(c.cta.link) + '"><span class="p5-im">' + im(p.image) + '</span><b>' + esc(p.name) + '</b><span class="go">' + ico('arrow') + '</span></a>'; }).join('') + '</div></section>';
    if (show(c, 'about')) h += '<section class="col more"><h3>' + esc(a.title) + '</h3><p>' + nl(a.text) + '</p>' + btn(c.cta2, 'out') + '<p>' + nl(a.text2) + '</p>' + im('art:cup:gold:6', 'potart') + '</section>';
    h += '<section class="col">' + sFaq(c, { cls: 'inl' }) + '</section>';
    h += '<footer class="ft"><div class="wrap ft-in">' + contactBlock(cfg) + '</div><div class="ft-bot">' + esc(cfg.footer.text) + ' <a class="adm" href="#/masuk">Masuk</a></div></footer></div>';
    return h;
  };

  M.garten = function (cfg, pg, ctx) {
    var c = pg.c, a = c.about, h = '';
    h += navBar(cfg, ctx, { cls: 'plain', cta: btn(c.cta, 'sq g') });
    h += '<section class="hero"><div class="hero-bg">' + heroMedia(c) + '</div><div class="hero-in"><div class="mark">' + ico('leaf') + '</div><h1>' + esc(c.title) + '</h1><div class="chip">' + esc(c.eyebrow) + '</div></div></section>';
    h += '<section class="sec s1"><div class="wrap gt-g"><div><h2>' + esc(c.featuresTitle.title) + '</h2><p>' + esc(c.featuresTitle.text) + '</p>' + btn(c.cta2, 'sq g') + (hasStats(c) ? '<div class="gbar"><b>' + esc(c.stats[0].num) + '</b><span>' + esc(c.stats[0].label) + '</span></div>' : '') + '</div>' + im(a.image, 'gt-img') + '</div></section>';
    h += '<section class="sec s2"><div class="wrap gt-g r">' + im('art:leaf:day:2', 'leafmask') + '<div><h2>' + esc(a.title) + '</h2><ul class="ck chk">' + (a.bullets || []).filter(Boolean).map(function (x, i) { return '<li class="' + (i % 2 ? 'y' : '') + '">' + ico('check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul><p>' + nl(a.text) + '</p></div></div></section>';
    h += '<section class="sec s3"><div class="wrap">' + im((c.gallery.images || [])[0], 'tiles-bg') + '<div class="tiles">' + c.features.slice(0, 3).map(function (f, i) { return '<div class="tile t' + i + '">' + ico(f.icon) + '<b>' + esc(f.title) + '</b><p>' + esc(f.text) + '</p></div>'; }).join('') + '</div></div></section>';
    h += sGallery(c, { n: 3, cls: 'round' }) + sSteps(c, { cls: 'gdk' }) + sProducts(c, { n: 3, cls: 'gp', hc: 'center' }) + sFaq(c) + sCta(c, { cls: 'green', btn: 'sq y' });
    return h + foot(cfg, ctx, 'green');
  };

  M.lawn = function (cfg, pg, ctx) {
    var c = pg.c, a = c.about, h = '';
    h += '<section class="hero"><div class="hero-bg">' + heroMedia(c) + '</div><header class="hd float"><div class="hd-in">' + brand(cfg) + '<nav class="nav">' + navItems(cfg, ctx) + '</nav>' + btn(c.cta, 'olv') + hb() + '</div></header><div class="hero-in"><h1><em>' + esc(c.eyebrow) + '</em>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta2, 'olv') + '</div></section>';
    h += '<section class="sec svc"><div class="wrap">' + '<div class="svc-h"><span class="pillt">' + esc(c.featuresTitle.eyebrow || 'Layanan') + '</span><h2>' + esc(c.featuresTitle.title) + '</h2></div><div class="svc-g">' + c.features.slice(0, 4).map(function (f) { return '<article class="sv">' + im(f.image, 'sv-im') + '<span class="sv-i">' + ico(f.icon) + '</span><h3>' + esc(f.title) + '</h3><p>' + esc(f.text) + '</p><a class="more" href="' + lk(c.cta.link) + '">Selengkapnya ' + ico('arrow') + '</a></article>'; }).join('') + '</div></div></section>';
    if (show(c, 'about')) h += '<section class="sec slate"><div class="wrap sl-g"><div><span class="pillt">' + esc(a.eyebrow || '') + '</span><h2>' + esc(a.title) + '</h2><p>' + nl(a.text) + '</p><div class="mini">' + c.features.slice(0, 2).map(function (f) { return '<div><span>' + ico(f.icon) + '</span><b>' + esc(f.title) + '</b><p>' + esc(f.text) + '</p></div>'; }).join('') + '</div></div><div class="hexs">' + im(a.image, 'hx hx1') + im(a.image2 || (c.gallery.images || [])[1], 'hx hx2') + im((c.gallery.images || [])[2], 'hx hx3') + '</div></div></section>';
    h += sSteps(c, { cls: 'reas', hc: 'center' }) + sStats(c, { cls: 'olive' }) + sGallery(c, { cls: 'mosaic', n: 6, hc: 'center' }) + sTesti(c);
    if (show(c, 'products')) h += '<section class="sec price"><div class="wrap">' + head(c.productsTitle, 'center') + '<div class="grid pr3">' + c.products.slice(0, 3).map(function (p, i) { return '<div class="plan' + (i === 1 ? ' hot' : '') + '"><small>' + esc(p.cat) + '</small><b class="amt">' + (p.price ? esc(p.price) : 'Tersedia di aplikasi') + '</b><h3>' + esc(p.name) + '</h3><p>' + esc(p.desc) + '</p>' + btn({ label: 'Buka', link: c.cta.link }, 'olv') + '</div>'; }).join('') + '</div></div></section>';
    h += sFaq(c) + sCta(c, { cls: 'img', bg: (c.gallery.images || [])[4], btn: 'olv' });
    return h + foot(cfg, ctx, 'dark');
  };

  M.kabut = function (cfg, pg, ctx) {
    var c = pg.c, a = c.about, h = '';
    h += '<div class="shell"><aside class="rail"><b>' + esc(cfg.brand.short || cfg.brand.name) + '</b><span class="n">' + ico('leaf') + '</span><span class="vt">' + esc(cfg.brand.tagline) + '</span><div class="socs">' + social(cfg) + '</div></aside><div class="main">';
    h += '<section class="hero"><div class="hero-bg">' + heroMedia(c) + '</div><header class="hd"><div class="hd-in"><span class="sub">' + esc(c.eyebrow) + '</span><nav class="nav">' + navItems(cfg, ctx) + '</nav>' + hb() + '</div></header><div class="hero-in"><h1>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta, 'rd') + '</div></section>';
    if (show(c, 'about')) h += '<section class="sec ab"><h2 class="ls">' + esc(a.eyebrow || 'Tentang') + ' <span>' + esc((cfg.brand.short || '').split(' ')[0] || '') + '</span></h2><div class="wrap ab-g"><div class="ab-tx"><h3>' + esc(a.title) + '</h3><p>' + nl(a.text) + '</p>' + (a.text2 ? '<p>' + nl(a.text2) + '</p>' : '') + '</div>' + im(a.image, 'sq') + '</div></section>';
    if (show(c, 'gallery')) h += '<section class="sec foot"><h2 class="ls">' + esc(c.gallery.title) + ' <span>' + esc(cfg.brand.short || '') + '</span></h2><div class="panels">' + (c.gallery.images || []).filter(Boolean).slice(0, 4).map(function (r, i) { return '<div class="pn">' + im(r) + '<span class="pv">' + esc((c.features[i] || {}).title || '') + '</span></div>'; }).join('') + '</div></section>';
    h += '<section class="sec big"><div class="wrap big-g"><div class="bn">' + (hasStats(c) ? esc(c.stats[0].num) : '茶') + '</div><div><b class="ls">' + esc(hasStats(c) ? c.stats[0].label : c.cta.title) + '</b><p>' + esc(c.cta.text) + '</p>' + btn({ label: c.cta.label, link: c.cta.link }, 'rd') + '</div></div></section>';
    h += sProducts(c, { n: 4, cls: 'kb', hc: 'ls' }) + sSteps(c, { cls: 'kb', hc: 'ls' }) + sFaq(c);
    h += '<footer class="ft"><div class="wrap ft-in">' + contactBlock(cfg) + '</div><div class="ft-bot">' + esc(cfg.footer.text) + ' <a class="adm" href="#/masuk">Masuk</a></div></footer></div></div>';
    return h;
  };

  M.kedai = function (cfg, pg, ctx) {
    var c = pg.c, cats = [], seen = {}, h = '';
    c.products.forEach(function (p) { if (p.cat && !seen[p.cat]) { seen[p.cat] = 1; cats.push(p.cat); } });
    h += '<div class="util"><div class="wrap"><span>' + esc(cfg.contact.hours) + '</span><span class="u-r"><a href="#/s/faq">FAQ</a><a href="#/masuk">Masuk</a></span></div></div>';
    h += '<header class="hd"><div class="wrap hd-in">' + brand(cfg, 'big') + '<div class="srch"><span>Cari modul…</span>' + ico('search') + '</div><a class="cart" href="#/masuk">' + ico('arrow') + '<b>Masuk</b><i>aplikasi</i></a>' + hb() + '</div></header><nav class="nav dk"><div class="wrap">' + navItems(cfg, ctx) + '</div></nav>';
    h += '<section class="hero"><div class="hero-bg">' + heroMedia(c) + '</div><div class="wrap hero-in"><h1><small>' + esc(c.eyebrow) + '</small>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta, 'lnk') + '</div></section>';
    if (show(c, 'products')) h += '<section class="sec shop"><div class="wrap sh-g"><aside class="side"><h4>Kategori</h4><ul>' + cats.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><h4>Tentang</h4><p>' + esc((c.about.text || '').slice(0, 140)) + '…</p></aside><div><h2 class="stt">' + esc(c.productsTitle.title) + '</h2><div class="grid pg">' + c.products.slice(0, 9).map(function (p) { return pCard(p, c, { cat: true, desc: false, label: 'Buka' }); }).join('') + '</div></div></div></section>';
    h += sFeatures(c, { cls: 'plainf', hc: 'center' }) + sSteps(c, { cls: 'kd2', hc: 'center' });
    return h + foot(cfg, ctx, 'dark');
  };

  M.rempah = function (cfg, pg, ctx) {
    var c = pg.c, cats = [], seen = {}, h = '';
    c.products.forEach(function (p) { if (p.cat && !seen[p.cat]) { seen[p.cat] = 1; cats.push(p.cat); } });
    h += '<header class="hd"><div class="wrap hd-in"><div class="srch"><span>Cari modul…</span>' + ico('search') + '</div>' + brand(cfg, 'ctr') + '<div class="hd-r"><a href="#/masuk">Masuk</a>' + ico('arrow') + '<b>Aplikasi</b></div>' + hb() + '</div></header><nav class="nav bk"><div class="wrap">' + navItems(cfg, ctx) + '</div></nav>';
    h += '<section class="hero wood"><div class="wrap hero-in">' + im('art:box:day:2', 'pk') + '<div class="scr"><span>' + esc(c.eyebrow) + '</span><h1>' + esc(c.title) + '</h1></div>' + im('art:tea:green:7', 'bowl1') + '</div></section>';
    h += '<section class="sec cat"><div class="wrap rp-g"><aside class="side"><h4>Cari Berdasarkan Nama</h4><div class="az">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (l, i) { return '<span' + (i === 1 ? ' class="on"' : '') + '>' + l + '</span>'; }).join('') + '</div><h4>Jenis</h4><ul>' + cats.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><h4>Sering dipakai</h4><ul><li class="hl">' + esc((c.products[0] || {}).name) + ' ×</li></ul><h4>Modul lain</h4><ul>' + c.products.slice(0, 6).map(function (p) { return '<li>' + esc(p.name) + '</li>'; }).join('') + '</ul></aside><div><div class="crumb">Beranda › Modul › ' + esc(pg.title) + '</div><h2 class="stt">' + esc(c.productsTitle.title) + '</h2><div class="grid pg sq">' + c.products.slice(0, 9).map(function (p) {
      return '<article class="pc"><div class="pc-i">' + im(p.image, 'pc-im') + '</div><h3>' + esc(p.name) + '</h3><div class="pc-f"><a class="btn mini out" href="' + lk(c.cta.link) + '"><span>LIHAT</span></a><span class="price">' + (p.price ? esc(p.price) : 'Tersedia di aplikasi') + '</span></div></article>';
    }).join('') + '</div></div></div></section>';
    h += '<section class="news"><div class="wrap news-in"><div><h3>Mulai <b>sekarang</b></h3><p>' + esc(c.cta.text) + '</p></div>' + btn({ label: c.cta.label, link: c.cta.link }, 'grn') + '</div></section>';
    h += sFeatures(c, { cls: 'plainf', hc: 'center' }) + sFaq(c);
    return h + foot(cfg, ctx, 'dark');
  };

  M.chun = function (cfg, pg, ctx) {
    var c = pg.c, a = c.about, h = '';
    h += '<header class="hd"><div class="wrap hd-in">' + brand(cfg) + '<nav class="nav">' + navItems(cfg, ctx) + '</nav>' + hb() + '</div></header>';
    h += '<section class="hero"><div class="hero-bg">' + heroMedia(c) + '</div><div class="ghost">茶</div><div class="hero-in"><div class="eb">' + esc(c.eyebrow) + '</div><h1>' + esc(c.title) + '</h1><p>' + esc(c.subtitle) + '</p>' + btn(c.cta, 'ink') + '</div></section>';
    if (show(c, 'about')) h += '<section class="sec intro"><div class="wrap in-g"><div class="frame">' + im(a.image) + '</div><div><h2>' + esc(a.title) + '</h2><p>' + nl(a.text) + '</p><div class="gp">' + c.features.slice(0, 2).map(function (f) { return '<div class="gpc"><span>' + ico(f.icon) + '</span><b>' + esc(f.title) + '</b><p>' + esc(f.text) + '</p></div>'; }).join('') + '</div></div></div></section>';
    h += '<section class="sec rows"><div class="wrap">' + c.features.slice(2, 4).map(function (f, i) { return '<div class="rw' + (i ? ' rv' : '') + '"><div class="frame">' + im(f.image) + '</div><div class="gpanel"><b>' + esc(f.title) + '</b><p>' + esc(f.text) + '</p></div></div>'; }).join('') + '</div></section>';
    h += sProducts(c, { n: 4, cls: 'tiles', hc: 'center' }) + sSteps(c, { cls: 'leafy', hc: 'center' }) + sGallery(c, { n: 3, cls: 'ink3' }) + sCta(c, { cls: 'ink', btn: 'ink' });
    return h + foot(cfg, ctx, 'ink');
  };

  /* ---------- tampilan ---------- */
    var FONTS = { donal: ["'Oswald'", "'Poppins'"], josie: ["'Poppins'", "'Poppins'"], terrain: ["'Plus Jakarta Sans'", "'Plus Jakarta Sans'"], chaya: ["'Lora'", "'Lora'"], oolong: ["'Lora'", "'Lora'"], garten: ["'Poppins'", "'Poppins'"], lawn: ["'Outfit'", "'Outfit'"], kabut: ["'Montserrat'", "'Montserrat'"], kedai: ["'Lora'", "'Lato'"], rempah: ["'Lato'", "'Lato'"], chun: ["'Noto Serif SC'", "'Lora'"] };
  function siteVars(cfg, pg) {
    var v = '', p = pg.primary || (cfg.theme.useBrand ? cfg.theme.primary : ''), a = pg.accent || (cfg.theme.useBrand ? cfg.theme.accent : '');
    var ok = function (x) { return /^#[0-9a-fA-F]{3,8}$/.test(x || ''); };
    if (ok(p)) v += '--p:' + p + ';'; if (ok(a)) v += '--a:' + a + ';';
    return v;
  }
  AWS.siteVars = siteVars;
  AWS.renderPage = function (cfg, pg, ctx) {
    ctx = ctx || {}; ctx.cur = ctx.cur || '#/p/' + pg.id;
    var fn = M[pg.model] || M.donal, f = FONTS[pg.model] || FONTS.donal;
    return '<div class="site m-' + (M[pg.model] ? pg.model : 'donal') + '" style="' + siteVars(cfg, pg) + '--hf:' + f[0] + ',system-ui,sans-serif;--bf:' + f[1] + ',system-ui,sans-serif">' + fn(cfg, pg, ctx) + '</div>';
  };
  AWS.loadFonts = function () {
    if (document.getElementById('gf-land')) return;
    var l = document.createElement('link'); l.id = 'gf-land'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Lora:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Noto+Serif+SC:wght@500;700&family=Oswald:wght@500;600&family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  };
  AWS.CSS = "/* ===== Dasar ===== */\n*{box-sizing:border-box}\n\n:host{display:block;scroll-behavior:smooth;font-family:'Poppins',system-ui,-apple-system,'Segoe UI',sans-serif;background:#fff;color:#16301c}\n\na{color:inherit;text-decoration:none}\nimg{max-width:100%}\nbutton,input,select,textarea{font:inherit}\n.nf{padding:90px 24px;text-align:center}\n.site{container-type:inline-size;container-name:site;width:100%;overflow-x:clip;position:relative;--p:#1f5e2e;--a:#f4b81f;--ink:#16301c;--mut:#5b6b5f;--bg:#fff;--hf:'Poppins',system-ui,sans-serif;--bf:'Poppins',system-ui,sans-serif;font-family:var(--bf);color:var(--ink);background:var(--bg);line-height:1.65}\n.site h1,.site h2,.site h3,.site h4{font-family:var(--hf);line-height:1.18;margin:0 0 .5em;color:inherit}\n.site p{margin:0 0 1em;color:var(--mut)}\n.wrap{max-width:1200px;margin:0 auto;padding:0 28px;width:100%}\n.ic{width:1.15em;height:1.15em;flex:none;vertical-align:-.2em}\n.im{display:block;width:100%;height:100%;min-height:80px;background-color:#dfe8dc;background-size:cover;background-position:center;background-repeat:no-repeat}\n.grid{display:grid;gap:24px}\n.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}\n.fg,.sg,.sp{grid-template-columns:repeat(4,1fr)}\n.pg,.tg{grid-template-columns:repeat(3,1fr)}\n.sec{padding:84px 0}\n.sh{max-width:680px;margin:0 0 40px}\n.sh.center{margin-left:auto;margin-right:auto;text-align:center}\n.sh h2,.sec>.wrap>h2,.about h2{font-size:2.1rem;font-size:clamp(1.7rem,3.6cqi,2.6rem)}\n.eb{font-size:.85rem;font-weight:600;color:var(--p);letter-spacing:.03em;margin-bottom:.6em}\n.btn{display:inline-flex;align-items:center;gap:.6em;padding:.8em 1.4em;border-radius:8px;background:var(--p);color:#fff;font-weight:600;font-size:.93rem;border:0;cursor:pointer;transition:.2s;line-height:1.2}\n.btn:hover{filter:brightness(1.1);transform:translateY(-1px)}\n.btn.pill{border-radius:99px}.btn.sq{border-radius:0}\n.btn.yellow,.btn.y{background:var(--a);color:#1b2a12}\n.btn.white{background:#fff;color:var(--p)}\n.btn.out{background:transparent;border:1.5px solid currentColor;color:inherit}\n.btn.mini{padding:.45em 1em;font-size:.8rem}\n.ck{list-style:none;padding:0;margin:0 0 20px;display:grid;gap:10px}\n.ck li{display:flex;gap:10px;align-items:flex-start}\n.ck .ic{color:var(--p);margin-top:.28em}\n.more{color:var(--p);font-weight:700;font-size:.85rem;display:inline-flex;gap:6px;align-items:center;margin-top:8px}\n.tag{position:absolute;top:10px;left:10px;background:var(--a);color:#1b2a12;font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:99px;z-index:2}\n/* header */\n.hd{position:relative;z-index:20;background:#fff;color:var(--ink)}\n.hd-in{display:flex;align-items:center;gap:24px;min-height:78px}\n.brand{display:flex;align-items:center;gap:12px;font-family:var(--hf)}\n.brand img{height:46px;width:auto}\n.bm{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--p);color:#fff;font-size:1.4rem;flex:none}\n.bt{display:flex;flex-direction:column;line-height:1.15}.bt b{font-size:1rem;letter-spacing:.01em}.bt small{font-size:.7rem;color:var(--mut);font-weight:400}\n.nav{margin-left:auto}\n.nv{list-style:none;margin:0;padding:0;display:flex;gap:4px;align-items:center}\n.nv>li{position:relative}\n.nv a{display:flex;align-items:center;gap:4px;padding:10px 14px;font-weight:600;font-size:.92rem;border-radius:8px}\n.nv>li.cur>a,.nv>li>a:hover{color:var(--p)}\n.nv .sub{display:none;position:absolute;left:0;top:100%;min-width:210px;background:#fff;color:#16301c;box-shadow:0 14px 34px rgba(0,0,0,.16);border-radius:12px;padding:8px;list-style:none;margin:0;z-index:50}\n.nv li:hover>.sub,.nv li.open>.sub{display:block}\n.nv .sub a{white-space:nowrap}.nv .sub a:hover,.nv .sub li.cur a{background:#f1f5ee;color:var(--p)}\n.chv{width:.9em;height:.9em;transition:.2s}\n.hb{display:none;margin-left:auto;width:44px;height:44px;border-radius:10px;border:1px solid rgba(0,0,0,.18);background:transparent;color:inherit;cursor:pointer;font-size:1.3rem;place-items:center}\n.phone{display:flex;gap:8px;align-items:center;font-weight:700;font-size:.85rem}\n/* hero umum */\n.hero{position:relative;color:#fff;overflow:hidden}\n.hero-bg{position:absolute;inset:0}\n.slides,.vid{position:absolute;inset:0;width:100%;height:100%}\n.vid{object-fit:cover;border:0;pointer-events:none}iframe.vid{transform:scale(1.4)}\n.sl{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.2s}.sl.on{opacity:1}\n.hero-bg:after{content:'';position:absolute;inset:0}\n.hero>*:not(.hero-bg){position:relative}\n.hero .hero-in,.hero .hero-g{z-index:2}\n/* bagian umum */\n.fc{background:#fff;border-radius:16px;padding:26px;border:1px solid rgba(0,0,0,.08)}\n.fc-im{height:150px;border-radius:12px;margin-bottom:16px}\n.fc-ic{display:grid;place-items:center;width:54px;height:54px;border-radius:14px;background:var(--p);color:var(--a);font-size:1.5rem;margin-bottom:14px}\n.fc h3{font-size:1.1rem}.fc p{margin:0;font-size:.92rem}\n.stats{padding:58px 0}\n.st{text-align:center}.st b{display:block;font-size:2.4rem;font-family:var(--hf);line-height:1.1}\n.st-i{display:grid;place-items:center;width:52px;height:52px;margin:0 auto 10px;border-radius:50%;background:rgba(255,255,255,.14);color:var(--a);font-size:1.4rem}\n.pc{background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column}\n.pc-i{position:relative;aspect-ratio:4/3;overflow:hidden}.pc-im{position:absolute;inset:0;transition:transform .4s}.pc:hover .pc-im{transform:scale(1.05)}\n.pc-b{padding:16px;display:flex;flex-direction:column;gap:2px;flex:1}\n.pc-b h3{font-size:1.05rem;margin:0}.pc-b p{font-size:.86rem;margin:4px 0 12px}\n.pc small{color:var(--mut);font-size:.7rem;text-transform:uppercase;letter-spacing:.08em}\n.pc-f{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8px}\n.price{font-weight:700;color:var(--p);font-size:.95rem}\n.sp-i{background:#fff;border-radius:16px;padding:24px;border:1px solid rgba(0,0,0,.08)}.sp-i h3{font-size:1.05rem}.sp-i p{margin:0;font-size:.9rem}\n.num{display:inline-grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--a);color:#1b2a12;font-weight:700;margin-bottom:12px}\n.gl{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.gi{height:230px;border-radius:12px}\n.tq{margin:0;background:#fff;border-radius:16px;padding:26px;border:1px solid rgba(0,0,0,.08)}.tq footer b{display:block}.tq small{color:var(--mut)}\n.fq{max-width:860px;margin:0 auto;display:grid;gap:10px}\ndetails{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:12px;padding:0 20px}\nsummary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 0;font-weight:600}\nsummary::-webkit-details-marker{display:none}details[open] .chv{transform:rotate(180deg)}details p{padding-bottom:14px;margin:0}\n.cta{padding:56px 0}.cta-in{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}.cta h2{margin:0 0 .3em;font-size:1.9rem}.cta p{margin:0}\n.cta.img{position:relative;color:#fff;padding:96px 0;overflow:hidden}.cta-bg{position:absolute;inset:0}.cta.img:before{content:'';position:absolute;inset:0;background:rgba(10,45,25,.72);z-index:1}.cta.img .cta-in{position:relative;z-index:2}.cta.img p{color:#e8f0e4}\n/* footer */\n.ft{background:#12301a;color:#dfe9db;padding-top:56px}\n.ft-in{display:grid;grid-template-columns:1.4fr 1fr 1.3fr;gap:36px;padding-bottom:36px}\n.ft h4{color:#fff;margin-bottom:14px}.ft ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}\n.ft p{color:#b7c9b2;margin:10px 0 0}.ft a:hover{color:var(--a)}\n.ft .ct li,.ct li{display:flex;gap:10px;align-items:flex-start}.ct{list-style:none;margin:0;padding:0;display:grid;gap:8px}.ct .ic{margin-top:.3em;color:var(--a)}\n.ft-bot{border-top:1px solid rgba(255,255,255,.14);padding:18px 0;text-align:center;font-size:.85rem;color:#a8bda5}\n.adm{opacity:.5;margin-left:10px;font-size:.78rem}\n.brand.inv{color:#fff}.brand.inv .bt small{color:#b7c9b2}\n.socs{display:flex;gap:8px;margin-top:12px}.soc{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.14)}.soc:hover{background:var(--a);color:#1b2a12}\n\n/* ===== 1. DONAL ===== */\n.m-donal{--p:#14532d;--a:#f6b91a}\n.m-donal .tb{background:var(--p);color:#fff;font-size:.78rem}\n.m-donal .tb-in{display:flex;justify-content:space-between;gap:16px;padding:10px 28px;align-items:center;max-width:1200px;margin:auto}\n.m-donal .tb-c{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.m-donal .tb-c .ic{color:var(--a);margin-left:12px}.m-donal .tb-s{display:flex;gap:6px}.m-donal .tb .soc{width:26px;height:26px}\n.m-donal .hd{box-shadow:0 2px 12px rgba(0,0,0,.06)}\n.m-donal .hero{min-height:560px;display:flex;align-items:center}\n.m-donal .hero-bg:after{background:linear-gradient(90deg,rgba(8,30,15,.8),rgba(8,30,15,.12))}\n.m-donal .hero-in{padding-top:90px;padding-bottom:150px}\n.m-donal .hero h1{font-size:3rem;font-size:clamp(2.2rem,6.2cqi,4.4rem);text-transform:uppercase;font-weight:500;max-width:16ch;color:#fff;letter-spacing:.01em}\n.m-donal .hero p{color:#e8f0e4;max-width:54ch}\n.m-donal .eb.script{color:var(--a);font-style:italic;font-size:1rem}\n.m-donal .band{background:var(--a);padding:0 0 64px}\n.m-donal .band .g3{margin-top:-96px;position:relative;z-index:3}\n.m-donal .bcard{position:relative;display:block;height:300px;border-radius:20px;overflow:hidden;border:5px solid #fff;background:#fff;box-shadow:0 14px 34px rgba(0,0,0,.18)}\n.m-donal .bcard .im{position:absolute;inset:0}\n.m-donal .bcard .lbl{position:absolute;left:14px;right:14px;bottom:14px;background:#fff;border-radius:10px;padding:13px;text-align:center;font-weight:700;color:var(--p);font-size:.95rem}\n.m-donal .dn-g{display:grid;grid-template-columns:1.35fr 1fr;gap:36px}\n.m-donal .dn-img{height:300px;border-radius:20px;margin-top:22px}\n.m-donal .ybox{background:var(--a);border-radius:18px;padding:26px;margin-bottom:20px;color:#1b2a12}.m-donal .ybox b{display:block;font-size:2.6rem;font-family:var(--hf);line-height:1.1}.m-donal .yi{float:right;width:44px;height:44px;border-radius:50%;background:var(--p);color:#fff;display:grid;place-items:center}\n.m-donal .gbox{background:var(--p);color:#fff;border-radius:18px;padding:28px}.m-donal .gbox .ck li{color:#fff}.m-donal .gbox .ck .ic{color:var(--a)}.m-donal .gbox hr{border:0;border-top:1px solid rgba(255,255,255,.18);margin:6px 0 14px}\n.m-donal .gi,.m-donal .gl .gi{height:auto}\n.m-donal .gbox .gi{display:flex;gap:12px;align-items:center;margin:12px 0;height:auto}.m-donal .gbox .gi span{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.12);display:grid;place-items:center;color:var(--a);flex:none}\n.m-donal .rd{display:inline-block;margin-top:8px;color:var(--a);border-bottom:1px solid;font-weight:600}\n.m-donal .feat.beige{background:#f4f1e8}.m-donal .fc{border-color:#ece6d3}\n.m-donal .stats.dark{background:var(--p);color:#fff}.m-donal .stats.dark p{color:#cfe3d4}\n.m-donal .cta.yellow{background:var(--a);color:#1b2a12}.m-donal .cta.yellow p{color:#3d4a2c}.m-donal .btn.dark{background:var(--p)}\n.m-donal .tq{background:#f4f1e8}\n\n/* ===== 2. JOSIE ===== */\n.m-josie{--p:#4a7c1f;--a:#f2c230}\n.m-josie .tb{background:#3a4a3a;color:#fff;font-size:.78rem}.m-josie .tb-in{display:flex;justify-content:space-between;padding:9px 28px;max-width:1200px;margin:auto}.m-josie .tb-c{display:flex;gap:8px;align-items:center}.m-josie .tb-c .ic{margin-left:12px;color:var(--a)}.m-josie .tb .soc{width:24px;height:24px}\n.m-josie .hero{background:linear-gradient(90deg,#f4f8ea 45%,#fff);color:var(--ink)}\n.m-josie .hero-g{display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:center;padding-top:60px;padding-bottom:60px}\n.m-josie .hero h1{font-size:2.6rem;font-size:clamp(2rem,5cqi,3.5rem);color:var(--p)}\n.m-josie .hero-t .eb{display:inline-block;background:#fff;border:1px solid #dfe8cf;padding:6px 14px;border-radius:99px}\n.m-josie .hero-i{position:relative;height:450px;border-radius:26px 26px 26px 130px;overflow:hidden;box-shadow:0 20px 50px rgba(40,70,20,.2)}\n.m-josie .strip{background:#fff;border-bottom:1px solid #eee}\n.m-josie .si{display:flex;gap:14px;padding:28px 0}.m-josie .si span{width:56px;height:56px;flex:none;border-radius:50%;background:#e9f3d6;color:var(--p);display:grid;place-items:center;font-size:1.5rem}.m-josie .si b{display:block}.m-josie .si p{margin:0;font-size:.85rem}\n.m-josie .ab-g{display:grid;grid-template-columns:1fr 1.1fr;gap:56px;align-items:center}\n.m-josie .ab-im{position:relative;height:460px}.m-josie .ab1{position:absolute;left:0;top:0;width:52%;height:80%;border-radius:12px}.m-josie .ab2{position:absolute;right:4%;bottom:0;width:50%;height:72%;border-radius:12px;border:6px solid #fff}\n.badge{position:absolute;left:12px;top:12px;background:var(--a);padding:12px 18px;border-radius:12px;font-weight:700;text-align:center;z-index:3;color:#1b2a12}.badge b{display:block;font-size:1.7rem;line-height:1.1}.badge span{font-size:.75rem}\n.m-josie .pbn{position:relative;padding:110px 0;color:#fff;overflow:hidden}.m-josie .pbn-bg{position:absolute;inset:0}.m-josie .pbn:before{content:'';position:absolute;inset:0;background:rgba(20,40,20,.62);z-index:1}.m-josie .pbn .wrap{position:relative;z-index:2;max-width:780px}.m-josie .pbn p{color:#e7efe0}.m-josie .pbn h2{font-size:2.2rem}\n.m-josie .jo3{background:#f6f8f0}.m-josie .pc{box-shadow:0 8px 26px rgba(60,80,30,.1);border:0}\n.m-josie .stats.light{background:#fff;color:var(--p)}.m-josie .stats.light .st-i{background:#e9f3d6;color:var(--p)}.m-josie .stats.light span{color:var(--mut)}\n\n/* ===== 3. TERRAIN ===== */\n.m-terrain{--p:#0f5a38;--a:#f4e43a}\n.m-terrain .hd{background:var(--p);color:#fff}.m-terrain .bm{background:var(--a);color:var(--p)}.m-terrain .bt small{color:#cfe3d4}.m-terrain .nv>li.cur>a,.m-terrain .nv>li>a:hover{color:var(--a)}\n.m-terrain .phone{background:var(--a);color:#0b3d25;padding:8px 14px;border-radius:99px}\n.m-terrain .hero{background:var(--p);padding:0 0 40px}\n.m-terrain .hero-card{position:relative;border-radius:28px;overflow:hidden;min-height:520px;color:#fff;display:flex;align-items:flex-end}\n.m-terrain .hero-bg:after{background:linear-gradient(90deg,rgba(6,50,30,.82),rgba(6,50,30,.1))}\n.m-terrain .hero-in{position:relative;z-index:2;padding:48px;max-width:640px}\n.m-terrain .hero h1{font-size:2.6rem;font-size:clamp(1.9rem,5cqi,3.4rem);color:#fff}.m-terrain .hero p{color:#e5f0e6}\n.m-terrain .btn.dk{background:var(--a);color:#0b3d25}\n.m-terrain .glass{position:absolute;right:26px;bottom:26px;width:min(270px,36%);background:rgba(255,255,255,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:18px;padding:18px;color:#fff;z-index:2;border:1px solid rgba(255,255,255,.3)}.m-terrain .glass p{color:#eaf3ea;font-size:.82rem;margin:6px 0}.m-terrain .glass a{font-weight:700;font-size:.82rem}\n.m-terrain .mi-t{max-width:820px;margin:0 auto 38px;text-align:center}.m-terrain .mi-t h2{font-size:2.2rem;font-size:clamp(1.6rem,3.6cqi,2.6rem)}\n.m-terrain .mi-g{grid-template-columns:repeat(4,1fr)}\n.m-terrain .mc{border-radius:22px;overflow:hidden;background:#eef4ee;display:flex;flex-direction:column}.m-terrain .mc-im{height:150px}.m-terrain .mc-b{padding:16px}.m-terrain .mc-b h3{font-size:1rem}.m-terrain .mc-b p{margin:0;font-size:.85rem}.m-terrain .mc.y{background:var(--a)}.m-terrain .mc.y p{color:#3a3a10}\n.m-terrain .projects{background:#e5efe6}.m-terrain .pj{grid-template-columns:1fr 1.15fr 1fr;align-items:end}\n.m-terrain .pjc{position:relative;display:block;height:340px;border-radius:24px;overflow:hidden}.m-terrain .pjc:nth-child(2){height:410px}.m-terrain .pjc .im{position:absolute;inset:0}.m-terrain .pjc .lbl{position:absolute;left:12px;bottom:12px;background:#fff;color:var(--p);font-weight:700;padding:8px 14px;border-radius:12px;font-size:.9rem}\n.m-terrain .wy-g{display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center}.m-terrain .wy-im{position:relative;height:430px}\n.m-terrain .wy1{position:absolute;left:0;top:0;width:60%;height:72%;border-radius:90px 20px 20px 20px}.m-terrain .wy2{position:absolute;right:0;bottom:0;width:56%;height:70%;border-radius:20px;border:6px solid #fff}\n.m-terrain .steps.dk{background:var(--p);color:#fff}.m-terrain .steps.dk .sp-i{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14)}.m-terrain .steps.dk p{color:#cfe3d4}.m-terrain .steps.dk .eb{color:var(--a)}\n.m-terrain .stats.light{background:#fff;color:var(--p)}.m-terrain .stats.light .st-i{background:#e5efe6;color:var(--p)}.m-terrain .stats.light span{color:var(--mut)}\n.m-terrain .ft.dk{background:#083a24}\n\n/* ===== 4. CHAYA ===== */\n.m-chaya{--p:#6f8a2d;--a:#8a4b2a}\n.m-chaya .hd{border-bottom:1px solid #eee}.m-chaya .hd-in{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;min-height:84px}\n.m-chaya .nav{margin:0}.m-chaya .nv a{font-weight:500;font-size:.88rem}\n.m-chaya .brand.ctr{justify-self:center}.m-chaya .bm{background:#fff;color:var(--p);border:1.5px solid var(--p)}\n.m-chaya .hd-r{justify-self:end;display:flex;gap:14px;align-items:center;color:var(--p)}.m-chaya .tel{font-size:.82rem}\n.m-chaya .hero{background:#fff;color:var(--ink);min-height:540px}\n.m-chaya .hero-bg{opacity:.3}.m-chaya .hero-bg:after{background:linear-gradient(#fff,rgba(255,255,255,0) 35%,#fff)}\n.m-chaya .hero-g{display:grid;grid-template-columns:1fr 1.25fr;align-items:center;gap:30px;min-height:540px}\n.m-chaya .hero h1{font-size:2.4rem;font-size:clamp(1.8rem,4.2cqi,3rem);font-weight:600}.m-chaya .hero small{color:var(--mut);font-size:.9rem}\n.m-chaya .btn{border-radius:0;background:var(--p)}\n.m-chaya .cupart{height:430px;-webkit-mask-image:radial-gradient(closest-side,#000 62%,transparent);mask-image:radial-gradient(closest-side,#000 62%,transparent)}\n.m-chaya .kinds h2{text-align:center;font-weight:500;font-size:1.9rem}\n.m-chaya .kd{display:flex;gap:34px;justify-content:center;flex-wrap:wrap;margin-top:34px}.m-chaya .kd-i{text-align:center;width:150px;font-size:.85rem}\n.m-chaya .bowl{display:block;width:150px;height:150px;border-radius:50%;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.14);margin-bottom:12px;border:5px solid #fff}\n.m-chaya .sp2{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}.m-chaya .sp-img{height:400px;border-radius:24px}\n.m-chaya .soft{background:#f7f9ef}.m-chaya .soft2{background:#fff}\n.m-chaya .pc{border-radius:0;border:0;background:#faf9f4}\n.m-chaya .ft.light{background:#f4f1e8;color:var(--ink)}.m-chaya .ft.light h4{color:var(--ink)}.m-chaya .ft.light p,.m-chaya .ft.light .ft-bot{color:var(--mut)}.m-chaya .ft.light .brand.inv{color:var(--ink)}.m-chaya .ft.light .bt small{color:var(--mut)}.m-chaya .ft.light .soc{background:rgba(0,0,0,.08)}\n\n/* ===== 5. OOLONG ===== */\n.m-oolong{--p:#7d9a2b;--a:#6b3f26;background:#8a9a2a;min-height:100vh}\n.m-oolong .bgf{position:absolute;inset:0;z-index:0}.m-oolong .bgf .im{background-attachment:fixed}\n.m-oolong .paper{position:relative;z-index:1;max-width:880px;margin:0 auto;background:rgba(255,255,255,.95);padding:24px 30px 0;box-shadow:0 0 70px rgba(0,0,0,.3)}\n.m-oolong .hd{background:transparent}.m-oolong .hd-top{display:flex;align-items:center;justify-content:space-between;gap:12px}\n.m-oolong .hd .socs{margin:0}.m-oolong .hd .soc{background:#fff;border:1px solid #c9d68a;color:var(--p)}\n.m-oolong .nav{margin:14px 0 6px}.m-oolong .nv{justify-content:center;flex-wrap:wrap}\n.m-oolong .nv>li>a{border:1.5px solid #b9c76a;border-radius:99px;padding:5px 16px;font-size:.8rem;font-weight:500;font-family:var(--hf)}.m-oolong .nv>li.cur>a{background:#fff;color:var(--p)}\n.m-oolong .col{position:relative;margin:30px 0}\n.m-oolong .col>.hero-bg{position:absolute;inset:0;opacity:.16;border-radius:20px;overflow:hidden}\n.m-oolong .collage{position:relative;height:430px}\n.m-oolong .cir{position:absolute;border-radius:50%;overflow:hidden;border:3px solid #fff;box-shadow:0 8px 22px rgba(0,0,0,.25)}\n.m-oolong .c0{left:2%;top:70px;width:220px;height:220px}.m-oolong .c1{left:42%;top:6px;width:130px;height:130px}.m-oolong .c2{right:4%;top:150px;width:200px;height:200px}\n.m-oolong .pile{position:absolute;left:29%;top:110px;width:250px;height:250px;border-radius:50%;box-shadow:0 8px 22px rgba(0,0,0,.2);border:3px solid #fff}\n.m-oolong .lab{position:absolute;font-size:.78rem;max-width:180px;line-height:1.4}.m-oolong .l0{left:0;top:6px}.m-oolong .l1{right:6%;top:0;text-align:right}.m-oolong .l2{left:30%;bottom:0}\n.m-oolong .lab b{display:block;font-family:var(--hf);font-size:1.02rem;color:var(--ink)}.m-oolong .lab small{color:var(--mut);font-style:italic}\n.m-oolong .pill{border-radius:90px;overflow:hidden;min-height:170px;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center}\n.m-oolong .pill-bg{position:absolute;inset:0}.m-oolong .pill-bg:after{content:'';position:absolute;inset:0;background:rgba(70,40,20,.62)}\n.m-oolong .pill-in{position:relative;z-index:2;padding:26px 50px}.m-oolong .pill-in h3{margin:0 0 6px;color:#fff}.m-oolong .pill-in p{color:#f3e8da;margin:0 0 10px;font-size:.84rem}\n.m-oolong .mid{text-align:center;font-weight:600;font-size:1.4rem}\n.m-oolong .gp5{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;margin-top:20px}\n.m-oolong .p5{display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px;font-size:.78rem;font-weight:700;font-family:var(--hf)}\n.m-oolong .p5-im{display:block;width:100%;aspect-ratio:1;border-radius:10px;overflow:hidden;border-bottom:3px solid #b9c76a}.m-oolong .p5-im .im{height:100%}\n.m-oolong .go{width:30px;height:30px;border-radius:50%;border:1.5px solid #b9c76a;display:grid;place-items:center;color:var(--p)}\n.m-oolong .more{display:block}.m-oolong .more h3{font-size:1.2rem;color:var(--p)}.m-oolong .potart{height:170px;border-radius:24px;margin-top:10px}\n.m-oolong .btn.out{color:var(--p)}.m-oolong .pill .btn.out{color:#fff}\n.m-oolong .faq.inl{padding:0}.m-oolong .faq .wrap{padding:0}.m-oolong details{background:#fbfaf3}\n.m-oolong .ft{background:#f1ecdc;color:var(--ink);margin:30px -30px 0;padding:26px 30px 0}.m-oolong .ft .ft-in{display:block;padding:0 0 18px}.m-oolong .ft-bot{color:var(--mut);border-color:#ddd5bd}\n\n/* ===== 6. GARTEN ===== */\n.m-garten{--p:#2f8f2f;--a:#f6c000}\n.m-garten .hd{border-bottom:1px solid #e8efe3}.m-garten .btn.g{background:var(--p)}\n.m-garten .hero{min-height:540px;display:grid;place-items:center;text-align:center}\n.m-garten .hero-bg:after{background:rgba(40,130,40,.8)}\n.m-garten .hero h1{font-size:3rem;font-size:clamp(2.2rem,7.4cqi,4.8rem);text-transform:uppercase;letter-spacing:.04em;font-weight:700;color:#fff;max-width:14ch;margin:0 auto .4em}\n.m-garten .mark{font-size:3.2rem;margin-bottom:6px}.m-garten .hero-in{padding:0 28px}\n.m-garten .chip{display:inline-block;border:1.5px solid rgba(255,255,255,.75);border-radius:8px;padding:6px 22px;letter-spacing:.2em;text-transform:uppercase;font-size:.72rem}\n.m-garten .gt-g{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}.m-garten .gt-g.r{grid-template-columns:1fr 1.1fr}\n.m-garten .gt-img{height:430px;border-radius:16px}.m-garten .gbar{display:flex;align-items:center;gap:16px;background:var(--p);color:#fff;padding:18px 22px;margin-top:26px;border-radius:8px}.m-garten .gbar b{font-size:1.8rem}\n.m-garten h2{font-size:2.2rem;font-size:clamp(1.7rem,3.6cqi,2.5rem);font-weight:700}\n.m-garten .leafmask{height:470px;border-radius:0 190px 0 190px}\n.m-garten .chk li{background:#fff;border:1px solid #e2eedb;padding:12px 14px;border-radius:6px;box-shadow:0 4px 14px rgba(40,100,40,.06)}.m-garten .chk li.y .ic{color:var(--a)}\n.m-garten .s3 .wrap{position:relative}.m-garten .tiles-bg{height:370px;border-radius:12px}\n.m-garten .tiles{display:grid;grid-template-columns:repeat(3,1fr);margin:-130px 24px 0;position:relative}\n.m-garten .tile{padding:28px;color:#fff;background:var(--p)}.m-garten .tile.t1{background:#3fae3f}.m-garten .tile.t2{background:var(--a);color:#1b2a12}.m-garten .tile p{color:inherit;opacity:.92;margin:0;font-size:.9rem}.m-garten .tile .ic{font-size:1.8rem;margin-bottom:10px}\n.m-garten .gal.round .gl{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.m-garten .gi{height:250px;border-radius:24px}\n.m-garten .steps.gdk{background:var(--p);color:#fff}.m-garten .steps.gdk .sp-i{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}.m-garten .steps.gdk p{color:#e2f2e2}.m-garten .steps.gdk .eb{color:var(--a)}\n.m-garten .gp{background:#f4faf0}\n.m-garten .cta.green{background:var(--p);color:#fff}.m-garten .cta.green p{color:#e2f2e2}.m-garten .ft.green{background:#1f6b1f}\n\n/* ===== 7. LAWN ===== */\n.m-lawn{--p:#8a9a2c;--a:#233640}\n.m-lawn .hero{min-height:640px}\n.m-lawn .hero-bg:after{background:rgba(15,28,20,.62)}\n.m-lawn .hd.float{position:absolute;top:22px;left:5%;right:5%;background:#fff;border-radius:22px;color:var(--a);z-index:5;box-shadow:0 10px 34px rgba(0,0,0,.2)}\n.m-lawn .hd.float .hd-in{padding:0 22px;min-height:70px}.m-lawn .bm{background:var(--p)}\n.m-lawn .btn.olv{background:var(--p);color:#fff;border-radius:99px}\n.m-lawn .hero-in{text-align:center;padding:220px 28px 130px;max-width:900px;margin:0 auto}\n.m-lawn .hero h1{font-size:3rem;font-size:clamp(2rem,6cqi,4rem);color:#fff}.m-lawn .hero h1 em{display:block;font-style:italic;font-weight:400;font-size:.5em;opacity:.9;margin-bottom:8px}.m-lawn .hero p{color:#e8eee0;max-width:56ch;margin:0 auto 1.4em}\n.pillt{display:inline-block;border:1px solid #d7dcc0;border-radius:99px;padding:4px 14px;font-size:.78rem;margin-bottom:10px;color:inherit}\n.m-lawn .svc-h h2{color:var(--p);font-size:2.2rem}.m-lawn .svc-g{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:20px}\n.m-lawn .sv{position:relative;background:#fff;border:1px solid #e7ecd2;border-radius:16px;padding:162px 20px 24px;text-align:center}\n.m-lawn .sv-im{position:absolute;top:18px;left:50%;transform:translateX(-50%);width:130px;height:130px;border-radius:50%}\n.m-lawn .sv-i{position:absolute;top:122px;left:50%;transform:translateX(-50%);width:34px;height:34px;border-radius:50%;background:var(--p);color:#fff;display:grid;place-items:center;z-index:2}\n.m-lawn .sv h3{font-size:1.05rem}.m-lawn .sv p{font-size:.86rem}\n.m-lawn .slate{background:var(--a);color:#fff}.m-lawn .slate p{color:#c9d6da}.m-lawn .slate h2{font-size:2.1rem}\n.m-lawn .sl-g{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center}\n.m-lawn .hexs{position:relative;height:450px}\n.m-lawn .hx{position:absolute;width:250px;height:290px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}.m-lawn .hx1{left:4%;top:0}.m-lawn .hx2{right:4%;top:70px}.m-lawn .hx3{left:27%;top:165px}\n.m-lawn .mini{display:grid;grid-template-columns:1fr 1fr;gap:16px}.m-lawn .mini div{background:rgba(255,255,255,.07);border-radius:12px;padding:16px}.m-lawn .mini span{color:var(--p);font-size:1.4rem}.m-lawn .mini p{margin:0;font-size:.82rem}\n.m-lawn .reas{background:#f6f8ea}.m-lawn .reas .sp-i{text-align:center;border-color:#e3e9c9}.m-lawn .reas .num{background:var(--p);color:#fff}\n.m-lawn .stats.olive{background:var(--p);color:#fff}\n.m-lawn .mosaic .gl{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:150px;gap:12px}.m-lawn .mosaic .gi{height:auto;border-radius:8px}.m-lawn .mosaic .gi:nth-child(1){grid-row:span 2;grid-column:span 2}.m-lawn .mosaic .gi:nth-child(4){grid-row:span 2}\n.m-lawn .pr3{grid-template-columns:repeat(3,1fr)}.m-lawn .plan{background:#fff;border:1px solid #e3e8cb;border-radius:18px;padding:30px;text-align:center}.m-lawn .plan.hot{background:var(--a);color:#fff;transform:translateY(-10px)}.m-lawn .plan.hot p{color:#c9d6da}.m-lawn .plan.hot .amt{color:var(--p)}\n.m-lawn .amt{display:block;font-size:1.7rem;color:var(--p);font-family:var(--hf);margin:10px 0}.m-lawn .plan small{text-transform:uppercase;letter-spacing:.1em;font-size:.7rem}\n.m-lawn .ft.dark{background:#1b2a30}\n\n/* ===== 8. KABUT ===== */\n.m-kabut{--p:#52634f;--a:#8fa38a;--ink:#eef2ea;--mut:#dbe3d6;--bg:#52634f;background:#52634f;color:#eef2ea}\n.m-kabut .shell{display:grid;grid-template-columns:96px 1fr}\n.m-kabut .rail{background:#7c8f78;display:flex;flex-direction:column;align-items:center;gap:18px;padding:26px 8px;text-align:center;font-size:.76rem}\n.m-kabut .rail .n{font-size:2rem;color:#3a4a37}.m-kabut .rail .vt{writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:.22em;font-size:.62rem;text-transform:uppercase}\n.m-kabut .rail .socs{flex-direction:column}\n.m-kabut .hero{min-height:540px;display:flex;align-items:flex-end}\n.m-kabut .hero-bg:after{background:linear-gradient(180deg,rgba(40,58,38,.6),rgba(40,58,38,0) 30%),linear-gradient(0deg,rgba(55,72,52,.78),rgba(255,255,255,0) 60%)}\n.m-kabut .hd{position:absolute;top:0;left:0;right:0;background:transparent;color:#fff}\n.m-kabut .hd-in{margin:0 28px;border-bottom:1px solid rgba(255,255,255,.45);min-height:62px}\n.m-kabut .sub{font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;white-space:nowrap}\n.m-kabut .nv a{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;font-weight:500}.m-kabut .nv>li.cur>a{box-shadow:inset 0 -2px #fff;border-radius:0}.m-kabut .nv>li>a:hover{color:#fff}\n.m-kabut .hero-in{margin-left:auto;text-align:right;padding:140px 56px 60px;max-width:660px}\n.m-kabut .hero h1{letter-spacing:.14em;text-transform:uppercase;font-size:2.4rem;font-size:clamp(1.5rem,4.2cqi,2.7rem);font-weight:600;color:#fff}.m-kabut .hero p{color:#eef2ea;font-size:.88rem}\n.m-kabut .btn.rd{border-radius:99px;background:rgba(40,60,38,.85);color:#fff;font-weight:500;font-size:.8rem}\n.m-kabut .ls{letter-spacing:.3em;text-transform:uppercase;font-size:1rem;text-align:center;font-weight:600;display:block;margin-bottom:22px}.m-kabut .ls span{color:#3b4b38}\n.m-kabut .sec{padding:70px 0}\n.m-kabut .ab-g{display:grid;grid-template-columns:1fr auto;gap:44px;align-items:center}.m-kabut .ab-tx h3{font-size:1.15rem}.m-kabut .ab-tx p{font-size:.88rem}\n.m-kabut .im.sq{width:250px;height:250px;box-shadow:0 14px 34px rgba(0,0,0,.35)}\n.m-kabut .panels{display:grid;grid-template-columns:repeat(4,1fr);margin-top:26px}.m-kabut .pn{position:relative;height:380px;overflow:hidden}.m-kabut .pn .im{position:absolute;inset:0;transition:transform .5s}.m-kabut .pn:hover .im{transform:scale(1.06)}\n.m-kabut .pv{position:absolute;left:14px;bottom:14px;writing-mode:vertical-rl;transform:rotate(180deg);font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;z-index:2;color:#fff}\n.m-kabut .big-g{display:grid;grid-template-columns:auto 1fr;gap:34px;align-items:center}.m-kabut .bn{font-size:6rem;font-size:clamp(3.4rem,14cqi,9rem);font-weight:800;line-height:1;color:transparent;-webkit-text-stroke:2px #cddcc7;font-family:'Noto Serif SC','Montserrat',serif}.m-kabut .big-g .ls{text-align:left}\n.m-kabut .pc{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14);color:#fff;border-radius:0}.m-kabut .price{color:#d4e5cd}.m-kabut .btn.mini{background:#7c8f78;border-radius:99px}\n.m-kabut .sh h2{letter-spacing:.2em;text-transform:uppercase;font-size:1.1rem;text-align:center}.m-kabut .sh.ls{max-width:none}.m-kabut .sh{max-width:none}\n.m-kabut .sp-i{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}.m-kabut .num{background:#cddcc7;color:#3b4b38}\n.m-kabut details{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}\n.m-kabut .ft{background:#3f4f3c}.m-kabut .ft-in{display:block;padding:0 28px 20px}.m-kabut .ft .ct{max-width:520px}\n\n/* ===== 9. KEDAI ===== */\n.m-kedai{--p:#7a9a12;--a:#c0501f;--bg:#f3f3f1}\n.m-kedai .util{background:#111;color:#ccc;font-size:.74rem}.m-kedai .util .wrap{display:flex;justify-content:space-between;padding:8px 28px}.m-kedai .u-r a{margin-left:16px}\n.m-kedai .hd{background:linear-gradient(#fff,#f3f3f1)}\n.m-kedai .brand.big .bm{width:58px;height:58px}.m-kedai .brand.big .bt b{font-size:1.7rem;font-family:'Lora',serif;font-style:italic}\n.m-kedai .srch{margin-left:auto;display:flex;align-items:center;justify-content:space-between;gap:30px;background:#fff;border:1px solid #ddd;padding:10px 16px;width:250px;color:#777;font-style:italic;font-size:.85rem}\n.m-kedai .cart{display:flex;gap:8px;align-items:center;background:var(--p);color:#fff;padding:10px 18px;border-radius:6px 6px 0 0;font-size:.85rem}.m-kedai .cart i{opacity:.8}\n.m-kedai .nav.dk{background:#222;margin:0}.m-kedai .nav.dk .nv{gap:0}.m-kedai .nav.dk .nv>li>a{color:#fff;text-transform:uppercase;font-size:.82rem;padding:14px 18px;border-radius:0}.m-kedai .nav.dk .nv>li.cur>a,.m-kedai .nav.dk .nv>li>a:hover{color:#c8e04a}\n.m-kedai .hero{min-height:320px;display:flex;align-items:center}.m-kedai .hero-bg:after{background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0))}\n.m-kedai .hero h1{font-style:italic;font-size:3rem;font-size:clamp(2rem,6cqi,3.8rem);color:#fff;font-weight:400}.m-kedai .hero h1 small{display:block;font-size:.4em;color:#eaf5b0;margin-bottom:6px}.m-kedai .hero p{color:#eee;max-width:48ch}\n.m-kedai .btn.lnk{background:none;color:#e5ff7a;text-decoration:underline;padding:0}\n.m-kedai .shop{background:#fff}.m-kedai .sh-g{display:grid;grid-template-columns:230px 1fr;gap:30px}\n.m-kedai .side h4{font-size:1.25rem;font-style:italic;font-weight:400}.m-kedai .side ul{list-style:none;padding:0;margin:0 0 22px}.m-kedai .side li{padding:9px 0;border-bottom:1px solid #ddd;color:#666;font-style:italic;font-size:.9rem}.m-kedai .side p{font-size:.85rem}\n.m-kedai .stt{font-size:1.5rem;font-style:italic;font-weight:400}\n.m-kedai .pc{border-radius:0;text-align:center}.m-kedai .pc-i{margin:12px 12px 0;border:1px solid #ddd}.m-kedai .pc-b h3{color:var(--p);font-style:italic;font-weight:400;font-size:.95rem}.m-kedai .pc-f{flex-direction:column;gap:8px}.m-kedai .price{font-size:1.25rem;color:#222}.m-kedai .btn.mini{background:var(--a);border-radius:2px}.m-kedai .tag{background:var(--p);color:#fff;border-radius:0}\n.m-kedai .plainf{background:#f3f3f1}.m-kedai .fc{border-radius:0;background:#fff}.m-kedai .fc-ic{border-radius:0;background:#222;color:#c8e04a}.m-kedai .kd2{background:#fff}.m-kedai .kd2 .sp-i{border-radius:0}.m-kedai .num{background:var(--p);color:#fff}\n.m-kedai .ft.dark{background:#1a1a1a}\n\n/* ===== 10. REMPAH ===== */\n.m-rempah{--p:#7cb342;--a:#222}\n.m-rempah .hd-in{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;min-height:84px}\n.m-rempah .srch{border-bottom:2px solid #222;display:flex;justify-content:space-between;padding:6px 0;max-width:240px;color:#777;font-size:.84rem}\n.m-rempah .brand.ctr{justify-self:center}.m-rempah .brand .bt b{font-size:1.5rem}.m-rempah .bm{background:#fff;color:var(--p);border:2px solid var(--p);border-radius:50%}\n.m-rempah .hd-r{justify-self:end;display:flex;align-items:center;gap:10px;font-size:.76rem;color:#333}\n.m-rempah .nav.bk{background:#222;margin:0}.m-rempah .nav.bk .nv{width:100%;gap:0}.m-rempah .nav.bk .nv>li{flex:1;text-align:center;border-left:1px dashed #666}.m-rempah .nav.bk .nv>li:first-child{border-left:0}\n.m-rempah .nav.bk .nv>li>a{justify-content:center;color:#fff;text-transform:uppercase;font-size:.8rem;padding:14px;border-radius:0;font-weight:500}.m-rempah .nav.bk .nv>li.cur>a{background:var(--p);color:#fff}\n.m-rempah .hero.wood{background:repeating-linear-gradient(90deg,#f3f2ef 0 58px,#e8e7e2 58px 60px);height:230px}\n.m-rempah .hero-in{position:relative;height:230px;max-width:1000px}\n.m-rempah .pk{position:absolute;left:33%;top:-4px;width:110px;height:140px;transform:rotate(-6deg);box-shadow:0 10px 22px rgba(0,0,0,.28)}\n.m-rempah .scr{position:absolute;left:54%;top:34px;font-family:'Lora',serif;font-style:italic;color:#444}.m-rempah .scr span{font-size:.9rem;color:#777}.m-rempah .scr h1{display:block;margin:0;font-size:1.9rem;font-weight:400;max-width:12ch;line-height:1.15;color:#444}\n.m-rempah .bowl1{position:absolute;left:6%;top:36px;width:130px;height:130px;border-radius:50%;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.25)}\n.m-rempah .rp-g{display:grid;grid-template-columns:210px 1fr;gap:30px}\n.m-rempah .side h4{font-size:1.05rem;text-transform:uppercase;font-weight:400;letter-spacing:.03em}.m-rempah .side ul{list-style:none;padding:0;margin:0 0 22px}.m-rempah .side li{padding:3px 0;font-size:.85rem;color:#444}.m-rempah .side li.hl{color:#e8a200}\n.m-rempah .az{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:22px}.m-rempah .az span{border:1px solid #ccc;text-align:center;font-size:.68rem;padding:2px 0;color:#555}.m-rempah .az span.on{background:#ffe8a0;border-color:#e8a200}\n.m-rempah .crumb{font-size:.7rem;color:#888;margin-bottom:6px}.m-rempah .stt{font-size:1.5rem;text-transform:uppercase;font-weight:400;letter-spacing:.02em}\n.m-rempah .pg.sq .pc{border:0;border-radius:0;background:none}.m-rempah .pc-i{aspect-ratio:1;border:1px solid #ddd}.m-rempah .pc h3{font-size:.9rem;font-weight:400;margin:8px 0}.m-rempah .price{color:var(--p);font-size:1.4rem;font-weight:400}\n.m-rempah .btn.mini.out{color:#444;border:1px solid #888;border-radius:2px;font-weight:500}\n.m-rempah .news{background:#222;color:#fff;padding:28px 0}.m-rempah .news-in{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}.m-rempah .news h3{margin:0}.m-rempah .news h3 b{color:var(--p)}.m-rempah .news p{margin:0;color:#bbb}.m-rempah .btn.grn{background:var(--p);border-radius:0}\n.m-rempah .plainf{background:#fff}.m-rempah .fc{border-radius:0}.m-rempah .fc-ic{border-radius:0;background:#222;color:var(--p)}\n.m-rempah .ft.dark{background:#222}\n\n/* ===== 11. CHUN ===== */\n.m-chun{--p:#2e6b3a;--a:#c8442f;--ink:#17331f;--bg:#f6f0e2}\n.m-chun .hd{background:#f6f0e2}.m-chun .bm{background:var(--a);border-radius:50%}\n.m-chun .hero{min-height:560px;display:grid;place-items:center;text-align:center;color:var(--ink)}\n.m-chun .hero-bg:after{background:linear-gradient(rgba(246,240,226,.82),rgba(246,240,226,.15) 45%,#f6f0e2)}\n.m-chun .ghost{position:absolute;right:8%;top:30px;font-size:15rem;font-family:'Noto Serif SC',serif;color:rgba(46,107,58,.14);line-height:1;font-weight:700;pointer-events:none}\n.m-chun .hero-in{padding:0 28px;max-width:860px}.m-chun .hero h1{font-size:3rem;font-size:clamp(2.1rem,6cqi,4rem);font-weight:700;color:var(--ink)}.m-chun .hero p{color:#3a4b3d}.m-chun .eb{color:var(--a)}\n.m-chun .btn.ink{background:#17331f;border-radius:0}\n.m-chun .in-g{display:grid;grid-template-columns:1fr 1.2fr;gap:50px;align-items:center}.m-chun .frame{border:2px solid #17331f;padding:10px;background:#fff}.m-chun .frame .im{height:390px}\n.m-chun .gp{display:grid;grid-template-columns:1fr 1fr;gap:14px}.m-chun .gpc{background:var(--p);color:#fff;padding:16px;border-radius:4px}.m-chun .gpc p{color:#d8e8d8;margin:4px 0 0;font-size:.85rem}.m-chun .gpc span{color:#d4e86a;font-size:1.3rem}\n.m-chun .rw{display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:stretch;margin-bottom:30px}.m-chun .rw.rv .frame{order:2}.m-chun .rw .frame .im{height:280px}\n.m-chun .gpanel{background:var(--p);color:#fff;padding:36px;display:flex;flex-direction:column;justify-content:center}.m-chun .gpanel b{font-size:1.4rem;font-family:var(--hf);margin-bottom:8px}.m-chun .gpanel p{color:#dcebdc;margin:0}\n.m-chun .tiles .pg{grid-template-columns:repeat(4,1fr)}.m-chun .pc{border-radius:0;border:1px solid #17331f}.m-chun .price{background:var(--p);color:#fff;padding:2px 10px;font-size:.8rem}.m-chun .btn.mini{background:#17331f;border-radius:0}\n.m-chun .leafy{background:#e4ead8}.m-chun .sp-i{border-radius:0;border:1.5px solid #17331f;background:#fff}.m-chun .num{background:var(--a);color:#fff}\n.m-chun .ink3 .gl{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.m-chun .ink3 .gi{height:240px;border:2px solid #17331f;border-radius:0}\n.m-chun .cta.ink{background:#17331f;color:#fff}.m-chun .cta.ink p{color:#cfe0d2}.m-chun .cta.ink .btn{background:var(--a)}.m-chun .ft.ink{background:#0f2415}\n.m-chun details{border-radius:0;border-color:#17331f}\n\n/* ===== Responsif (berbasis lebar wadah, jadi pratinjau HP di admin ikut benar) ===== */\n@container site (max-width:900px){\n  .hb{display:inline-grid;place-items:center}\n  .nav{display:none;position:absolute;left:0;right:0;top:100%;background:#fff;color:#16301c;padding:10px 20px 20px;box-shadow:0 18px 34px rgba(0,0,0,.22);margin:0;z-index:60}\n  .nv-open .nav{display:block}\n  .nv{flex-direction:column;align-items:stretch;gap:0}\n  .nv>li>a{padding:12px 6px;color:#16301c!important;border-bottom:1px solid #eee;justify-content:space-between}\n  .nv .sub{position:static;box-shadow:none;padding:0 0 0 14px;display:none;background:none}.nv li:hover>.sub{display:none}.nv li.open>.sub{display:block}\n  .hd-in{gap:12px}\n  .fg,.sg,.sp,.mi-g{grid-template-columns:repeat(2,1fr)}.pg,.tg,.g3{grid-template-columns:1fr 1fr}.tiles .pg{grid-template-columns:1fr 1fr}\n  .ft-in{grid-template-columns:1fr 1fr}\n  .sec{padding:60px 0}\n  .m-donal .dn-g,.m-josie .ab-g,.m-josie .hero-g,.m-terrain .wy-g,.m-chaya .hero-g,.m-chaya .sp2,.m-garten .gt-g,.m-garten .gt-g.r,.m-lawn .sl-g,.m-chun .in-g,.m-kedai .sh-g,.m-rempah .rp-g{grid-template-columns:1fr}\n  .m-josie .hero-i{height:320px;border-radius:24px}.m-josie .ab-im{height:380px}\n  .m-terrain .pj{grid-template-columns:1fr}.m-terrain .pjc,.m-terrain .pjc:nth-child(2){height:260px}.m-terrain .glass{position:relative;right:auto;bottom:auto;width:auto;margin:0 20px 20px}.m-terrain .hero-card{flex-direction:column;justify-content:flex-end}\n  .m-chaya .hd-in{grid-template-columns:auto 1fr auto}.m-chaya .hd-r .tel{display:none}.m-chaya .cupart{height:260px}\n  .m-oolong .gp5{grid-template-columns:repeat(2,1fr)}.m-oolong .collage{height:560px}.m-oolong .c0{top:60px;width:170px;height:170px}.m-oolong .c2{top:250px;width:160px;height:160px}.m-oolong .pile{left:22%;top:310px;width:200px;height:200px}.m-oolong .l2{bottom:0}.m-oolong .pill{border-radius:40px}\n  .m-garten .tiles{grid-template-columns:1fr;margin:-80px 14px 0}.m-garten .gal.round .gl{grid-template-columns:1fr 1fr}.m-garten .gt-img{height:300px}.m-garten .leafmask{height:300px}\n  .m-lawn .svc-g{grid-template-columns:1fr 1fr}.m-lawn .pr3{grid-template-columns:1fr}.m-lawn .hexs{height:360px}.m-lawn .hx{width:170px;height:198px}.m-lawn .hx3{left:30%;top:110px}.m-lawn .mosaic .gl{grid-template-columns:1fr 1fr}.m-lawn .hd.float{left:3%;right:3%}\n  .m-kabut .shell{grid-template-columns:1fr}.m-kabut .rail{flex-direction:row;justify-content:space-between;padding:12px 16px}.m-kabut .rail .vt{writing-mode:horizontal-tb;transform:none}.m-kabut .rail .socs{flex-direction:row;margin:0}.m-kabut .hero-in{padding:120px 24px 40px;text-align:left;margin-left:0}.m-kabut .panels{grid-template-columns:1fr 1fr}.m-kabut .ab-g{grid-template-columns:1fr}.m-kabut .im.sq{width:100%}\n  .m-kedai .srch{display:none}.m-kedai .cart{margin-left:auto}.m-kedai .nav.dk,.m-rempah .nav.bk{position:static;box-shadow:none;padding:0;display:none}.m-kedai .nv-open .nav.dk,.m-rempah .nv-open .nav.bk{display:block}\n  .m-kedai .nav.dk .nv>li>a,.m-rempah .nav.bk .nv>li>a{color:#fff!important;border-bottom:1px solid #444}.m-rempah .nav.bk .nv>li{border-left:0}\n  .m-rempah .hd-in{grid-template-columns:auto 1fr auto}.m-rempah .srch{display:none}.m-rempah .brand.ctr{justify-self:start}.m-rempah .hd-r a{display:none}\n  .m-rempah .pk{left:46%}.m-rempah .scr{left:6%;top:150px}.m-rempah .scr h1{font-size:1.3rem}.m-rempah .bowl1{width:90px;height:90px;left:3%}.m-rempah .hero.wood,.m-rempah .hero-in{height:280px}\n  .m-chun .rw{grid-template-columns:1fr}.m-chun .rw.rv .frame{order:0}.m-chun .ghost{font-size:9rem}\n  .m-donal .band .g3{grid-template-columns:1fr}.m-donal .tb-c{display:none}\n}\n@container site (max-width:560px){\n  .fg,.sg,.sp,.mi-g,.pg,.tg,.g3,.ft-in,.tiles .pg{grid-template-columns:1fr}\n  .wrap{padding:0 18px}\n  .m-donal .hero h1{font-size:2.1rem}\n  .m-lawn .svc-g{grid-template-columns:1fr}\n  .m-oolong .paper{padding:16px 14px 0}.m-oolong .ft{margin:30px -14px 0}.m-oolong .collage{height:620px}\n  .m-garten .gal.round .gl{grid-template-columns:1fr}\n  .m-chaya .kd{gap:18px}\n}\n\n/* AWS: header ponsel — brand tidak ditekan tombol; tombol Masuk tetap ada di menu & hero */\n@container site (max-width:560px){\n  .hd .btn{display:none!important}\n  .brand{gap:8px;min-width:0}\n  .brand img{height:30px}\n  .brand .bt b{font-size:.88rem!important;white-space:nowrap}\n  .brand .bt small{display:none}\n  .m-josie .tb{display:none}\n  .hd .phone,.m-kedai .cart,.m-rempah .hd-r{display:none!important}\n}\n\n/* AWS: logo selalu di atas latar putih agar terbaca di header/footer gelap */\n.brand img{box-sizing:content-box;height:38px;padding:4px 10px;background:#fff;border-radius:10px}\n";
  /* ---------- isi landing AWS Daily Report ----------
   * Hanya klaim yang benar menurut aplikasi. Tidak ada telepon/email/alamat pribadi, tidak ada testimoni karangan. */
  function awsContent() {
    var P = function (n, d, cat, art, tag) { return { name: n, desc: d, price: '', image: art, tag: tag || '', cat: cat }; };
    return {
      eyebrow: 'PT. Agri Wangi Sentosa',
      title: 'Laporan Harian Kebun Teh, Rapi dalam Satu Tempat',
      subtitle: 'AWS Daily Report mengumpulkan absensi dan produksi dari Excel harian, lalu menyajikannya per orang, mandor, asisten, dan divisi, lengkap dengan penilaian otomatis.',
      cta: { label: 'Masuk ke Aplikasi', link: '#/masuk' }, cta2: { label: 'Lihat Fitur', link: '#/s/fitur' },
      hero: ['art:terrace:day:1', 'art:picker:gold:2', 'art:terrace:mist:3'], video: '',
      about: {
        eyebrow: 'Tentang Aplikasi', title: 'Dari Excel Harian ke Laporan yang Siap Dibaca',
        text: 'Setiap hari satu berkas Excel diunggah. Aplikasi mengekstrak data absensi dan produksi, menghitungnya dengan rumus yang sama seperti di Excel, lalu menampilkannya sebagai dashboard, tabel, dan grafik.',
        text2: 'Hasilnya dapat dilihat per hari, minggu, bulan, tahun, atau periode gaji 26–25, dan diunduh sebagai PDF, PowerPoint, Excel, atau CSV.',
        image: 'art:terrace:day:4', image2: 'art:factory:gold:5',
        bullets: ['Tanpa input ulang, data langsung dari Excel harian', 'Per orang, mandor, asisten, dan divisi', 'Penilaian otomatis dengan ambang yang dapat diubah'],
        badge: { num: '26–25', label: 'Periode gaji' }
      },
      featuresTitle: { eyebrow: 'Fitur', title: 'Yang Bisa Anda Lakukan', text: 'Semua yang dibutuhkan untuk memantau kebun dan pabrik setiap hari.' },
      features: [
        { icon: 'sun', title: 'Dashboard Menyeluruh', text: 'Produksi, grade, kehadiran, dan mangkir dalam satu layar untuk periode apa pun.', image: 'art:terrace:day:6' },
        { icon: 'users', title: 'Absensi Akurat', text: 'Dihitung dari data Excel dengan rumus yang sama, per orang hingga divisi.', image: 'art:picker:day:7' },
        { icon: 'leaf', title: 'Produksi & Grade', text: 'Budget, realisasi, selisih, dan komposisi Grade I–III untuk tiap mandor dan divisi.', image: 'art:leaf:day:8' },
        { icon: 'shield', title: 'Isu & Rekomendasi', text: 'Aturan penilaian otomatis, plus rekomendasi yang dapat Anda sunting sendiri.', image: 'art:factory:day:9' }],
      stats: [{ num: '1', label: 'Excel per Hari' }, { num: '26–25', label: 'Periode Gaji' }, { num: '4', label: 'Format Ekspor' }, { num: '11', label: 'Pilihan Tampilan' }],
      productsTitle: { eyebrow: 'Modul', title: 'Menu di dalam Aplikasi', text: 'Setiap menu menjawab satu kebutuhan laporan harian.' },
      products: [
        P('Dashboard', 'Ringkasan produksi dan kehadiran.', 'Pantau', 'art:terrace:day:11', 'Utama'),
        P('Absensi', 'Kehadiran per orang dan Tampilan Excel.', 'Pantau', 'art:picker:gold:12'),
        P('Produksi', 'Budget dan realisasi per mandor.', 'Pantau', 'art:leaf:day:13'),
        P('Grade', 'Komposisi Grade I–III.', 'Pantau', 'art:tea:green:14'),
        P('Kemandoran', 'Rekap per mandor dengan penilaian.', 'Analisis', 'art:picker:day:15'),
        P('Asisten & Divisi', 'Rekap per asisten, divisi, dan sub.', 'Analisis', 'art:terrace:gold:16'),
        P('Isu & Rekomendasi', 'Temuan otomatis yang dapat disunting.', 'Analisis', 'art:factory:mist:17'),
        P('Unggah Excel', 'Satu berkas per hari, data lama ditimpa aman.', 'Kelola', 'art:box:day:18'),
        P('Ekspor & Email', 'PDF, PowerPoint, Excel, CSV, dan email harian.', 'Kelola', 'art:cup:day:19'),
        P('Pengguna & Peran', 'Akses sesuai peran masing-masing.', 'Kelola', 'art:tea:black:20')],
      steps: {
        eyebrow: 'Alur Kerja', title: 'Dari Excel ke Laporan',
        items: [
          { title: 'Unggah Excel', text: 'Satu berkas untuk hari yang dipilih.' },
          { title: 'Data Diekstrak', text: 'Absensi dan produksi dibaca otomatis.' },
          { title: 'Dihitung & Dinilai', text: 'Rumus Excel dan aturan penilaian dijalankan.' },
          { title: 'Dibaca & Diekspor', text: 'Lihat di layar, unduh, atau kirim lewat email.' }]
      },
      gallery: { eyebrow: 'Suasana', title: 'Kebun dan Pabrik', images: ['art:terrace:day:21', 'art:picker:gold:22', 'art:factory:mist:23', 'art:leaf:day:24', 'art:terrace:gold:25', 'art:cup:day:26'] },
      testi: { title: '', items: [] },
      faq: {
        eyebrow: 'FAQ', title: 'Pertanyaan Umum',
        items: [
          { q: 'Bagaimana data masuk ke aplikasi?', a: 'Satu berkas Excel diunggah per hari. Aplikasi mengekstrak absensi dan produksi, dan data pada tanggal yang sama ditimpa dengan aman.' },
          { q: 'Apakah angkanya sama dengan Excel?', a: 'Ya. Rumus dan format angka mengikuti Excel, dan tabel dapat dibuka dalam Tampilan Excel.' },
          { q: 'Laporan apa yang bisa diunduh?', a: 'PDF, PowerPoint, Excel, dan CSV. Laporan harian juga dapat dikirim otomatis ke email.' },
          { q: 'Bagaimana mendapatkan akun?', a: 'Akun dibuat oleh administrator sistem. Hubungi administrator di perusahaan Anda.' }]
      },
      cta: { title: 'Siap Melihat Laporan Hari Ini?', text: 'Masuk dengan akun Anda untuk membuka dashboard, absensi, dan produksi.', label: 'Masuk ke Aplikasi', link: '#/masuk' },
      show: { about: true, features: true, stats: true, products: true, steps: true, gallery: true, testi: false, faq: true, cta: true }
    };
  }
  AWS.config = function (logo, versi) {
    return {
      brand: { name: 'AWS Daily Report', short: 'AWS Daily Report', tagline: 'PT. Agri Wangi Sentosa', logo: logo || '' },
      theme: { useBrand: false, primary: '#166534', accent: '#f4b81f' },
      contact: { address: 'Perkebunan & Pabrik Teh · PT. Agri Wangi Sentosa', phone: 'Khusus karyawan terdaftar', email: 'Hubungi administrator sistem Anda', hours: 'Laporan diperbarui setiap hari' },
      social: { instagram: '', facebook: '', youtube: '', whatsapp: '' },
      footer: { text: '© ' + new Date().getFullYear() + ' PT. Agri Wangi Sentosa · AWS Daily Report' + (versi ? ' v' + versi : '') },
      pages: [{ id: 'beranda' }],
      menu: [
        { label: 'Beranda', link: '#/', children: [] },
        { label: 'Fitur', link: '#/s/fitur', children: [] },
        { label: 'Modul', link: '#/s/modul', children: [] },
        { label: 'Alur Kerja', link: '#/s/alur', children: [] },
        { label: 'FAQ', link: '#/s/faq', children: [] },
        { label: 'Masuk', link: '#/masuk', children: [] }
      ]
    };
  };
  AWS.page = function (model) { return { id: 'beranda', title: 'Beranda', model: model, primary: '', accent: '', c: awsContent() }; };

  /* ---------- pemasangan, pemilih model, perilaku ---------- */
  var KLASIK = { k: 'klasik', n: 'Klasik AWS — Bawaan', d: 'Tampilan awal aplikasi yang sudah ada.', c: ['#166534', '#e3f1e8', '#0b2e1a'] };
  var KEY = 'awsl.model';
  var TARGET = { fitur: '.feat', modul: '.prod', alur: '.steps', faq: '.faq' };
  function valid(k) { return k === 'klasik' || AWS.MODELS.some(function (m) { return m.k === k; }); }
  /* urutan: pengaturan global dari server (boot.landing) -> salinan terakhir di browser -> APP_CONFIG.LANDING -> klasik */
  AWS.choice = function (fromBoot) {
    var k = fromBoot || '';
    if (!valid(k)) { try { k = localStorage.getItem(KEY) || ''; } catch (e) { } }
    if (!valid(k)) k = (window.APP_CONFIG && window.APP_CONFIG.LANDING) || '';
    return valid(k) ? k : 'klasik';
  };
  AWS.remember = function (k) { if (valid(k)) { try { localStorage.setItem(KEY, k); } catch (e) { } } };
  AWS.list = function () { return [KLASIK].concat(AWS.MODELS); };

  function stopTimers() { S.timers.forEach(clearInterval); S.timers = []; }
  AWS.stop = stopTimers;
  function startBehaviors(sr) {
    Array.prototype.forEach.call(sr.querySelectorAll('.slides'), function (el) {
      var n = el.children.length; if (n < 2) return; var i = 0;
      S.timers.push(setInterval(function () {
        if (!el.isConnected) return;
        el.children[i].classList.remove('on'); i = (i + 1) % n; el.children[i].classList.add('on');
      }, 5200));
    });
  }
  function bind(sr, lock) {
    sr.addEventListener('click', function (e) {
      var site = sr.querySelector('.site');
      if (e.target.closest('[data-act="menu"]')) { if (site) site.classList.toggle('nv-open'); return; }
      var a = e.target.closest('a'); if (!a) return;
      var h = a.getAttribute('href') || '';
      if (lock && h.indexOf('#/') === 0 && h !== '#/' && h.indexOf('#/s/') !== 0) { e.preventDefault(); return; }
      if (h === '#/' || h.indexOf('#/s/') === 0) {
        e.preventDefault(); if (site) site.classList.remove('nv-open');
        var t = h === '#/' ? null : sr.querySelector(TARGET[h.slice(4)] || '.none');
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* land: elemen #land; o = { logo, versi, klasik(el) } — klasik menggambar tampilan bawaan aplikasi */
  AWS.mount = function (land, o) {
    o = o || {}; stopTimers();
    var k = o.model && valid(o.model) ? o.model : AWS.choice(o.boot); land.innerHTML = '';
    function klasik() { k = 'klasik'; if (o.klasik) o.klasik(land); }
    if (k === 'klasik') klasik();
    else {
      try {
        AWS.loadFonts();
        var host = document.createElement('div'); host.className = 'lp-host';
        var sr = host.attachShadow({ mode: 'open' });
        sr.innerHTML = '<style>' + AWS.CSS + '</style>' + AWS.renderPage(AWS.config(o.logo, o.versi), AWS.page(k), { cur: '#/p/beranda' });
        land.appendChild(host); bind(sr, o.lock); startBehaviors(sr);
      } catch (e) { if (window.console) console.error('Landing model gagal, memakai Klasik:', e); land.innerHTML = ''; klasik(); }
    }
    return k;
  };

  /* pratinjau di dalam aplikasi: lapisan layar penuh; tautan dikunci agar tidak berpindah halaman */
  AWS.preview = function (k, o) {
    o = o || {}; if (!valid(k) || k === 'klasik') return false;
    var old = document.getElementById('lp-prev'); if (old) old.remove();
    var ov = document.createElement('div'); ov.id = 'lp-prev'; ov.className = 'lp-prev'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Pratinjau halaman awal');
    var nama = AWS.list().filter(function (x) { return x.k === k; })[0];
    ov.innerHTML = '<div class="lp-bar"><span>Pratinjau: <b>' + esc(nama ? nama.n : k) + '</b></span><button type="button" class="lp-x" aria-label="Tutup pratinjau">Tutup</button></div><div class="lp-body"></div>';
    document.body.appendChild(ov);
    var prevOv = document.body.style.overflow; document.body.style.overflow = 'hidden';
    var save = S.timers; S.timers = [];
    function tutup() { stopTimers(); S.timers = save; ov.remove(); document.body.style.overflow = prevOv; document.removeEventListener('keydown', esc_); }
    function esc_(e) { if (e.key === 'Escape') tutup(); }
    document.addEventListener('keydown', esc_);
    ov.querySelector('.lp-x').addEventListener('click', tutup);
    AWS.mount(ov.querySelector('.lp-body'), { logo: o.logo, versi: o.versi, model: k, lock: true });
    ov.querySelector('.lp-x').focus();
    return true;
  };


})(window);
