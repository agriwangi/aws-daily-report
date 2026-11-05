/* AWS Daily Report v1.0.0 — 24 jenis grafik (ECharts). Satu model data, banyak tampilan.
   spec = { cats:[], series:[{name,data:[]}], satuan:'kg', warna:[...], target:[...] } */
(function (w) {
  'use strict';
  var CH = { daftar: {}, hidup: [] };
  var JENIS = [
    ['line', 'Garis'], ['area', 'Area'], ['bar', 'Batang'], ['hbar', 'Batang mendatar'], ['stacked', 'Batang tumpuk'], ['step', 'Garis tangga'], ['combo', 'Kombinasi batang + garis'],
    ['pie', 'Pai'], ['donut', 'Donat'], ['rose', 'Mawar (Nightingale)'], ['treemap', 'Treemap'], ['sunburst', 'Sunburst'], ['funnel', 'Corong'], ['radar', 'Radar'],
    ['polar', 'Batang polar'], ['gauge', 'Meteran'], ['scatter', 'Sebar'], ['heatmap', 'Peta panas'], ['calendar', 'Kalender'], ['boxplot', 'Kotak-garis (boxplot)'],
    ['waterfall', 'Air terjun'], ['bullet', 'Bullet (capaian vs target)'], ['sankey', 'Sankey'], ['river', 'Sungai tema']
  ];
  CH.JENIS = JENIS;
  var NAMA = {}; JENIS.forEach(function (j) { NAMA[j[0]] = j[1]; });
  CH.nama = function (k) { return NAMA[k] || k; };

  function css(v, d) { var s = getComputedStyle(document.documentElement).getPropertyValue(v).trim(); return s || d; }
  CH.warna = function () {
    var p = css('--primary', '#166534');
    return [p, css('--accent', '#F59E0B'), '#2563EB', '#EA580C', '#7C3AED', '#0D9488', '#DC2626', '#4F46E5', '#65A30D', '#DB2777', '#0891B2', '#CA8A04'];
  };
  function tema() {
    var gelap = document.documentElement.getAttribute('data-mode') === 'gelap';
    return { gelap: gelap, teks: gelap ? '#E6F0EA' : '#0F1F17', muted: gelap ? '#9FB3A8' : '#5B6F63', garis: gelap ? '#24362D' : '#DCE5DF', kartu: gelap ? '#16241D' : '#FFFFFF' };
  }
  function fmt(v) { return typeof v === 'number' ? v.toLocaleString('id-ID', { maximumFractionDigits: 1 }) : v; }
  function dasar(t, spec) {
    return {
      color: spec.warna || CH.warna(), backgroundColor: 'transparent', animationDuration: 500,
      textStyle: { fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif", color: t.teks },
      tooltip: { trigger: 'axis', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks, fontSize: 12 }, valueFormatter: fmt },
      legend: { type: 'scroll', bottom: 0, textStyle: { color: t.muted, fontSize: 11 }, icon: 'roundRect', itemWidth: 10, itemHeight: 10 },
      grid: { left: 8, right: 14, top: 28, bottom: 36, containLabel: true }
    };
  }
  function ax(t, cats, ops) { return Object.assign({ type: 'category', data: cats, axisLine: { lineStyle: { color: t.garis } }, axisLabel: { color: t.muted, fontSize: 11, hideOverlap: true, formatter: function (v) { return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v.slice(8) + '/' + v.slice(5, 7) : v; } }, axisTick: { show: false } }, ops || {}); }
  function ay(t, ops) { return Object.assign({ type: 'value', axisLabel: { color: t.muted, fontSize: 11, formatter: function (v) { return Math.abs(v) >= 1000 ? (v / 1000).toLocaleString('id-ID') + 'rb' : v; } }, splitLine: { lineStyle: { color: t.garis, type: 'dashed' } } }, ops || {}); }
  function pairs(spec) { var s = spec.series[0] || { data: [] }; return (spec.cats || []).map(function (c, i) { return { name: c, value: s.data[i] || 0 }; }).filter(function (p) { return p.value > 0; }); }
  function pil(s) { return Math.round(s * 10) / 10; }

  var B = {};
  B.line = function (t, sp, o, area, step) { o.xAxis = ax(t, sp.cats, { boundaryGap: false }); o.yAxis = ay(t); o.series = sp.series.map(function (s) { var r = { name: s.name, type: 'line', data: s.data, smooth: !step, showSymbol: sp.cats.length < 40, symbolSize: 5, lineStyle: { width: 2.2 } }; if (area) r.areaStyle = { opacity: .18 }; if (step) r.step = 'middle'; return r; }); };
  B.area = function (t, sp, o) { B.line(t, sp, o, true); };
  B.step = function (t, sp, o) { B.line(t, sp, o, false, true); };
  B.bar = function (t, sp, o, tumpuk) { o.xAxis = ax(t, sp.cats); o.yAxis = ay(t); o.series = sp.series.map(function (s) { var r = { name: s.name, type: 'bar', data: s.data, barMaxWidth: 34, itemStyle: { borderRadius: tumpuk ? 0 : [4, 4, 0, 0] } }; if (tumpuk) r.stack = 'a'; return r; }); };
  B.stacked = function (t, sp, o) { B.bar(t, sp, o, true); };
  B.hbar = function (t, sp, o) { o.grid.left = 8; o.xAxis = ay(t); o.yAxis = ax(t, sp.cats.slice().reverse(), { axisLabel: { color: t.muted, fontSize: 11, width: 110, overflow: 'truncate' } }); o.series = sp.series.map(function (s) { return { name: s.name, type: 'bar', data: s.data.slice().reverse(), barMaxWidth: 22, itemStyle: { borderRadius: [0, 4, 4, 0] } }; }); };
  B.combo = function (t, sp, o) {
    o.xAxis = ax(t, sp.cats); o.yAxis = [ay(t), ay(t, { splitLine: { show: false } })];
    o.series = sp.series.map(function (s, i) { return i === 0 ? { name: s.name, type: 'bar', data: s.data, barMaxWidth: 30, itemStyle: { borderRadius: [4, 4, 0, 0] } } : { name: s.name, type: 'line', yAxisIndex: sp.series.length > 1 && i === 1 ? 1 : 0, data: s.data, smooth: true, symbolSize: 5 }; });
  };
  function bulat(t, sp, o, dalam, mawar) {
    o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks, fontSize: 12 }, valueFormatter: fmt };
    delete o.grid; o.series = [{ type: 'pie', radius: dalam ? ['48%', '72%'] : (mawar ? ['18%', '72%'] : '68%'), roseType: mawar ? 'area' : undefined, center: ['50%', '46%'], data: pairs(sp), label: { color: t.muted, fontSize: 11, formatter: '{b}\n{d}%' }, itemStyle: { borderColor: t.kartu, borderWidth: 2, borderRadius: 5 } }];
  }
  B.pie = function (t, sp, o) { bulat(t, sp, o, false, false); };
  B.donut = function (t, sp, o) { bulat(t, sp, o, true, false); };
  B.rose = function (t, sp, o) { bulat(t, sp, o, false, true); };
  B.treemap = function (t, sp, o) { o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks }, valueFormatter: fmt }; delete o.grid; delete o.legend; o.series = [{ type: 'treemap', roam: false, nodeClick: false, breadcrumb: { show: false }, data: pairs(sp), label: { color: '#fff', fontSize: 12 }, itemStyle: { borderColor: t.kartu, borderWidth: 2, gapWidth: 2 } }]; };
  B.sunburst = function (t, sp, o) {
    delete o.grid; delete o.legend; o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks }, valueFormatter: fmt };
    var data = sp.tree || (function () { var g = {}; (sp.cats || []).forEach(function (c, i) { var v = (sp.series[0] || { data: [] }).data[i] || 0; if (v <= 0) return; var p = String(c).split(' / '); var k = p.length > 1 ? p[0] : 'Semua'; (g[k] = g[k] || []).push({ name: p.length > 1 ? p.slice(1).join(' / ') : c, value: v }); }); return Object.keys(g).map(function (k) { return { name: k, children: g[k] }; }); })();
    o.series = [{ type: 'sunburst', radius: ['12%', '90%'], data: data, label: { color: '#fff', fontSize: 10, minAngle: 8 }, itemStyle: { borderColor: t.kartu, borderWidth: 2 } }];
  };
  B.funnel = function (t, sp, o) { delete o.grid; o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks }, valueFormatter: fmt }; var d = pairs(sp).sort(function (a, b) { return b.value - a.value; }); o.series = [{ type: 'funnel', left: '8%', right: '8%', top: 14, bottom: 34, sort: 'descending', data: d, label: { color: '#fff', fontSize: 11 }, itemStyle: { borderColor: t.kartu, borderWidth: 2 } }]; };
  B.radar = function (t, sp, o) {
    delete o.grid; var mx = 0; sp.series.forEach(function (s) { s.data.forEach(function (v) { if (v > mx) mx = v; }); });
    o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks } };
    o.radar = { indicator: sp.cats.slice(0, 12).map(function (c) { return { name: c, max: mx * 1.1 || 1 }; }), radius: '62%', center: ['50%', '46%'], axisName: { color: t.muted, fontSize: 11 }, splitLine: { lineStyle: { color: t.garis } }, splitArea: { show: false }, axisLine: { lineStyle: { color: t.garis } } };
    o.series = [{ type: 'radar', data: sp.series.map(function (s) { return { name: s.name, value: s.data.slice(0, 12), areaStyle: { opacity: .15 } }; }) }];
  };
  B.polar = function (t, sp, o) { delete o.grid; o.polar = { radius: ['16%', '74%'], center: ['50%', '46%'] }; o.angleAxis = { type: 'category', data: sp.cats, axisLabel: { color: t.muted, fontSize: 10 }, axisLine: { lineStyle: { color: t.garis } } }; o.radiusAxis = { axisLabel: { color: t.muted, fontSize: 10 }, splitLine: { lineStyle: { color: t.garis } } }; o.series = sp.series.map(function (s) { return { name: s.name, type: 'bar', coordinateSystem: 'polar', data: s.data, stack: 'a' }; }); };
  B.gauge = function (t, sp, o) {
    delete o.grid; delete o.legend; o.tooltip = { show: false }; var v = (sp.series[0] && sp.series[0].data[0]) || 0, mx = sp.maks || 120;
    o.series = [{ type: 'gauge', min: 0, max: mx, center: ['50%', '58%'], radius: '88%', startAngle: 200, endAngle: -20, progress: { show: true, width: 14 }, axisLine: { lineStyle: { width: 14, color: [[1, t.garis]] } }, pointer: { width: 5 }, axisTick: { show: false }, splitLine: { length: 8, lineStyle: { color: t.muted } }, axisLabel: { color: t.muted, fontSize: 10, distance: 18 }, detail: { valueAnimation: true, formatter: '{value}' + (sp.satuan === '%' ? '%' : ''), color: t.teks, fontSize: 26, offsetCenter: [0, '38%'] }, title: { color: t.muted, fontSize: 12, offsetCenter: [0, '62%'] }, data: [{ value: pil(v), name: sp.judulGauge || (sp.series[0] && sp.series[0].name) || '' }] }];
  };
  B.scatter = function (t, sp, o) {
    var a = sp.series[0] || { data: [] }, b = sp.series[1];
    o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks, fontSize: 12 }, formatter: function (p) { return U.esc(p.data[2] || '') + '<br/>' + U.esc(b ? a.name : 'Nilai') + ': ' + fmt(p.data[0]) + (b ? '<br/>' + U.esc(b.name) + ': ' + fmt(p.data[1]) : ''); } };
    o.xAxis = ay(t, { name: b ? a.name : '', nameTextStyle: { color: t.muted }, scale: true }); o.yAxis = ay(t, { name: b ? b.name : a.name, nameTextStyle: { color: t.muted }, scale: true });
    if (!b) { o.xAxis = ax(t, sp.cats); o.series = [{ type: 'scatter', symbolSize: 10, data: a.data.map(function (v, i) { return [i, v, sp.cats[i]]; }) }]; o.tooltip.formatter = function (p) { return U.esc(p.data[2]) + ': ' + fmt(p.data[1]); }; o.xAxis = ax(t, sp.cats); o.series[0].data = a.data.map(function (v, i) { return { value: [sp.cats[i], v, sp.cats[i]] }; }); o.tooltip.formatter = function (p) { return U.esc(p.value[2]) + ': ' + fmt(p.value[1]); }; return; }
    o.series = [{ type: 'scatter', symbolSize: 11, itemStyle: { opacity: .8 }, data: a.data.map(function (v, i) { return [v, b.data[i], sp.cats[i]]; }) }];
  };
  B.heatmap = function (t, sp, o) {
    delete o.legend; var data = [], mx = 0, mn = 0; sp.series.forEach(function (s, yi) { s.data.forEach(function (v, xi) { data.push([xi, yi, v]); if (v > mx) mx = v; if (v < mn) mn = v; }); });
    o.tooltip = { position: 'top', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks, fontSize: 12 }, formatter: function (p) { return U.esc(sp.series[p.data[1]].name) + ' · ' + U.esc(sp.cats[p.data[0]]) + '<br/><b>' + fmt(p.data[2]) + '</b>'; } };
    o.grid = { left: 8, right: 14, top: 14, bottom: 52, containLabel: true }; o.xAxis = ax(t, sp.cats, { splitArea: { show: true } }); o.yAxis = ax(t, sp.series.map(function (s) { return s.name; }), { axisLabel: { color: t.muted, fontSize: 11, width: 100, overflow: 'truncate' } });
    o.visualMap = { min: mn, max: mx || 1, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, textStyle: { color: t.muted, fontSize: 10 }, inRange: { color: t.gelap ? ['#14301f', '#22C55E', '#F59E0B', '#DC2626'] : ['#E8F5EC', '#4ADE80', '#F59E0B', '#DC2626'] } };
    o.series = [{ type: 'heatmap', data: data, label: { show: sp.cats.length * sp.series.length <= 80, color: t.teks, fontSize: 10, formatter: function (p) { return fmt(p.data[2]); } }, itemStyle: { borderColor: t.kartu, borderWidth: 1 } }];
  };
  B.calendar = function (t, sp, o) {
    delete o.grid; delete o.legend; var s = sp.series[0] || { data: [] }, data = [], mx = 0; (sp.cats || []).forEach(function (c, i) { if (/^\d{4}-\d{2}-\d{2}$/.test(c)) { data.push([c, s.data[i] || 0]); if ((s.data[i] || 0) > mx) mx = s.data[i]; } });
    if (!data.length) { o.title = { text: 'Kalender memerlukan data harian.', left: 'center', top: 'center', textStyle: { color: t.muted, fontSize: 13, fontWeight: 400 } }; return; }
    var rentang = [data[0][0], data[data.length - 1][0]];
    o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks, fontSize: 12 }, formatter: function (p) { return U.tglID(p.value[0], true) + '<br/><b>' + fmt(p.value[1]) + '</b>'; } };
    o.visualMap = { min: 0, max: mx || 1, orient: 'horizontal', left: 'center', bottom: 0, calculable: true, textStyle: { color: t.muted, fontSize: 10 }, inRange: { color: t.gelap ? ['#14301f', '#22C55E', '#F59E0B'] : ['#E8F5EC', '#4ADE80', '#166534'] } };
    o.calendar = { top: 28, left: 34, right: 12, bottom: 50, range: rentang, cellSize: ['auto', 18], itemStyle: { borderWidth: 2, borderColor: t.kartu, color: t.gelap ? '#111C17' : '#EEF3F0' }, splitLine: { show: false }, yearLabel: { show: false }, dayLabel: { color: t.muted, nameMap: ['M', 'S', 'S', 'R', 'K', 'J', 'S'], firstDay: 1, fontSize: 10 }, monthLabel: { color: t.muted, nameMap: U.BLN.map(function (b) { return b.slice(0, 3); }), fontSize: 10 } };
    o.series = [{ type: 'heatmap', coordinateSystem: 'calendar', data: data }];
  };
  B.boxplot = function (t, sp, o) {
    var names = sp.series.map(function (s) { return s.name; }), data = sp.series.map(function (s) { var a = s.data.filter(function (v) { return typeof v === 'number'; }).sort(function (x, y) { return x - y; }); if (!a.length) return [0, 0, 0, 0, 0]; var q = function (p) { var i = (a.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return a[lo] + (a[hi] - a[lo]) * (i - lo); }; return [a[0], q(.25), q(.5), q(.75), a[a.length - 1]].map(pil); });
    o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks, fontSize: 12 }, formatter: function (p) { var d = p.data.slice(1); return U.esc(p.name) + '<br/>Min ' + fmt(d[0]) + '<br/>Q1 ' + fmt(d[1]) + '<br/>Median ' + fmt(d[2]) + '<br/>Q3 ' + fmt(d[3]) + '<br/>Maks ' + fmt(d[4]); } };
    delete o.legend; o.xAxis = ax(t, names); o.yAxis = ay(t); o.series = [{ type: 'boxplot', data: data, itemStyle: { color: t.gelap ? 'rgba(34,197,94,.25)' : 'rgba(22,101,52,.18)', borderColor: css('--primary', '#166534'), borderWidth: 1.6 } }];
  };
  B.waterfall = function (t, sp, o) {
    var s = sp.series[0] || { data: [] }, base = [], up = [], dn = [], cum = 0;
    s.data.forEach(function (v) { v = v || 0; if (v >= 0) { base.push(cum); up.push(v); dn.push(0); cum += v; } else { cum += v; base.push(cum); up.push(0); dn.push(-v); } });
    delete o.legend; o.xAxis = ax(t, sp.cats); o.yAxis = ay(t);
    o.series = [{ type: 'bar', stack: 'w', data: base, itemStyle: { color: 'transparent' }, tooltip: { show: false } }, { name: 'Naik', type: 'bar', stack: 'w', data: up, itemStyle: { color: '#16A34A', borderRadius: [3, 3, 0, 0] } }, { name: 'Turun', type: 'bar', stack: 'w', data: dn, itemStyle: { color: '#DC2626', borderRadius: [3, 3, 0, 0] } }];
    o.tooltip.formatter = function (ps) { var i = ps[0].dataIndex; return U.esc(sp.cats[i]) + '<br/><b>' + fmt(s.data[i]) + '</b>'; };
  };
  B.bullet = function (t, sp, o) {
    var a = sp.series[0] || { data: [], name: '' }, tg = sp.series[1] || sp.target && { name: 'Target', data: sp.target } || { name: 'Target', data: [] };
    var cats = sp.cats.slice().reverse(), A = a.data.slice().reverse(), T = (tg.data || []).slice().reverse();
    o.xAxis = ay(t); o.yAxis = ax(t, cats, { axisLabel: { color: t.muted, fontSize: 11, width: 110, overflow: 'truncate' } });
    o.series = [{ name: tg.name, type: 'bar', data: T, barWidth: 22, itemStyle: { color: t.gelap ? '#24362D' : '#E4EBE7', borderRadius: 4 }, z: 1, silent: true }, { name: a.name, type: 'bar', data: A.map(function (v, i) { return { value: v, itemStyle: { color: T[i] && v >= T[i] ? '#16A34A' : v >= (T[i] || 0) * .8 ? '#F59E0B' : '#DC2626' } }; }), barWidth: 10, barGap: '-65%', z: 3, itemStyle: { borderRadius: 3 } }];
  };
  B.sankey = function (t, sp, o) {
    delete o.grid; delete o.legend; o.tooltip = { trigger: 'item', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks }, valueFormatter: fmt };
    var nodes = {}, links = sp.links ? sp.links.slice() : [];
    if (!links.length) sp.series.forEach(function (s) { sp.cats.forEach(function (c, i) { var v = s.data[i] || 0; if (v > 0) links.push({ source: s.name, target: c, value: v }); }); });
    links.forEach(function (l) { nodes[l.source] = 1; nodes[l.target] = 1; });
    o.series = [{ type: 'sankey', left: 10, right: 90, top: 10, bottom: 10, nodeGap: 10, data: Object.keys(nodes).map(function (n) { return { name: n }; }), links: links, label: { color: t.teks, fontSize: 11 }, lineStyle: { color: 'gradient', curveness: .5, opacity: .35 }, emphasis: { focus: 'adjacency' } }];
  };
  B.river = function (t, sp, o) {
    var data = []; sp.series.forEach(function (s) { sp.cats.forEach(function (c, i) { data.push([c, s.data[i] || 0, s.name]); }); });
    o.tooltip = { trigger: 'axis', confine: true, backgroundColor: t.kartu, borderColor: t.garis, textStyle: { color: t.teks, fontSize: 12 } };
    o.singleAxis = { type: 'category', data: sp.cats, top: 24, bottom: 52, left: 10, right: 14, axisLabel: { color: t.muted, fontSize: 10, hideOverlap: true }, axisLine: { lineStyle: { color: t.garis } } };
    delete o.grid; o.series = [{ type: 'themeRiver', data: data, label: { show: false }, emphasis: { focus: 'self' } }];
  };

  CH.opsi = function (jenis, spec) {
    var t = tema(), o = dasar(t, spec); (B[jenis] || B.bar)(t, spec, o); if (spec.satuan && o.yAxis && !Array.isArray(o.yAxis) && !o.yAxis.name && ['line', 'area', 'bar', 'stacked', 'step', 'waterfall'].indexOf(jenis) >= 0) o.yAxis.name = spec.satuan, o.yAxis.nameTextStyle = { color: t.muted, fontSize: 11, align: 'left' };
    return o;
  };
  /* render ke elemen */
  CH.render = function (el, jenis, spec) {
    if (!w.echarts || !el) return null;
    var c = echarts.getInstanceByDom(el); if (c) c.dispose();
    c = echarts.init(el, null, { renderer: 'canvas' }); c.setOption(CH.opsi(jenis, spec), true);
    if (w.ResizeObserver) { var ro = new ResizeObserver(function () { try { c.resize(); } catch (e) {} }); ro.observe(el); c._ro = ro; }
    return c;
  };
  /* panel berkepala: judul + pemilih jenis + grafik. daftar jenis boleh dibatasi */
  CH.panel = function (host, opsi) {
    // opsi: id, judul, spec(fn|obj), jenis, boleh[], tinggi('', 'tall','sm'), catatan
    var boleh = opsi.boleh || JENIS.map(function (j) { return j[0]; }), kunci = 'jenis_' + opsi.id, tersimpan = U.baca(kunci, '');
    var jenis = boleh.indexOf(tersimpan) >= 0 ? tersimpan : opsi.jenis;
    var card = document.createElement('div'); card.className = 'card'; card.dataset.panel = opsi.id;
    card.innerHTML = '<div class="chead"><h3>' + U.esc(opsi.judul) + '</h3><select aria-label="Jenis grafik: ' + U.esc(opsi.judul) + '">' + boleh.map(function (k) { return '<option value="' + k + '"' + (k === jenis ? ' selected' : '') + '>' + U.esc(NAMA[k]) + '</option>'; }).join('') + '</select></div>' + (opsi.catatan ? '<div class="muted" style="font-size:12px;margin:-4px 0 6px">' + U.esc(opsi.catatan) + '</div>' : '') + '<div class="chart ' + (opsi.tinggi || '') + '"></div>';
    host.appendChild(card);
    var box = card.querySelector('.chart'), sel = card.querySelector('select'), inst = null;
    var gambar = function () {
      var sp = typeof opsi.spec === 'function' ? opsi.spec() : opsi.spec;
      if (!sp || !sp.cats || !sp.cats.length) { box.innerHTML = '<div class="empty" style="padding:60px 8px">Belum ada data untuk periode ini.</div>'; inst = null; return; }
      if (!box.firstElementChild || box.firstElementChild.className === 'empty') box.innerHTML = '';
      inst = CH.render(box, sel.value, sp); card._chart = inst;
    };
    sel.addEventListener('change', function () { U.simpan(kunci, sel.value); gambar(); });
    card._gambar = gambar; CH.hidup.push(card); gambar();
    return card;
  };
  CH.gambarUlang = function () { CH.hidup = CH.hidup.filter(function (c) { return document.body.contains(c); }); CH.hidup.forEach(function (c) { try { c._gambar(); } catch (e) {} }); };
  CH.bersih = function () { CH.hidup.forEach(function (c) { var i = c._chart; if (i) { try { if (i._ro) i._ro.disconnect(); i.dispose(); } catch (e) {} } }); CH.hidup = []; };
  CH.gambarPng = function (card) { try { return card._chart ? card._chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' }) : null; } catch (e) { return null; } };
  /* render senyap (untuk PPT/PDF): gambar spec ke elemen luring, kembalikan dataURL putih */
  CH.png = function (jenis, spec, lebar, tinggi) {
    var el = document.createElement('div'); el.style.cssText = 'position:fixed;left:-99999px;top:0;width:' + (lebar || 900) + 'px;height:' + (tinggi || 420) + 'px'; document.body.appendChild(el);
    try {
      var c = echarts.init(el, null, { renderer: 'canvas' }), gelap = document.documentElement.getAttribute('data-mode'); document.documentElement.setAttribute('data-mode', 'terang');
      var o = CH.opsi(jenis, spec); o.animation = false; c.setOption(o); var url = c.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' }); c.dispose();
      if (gelap) document.documentElement.setAttribute('data-mode', gelap); return url;
    } catch (e) { return null; } finally { el.remove(); }
  };
  w.CH = CH;
})(window);
