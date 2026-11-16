/*
 * Creador de Mapas Interactivos — editor.
 *
 * Modelo del proyecto:
 *   { name, chemicals:[{id,name,fill,ring,fichas:[{img,caption,signal,hazards[],emergency,notes,source}]}],
 *     maps:[{id,name,title,subtitle,background,bgWidth,bgHeight,markerSize,
 *            areas:[{id,name,desc,x,y,w,h,photos:[{img,pins:[{chem,x,y}]}],chems:[]}],
 *            markers:[{id,chem,x,y,area}], labels:[{id,text,x,y,size}]}],
 *     assets:{id: dataURL} }
 * Todas las posiciones se guardan en % del plano (o de la foto).
 */
(function () {
  'use strict';

  // ------------------------------------------------------------- utilidades
  var ICON = {
    hazard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.5" stroke-linecap="round"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6h6l2 2h10v11H3z"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h11l4 4v14H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/></svg>',
    open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 21h14"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/></svg>',
    files: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M8 6h8l4 4v12H8z"/><path d="M4 2h8l2 2M4 2v16h2"/></svg>',
    select: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 8-6 1.6 3.5 6.4-2.6 1.4-3.5-6.4L6 18z"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2.5"><rect x="3.5" y="5" width="17" height="14" rx="2"/></svg>',
    marker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 6V4h14v2M12 4v16M9 20h6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15l7-7 7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.6"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/><path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-4.5M13.5 16.5v-4.5h1a2 2 0 0 1 0 4.5z"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5"/></svg>',
    steps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M8.5 10l1.5 1.5 3-3M8.5 16l1.5 1.5 3-3"/></svg>',
    shRect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="1.5"/></svg>',
    shEllipse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="8.5" ry="7"/></svg>',
    shCells: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h6v6H4zM10 4h6v6h-6zM10 10h6v6h-6zM16 10h4v6h-4zM4 14h6v6H4z" fill="currentColor" fill-opacity=".25"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 19A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.4-2L14 9V3"/><path d="M7 15h10"/></svg>'
  };

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') { for (var s in v) if (v[s] != null) el.style.setProperty(s, v[s]); }
      else if (k === 'value') el.value = v;
      else if (k === 'checked' || k === 'selected' || k === 'disabled') el[k] = !!v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(function (x) { append(el, x); });
    else el.append(c);
  }
  function ic(name) { var s = h('span', { html: ICON[name] }); return s.firstChild; }
  function chemIc(c, cls) { return h('span', { class: 'ic' + (cls ? ' ' + cls : ''), style: { '--f': c ? c.fill : '#ccc', '--r': c ? c.ring : '#999' } }); }
  function uid(p) { return (p || 'id') + '_' + Math.random().toString(36).slice(2, 8); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function norm(s) { return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isTyping(e) { var t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); }

  function toast(msg, err) {
    var t = h('div', { class: 'toast' + (err ? ' err' : ''), text: msg });
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, err ? 5000 : 2600);
  }
  function busy(msg) {
    var b = h('div', { class: 'busy' }, h('div', null, msg || 'Procesando…'));
    document.body.appendChild(b);
    return function () { b.remove(); };
  }
  function pickFiles(accept, multiple) {
    return new Promise(function (resolve) {
      var inp = h('input', { type: 'file', accept: accept, style: { display: 'none' } });
      if (multiple) inp.multiple = true;
      inp.addEventListener('change', function () { resolve(Array.from(inp.files || [])); inp.remove(); });
      document.body.appendChild(inp);
      inp.click();
    });
  }
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('No se pudo leer la imagen')); };
      img.src = src;
    });
  }
  /* Lee una imagen, la reduce a max px y la codifica en WebP (o JPEG si el navegador no soporta WebP). */
  function imageFileToDataUrl(file, max, quality) {
    var url = URL.createObjectURL(file);
    return loadImage(url).then(function (img) {
      URL.revokeObjectURL(url);
      return canvasEncode(img, img.naturalWidth, img.naturalHeight, max, quality);
    });
  }
  function canvasEncode(src, w, hgt, max, quality) {
    var s = Math.min(1, max / Math.max(w, hgt));
    var cw = Math.round(w * s), ch = Math.round(hgt * s);
    var c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(src, 0, 0, cw, ch);
    var data = c.toDataURL('image/webp', quality || 0.75);
    if (data.indexOf('data:image/webp') !== 0) data = c.toDataURL('image/jpeg', quality || 0.8);
    return { data: data, width: cw, height: ch };
  }

  // ----------------------------------------------------------------- estado
  var project = null;
  var ui = {
    left: 'maps', view: 'map', mapId: null, chemId: null, sel: null, tool: 'select', toolChem: null,
    chemQuery: '', views: {}, menu: null, areaShape: 'rect', cellDraft: null
  };
  var undoStack = [], redoStack = [];
  var saveTimer = null, saveState = 'Guardado';
  var app = document.getElementById('app');

  function curMap() { return project.maps.filter(function (m) { return m.id === ui.mapId; })[0] || null; }
  function chem(id) { return project.chemicals.filter(function (c) { return c.id === id; })[0] || null; }
  function selArea() { var m = curMap(); return m && ui.sel && ui.sel.type === 'area' ? m.areas.filter(function (a) { return a.id === ui.sel.id; })[0] : null; }
  function selMarker() { var m = curMap(); return m && ui.sel && ui.sel.type === 'marker' ? m.markers.filter(function (x) { return x.id === ui.sel.id; })[0] : null; }
  function selLabel() { var m = curMap(); return m && ui.sel && ui.sel.type === 'label' ? (m.labels || []).filter(function (x) { return x.id === ui.sel.id; })[0] : null; }
  function addAsset(data, prefix) { var id = uid(prefix || 'img'); project.assets[id] = data; return id; }
  function isProc(m) { return !!m && m.type === 'procesos'; }
  function procCount(m) { var n = 0; m.areas.forEach(function (a) { n += a.processes.length; }); return n; }
  function sortedChems() { return project.chemicals.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); }); }

  function normalizeProject(p) {
    p.name = p.name || 'Proyecto de mapas';
    p.chemicals = p.chemicals || []; p.maps = p.maps || []; p.assets = p.assets || {};
    p.chemicals.forEach(function (c) { c.fichas = c.fichas || []; c.fill = c.fill || '#ffffff'; c.ring = c.ring || '#000000'; });
    p.maps.forEach(function (m) {
      m.type = m.type === 'procesos' ? 'procesos' : 'quimicos';
      m.areas = m.areas || []; m.markers = m.markers || []; m.labels = m.labels || [];
      m.markerSize = m.markerSize || 1;
      m.areas.forEach(function (a) {
        a.photos = a.photos || []; a.chems = a.chems || []; a.processes = a.processes || [];
        a.photos.forEach(function (ph) { ph.pins = ph.pins || []; });
        a.processes.forEach(function (pr) { pr.steps = pr.steps || []; });
      });
    });
    return p;
  }
  function validateUi() {
    if (!curMap()) ui.mapId = project.maps[0] ? project.maps[0].id : null;
    if (ui.chemId && !chem(ui.chemId)) { ui.chemId = null; ui.view = 'map'; }
    if (ui.sel) {
      var ok = (ui.sel.type === 'area' && selArea()) || (ui.sel.type === 'marker' && selMarker()) || (ui.sel.type === 'label' && selLabel());
      if (!ok) ui.sel = null;
    }
    if (ui.toolChem && !chem(ui.toolChem)) ui.toolChem = null;
  }

  // ------------------------------------------------- historial y guardado
  function snapshot() {
    var copy = {};
    for (var k in project) if (k !== 'assets') copy[k] = project[k];
    return JSON.stringify(copy);
  }
  function pushUndo(snap) {
    undoStack.push(snap || snapshot());
    if (undoStack.length > 120) undoStack.shift();
    redoStack.length = 0;
  }
  /* Cambio estructural: guarda historial, aplica y vuelve a dibujar todo. */
  function commit(fn) { pushUndo(); fn(); changed(); }
  function changed(light) {
    normalizeProject(project);
    validateUi();
    scheduleSave();
    if (light) { safe(renderHead, 'la cabecera'); safe(renderLeft, 'el panel izquierdo'); safe(renderCanvas, 'el plano'); } else renderAll();
  }
  function restore(str) {
    var o = JSON.parse(str);
    o.assets = project.assets;
    project = normalizeProject(o);
    changed();
  }
  function undo() { if (!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); toast('Deshecho'); }
  function redo() { if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); toast('Rehecho'); }

  /* Campos de texto: un paso de deshacer por edicion de campo. */
  function bindText(el, get, set, opts) {
    var snap = null;
    el.value = get() || '';
    el.addEventListener('focus', function () { snap = snapshot(); });
    el.addEventListener('input', function () {
      if (snap) { pushUndo(snap); snap = null; }
      set(el.value);
      validateUi(); scheduleSave();
      if (opts && opts.refresh) opts.refresh(); else { renderLeft(); renderCanvas(); renderHead(); }
    });
    return el;
  }

  function scheduleSave() {
    saveState = 'Guardando…'; updateSaveLabel();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      Store.save(project).then(function () { saveState = 'Guardado en este navegador'; updateSaveLabel(); })
        .catch(function (e) { saveState = 'Sin guardado automático'; updateSaveLabel(); console.warn(e); });
    }, 700);
  }
  function updateSaveLabel() { var el = document.getElementById('ed-save'); if (el) el.textContent = saveState; }

  // ------------------------------------------------------------- estructura
  var head, left, center, right;
  function buildShell() {
    app.innerHTML = '';
    head = h('header', { class: 'ed-head' });
    left = h('aside', { class: 'ed-left' });
    center = h('main', { class: 'ed-center' });
    right = h('aside', { class: 'ed-right' });
    app.append(head, h('div', { class: 'narrow-warning' }, 'El editor está pensado para PC o tablet. Los mapas exportados sí se ven perfectamente en el teléfono.'),
      h('div', { class: 'ed-body' }, left, center, right));
  }
  /* Si un panel falla al dibujarse, los demas se dibujan igual y se avisa. */
  var renderErrorShown = false;
  function safe(fn, name) {
    try { fn(); } catch (e) {
      console.error('Error al dibujar ' + name, e);
      if (!renderErrorShown) { renderErrorShown = true; toast('Error al actualizar ' + name + '. Recarga la página; tus datos están guardados.', true); setTimeout(function () { renderErrorShown = false; }, 6000); }
    }
  }
  function renderAll() { safe(renderHead, 'la cabecera'); safe(renderLeft, 'el panel izquierdo'); safe(renderCenter, 'el plano'); safe(renderRight, 'el panel derecho'); }

  // ----------------------------------------------------------------- cabecera
  function renderHead() {
    var nameInput = h('input', { 'aria-label': 'Nombre del proyecto', title: 'Nombre del proyecto' });
    bindText(nameInput, function () { return project.name; }, function (v) { project.name = v; }, { refresh: function () { } });
    head.innerHTML = '';
    head.append(
      h('div', { class: 'ed-brand' }, h('div', { class: 'ed-logo', html: ICON.hazard }),
        h('div', null, h('b', null, 'Creador de Mapas Interactivos'), nameInput)),
      h('div', { class: 'spacer' }),
      h('span', { class: 'ed-save', id: 'ed-save', text: saveState }),
      h('button', { class: 'btn icon', title: 'Deshacer (Ctrl+Z)', 'aria-label': 'Deshacer', disabled: !undoStack.length, onclick: undo }, ic('undo')),
      h('button', { class: 'btn icon', title: 'Rehacer (Ctrl+Y)', 'aria-label': 'Rehacer', disabled: !redoStack.length, onclick: redo }, ic('redo')),
      h('div', { class: 'ed-sep' }),
      h('button', { class: 'btn', disabled: !curMap(), onclick: function () { openPreview(); } }, ic('eye'), h('span', { class: 'lbl' }, 'Vista previa')),
      menuButton('export', h('span', { class: 'lbl' }, 'Exportar HTML'), 'download', true, exportMenu),
      menuButton('project', h('span', { class: 'lbl' }, 'Proyecto'), 'folder', false, projectMenu),
      h('a', { class: 'btn', href: 'manual/index.html', target: '_blank', rel: 'noopener', title: 'Manual de usuario' }, ic('help'), h('span', { class: 'lbl' }, 'Ayuda')));
  }
  function menuButton(key, label, icon, primary, build) {
    var wrap = h('div', { class: 'menu-wrap' });
    var btn = h('button', { class: 'btn' + (primary ? ' primary' : ''), 'aria-haspopup': 'true', 'aria-expanded': String(ui.menu === key), onclick: function (e) {
      e.stopPropagation(); ui.menu = ui.menu === key ? null : key; renderHead();
    } }, ic(icon), label);
    wrap.append(btn);
    if (ui.menu === key) {
      var menu = h('div', { class: 'menu', onclick: function (e) { e.stopPropagation(); } });
      build(menu);
      wrap.append(menu);
    }
    return wrap;
  }
  function menuItem(icon, title, sub, fn) {
    return h('button', { onclick: function () { ui.menu = null; renderHead(); fn(); } }, ic(icon), h('span', null, h('b', null, title), sub ? h('small', null, sub) : null));
  }
  function exportMenu(menu) {
    var m = curMap();
    if (m) menu.append(menuItem('file', 'Exportar «' + (m.name || m.id) + '»', 'Un HTML independiente con este mapa', function () { exportMaps([m.id]); }));
    if (project.maps.length > 1) {
      menu.append(menuItem('files', 'Exportar cada mapa por separado', project.maps.length + ' archivos HTML independientes', function () {
        project.maps.forEach(function (x, i) { setTimeout(function () { exportMaps([x.id]); }, i * 600); });
      }));
      menu.append(menuItem('map', 'Exportar todos en un solo HTML', 'Con selector de mapa en la cabecera', function () { exportMaps(project.maps.map(function (x) { return x.id; })); }));
    }
    menu.append(h('hr'), h('div', { class: 'help', style: { padding: '0 10px 6px', margin: 0 } }, 'Los HTML exportados incluyen planos, fotos y fichas. Funcionan sin internet, sin instalar nada y en PC o teléfono.'));
  }
  function projectMenu(menu) {
    menu.append(
      menuItem('save', 'Guardar proyecto (.json)', 'Copia de seguridad editable para compartir o continuar en otro equipo', saveProjectFile),
      menuItem('open', 'Abrir proyecto (.json)', 'Reemplaza el proyecto actual', openProjectFile),
      h('hr'),
      menuItem('reset', 'Restaurar ejemplo L1 / L2', 'Vuelve a cargar los mapas de demostración', function () {
        if (!window.DEMO_PROJECT) return toast('El ejemplo no está disponible (falta demo/demo-data.js).', true);
        if (!confirm('¿Reemplazar el proyecto actual por el ejemplo L1 / L2? Puedes deshacer con Ctrl+Z.')) return;
        loadProject(clone(window.DEMO_PROJECT), true);
      }),
      menuItem('plus', 'Nuevo proyecto vacío', 'Empieza desde cero (conserva la biblioteca de químicos)', function () {
        if (!confirm('¿Crear un proyecto vacío? Se conservará la biblioteca de químicos con sus fichas. Puedes deshacer con Ctrl+Z.')) return;
        pushUndo();
        project.maps = []; project.name = 'Nuevo proyecto';
        ui.mapId = null; ui.sel = null; changed();
        newMapDialog();
      }));
  }
  document.addEventListener('click', function () { if (ui.menu) { ui.menu = null; renderHead(); } });

  // ----------------------------------------------------------- barra izquierda
  function renderLeft() {
    var scrollEl = left.querySelector('.scroll');
    var top = scrollEl ? scrollEl.scrollTop : 0;
    left.innerHTML = '';
    var cm = curMap();
    var procMode = isProc(cm) && ui.view !== 'chem';
    if (procMode && ui.left === 'chems') ui.left = 'procs';
    if (!procMode && ui.left === 'procs') ui.left = 'maps';
    left.append(h('div', { class: 'tabs', role: 'tablist' },
      h('button', { role: 'tab', 'aria-selected': String(ui.left === 'maps'), onclick: function () { ui.left = 'maps'; ui.view = 'map'; renderAll(); } }, 'Mapas'),
      procMode
        ? h('button', { role: 'tab', 'aria-selected': String(ui.left === 'procs'), onclick: function () { ui.left = 'procs'; renderLeft(); } }, 'Áreas y procesos')
        : h('button', { role: 'tab', 'aria-selected': String(ui.left === 'chems'), onclick: function () { ui.left = 'chems'; renderLeft(); } }, 'Químicos (' + project.chemicals.length + ')')));
    var sc = h('div', { class: 'scroll' });
    if (ui.left === 'procs') {
      renderProcTree(sc, cm);
    } else if (ui.left === 'maps') {
      sc.append(h('div', { class: 'side-title' }, h('span', null, 'Mapas del proyecto'),
        h('button', { class: 'btn sm', onclick: newMapDialog }, ic('plus'), 'Nuevo')));
      if (!project.maps.length) sc.append(h('p', { class: 'help pad' }, 'Aún no hay mapas. Crea uno nuevo y sube el plano base.'));
      project.maps.forEach(function (m) {
        var active = m.id === ui.mapId && ui.view === 'map';
        var pend = m.areas.filter(function (a) { return !a.photos.length; }).length;
        var card = h('div', { class: 'map-card' + (active ? ' active' : '') },
          h('div', { class: 'map-card-row' },
            h('button', { class: 'map-open', onclick: function () { ui.mapId = m.id; ui.view = 'map'; ui.sel = null; renderAll(); } },
              h('span', { class: 'map-thumb', style: { 'background-image': m.background ? 'url("' + project.assets[m.background] + '")' : null } }),
              h('span', { class: 'grow' }, h('b', null, m.name || 'Sin nombre'),
                h('span', { class: 'badge ' + (isProc(m) ? 'blue' : 'grey') }, isProc(m) ? 'Procesos' : 'Químicos'),
                h('small', null, m.areas.length + ' áreas · ' + (isProc(m) ? procCount(m) + ' procesos' : m.markers.length + ' pictogramas')),
                pend ? h('span', { class: 'badge warn' }, pend + ' fotos pendientes') : null)),
            h('div', { class: 'map-acts' },
              h('button', { class: 'btn icon ghost', title: 'Clonar mapa', 'aria-label': 'Clonar ' + (m.name || 'mapa'), onclick: function () { cloneMapDialog(m); } }, ic('copy')),
              h('button', { class: 'btn icon ghost danger', title: 'Eliminar mapa', 'aria-label': 'Eliminar ' + (m.name || 'mapa'), onclick: function () { deleteMap(m); } }, ic('trash')))));
        if (active && m.areas.length) {
          var list = h('div', { class: 'area-list' });
          m.areas.forEach(function (a) {
            var isSel = ui.sel && ui.sel.type === 'area' && ui.sel.id === a.id;
            var main = h('button', { class: 'area-main', title: 'Seleccionar y centrar', onclick: function () { ui.sel = { type: 'area', id: a.id }; renderAll(); focusArea(a); } },
              ic(a.photos.length ? 'camera' : 'area'), h('span', { class: 'grow' }, a.name || 'Área'),
              isProc(m) ? h('span', { class: 'badge ' + (a.processes.length ? 'blue' : 'warn') }, a.processes.length + ' proc.') : null,
              a.photos.length ? null : h('span', { class: 'badge warn' }, 'Foto pend.'));
            list.append(h('div', { class: 'area-item' + (isSel ? ' sel' : '') }, main,
              h('button', { class: 'rename', title: 'Renombrar área', 'aria-label': 'Renombrar ' + (a.name || 'área'), onclick: function () { inlineRename(main, a.name, function (v) { a.name = v; }); } }, ic('edit'))));
          });
          card.append(list);
        }
        sc.append(card);
      });
    } else {
      var q = h('input', { type: 'search', placeholder: 'Buscar químico…', value: ui.chemQuery, 'aria-label': 'Buscar químico' });
      q.addEventListener('input', function () { ui.chemQuery = q.value; fillChems(); });
      var listBox = h('div');
      function fillChems() {
        listBox.innerHTML = '';
        var qq = norm(ui.chemQuery);
        sortedChems().filter(function (c) { return !qq || norm(c.name).indexOf(qq) >= 0; }).forEach(function (c) {
          var uses = usageCount(c.id);
          listBox.append(h('button', { class: 'chem-item' + (ui.view === 'chem' && ui.chemId === c.id ? ' sel' : ''), onclick: function () { ui.view = 'chem'; ui.chemId = c.id; ui.sel = null; renderAll(); } },
            chemIc(c), h('span', { class: 'grow' }, h('b', null, c.name),
              h('small', null, uses ? uses + ' pictogramas · ' : 'Sin uso · '),
              c.fichas.length ? h('small', null, c.fichas.length + (c.fichas.length === 1 ? ' ficha' : ' fichas')) : h('span', { class: 'badge warn' }, 'Ficha pendiente'))));
        });
      }
      fillChems();
      sc.append(h('div', { class: 'side-title' }, h('span', null, 'Biblioteca de químicos'),
        h('button', { class: 'btn sm', onclick: newChem }, ic('plus'), 'Nuevo')),
        h('div', { class: 'search', style: { 'padding-top': 0 } }, q),
        h('div', { style: { padding: '4px 6px 6px' } }, listBox),
        h('div', { class: 'pad' }, h('button', { class: 'btn block', onclick: function () { openPdfImport(null); } }, ic('pdf'), 'Importar etiquetas desde PDF')));
    }
    left.append(sc);
    sc.scrollTop = top;
  }
  /* Reemplaza un elemento por un campo de texto para renombrar en el sitio. */
  function inlineRename(holder, current, onSave) {
    var inp = h('input', { class: 'inline-rename', value: current || '', 'aria-label': 'Nuevo nombre' });
    holder.replaceWith(inp);
    inp.focus({ preventScroll: true }); inp.select();
    var done = false;
    function finish(save) {
      if (done) return; done = true;
      var v = inp.value.trim();
      if (save && v && v !== current) { commit(function () { onSave(v); }); toast('Nombre actualizado'); }
      else renderAll();
    }
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
    });
    inp.addEventListener('blur', function () { finish(true); });
  }

  /* Pestaña «Áreas y procesos» de un mapa de procesos. */
  function renderProcTree(sc, m) {
    var q = h('input', { type: 'search', placeholder: 'Buscar área o proceso…', value: ui.procQuery || '', 'aria-label': 'Buscar área o proceso' });
    var box = h('div', { class: 'tree' });
    q.addEventListener('input', function () { ui.procQuery = q.value; fill(); });
    function fill() {
      box.innerHTML = '';
      var qq = norm(ui.procQuery);
      var shown = 0;
      m.areas.forEach(function (a) {
        var areaHit = !qq || norm(a.name).indexOf(qq) >= 0;
        var procs = a.processes.filter(function (pr) { return areaHit || norm(pr.name).indexOf(qq) >= 0; });
        if (!areaHit && !procs.length) return;
        shown++;
        var isSel = ui.sel && ui.sel.type === 'area' && ui.sel.id === a.id;
        var open = h('button', { class: 'tree-open', title: 'Seleccionar y centrar en el plano', onclick: function () { ui.sel = { type: 'area', id: a.id }; renderAll(); focusArea(a); } },
          ic('area'), h('span', { class: 'grow' }, a.name || 'Área'),
          h('span', { class: 'badge ' + (a.processes.length ? 'blue' : 'warn') }, a.processes.length ? a.processes.length + ' proc.' : 'sin procesos'));
        var node = h('div', { class: 'tree-area' + (isSel ? ' sel' : '') },
          h('div', { class: 'tree-head' }, open,
            h('button', { class: 'rename', title: 'Renombrar área', 'aria-label': 'Renombrar ' + (a.name || 'área'), onclick: function () { inlineRename(open, a.name, function (v) { a.name = v; }); } }, ic('edit'))));
        procs.forEach(function (pr) {
          var i = a.processes.indexOf(pr);
          node.append(h('button', { class: 'tree-proc', title: 'Editar proceso', onclick: function () { ui.sel = { type: 'area', id: a.id }; openProcessEditor(m, a, pr.id); } },
            h('span', { class: 'step-num sm' }, String(i + 1)), h('span', { class: 'grow' }, pr.name || 'Proceso'),
            h('small', null, pr.steps.length + (pr.steps.length === 1 ? ' paso' : ' pasos'))));
        });
        node.append(h('button', { class: 'tree-add', onclick: function () {
          var pr = newProcess();
          commit(function () { a.processes.push(pr); ui.sel = { type: 'area', id: a.id }; });
          openProcessEditor(m, a, pr.id);
        } }, ic('plus'), 'Agregar proceso'));
        box.append(node);
      });
      if (!m.areas.length) box.append(h('div', { class: 'pending-box', style: { margin: '8px' } }, ic('area'), 'Este mapa aún no tiene áreas. Pulsa «+ Área» y dibuja un rectángulo sobre el plano.'));
      else if (!shown) box.append(h('p', { class: 'help pad' }, 'Sin resultados.'));
    }
    fill();
    sc.append(h('div', { class: 'side-title' }, h('span', null, 'Áreas del mapa (' + m.areas.length + ')'),
        h('button', { class: 'btn sm', title: 'Dibujar una nueva área en el plano', onclick: function () { ui.view = 'map'; setTool('area'); toast('Dibuja el área arrastrando sobre el plano'); } }, ic('plus'), 'Área')),
      h('div', { class: 'search', style: { 'padding-top': 0 } }, q),
      box,
      h('p', { class: 'help pad' }, 'Toca ✎ para renombrar un área. Toca un proceso para editar sus pasos.'));
  }

  function usageCount(chemId) {
    var n = 0;
    project.maps.forEach(function (m) { m.markers.forEach(function (mk) { if (mk.chem === chemId) n++; }); });
    return n;
  }

  // ------------------------------------------------------------------ centro
  var canvasRefs = null, canvasObserver = null, spaceDown = false;
  document.addEventListener('keydown', function (e) { if (e.code === 'Space' && !isTyping(e)) { spaceDown = true; if (canvasRefs) e.preventDefault(); } });
  document.addEventListener('keyup', function (e) { if (e.code === 'Space') spaceDown = false; });
  function renderCenter() {
    center.innerHTML = '';
    canvasRefs = null;
    if (canvasObserver) { canvasObserver.disconnect(); canvasObserver = null; }
    if (ui.view === 'chem' && chem(ui.chemId)) return renderChemEditor();
    var m = curMap();
    if (!m) {
      center.append(h('div', { class: 'canvas-empty' }, h('div', { class: 'drop' }, ic('map'), h('b', null, 'No hay mapas'),
        h('p', null, 'Crea un mapa y sube la imagen del plano (PNG, JPG o WebP).'),
        h('button', { class: 'btn primary', onclick: newMapDialog }, ic('plus'), 'Nuevo mapa'))));
      return;
    }
    // barra de herramientas
    var chemSel = h('select', { 'aria-label': 'Sustancia a colocar', title: 'Sustancia a colocar' },
      h('option', { value: '' }, '— Elige sustancia —'),
      sortedChems().map(function (c) { return h('option', { value: c.id, selected: c.id === ui.toolChem }, c.name); }));
    chemSel.addEventListener('change', function () { ui.toolChem = chemSel.value || null; if (ui.toolChem) setTool('marker'); else renderCenter(); });
    function toolBtn(id, icon, label, key) {
      return h('button', { class: 'tool', 'aria-pressed': String(ui.tool === id), title: label + ' (' + key + ')', onclick: function () { setTool(id); } }, ic(icon), label, h('kbd', null, key));
    }
    var hints = {
      select: 'Clic para seleccionar · arrastra para mover · arrastra el fondo para desplazar · rueda para zoom',
      area: 'Arrastra sobre el plano para dibujar el área',
      marker: ui.toolChem ? 'Clic en el plano para colocar «' + (chem(ui.toolChem) || {}).name + '». Esc para terminar' : 'Elige la sustancia en la lista para colocar pictogramas',
      label: 'Clic en el plano para añadir un texto (p. ej. «Usted está aquí»)'
    };
    if (isProc(m)) {
      if (ui.tool === 'marker') ui.tool = 'select';
      hints.area = 'Arrastra sobre el plano para delimitar el área; luego agrégale sus procesos en el panel derecho';
    }
    if (ui.tool === 'area') {
      hints.area = {
        rect: 'Arrastra sobre el plano para dibujar un rectángulo',
        ellipse: 'Arrastra para dibujar un círculo/elipse · mantén Mayús para un círculo perfecto',
        cells: 'Pinta celdas arrastrando · empezar sobre una celda pintada la borra · Enter para terminar, Esc para cancelar'
      }[ui.areaShape];
    }
    var shapeBar = null;
    if (ui.tool === 'area') {
      shapeBar = h('div', { class: 'shape-bar', role: 'group', 'aria-label': 'Forma del área' }, SHAPES.map(function (sp) {
        return h('button', { class: 'shape-btn', 'aria-pressed': String(ui.areaShape === sp[0]), title: sp[1], onclick: function () {
          if (ui.areaShape === 'cells' && sp[0] !== 'cells' && ui.cellDraft && draftKeys(ui.cellDraft).length && !confirm('¿Descartar las celdas pintadas?')) return;
          if (sp[0] !== 'cells') ui.cellDraft = null;
          ui.areaShape = sp[0]; renderCenter();
        } }, ic(sp[2]), sp[1]);
      }));
    }
    var cellsBar = null;
    if (ui.tool === 'area' && ui.areaShape === 'cells') {
      var dr = cellDraft(m);
      var editing = dr.areaId ? m.areas.filter(function (x) { return x.id === dr.areaId; })[0] : null;
      var minS = Math.max(4, Math.round(m.bgWidth / 200)), maxS = Math.round(m.bgWidth / 12);
      var size = h('input', { type: 'range', min: String(minS), max: String(maxS), step: '1', value: String(dr.size), title: 'Tamaño de celda' });
      var sizeLbl = h('span', { class: 'cells-size' }, dr.size + ' px');
      size.addEventListener('input', function () {
        var ns = parseInt(size.value, 10);
        resizeDraft(m, dr, ns); m.gridSize = ns; sizeLbl.textContent = ns + ' px'; scheduleSave();
        if (canvasRefs && canvasRefs.grid) canvasRefs.grid.style.backgroundSize = ns + 'px ' + ns + 'px';
        renderDraftCells();
      });
      cellsBar = h('div', { class: 'toolbar cells-bar' },
        h('b', null, editing ? 'Editando forma de «' + editing.name + '»' : 'Nueva área por celdas'),
        h('label', { class: 'row', style: { gap: '6px' } }, 'Tamaño de celda', size, sizeLbl),
        h('span', { id: 'cells-count', class: 'badge blue' }, ''),
        h('div', { class: 'grow' }),
        h('button', { class: 'btn sm', onclick: function () { dr.set = {}; renderDraftCells(); } }, 'Limpiar'),
        h('button', { class: 'btn sm', onclick: cancelCells }, 'Cancelar'),
        h('button', { class: 'btn sm primary', id: 'cells-ok', onclick: confirmCells }, ic('plus'), editing ? 'Guardar forma' : 'Crear área'));
    }
    var toolbar = h('div', { class: 'toolbar' },
      toolBtn('select', 'select', 'Seleccionar', 'V'),
      toolBtn('area', 'area', 'Área', 'A'),
      shapeBar,
      isProc(m) ? null : toolBtn('marker', 'marker', 'Pictograma', 'P'),
      isProc(m) ? null : chemSel,
      toolBtn('label', 'text', 'Texto', 'T'),
      h('span', { class: 'tool-hint' }, hints[ui.tool]));
    var canvas = h('div', { class: 'canvas t-' + ui.tool + (isProc(m) ? ' proc' : '') + (ui.tool === 'area' ? ' sh-' + ui.areaShape : '') });
    append(center, [toolbar, cellsBar, canvas]);
    if (!m.background) {
      var drop = h('div', { class: 'drop' }, ic('image'), h('b', null, 'Sube el plano base de «' + (m.name || 'mapa') + '»'),
        h('p', null, 'Arrastra aquí una imagen (PNG, JPG o WebP) o elige un archivo.'),
        h('button', { class: 'btn primary', onclick: function () { pickFiles('image/*').then(function (f) { if (f[0]) setBackground(m, f[0]); }); } }, ic('open'), 'Elegir imagen'));
      canvas.append(h('div', { class: 'canvas-empty' }, drop));
      canvas.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('over'); });
      canvas.addEventListener('dragleave', function () { drop.classList.remove('over'); });
      canvas.addEventListener('drop', function (e) { e.preventDefault(); var f = e.dataTransfer.files[0]; if (f) setBackground(m, f); });
      return;
    }
    var stage = h('div', { class: 'stage', style: { width: m.bgWidth + 'px', height: m.bgHeight + 'px' } },
      h('img', { class: 'bg', src: project.assets[m.background], alt: '', draggable: 'false' }));
    var overlay = h('div', { style: { position: 'absolute', inset: '0' } });
    var grid = null, draftLayer = null;
    if (ui.tool === 'area' && ui.areaShape === 'cells') {
      var gs = cellDraft(m).size;
      grid = h('div', { class: 'grid-overlay', style: { 'background-size': gs + 'px ' + gs + 'px' } });
      draftLayer = h('div', { class: 'draft-layer' });
      stage.append(grid);
    }
    stage.append(overlay);
    if (draftLayer) stage.append(draftLayer);
    var pct = h('div', { class: 'pct' });
    canvas.append(stage, h('div', { class: 'zoomctl' },
      h('button', { title: 'Acercar', 'aria-label': 'Acercar', onclick: function () { zoomBy(1.4); } }, ic('plus')),
      h('button', { title: 'Alejar', 'aria-label': 'Alejar', onclick: function () { zoomBy(1 / 1.4); } }, ic('minus')),
      h('button', { title: 'Ajustar a la pantalla', 'aria-label': 'Ajustar', onclick: function () { fitView(); } }, ic('fit')), pct));
    canvasRefs = { m: m, canvas: canvas, stage: stage, overlay: overlay, pct: pct, grid: grid, draftLayer: draftLayer };
    bindCanvas(canvasRefs);
    renderCanvas();
    renderDraftCells();
    var v = ui.views[m.id];
    if (!v) requestAnimationFrame(function () { fitView(); }); else applyView();
    if (window.ResizeObserver) { canvasObserver = new ResizeObserver(function () { var vv = ui.views[m.id]; if (vv && vv.fit) fitView(); }); canvasObserver.observe(canvas); }
  }

  function setTool(t) {
    if (t === 'marker' && isProc(curMap())) return;
    if (t !== 'area' && ui.cellDraft) {
      if (draftKeys(ui.cellDraft).length && !confirm('¿Descartar las celdas pintadas sin crear el área?')) return;
      ui.cellDraft = null;
    }
    ui.tool = t;
    if (t === 'marker' && !ui.toolChem) {
      var a = selArea();
      ui.toolChem = (a && a.chems[0]) || (sortedChems()[0] || {}).id || null;
    }
    renderCenter();
  }

  // vista (zoom/desplazamiento) del lienzo
  function getView() { var m = curMap(); return ui.views[m.id] || (ui.views[m.id] = { s: 1, tx: 0, ty: 0, fit: true }); }
  function applyView() {
    if (!canvasRefs) return;
    var v = getView(), m = canvasRefs.m;
    canvasRefs.stage.style.transform = 'translate(' + v.tx + 'px,' + v.ty + 'px) scale(' + v.s + ')';
    canvasRefs.stage.style.setProperty('--inv', (1 / v.s).toFixed(4));
    var base = m.bgWidth * 0.0165 * (m.markerSize || 1);
    var screen = clamp(base * v.s, 10, 34);
    canvasRefs.stage.style.setProperty('--mk', (screen / v.s).toFixed(2) + 'px');
    canvasRefs.pct.textContent = Math.round(v.s * 100) + '%';
  }
  function fitView() {
    if (!canvasRefs) return;
    var c = canvasRefs.canvas, m = canvasRefs.m, v = getView();
    var vw = c.clientWidth, vh = c.clientHeight;
    if (!vw || !vh) return;
    v.s = Math.min((vw - 50) / m.bgWidth, (vh - 50) / m.bgHeight);
    v.tx = (vw - m.bgWidth * v.s) / 2; v.ty = (vh - m.bgHeight * v.s) / 2; v.fit = true;
    applyView();
  }
  function zoomBy(f, cx, cy) {
    if (!canvasRefs) return;
    var v = getView(), c = canvasRefs.canvas;
    if (cx == null) { cx = c.clientWidth / 2; cy = c.clientHeight / 2; }
    var ns = clamp(v.s * f, 0.05, 8);
    v.tx = cx - (cx - v.tx) * ns / v.s; v.ty = cy - (cy - v.ty) * ns / v.s; v.s = ns; v.fit = false;
    applyView();
  }
  function focusArea(a) {
    if (!canvasRefs) return;
    var m = canvasRefs.m, c = canvasRefs.canvas, v = getView();
    var aw = a.w / 100 * m.bgWidth, ah = a.h / 100 * m.bgHeight;
    var cx = (a.x + a.w / 2) / 100 * m.bgWidth, cy = (a.y + a.h / 2) / 100 * m.bgHeight;
    v.s = clamp(Math.min(c.clientWidth / (aw * 3), c.clientHeight / (ah * 3)), 0.1, 3);
    v.tx = c.clientWidth / 2 - cx * v.s; v.ty = c.clientHeight / 2 - cy * v.s; v.fit = false;
    applyView();
  }

  /* Dibuja areas, pictogramas y textos sobre el plano. */
  function renderCanvas() {
    if (!canvasRefs) return;
    var m = canvasRefs.m, ov = canvasRefs.overlay;
    ov.innerHTML = '';
    m.areas.forEach(function (a) {
      var sel = ui.sel && ui.sel.type === 'area' && ui.sel.id === a.id;
      var sh = shapeOf(a);
      if (ui.cellDraft && ui.cellDraft.areaId === a.id) return; // se está editando su forma
      var el = h('div', { class: 'ed-area shape-' + sh + (sel ? ' sel' : ''), 'data-kind': 'area', 'data-id': a.id,
        style: { left: a.x + '%', top: a.y + '%', width: a.w + '%', height: a.h + '%' } },
        h('span', { class: 'ed-area-tag' }, a.name || 'Área',
          isProc(m) ? h('span', { class: 'badge ' + (a.processes.length ? 'blue' : 'warn') }, a.processes.length ? a.processes.length + (a.processes.length === 1 ? ' proceso' : ' procesos') : 'sin procesos') : null,
          a.photos.length ? null : h('span', { class: 'badge warn' }, 'foto pend.')));
      if (sh === 'cells' && a.grid) el.prepend(cellsSvg(a.grid.size, a.grid.cells));
      if (sel && sh !== 'cells') ['nw', 'ne', 'sw', 'se'].forEach(function (k) { el.append(h('span', { class: 'handle ' + k, 'data-kind': 'handle', 'data-h': k })); });
      ov.append(el);
    });
    m.markers.forEach(function (mk) {
      var c = chem(mk.chem);
      var sel = ui.sel && ui.sel.type === 'marker' && ui.sel.id === mk.id;
      ov.append(h('div', { class: 'ed-mk' + (sel ? ' sel' : '') + (mk.area ? '' : ' loose'), 'data-kind': 'marker', 'data-id': mk.id, title: (c ? c.name : '?') + (mk.area ? '' : ' (sin área)'),
        style: { left: mk.x + '%', top: mk.y + '%', '--f': c ? c.fill : '#ccc', '--r': c ? c.ring : '#999' } }));
    });
    (m.labels || []).forEach(function (l) {
      var sel = ui.sel && ui.sel.type === 'label' && ui.sel.id === l.id;
      ov.append(h('div', { class: 'ed-label' + (sel ? ' sel' : ''), 'data-kind': 'label', 'data-id': l.id,
        style: { left: l.x + '%', top: l.y + '%', 'font-size': (12 * (l.size || 1)) + 'px' } }, l.text || 'Texto'));
    });
    applyView();
  }

  // ------------------------------------------------------------ formas de área
  /* Formas: 'rect' (por defecto), 'ellipse' (dentro del rectángulo x,y,w,h)
     y 'cells': celdas de una cuadrícula de grid.size px del plano, guardadas
     como "columna,fila" (x,y,w,h es el rectángulo que las contiene). */
  var SHAPES = [['rect', 'Rectángulo', 'shRect'], ['ellipse', 'Círculo', 'shEllipse'], ['cells', 'Cuadrícula', 'shCells']];
  function shapeOf(a) { return a.shape === 'ellipse' || a.shape === 'cells' ? a.shape : 'rect'; }
  function gridSizeOf(m) { return m.gridSize || Math.max(8, Math.round(m.bgWidth / 50)); }
  function parseCell(k) { var p = k.split(','); return [parseInt(p[0], 10), parseInt(p[1], 10)]; }
  function cellsBox(size, keys) {
    var c0 = Infinity, r0 = Infinity, c1 = -Infinity, r1 = -Infinity;
    keys.forEach(function (k) { var c = parseCell(k); c0 = Math.min(c0, c[0]); r0 = Math.min(r0, c[1]); c1 = Math.max(c1, c[0]); r1 = Math.max(r1, c[1]); });
    return { x: c0 * size, y: r0 * size, w: (c1 - c0 + 1) * size, h: (r1 - r0 + 1) * size };
  }
  function setCells(m, a, size, keys) {
    var b = cellsBox(size, keys);
    a.shape = 'cells';
    a.grid = { size: size, cells: keys.slice().sort() };
    a.x = r3(b.x / m.bgWidth * 100); a.y = r3(b.y / m.bgHeight * 100);
    a.w = r3(b.w / m.bgWidth * 100); a.h = r3(b.h / m.bgHeight * 100);
  }
  function pointInArea(m, a, x, y) {
    if (x < a.x || x > a.x + a.w || y < a.y || y > a.y + a.h) return false;
    var sh = shapeOf(a);
    if (sh === 'ellipse') {
      var nx = (x - (a.x + a.w / 2)) / (a.w / 2), ny = (y - (a.y + a.h / 2)) / (a.h / 2);
      return nx * nx + ny * ny <= 1;
    }
    if (sh === 'cells' && a.grid) {
      var sz = a.grid.size, px = x / 100 * m.bgWidth, py = y / 100 * m.bgHeight;
      return a.grid.cells.indexOf(Math.floor(px / sz) + ',' + Math.floor(py / sz)) >= 0;
    }
    return true;
  }
  /* Celdas (de tamaño size) cuyo centro cae dentro de la forma del área. */
  function rasterize(m, a, size) {
    var x0 = a.x / 100 * m.bgWidth, y0 = a.y / 100 * m.bgHeight, x1 = x0 + a.w / 100 * m.bgWidth, y1 = y0 + a.h / 100 * m.bgHeight;
    var out = [];
    for (var c = Math.floor(x0 / size); c * size < x1; c++) for (var r = Math.floor(y0 / size); r * size < y1; r++) {
      var cx = (c + 0.5) * size / m.bgWidth * 100, cy = (r + 0.5) * size / m.bgHeight * 100;
      if (pointInArea(m, a, cx, cy)) out.push(c + ',' + r);
    }
    if (!out.length) out.push(Math.floor((x0 + x1) / 2 / size) + ',' + Math.floor((y0 + y1) / 2 / size));
    return out;
  }
  /* SVG con relleno y contorno exterior de un conjunto de celdas (coordenadas relativas a su caja). */
  function cellsSvg(size, keys, cls) {
    var b = cellsBox(size, keys), set = {}, fill = '', edge = '';
    keys.forEach(function (k) { set[k] = 1; });
    keys.forEach(function (k) {
      var c = parseCell(k), x = c[0] * size - b.x, y = c[1] * size - b.y;
      fill += 'M' + x + ' ' + y + 'h' + size + 'v' + size + 'h' + (-size) + 'z';
      if (!set[c[0] + ',' + (c[1] - 1)]) edge += 'M' + x + ' ' + y + 'h' + size;
      if (!set[c[0] + ',' + (c[1] + 1)]) edge += 'M' + x + ' ' + (y + size) + 'h' + size;
      if (!set[(c[0] - 1) + ',' + c[1]]) edge += 'M' + x + ' ' + y + 'v' + size;
      if (!set[(c[0] + 1) + ',' + c[1]]) edge += 'M' + (x + size) + ' ' + y + 'v' + size;
    });
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', cls || 'cells-svg');
    svg.setAttribute('viewBox', '0 0 ' + b.w + ' ' + b.h);
    svg.setAttribute('preserveAspectRatio', 'none');
    var pf = document.createElementNS(ns, 'path'); pf.setAttribute('d', fill); pf.setAttribute('class', 'cf');
    var pe = document.createElementNS(ns, 'path'); pe.setAttribute('d', edge); pe.setAttribute('class', 'ce');
    svg.append(pf, pe);
    return svg;
  }
  function changeShape(m, a, sh) {
    var cur = shapeOf(a);
    if (sh === cur) return;
    commit(function () {
      if (sh === 'cells') { setCells(m, a, gridSizeOf(m), rasterize(m, a, gridSizeOf(m))); }
      else { a.shape = sh; delete a.grid; }
    });
    if (sh === 'cells') toast('Área convertida a celdas. Usa «Editar celdas» para ajustar la forma.');
  }

  /* --- borrador de celdas (modo cuadrícula) --- */
  function cellDraft(m) {
    var d = ui.cellDraft;
    if (!d || d.mapId !== m.id) d = ui.cellDraft = { mapId: m.id, areaId: null, size: gridSizeOf(m), set: {} };
    return d;
  }
  function draftKeys(d) { return Object.keys(d.set); }
  function startEditCells(m, a) {
    var keys = a.grid ? a.grid.cells : rasterize(m, a, gridSizeOf(m));
    var set = {}; keys.forEach(function (k) { set[k] = 1; });
    ui.cellDraft = { mapId: m.id, areaId: a.id, size: a.grid ? a.grid.size : gridSizeOf(m), set: set };
    ui.areaShape = 'cells'; ui.tool = 'area';
    renderAll();
  }
  function resizeDraft(m, d, newSize) {
    var old = d.size, set = {};
    var keys = draftKeys(d);
    if (keys.length) {
      var b = cellsBox(old, keys);
      for (var c = Math.floor(b.x / newSize); c * newSize < b.x + b.w; c++) for (var r = Math.floor(b.y / newSize); r * newSize < b.y + b.h; r++) {
        var cx = (c + 0.5) * newSize, cy = (r + 0.5) * newSize;
        if (d.set[Math.floor(cx / old) + ',' + Math.floor(cy / old)]) set[c + ',' + r] = 1;
      }
    }
    d.set = set; d.size = newSize;
  }
  function confirmCells() {
    var m = curMap(), d = ui.cellDraft;
    if (!m || !d) return;
    var keys = draftKeys(d);
    if (!keys.length) { toast('Pinta al menos una celda sobre el plano', true); return; }
    var a = d.areaId ? m.areas.filter(function (x) { return x.id === d.areaId; })[0] : null;
    var isNew = !a;
    commit(function () {
      if (isNew) { a = { id: uid('area'), name: 'Nueva área ' + (m.areas.length + 1), desc: '', photos: [], chems: [], processes: [] }; m.areas.push(a); }
      setCells(m, a, d.size, keys);
      if (isNew) m.markers.forEach(function (mk) { if (!mk.area && pointInArea(m, a, mk.x, mk.y)) assignMarkerArea(m, mk); });
      ui.sel = { type: 'area', id: a.id }; ui.tool = 'select'; ui.cellDraft = null;
    });
    toast(isNew ? 'Área creada' : 'Forma actualizada');
    if (isNew) { var inp = right.querySelector('input'); if (inp) { inp.focus({ preventScroll: true }); inp.select(); } }
  }
  function cancelCells() { ui.cellDraft = null; ui.tool = 'select'; renderAll(); }
  function renderDraftCells() {
    if (!canvasRefs) return;
    var layer = canvasRefs.draftLayer; if (!layer) return;
    layer.innerHTML = '';
    var d = ui.cellDraft, m = canvasRefs.m;
    var keys = d ? draftKeys(d) : [];
    if (keys.length) {
      var b = cellsBox(d.size, keys);
      var box = h('div', { class: 'cells-draft', style: { left: (b.x / m.bgWidth * 100) + '%', top: (b.y / m.bgHeight * 100) + '%', width: (b.w / m.bgWidth * 100) + '%', height: (b.h / m.bgHeight * 100) + '%' } });
      box.append(cellsSvg(d.size, keys));
      layer.append(box);
    }
    var cnt = document.getElementById('cells-count');
    if (cnt) cnt.textContent = keys.length + (keys.length === 1 ? ' celda' : ' celdas');
    var ok = document.getElementById('cells-ok');
    if (ok) ok.disabled = !keys.length;
  }

  function areaAt(m, x, y, exceptId) {
    for (var i = m.areas.length - 1; i >= 0; i--) {
      var a = m.areas[i];
      if (a.id !== exceptId && pointInArea(m, a, x, y)) return a;
    }
    return null;
  }
  function assignMarkerArea(m, mk) {
    var a = areaAt(m, mk.x, mk.y);
    mk.area = a ? a.id : null;
    if (a && a.chems.indexOf(mk.chem) < 0) a.chems.push(mk.chem);
  }

  function bindCanvas(refs) {
    var canvas = refs.canvas, m = refs.m;
    var drag = null;
    function pt(e) {
      var r = refs.stage.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
    }
    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = canvas.getBoundingClientRect();
      var dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      zoomBy(Math.exp(-dy * 0.0016), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { if (e.target.closest('[data-kind]')) e.preventDefault(); });

    canvas.addEventListener('pointerdown', function (e) {
      if (e.button === 2) return;
      var target = e.target.closest('[data-kind]');
      var kind = target ? target.getAttribute('data-kind') : null;
      var id = target ? target.getAttribute('data-id') : null;
      var p = pt(e), v = getView();
      var startClient = { x: e.clientX, y: e.clientY };
      if (e.button === 1 || spaceDown || (ui.tool === 'select' && !kind) || (ui.tool === 'marker' && !ui.toolChem)) {
        drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, tx: v.tx, ty: v.ty, start: startClient, clickDeselect: ui.tool === 'select' && !kind };
      } else if (ui.tool === 'select') {
        if (kind === 'handle') {
          var a = selArea();
          drag = { mode: 'resize', h: target.getAttribute('data-h'), a: a, orig: clone(a), p0: p, start: startClient, snap: snapshot(), moved: false };
        } else if (kind === 'marker') {
          var mk = m.markers.filter(function (x) { return x.id === id; })[0];
          ui.sel = { type: 'marker', id: id };
          drag = { mode: 'marker', mk: mk, orig: { x: mk.x, y: mk.y }, p0: p, start: startClient, snap: snapshot(), moved: false, el: target };
          markSelected();
        } else if (kind === 'label') {
          var lb = m.labels.filter(function (x) { return x.id === id; })[0];
          ui.sel = { type: 'label', id: id };
          drag = { mode: 'label', lb: lb, orig: { x: lb.x, y: lb.y }, p0: p, start: startClient, snap: snapshot(), moved: false, el: target };
          markSelected();
        } else if (kind === 'area') {
          var ar = m.areas.filter(function (x) { return x.id === id; })[0];
          ui.sel = { type: 'area', id: id };
          var inner = m.markers.filter(function (x) { return x.area === ar.id; });
          drag = { mode: 'area', a: ar, orig: { x: ar.x, y: ar.y, cells: ar.grid ? ar.grid.cells.slice() : null }, inner: inner.map(function (x) { return { mk: x, x: x.x, y: x.y }; }), p0: p, start: startClient, snap: snapshot(), moved: false, el: target };
          markSelected();
        }
      } else if (ui.tool === 'area' && ui.areaShape === 'cells') {
        var dr = cellDraft(m);
        var key = cellKeyAt(p, dr.size);
        drag = { mode: 'paint', erase: !!dr.set[key], last: p, start: startClient };
        paintAt(p, drag);
      } else if (ui.tool === 'area') {
        var draft = h('div', { class: 'draft' + (ui.areaShape === 'ellipse' ? ' ellipse' : '') });
        refs.overlay.append(draft);
        drag = { mode: 'draw', p0: p, draft: draft, start: startClient };
      } else {
        drag = { mode: 'place', start: startClient };
      }
      if (drag) { canvas.setPointerCapture(e.pointerId); e.preventDefault(); }
    });
    function cellKeyAt(pp, size) { return Math.floor(pp.x / 100 * m.bgWidth / size) + ',' + Math.floor(pp.y / 100 * m.bgHeight / size); }
    function paintAt(pp, dg) {
      var d = cellDraft(m), from = dg.last || pp;
      var dx = (pp.x - from.x) / 100 * m.bgWidth, dy = (pp.y - from.y) / 100 * m.bgHeight;
      var steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (d.size / 2)));
      for (var i = 0; i <= steps; i++) {
        var q = { x: from.x + (pp.x - from.x) * i / steps, y: from.y + (pp.y - from.y) * i / steps };
        if (q.x < 0 || q.y < 0 || q.x > 100 || q.y > 100) continue;
        var k = cellKeyAt(q, d.size);
        if (dg.erase) delete d.set[k]; else d.set[k] = 1;
      }
      dg.last = pp;
      renderDraftCells();
    }
    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      if (drag.mode === 'paint') { paintAt(pt(e), drag); return; }
      var dist = Math.hypot(e.clientX - drag.start.x, e.clientY - drag.start.y);
      var p = pt(e), v = getView();
      if (drag.mode === 'pan') {
        if (dist > 3) { canvas.classList.add('panning'); drag.panned = true; }
        v.tx = drag.tx + e.clientX - drag.sx; v.ty = drag.ty + e.clientY - drag.sy; v.fit = false; applyView();
        return;
      }
      if (dist < 3 && !drag.moved) return;
      if (!drag.moved && drag.snap) { drag.moved = true; }
      var dx = p.x - (drag.p0 ? drag.p0.x : 0), dy = p.y - (drag.p0 ? drag.p0.y : 0);
      if (drag.mode === 'marker') {
        drag.mk.x = r3(clamp(drag.orig.x + dx, 0, 100)); drag.mk.y = r3(clamp(drag.orig.y + dy, 0, 100));
        drag.el.style.left = drag.mk.x + '%'; drag.el.style.top = drag.mk.y + '%';
      } else if (drag.mode === 'label') {
        drag.lb.x = r3(clamp(drag.orig.x + dx, 0, 100)); drag.lb.y = r3(clamp(drag.orig.y + dy, 0, 100));
        drag.el.style.left = drag.lb.x + '%'; drag.el.style.top = drag.lb.y + '%';
      } else if (drag.mode === 'area' && drag.orig.cells) {
        var A2 = drag.a, sz = A2.grid.size;
        var dc = Math.round(dx / 100 * m.bgWidth / sz), drr = Math.round(dy / 100 * m.bgHeight / sz);
        A2.grid.cells = drag.orig.cells.map(function (k) { var c = parseCell(k); return (c[0] + dc) + ',' + (c[1] + drr); });
        setCells(m, A2, sz, A2.grid.cells);
        var rdx2 = A2.x - drag.orig.x, rdy2 = A2.y - drag.orig.y;
        drag.inner.forEach(function (it) { it.mk.x = r3(it.x + rdx2); it.mk.y = r3(it.y + rdy2); });
        drag.el.style.left = A2.x + '%'; drag.el.style.top = A2.y + '%';
        drag.inner.forEach(function (it) {
          var el2 = refs.overlay.querySelector('.ed-mk[data-id="' + it.mk.id + '"]');
          if (el2) { el2.style.left = it.mk.x + '%'; el2.style.top = it.mk.y + '%'; }
        });
      } else if (drag.mode === 'area') {
        var a = drag.a;
        a.x = r3(clamp(drag.orig.x + dx, 0, 100 - a.w)); a.y = r3(clamp(drag.orig.y + dy, 0, 100 - a.h));
        var rdx = a.x - drag.orig.x, rdy = a.y - drag.orig.y;
        drag.inner.forEach(function (it) { it.mk.x = r3(it.x + rdx); it.mk.y = r3(it.y + rdy); });
        drag.el.style.left = a.x + '%'; drag.el.style.top = a.y + '%';
        drag.inner.forEach(function (it) {
          var el = refs.overlay.querySelector('.ed-mk[data-id="' + it.mk.id + '"]');
          if (el) { el.style.left = it.mk.x + '%'; el.style.top = it.mk.y + '%'; }
        });
      } else if (drag.mode === 'resize') {
        var o = drag.orig, A = drag.a, x0 = o.x, y0 = o.y, x1 = o.x + o.w, y1 = o.y + o.h;
        if (drag.h.indexOf('w') >= 0) x0 = clamp(o.x + dx, 0, x1 - 0.5);
        if (drag.h.indexOf('e') >= 0) x1 = clamp(o.x + o.w + dx, x0 + 0.5, 100);
        if (drag.h.indexOf('n') >= 0) y0 = clamp(o.y + dy, 0, y1 - 0.5);
        if (drag.h.indexOf('s') >= 0) y1 = clamp(o.y + o.h + dy, y0 + 0.5, 100);
        A.x = r3(x0); A.y = r3(y0); A.w = r3(x1 - x0); A.h = r3(y1 - y0);
        var el = refs.overlay.querySelector('.ed-area[data-id="' + A.id + '"]');
        if (el) { el.style.left = A.x + '%'; el.style.top = A.y + '%'; el.style.width = A.w + '%'; el.style.height = A.h + '%'; }
      } else if (drag.mode === 'draw') {
        var px2 = p.x, py2 = p.y;
        if (ui.areaShape === 'ellipse' && e.shiftKey) {
          // circulo perfecto: mismo tamaño en pixeles del plano en ambos ejes
          var wpx = Math.abs(p.x - drag.p0.x) / 100 * m.bgWidth, hpx = Math.abs(p.y - drag.p0.y) / 100 * m.bgHeight, side = Math.max(wpx, hpx);
          px2 = drag.p0.x + Math.sign(p.x - drag.p0.x || 1) * side / m.bgWidth * 100;
          py2 = drag.p0.y + Math.sign(p.y - drag.p0.y || 1) * side / m.bgHeight * 100;
        }
        var x0d = Math.min(drag.p0.x, px2), y0d = Math.min(drag.p0.y, py2);
        drag.rect = { x: clamp(x0d, 0, 100), y: clamp(y0d, 0, 100), w: Math.abs(px2 - drag.p0.x), h: Math.abs(py2 - drag.p0.y) };
        drag.draft.style.left = drag.rect.x + '%'; drag.draft.style.top = drag.rect.y + '%';
        drag.draft.style.width = drag.rect.w + '%'; drag.draft.style.height = drag.rect.h + '%';
      }
    });
    function end(e) {
      if (!drag) return;
      var d = drag; drag = null;
      canvas.classList.remove('panning');
      var p = pt(e);
      if (d.mode === 'pan') {
        if (!d.panned && d.clickDeselect && ui.sel) { ui.sel = null; renderAll(); }
        return;
      }
      if (d.mode === 'paint') return;
      if (d.mode === 'draw') {
        d.draft.remove();
        if (d.rect && d.rect.w > 0.6 && d.rect.h > 0.6) {
          commit(function () {
            var a = { id: uid('area'), name: 'Nueva área ' + (m.areas.length + 1), desc: '', x: r3(d.rect.x), y: r3(d.rect.y),
              w: r3(Math.min(d.rect.w, 100 - d.rect.x)), h: r3(Math.min(d.rect.h, 100 - d.rect.y)), photos: [], chems: [], processes: [] };
            if (ui.areaShape === 'ellipse') a.shape = 'ellipse';
            m.areas.push(a);
            m.markers.forEach(function (mk) { if (!mk.area && pointInArea(m, a, mk.x, mk.y)) assignMarkerArea(m, mk); });
            ui.sel = { type: 'area', id: a.id }; ui.tool = 'select';
          });
          var inp = right.querySelector('input'); if (inp) { inp.focus({ preventScroll: true }); inp.select(); }
        }
        return;
      }
      if (d.mode === 'place') {
        if (Math.hypot(e.clientX - d.start.x, e.clientY - d.start.y) > 4) return;
        if (p.x < 0 || p.y < 0 || p.x > 100 || p.y > 100) return;
        if (ui.tool === 'marker' && ui.toolChem) {
          commit(function () {
            var mk = { id: uid('mk'), chem: ui.toolChem, x: r3(p.x), y: r3(p.y), area: null };
            assignMarkerArea(m, mk);
            m.markers.push(mk);
            ui.sel = { type: 'marker', id: mk.id };
          });
        } else if (ui.tool === 'label') {
          commit(function () {
            m.labels = m.labels || [];
            var lb = { id: uid('txt'), text: 'Usted está aquí', x: r3(p.x), y: r3(p.y), size: 1 };
            m.labels.push(lb);
            ui.sel = { type: 'label', id: lb.id }; ui.tool = 'select';
          });
          var inp2 = right.querySelector('input'); if (inp2) { inp2.focus({ preventScroll: true }); inp2.select(); }
        }
        return;
      }
      if (d.moved) {
        pushUndo(d.snap);
        if (d.mode === 'marker') assignMarkerArea(m, d.mk);
        if (d.mode === 'area' || d.mode === 'resize') {
          m.markers.forEach(function (mk) { if (!mk.area) { var a = areaAt(m, mk.x, mk.y); if (a) assignMarkerArea(m, mk); } });
        }
        changed();
      } else {
        renderAll();
      }
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('dblclick', function (e) {
      var t = e.target.closest('[data-kind=marker]');
      if (t) { var mk = m.markers.filter(function (x) { return x.id === t.getAttribute('data-id'); })[0]; if (mk) { ui.view = 'chem'; ui.chemId = mk.chem; ui.left = 'chems'; renderAll(); } }
      var ta = e.target.closest('[data-kind=area]');
      if (ta && !t) { var inp = right.querySelector('input'); if (inp) { inp.focus({ preventScroll: true }); inp.select(); } }
    });
  }
  function markSelected() {
    if (!canvasRefs) return;
    canvasRefs.overlay.querySelectorAll('.sel').forEach(function (el) { el.classList.remove('sel'); });
    var el = ui.sel && canvasRefs.overlay.querySelector('[data-id="' + ui.sel.id + '"]');
    if (el) el.classList.add('sel');
  }

  function setBackground(m, file) {
    var done = busy('Procesando plano…');
    imageFileToDataUrl(file, 3200, 0.85).then(function (r) {
      done();
      commit(function () {
        m.background = addAsset(r.data, 'plano');
        m.bgWidth = r.width; m.bgHeight = r.height;
        delete ui.views[m.id];
      });
      toast('Plano actualizado');
    }).catch(function (e) { done(); toast(e.message, true); });
  }

  // --------------------------------------------------------------- inspector
  function renderRight() {
    var top = right.scrollTop;
    right.innerHTML = '';
    if (ui.view === 'chem') { renderChemSide(); right.scrollTop = top; return; }
    var m = curMap();
    if (!m) { right.append(h('div', { class: 'pad help' }, 'Crea un mapa para empezar.')); return; }
    var a = selArea(), mk = selMarker(), lb = selLabel();
    if (a) renderAreaPanel(m, a);
    else if (mk) renderMarkerPanel(m, mk);
    else if (lb) renderLabelPanel(m, lb);
    else renderMapPanel(m);
    right.scrollTop = top;
  }
  function field(label, input, extra) { return h('label', { class: 'field' }, h('span', null, label), input, extra || null); }
  function inspHead(iconEl, title, sub, onClose) {
    return h('div', { class: 'insp-head' }, iconEl, h('h3', null, title, sub ? h('small', null, sub) : null),
      onClose ? h('button', { class: 'btn icon ghost', title: 'Cerrar', 'aria-label': 'Cerrar', onclick: onClose }, ic('x')) : null);
  }
  function deselect() { ui.sel = null; renderAll(); }

  function renderMapPanel(m) {
    var name = bindText(h('input'), function () { return m.name; }, function (v) { m.name = v; });
    var title = bindText(h('input'), function () { return m.title; }, function (v) { m.title = v; });
    var sub = bindText(h('input'), function () { return m.subtitle; }, function (v) { m.subtitle = v; });
    var size = h('input', { type: 'range', min: '0.5', max: '2', step: '0.1', value: String(m.markerSize || 1), class: 'grow' });
    var snapS = null;
    size.addEventListener('pointerdown', function () { snapS = snapshot(); });
    size.addEventListener('input', function () { if (snapS) { pushUndo(snapS); snapS = null; } m.markerSize = parseFloat(size.value); applyView(); scheduleSave(); });
    var pendAreas = m.areas.filter(function (a) { return !a.photos.length; });
    if (isProc(m)) return renderProcMapPanel(m, name, title, sub, pendAreas);
    var used = Array.from(Exporter.chemsOfMap(m)).map(chem).filter(Boolean);
    var noFicha = used.filter(function (c) { return !c.fichas.length; });
    right.append(
      inspHead(h('span', { class: 'ed-logo', style: { width: '30px', height: '30px' }, html: ICON.map }), m.name || 'Mapa', 'Propiedades del mapa'),
      h('div', { class: 'sec' },
        field('Nombre corto (pestaña)', name),
        field('Título', title),
        field('Subtítulo', sub)),
      h('div', { class: 'sec' }, h('h4', null, 'Plano base'),
        m.background ? h('img', { src: project.assets[m.background], alt: '', style: { width: '100%', border: '1px solid var(--line)', 'border-radius': '8px', display: 'block', 'margin-bottom': '8px' } }) : null,
        h('button', { class: 'btn block', onclick: function () { pickFiles('image/*').then(function (f) { if (f[0]) setBackground(m, f[0]); }); } }, ic('image'), m.background ? 'Cambiar plano…' : 'Subir plano…'),
        h('p', { class: 'help', style: { 'margin-top': '6px' } }, 'Las áreas y pictogramas se conservan en la misma posición relativa al cambiar el plano.')),
      h('div', { class: 'sec' }, h('h4', null, 'Tamaño de los pictogramas'), h('div', { class: 'row' }, h('span', null, 'A'), size, h('b', { style: { 'font-size': '18px' } }, 'A'))),
      h('div', { class: 'sec' }, h('h4', null, 'Resumen'),
        h('div', { class: 'stat' }, h('span', null, 'Áreas'), h('b', null, m.areas.length)),
        h('div', { class: 'stat' }, h('span', null, 'Pictogramas'), h('b', null, m.markers.length)),
        h('div', { class: 'stat' }, h('span', null, 'Sustancias distintas'), h('b', null, used.length)),
        pendAreas.length ? h('div', { style: { 'margin-top': '8px' } }, h('span', { class: 'badge warn' }, pendAreas.length + ' áreas con foto pendiente'),
          h('div', { class: 'help', style: { 'margin-top': '4px' } }, pendAreas.map(function (a) { return a.name; }).join(' · '))) : h('span', { class: 'badge ok' }, 'Todas las áreas tienen foto'),
        noFicha.length ? h('div', { style: { 'margin-top': '8px' } }, h('span', { class: 'badge warn' }, noFicha.length + ' sustancias sin ficha'),
          h('div', { class: 'help', style: { 'margin-top': '4px' } }, noFicha.map(function (c) { return c.name; }).join(' · '))) : null),
      h('div', { class: 'sec' }, h('h4', null, 'Cómo editar'),
        h('p', { class: 'help' }, '1. Herramienta «Área»: dibuja un rectángulo sobre cada zona clicable.'),
        h('p', { class: 'help' }, '2. Selecciona el área para ponerle nombre, subir fotos y ubicar los químicos en la foto.'),
        h('p', { class: 'help' }, '3. Herramienta «Pictograma»: elige la sustancia y haz clic en el plano.'),
        h('p', { class: 'help' }, '4. En «Químicos» agrega las fichas SGA (imagen o PDF).'),
        h('p', { class: 'help', style: { margin: 0 } }, '5. «Vista previa» y «Exportar HTML».')),
      h('div', { class: 'sec' }, h('div', { class: 'row wrap' },
        h('button', { class: 'btn', onclick: function () { openPreview([m.id]); } }, ic('eye'), 'Vista previa'),
        h('button', { class: 'btn primary', onclick: function () { exportMaps([m.id]); } }, ic('download'), 'Exportar'),
        h('button', { class: 'btn', onclick: function () { cloneMapDialog(m); } }, ic('copy'), 'Clonar…'),
        h('button', { class: 'btn danger', onclick: function () { deleteMap(m); } }, ic('trash'), 'Eliminar'))));
  }

  function renderProcMapPanel(m, name, title, sub, pendAreas) {
    var nProc = procCount(m), nSteps = 0;
    var empty = m.areas.filter(function (a) { return !a.processes.length; });
    var noSteps = [];
    m.areas.forEach(function (a) { a.processes.forEach(function (pr) { nSteps += pr.steps.length; if (!pr.steps.length) noSteps.push(pr.name || 'Proceso'); }); });
    right.append(
      inspHead(h('span', { class: 'ed-logo', style: { width: '30px', height: '30px' }, html: ICON.steps }), m.name || 'Mapa', 'Mapa de procesos'),
      h('div', { class: 'sec' }, field('Nombre corto (pestaña)', name), field('Título', title), field('Subtítulo', sub)),
      h('div', { class: 'sec' }, h('h4', null, 'Plano base'),
        m.background ? h('img', { src: project.assets[m.background], alt: '', style: { width: '100%', border: '1px solid var(--line)', 'border-radius': '8px', display: 'block', 'margin-bottom': '8px' } }) : null,
        h('button', { class: 'btn block', onclick: function () { pickFiles('image/*').then(function (f) { if (f[0]) setBackground(m, f[0]); }); } }, ic('image'), m.background ? 'Cambiar plano…' : 'Subir plano…')),
      h('div', { class: 'sec' }, h('h4', null, 'Resumen'),
        h('div', { class: 'stat' }, h('span', null, 'Áreas'), h('b', null, m.areas.length)),
        h('div', { class: 'stat' }, h('span', null, 'Procesos'), h('b', null, nProc)),
        h('div', { class: 'stat' }, h('span', null, 'Pasos en total'), h('b', null, nSteps)),
        empty.length ? h('div', { style: { 'margin-top': '8px' } }, h('span', { class: 'badge warn' }, empty.length + ' áreas sin procesos'),
          h('div', { class: 'help', style: { 'margin-top': '4px' } }, empty.map(function (a) { return a.name; }).join(' · '))) : null,
        noSteps.length ? h('div', { style: { 'margin-top': '8px' } }, h('span', { class: 'badge warn' }, noSteps.length + ' procesos sin pasos'),
          h('div', { class: 'help', style: { 'margin-top': '4px' } }, noSteps.join(' · '))) : null,
        pendAreas.length ? h('div', { style: { 'margin-top': '8px' } }, h('span', { class: 'badge warn' }, pendAreas.length + ' áreas con foto pendiente')) : null),
      h('div', { class: 'sec' }, h('h4', null, 'Cómo editar'),
        h('p', { class: 'help' }, '1. Herramienta «Área»: delimita cada zona del plano.'),
        h('p', { class: 'help' }, '2. Selecciona el área: nombre, fotos y «+ Nuevo proceso».'),
        h('p', { class: 'help' }, '3. En cada proceso escribe sus pasos en orden (puedes pegar una lista, una línea por paso) y marca los pasos críticos.'),
        h('p', { class: 'help', style: { margin: 0 } }, '4. «Vista previa» y «Exportar HTML».')),
      h('div', { class: 'sec' }, h('div', { class: 'row wrap' },
        h('button', { class: 'btn', onclick: function () { openPreview([m.id]); } }, ic('eye'), 'Vista previa'),
        h('button', { class: 'btn primary', onclick: function () { exportMaps([m.id]); } }, ic('download'), 'Exportar'),
        h('button', { class: 'btn', onclick: function () { cloneMapDialog(m); } }, ic('copy'), 'Clonar…'),
        h('button', { class: 'btn danger', onclick: function () { deleteMap(m); } }, ic('trash'), 'Eliminar'))));
  }

  function chemSelect(value, onChange, placeholder, excludeIds) {
    var s = h('select', { class: 'inp' },
      placeholder ? h('option', { value: '' }, placeholder) : null,
      sortedChems().filter(function (c) { return !excludeIds || excludeIds.indexOf(c.id) < 0; })
        .map(function (c) { return h('option', { value: c.id, selected: c.id === value }, c.name); }));
    s.addEventListener('change', function () { if (s.value) onChange(s.value); });
    return s;
  }

  function renderAreaPanel(m, a) {
    var name = bindText(h('input'), function () { return a.name; }, function (v) { a.name = v; });
    var desc = bindText(h('textarea', { rows: '2' }), function () { return a.desc; }, function (v) { a.desc = v; });
    var photos = h('div', { class: 'photos' });
    a.photos.forEach(function (ph, i) {
      photos.append(h('div', { class: 'photo' },
        h('img', { src: project.assets[ph.img], alt: 'Foto ' + (i + 1), title: isProc(m) ? 'Ampliar' : 'Ubicar químicos en esta foto', onclick: function () { if (isProc(m)) lightbox(project.assets[ph.img]); else openPinEditor(m, a, i); } }),
        !isProc(m) && ph.pins.length ? h('span', { class: 'pins badge ok' }, ph.pins.length + ' ubicados') : null,
        h('div', { class: 'acts' },
          isProc(m) ? h('span') : h('button', { title: 'Ubicar químicos en la foto', 'aria-label': 'Ubicar químicos', onclick: function () { openPinEditor(m, a, i); } }, ic('pin')),
          h('button', { title: 'Mover antes', 'aria-label': 'Mover antes', disabled: i === 0, onclick: function () { commit(function () { a.photos.splice(i - 1, 0, a.photos.splice(i, 1)[0]); }); } }, ic('left')),
          h('button', { title: 'Mover después', 'aria-label': 'Mover después', disabled: i === a.photos.length - 1, onclick: function () { commit(function () { a.photos.splice(i + 1, 0, a.photos.splice(i, 1)[0]); }); } }, ic('right')),
          h('button', { title: 'Eliminar foto', 'aria-label': 'Eliminar foto', onclick: function () { if (confirm('¿Eliminar esta foto?')) commit(function () { a.photos.splice(i, 1); }); } }, ic('trash')))));
    });
    var chips = h('div', { class: 'chips' });
    var inMap = {};
    m.markers.forEach(function (mk) { if (mk.area === a.id) inMap[mk.chem] = (inMap[mk.chem] || 0) + 1; });
    a.chems.forEach(function (cid) {
      var c = chem(cid); if (!c) return;
      chips.append(h('div', { class: 'chip' }, chemIc(c, 'sm'), h('span', { class: 'grow', title: c.name }, c.name),
        inMap[cid] ? h('span', { class: 'badge grey', title: 'Pictogramas en el plano' }, inMap[cid] + ' en plano') : null,
        h('button', { title: 'Colocar pictograma en el plano', 'aria-label': 'Colocar pictograma', onclick: function () { ui.toolChem = cid; setTool('marker'); } }, ic('marker')),
        h('button', { title: 'Quitar del área', 'aria-label': 'Quitar ' + c.name, onclick: function () {
          var n = inMap[cid] || 0;
          if (n && !confirm('Se eliminarán también ' + n + ' pictograma(s) de ' + c.name + ' de esta área en el plano. ¿Continuar?')) return;
          commit(function () {
            a.chems = a.chems.filter(function (x) { return x !== cid; });
            m.markers = m.markers.filter(function (mk) { return !(mk.area === a.id && mk.chem === cid); });
            a.photos.forEach(function (ph) { ph.pins = ph.pins.filter(function (pn) { return pn.chem !== cid; }); });
          });
        } }, ic('x'))));
    });
    append(right, [
      inspHead(h('span', { class: 'ed-logo', style: { width: '30px', height: '30px' }, html: ICON.area }), a.name || 'Área', isProc(m) ? 'Área del mapa de procesos' : 'Área clicable', deselect),
      h('div', { class: 'sec' }, field('Nombre del área', name), field('Descripción (opcional)', desc),
        h('p', { class: 'help', style: { margin: 0 } }, 'También puedes renombrar con ✎ en la lista de áreas o con doble clic sobre el área en el plano.')),
      h('div', { class: 'sec' }, h('h4', null, 'Forma'),
        h('div', { class: 'shape-bar block' }, SHAPES.map(function (sp) {
          return h('button', { class: 'shape-btn', 'aria-pressed': String(shapeOf(a) === sp[0]), title: sp[1], onclick: function () { changeShape(m, a, sp[0]); } }, ic(sp[2]), sp[1]);
        })),
        shapeOf(a) === 'cells'
          ? h('button', { class: 'btn block', style: { 'margin-top': '8px' }, onclick: function () { startEditCells(m, a); } }, ic('shCells'), 'Editar celdas')
          : h('p', { class: 'help', style: { margin: '8px 0 0' } }, 'Ajusta el tamaño con las esquinas. «Cuadrícula» convierte el área en celdas para formas irregulares.')),
      isProc(m) ? processesSection(m, a) : null,
      h('div', { class: 'sec' }, h('h4', null, h('span', null, 'Fotos del área'), a.photos.length ? h('span', { class: 'badge ok' }, a.photos.length) : h('span', { class: 'badge warn' }, 'Pendiente')),
        a.photos.length ? photos : h('div', { class: 'pending-box' }, ic('camera'), 'Foto pendiente. En el mapa exportado se mostrará «Foto pendiente» hasta que la agregues.'),
        h('button', { class: 'btn block', style: { 'margin-top': '8px' }, onclick: function () { addPhotos(a); } }, ic('plus'), 'Agregar fotos…'),
        a.photos.length && !isProc(m) ? h('p', { class: 'help', style: { 'margin-top': '6px' } }, 'Toca una foto para ubicar sobre ella los pictogramas de los químicos.') : null),
      isProc(m) ? null : h('div', { class: 'sec' }, h('h4', null, 'Sustancias en esta área'), chips,
        chemSelect('', function (cid) { commit(function () { if (a.chems.indexOf(cid) < 0) a.chems.push(cid); }); }, '+ Agregar sustancia al área…', a.chems),
        h('p', { class: 'help', style: { 'margin-top': '6px' } }, 'Usa el botón ◎ para colocar el pictograma de esa sustancia en el plano.')),
      h('div', { class: 'sec' }, h('div', { class: 'row wrap' },
        h('button', { class: 'btn', onclick: function () { focusArea(a); } }, ic('fit'), 'Centrar'),
        h('button', { class: 'btn danger', onclick: function () {
          var n = m.markers.filter(function (mk) { return mk.area === a.id; }).length;
          var msg = '¿Eliminar el área «' + a.name + '»' + (n ? ' y sus ' + n + ' pictogramas' : '') + (a.processes.length ? ' y sus ' + a.processes.length + ' procesos' : '') + '? Puedes deshacer con Ctrl+Z.';
          if (!confirm(msg)) return;
          commit(function () {
            m.areas = m.areas.filter(function (x) { return x !== a; });
            m.markers = m.markers.filter(function (mk) { return mk.area !== a.id; });
            ui.sel = null;
          });
        } }, ic('trash'), 'Eliminar área')))]);
  }

  // ---------------------------------------------------------------- procesos
  function newProcess() { return { id: uid('proc'), name: 'Nuevo proceso', desc: '', owner: '', freq: '', ppe: '', source: '', steps: [] }; }
  function processesSection(m, a) {
    var list = h('div', { class: 'chips' });
    a.processes.forEach(function (pr, i) {
      list.append(h('div', { class: 'chip proc-chip' },
        h('span', { class: 'step-num' }, String(i + 1)),
        h('button', { class: 'grow proc-open', title: 'Editar proceso', onclick: function () { openProcessEditor(m, a, pr.id); } },
          h('b', null, pr.name || 'Proceso'), h('small', null, pr.steps.length + (pr.steps.length === 1 ? ' paso' : ' pasos'))),
        h('button', { title: 'Subir', 'aria-label': 'Subir', disabled: i === 0, onclick: function () { commit(function () { a.processes.splice(i - 1, 0, a.processes.splice(i, 1)[0]); }); } }, ic('up')),
        h('button', { title: 'Bajar', 'aria-label': 'Bajar', disabled: i === a.processes.length - 1, onclick: function () { commit(function () { a.processes.splice(i + 1, 0, a.processes.splice(i, 1)[0]); }); } }, ic('down')),
        h('button', { title: 'Duplicar', 'aria-label': 'Duplicar proceso', onclick: function () { commit(function () { var c = clone(pr); c.id = uid('proc'); c.name = pr.name + ' (copia)'; a.processes.splice(i + 1, 0, c); }); } }, ic('copy')),
        h('button', { title: 'Eliminar', 'aria-label': 'Eliminar proceso', onclick: function () { if (confirm('¿Eliminar el proceso «' + pr.name + '»? Puedes deshacer con Ctrl+Z.')) commit(function () { a.processes.splice(i, 1); }); } }, ic('x'))));
    });
    if (!a.processes.length) list.append(h('div', { class: 'pending-box' }, ic('steps'), 'Esta área todavía no tiene procesos.'));
    return h('div', { class: 'sec' }, h('h4', null, h('span', null, 'Procesos de esta área'), h('span', { class: 'badge blue' }, a.processes.length)),
      list,
      h('button', { class: 'btn primary block', onclick: function () {
        var pr = newProcess();
        commit(function () { a.processes.push(pr); });
        openProcessEditor(m, a, pr.id);
      } }, ic('plus'), 'Nuevo proceso'),
      h('p', { class: 'help', style: { 'margin-top': '6px' } }, 'En el mapa exportado, al tocar el área se listan sus procesos; cada proceso muestra sus pasos en orden y se pueden ir marcando.'));
  }

  /* Editor de un proceso: datos generales y pasos ordenados. */
  function openProcessEditor(m, a, procId) {
    function pr() { var mm = project.maps.filter(function (x) { return x.id === m.id; })[0]; var aa = mm && mm.areas.filter(function (x) { return x.id === a.id; })[0]; return aa && aa.processes.filter(function (x) { return x.id === procId; })[0]; }
    var body = h('div', { class: 'proc-editor' });
    var dlg = modal('Proceso · ' + a.name, body, [h('button', { class: 'btn primary', onclick: function () { dlg.close(); } }, 'Listo')],
      { wide: true, onClose: function () { renderAll(); } });
    var keep = { refresh: function () { } };
    function draw() {
      var p = pr();
      if (!p) { dlg.close(); return; }
      var top = body.parentNode ? body.parentNode.scrollTop : 0;
      body.innerHTML = '';
      var steps = h('ol', { class: 'step-list' });
      p.steps.forEach(function (st, i) {
        var txt = bindText(h('textarea', { rows: '2', placeholder: 'Describe el paso ' + (i + 1) + '…' }), function () { return st.text; }, function (v) { st.text = v; }, keep);
        var note = bindText(h('input', { placeholder: 'Nota o advertencia (opcional)' }), function () { return st.note; }, function (v) { st.note = v; }, keep);
        var warn = h('input', { type: 'checkbox' }); warn.checked = !!st.warn;
        warn.addEventListener('change', function () { commit(function () { st.warn = warn.checked; }); draw(); });
        steps.append(h('li', { class: 'step-card' + (st.warn ? ' warn' : '') },
          h('div', { class: 'step-side' }, h('span', { class: 'step-num' }, String(i + 1)),
            h('button', { class: 'btn sm icon', title: 'Subir', 'aria-label': 'Subir paso', disabled: i === 0, onclick: function () { commit(function () { p.steps.splice(i - 1, 0, p.steps.splice(i, 1)[0]); }); draw(); } }, ic('up')),
            h('button', { class: 'btn sm icon', title: 'Bajar', 'aria-label': 'Bajar paso', disabled: i === p.steps.length - 1, onclick: function () { commit(function () { p.steps.splice(i + 1, 0, p.steps.splice(i, 1)[0]); }); draw(); } }, ic('down'))),
          h('div', { class: 'step-main' }, txt,
            h('div', { class: 'row wrap', style: { 'margin-top': '6px' } }, h('div', { class: 'grow', style: { 'min-width': '200px' } }, note),
              h('label', { class: 'row', style: { gap: '6px', 'font-size': '13px', 'font-weight': '600' } }, warn, 'Paso crítico'))),
          h('div', { class: 'step-img' },
            st.img ? h('img', { src: project.assets[st.img], alt: '', title: 'Ampliar', onclick: function () { lightbox(project.assets[st.img]); } }) : null,
            h('div', { class: 'row', style: { gap: '4px', 'flex-wrap': 'wrap' } },
              h('button', { class: 'btn sm', onclick: function () {
                pickFiles('image/*').then(function (fs) {
                  if (!fs[0]) return;
                  imageFileToDataUrl(fs[0], 1400, 0.75).then(function (r) { commit(function () { st.img = addAsset(r.data, 'paso'); }); draw(); });
                });
              } }, ic('image'), st.img ? 'Cambiar' : 'Imagen'),
              st.img ? h('button', { class: 'btn sm', title: 'Quitar imagen', onclick: function () { commit(function () { delete st.img; }); draw(); } }, ic('x')) : null,
              h('button', { class: 'btn sm danger', title: 'Eliminar paso', 'aria-label': 'Eliminar paso', onclick: function () { commit(function () { p.steps.splice(i, 1); }); draw(); } }, ic('trash'))))));
      });
      var bulk = h('textarea', { rows: '4', placeholder: 'Pega aquí una lista de pasos, uno por línea. Se quitan numeraciones como «1.», «2)» o viñetas.' });
      body.append(
        h('div', { class: 'two' },
          field('Nombre del proceso', bindText(h('input'), function () { return p.name; }, function (v) { p.name = v; }, keep)),
          field('Responsable', bindText(h('input', { placeholder: 'p. ej. Operador de lavadora' }), function () { return p.owner; }, function (v) { p.owner = v; }, keep))),
        h('div', { class: 'two' },
          field('Frecuencia', bindText(h('input', { placeholder: 'p. ej. Cada cambio de turno' }), function () { return p.freq; }, function (v) { p.freq = v; }, keep)),
          field('EPP requerido', bindText(h('input', { placeholder: 'p. ej. Gafas, guantes de nitrilo' }), function () { return p.ppe; }, function (v) { p.ppe = v; }, keep))),
        field('Objetivo / descripción (opcional)', bindText(h('textarea', { rows: '2' }), function () { return p.desc; }, function (v) { p.desc = v; }, keep)),
        field('Referencia (código de procedimiento, documento…)', bindText(h('input'), function () { return p.source; }, function (v) { p.source = v; }, keep)),
        h('h4', { class: 'proc-h' }, 'Pasos (' + p.steps.length + ')'),
        p.steps.length ? steps : h('div', { class: 'pending-box', style: { 'margin-bottom': '10px' } }, 'Todavía no hay pasos. Agrégalos uno a uno o pega una lista.'),
        h('div', { class: 'row wrap', style: { margin: '10px 0' } },
          h('button', { class: 'btn primary', onclick: function () { commit(function () { p.steps.push({ text: '', note: '', warn: false }); }); draw(); var t = body.querySelectorAll('.step-card textarea'); if (t.length) t[t.length - 1].focus({ preventScroll: false }); } }, ic('plus'), 'Agregar paso')),
        h('details', { class: 'bulk' }, h('summary', null, 'Pegar varios pasos a la vez'), bulk,
          h('button', { class: 'btn', style: { 'margin-top': '6px' }, onclick: function () {
            var lines = bulk.value.split('\n').map(function (l) { return l.replace(/^\s*(?:\d+\s*[.)\-:]|[-•*·])\s*/, '').trim(); }).filter(Boolean);
            if (!lines.length) return;
            commit(function () { lines.forEach(function (l) { p.steps.push({ text: l, note: '', warn: false }); }); });
            toast(lines.length + (lines.length === 1 ? ' paso agregado' : ' pasos agregados'));
            draw();
          } }, ic('plus'), 'Agregar como pasos')));
      if (body.parentNode) body.parentNode.scrollTop = top;
    }
    draw();
  }

  function cloneMapDialog(m) {
    var name = h('input', { value: (m.name || 'Mapa') + ' (copia)' });
    var other = isProc(m) ? 'quimicos' : 'procesos';
    var mode = 'igual';
    function opt(val, title, desc) {
      var r = h('input', { type: 'radio', name: 'clone-mode', value: val }); r.checked = val === mode;
      r.addEventListener('change', function () { mode = val; });
      return h('label', { class: 'type-opt' }, r, h('span', null, h('b', null, title), h('small', null, desc)));
    }
    var dlg = modal('Clonar «' + (m.name || 'mapa') + '»', h('div', null,
      field('Nombre del nuevo mapa', name),
      h('div', { class: 'field' }, h('span', null, 'Tipo de copia'),
        opt('igual', 'Copia exacta', 'Mismo tipo de mapa, con todo su contenido.'),
        opt('otro', other === 'procesos' ? 'Como mapa de procesos' : 'Como mapa de químicos',
          other === 'procesos' ? 'Mismo plano, áreas, fotos y textos; sin químicos. Útil para documentar los procesos de la misma línea.'
                               : 'Mismo plano, áreas, fotos y textos; sin procesos.'))),
      [h('button', { class: 'btn', onclick: function () { dlg.close(); } }, 'Cancelar'),
       h('button', { class: 'btn primary', onclick: function () {
         dlg.close();
         commit(function () {
           var n = clone(m);
           n.id = uid('mapa'); n.name = name.value.trim() || (m.name + ' (copia)');
           if (mode === 'otro') {
             n.type = other;
             n.markers = [];
             n.areas.forEach(function (a) { a.chems = []; a.processes = []; a.photos.forEach(function (ph) { ph.pins = []; }); });
             if (other === 'procesos' && (!m.title || /sustancias/i.test(m.title))) n.title = 'Mapa de procesos';
             if (other === 'quimicos' && (!m.title || /procesos/i.test(m.title))) n.title = 'Mapa de sustancias químicas';
           }
           var idx = project.maps.indexOf(m);
           project.maps.splice(idx + 1, 0, n); ui.mapId = n.id; ui.view = 'map'; ui.left = 'maps'; ui.sel = null;
         });
         toast('Mapa clonado');
       } }, ic('copy'), 'Clonar')]);
    name.focus({ preventScroll: true }); name.select();
  }
  function deleteMap(m) {
    var what = isProc(m) ? procCount(m) + ' procesos' : m.markers.length + ' pictogramas';
    if (!confirm('¿Eliminar el mapa «' + (m.name || 'sin nombre') + '» (' + m.areas.length + ' áreas, ' + what + ')? Puedes deshacer con Ctrl+Z.')) return;
    commit(function () {
      project.maps = project.maps.filter(function (x) { return x !== m; });
      if (ui.mapId === m.id) { ui.mapId = null; ui.sel = null; }
    });
    toast('Mapa eliminado · Ctrl+Z para deshacer');
  }

  function addPhotos(a) {
    pickFiles('image/*', true).then(function (files) {
      if (!files.length) return;
      var done = busy('Procesando ' + files.length + (files.length === 1 ? ' foto…' : ' fotos…'));
      Promise.all(files.map(function (f) { return imageFileToDataUrl(f, 1600, 0.72); })).then(function (rs) {
        done();
        commit(function () { rs.forEach(function (r) { a.photos.push({ img: addAsset(r.data, 'foto'), pins: [] }); }); });
        toast(rs.length === 1 ? 'Foto agregada' : rs.length + ' fotos agregadas');
      }).catch(function (e) { done(); toast(e.message, true); });
    });
  }

  function renderMarkerPanel(m, mk) {
    var c = chem(mk.chem);
    var areaSel = h('select', { class: 'inp' }, h('option', { value: '' }, '— Sin área (abre la ficha directamente) —'),
      m.areas.map(function (a) { return h('option', { value: a.id, selected: a.id === mk.area }, a.name); }));
    areaSel.addEventListener('change', function () {
      commit(function () { mk.area = areaSel.value || null; var a = selAreaById(m, mk.area); if (a && a.chems.indexOf(mk.chem) < 0) a.chems.push(mk.chem); });
    });
    right.append(
      inspHead(chemIc(c, 'lg'), c ? c.name : 'Pictograma', 'Pictograma en el plano', deselect),
      h('div', { class: 'sec' },
        field('Sustancia', chemSelect(mk.chem, function (cid) {
          commit(function () { mk.chem = cid; var a = selAreaById(m, mk.area); if (a && a.chems.indexOf(cid) < 0) a.chems.push(cid); });
        })),
        field('Pertenece al área', areaSel),
        h('p', { class: 'help' }, 'En el mapa exportado, tocar el pictograma abre la ficha SGA de la sustancia. Si pertenece a un área, la sustancia aparece en la lista de esa área.')),
      h('div', { class: 'sec' }, h('div', { class: 'row wrap' },
        h('button', { class: 'btn', onclick: function () { ui.view = 'chem'; ui.chemId = mk.chem; ui.left = 'chems'; renderAll(); } }, ic('flask'), 'Editar ficha'),
        h('button', { class: 'btn', onclick: function () { commit(function () { var n = clone(mk); n.id = uid('mk'); n.x = r3(Math.min(100, n.x + 1.5)); m.markers.push(n); ui.sel = { type: 'marker', id: n.id }; }); } }, ic('copy'), 'Duplicar'),
        h('button', { class: 'btn danger', onclick: function () { deleteSelection(); } }, ic('trash'), 'Eliminar'))));
  }
  function selAreaById(m, id) { return m.areas.filter(function (a) { return a.id === id; })[0] || null; }

  function renderLabelPanel(m, lb) {
    var txt = bindText(h('input'), function () { return lb.text; }, function (v) { lb.text = v; });
    var size = h('input', { type: 'range', min: '0.6', max: '2.5', step: '0.1', value: String(lb.size || 1), class: 'grow' });
    var snapS = null;
    size.addEventListener('pointerdown', function () { snapS = snapshot(); });
    size.addEventListener('input', function () { if (snapS) { pushUndo(snapS); snapS = null; } lb.size = parseFloat(size.value); renderCanvas(); scheduleSave(); });
    right.append(
      inspHead(h('span', { class: 'ed-logo', style: { width: '30px', height: '30px' }, html: ICON.text }), 'Texto', 'Etiqueta sobre el plano', deselect),
      h('div', { class: 'sec' }, field('Texto', txt), field('Tamaño', h('div', { class: 'row' }, size))),
      h('div', { class: 'sec' }, h('button', { class: 'btn danger', onclick: deleteSelection }, ic('trash'), 'Eliminar texto')));
  }

  function deleteSelection() {
    var m = curMap(); if (!m || !ui.sel) return;
    var s = ui.sel;
    if (s.type === 'marker') commit(function () { m.markers = m.markers.filter(function (x) { return x.id !== s.id; }); ui.sel = null; });
    else if (s.type === 'label') commit(function () { m.labels = m.labels.filter(function (x) { return x.id !== s.id; }); ui.sel = null; });
    else if (s.type === 'area') {
      var a = selArea();
      if (!confirm('¿Eliminar el área «' + a.name + '» y sus pictogramas?')) return;
      commit(function () { m.areas = m.areas.filter(function (x) { return x !== a; }); m.markers = m.markers.filter(function (mk) { return mk.area !== a.id; }); ui.sel = null; });
    }
  }

  // ------------------------------------------------------- mapas: crear/duplicar
  function newMapDialog() {
    var name = h('input', { value: 'Línea ' + (project.maps.length + 1) });
    var title = h('input', { value: 'Mapa de sustancias químicas' });
    var type = 'quimicos';
    function opt(val, t, d) {
      var r = h('input', { type: 'radio', name: 'map-type', value: val }); r.checked = val === type;
      r.addEventListener('change', function () {
        type = val;
        if (/^Mapa de (sustancias químicas|procesos)$/.test(title.value)) title.value = val === 'procesos' ? 'Mapa de procesos' : 'Mapa de sustancias químicas';
      });
      return h('label', { class: 'type-opt' }, r, h('span', null, h('b', null, t), h('small', null, d)));
    }
    var sub = h('input', { value: '' });
    var file = null;
    var fileLabel = h('span', { class: 'help', style: { margin: 0 } }, 'Ningún archivo elegido (puedes subirlo después).');
    var dlg = modal('Nuevo mapa', h('div', null,
      h('div', { class: 'field' }, h('span', null, 'Tipo de mapa'),
        opt('quimicos', 'Mapa de químicos', 'Áreas con pictogramas de sustancias y fichas SGA.'),
        opt('procesos', 'Mapa de procesos', 'Áreas delimitadas con los procesos (pasos) que se deben seguir en cada una.')),
      field('Nombre corto (aparece en la pestaña, p. ej. «Línea 3»)', name),
      field('Título', title),
      field('Subtítulo (opcional)', sub),
      h('div', { class: 'field' }, h('span', null, 'Plano base (imagen)'),
        h('div', { class: 'row' }, h('button', { class: 'btn', onclick: function () { pickFiles('image/*').then(function (f) { file = f[0] || null; fileLabel.textContent = file ? file.name : 'Ningún archivo elegido'; }); } }, ic('image'), 'Elegir imagen…'), fileLabel))),
      [h('button', { class: 'btn', onclick: function () { dlg.close(); } }, 'Cancelar'),
       h('button', { class: 'btn primary', onclick: function () {
         var m = { id: uid('mapa'), type: type, name: name.value.trim() || 'Mapa', title: title.value.trim(), subtitle: sub.value.trim(), background: null, bgWidth: 2000, bgHeight: 1400, markerSize: 1, areas: [], markers: [], labels: [] };
         dlg.close();
         commit(function () { project.maps.push(m); ui.mapId = m.id; ui.view = 'map'; ui.left = 'maps'; ui.sel = null; });
         if (file) setBackground(m, file);
       } }, ic('plus'), 'Crear mapa')]);
    name.focus({ preventScroll: true }); name.select();
  }

  // ----------------------------------------------------------------- modales
  function modal(title, body, footer, opts) {
    opts = opts || {};
    var root = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    function close() { root.remove(); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    root.append(h('div', { class: 'modal-bg', onclick: opts.sticky ? null : close }),
      h('div', { class: 'dialog' + (opts.wide ? ' wide' : '') },
        h('div', { class: 'dialog-h' }, h('h3', null, title), opts.headExtra || null, h('button', { class: 'btn icon ghost', 'aria-label': 'Cerrar', onclick: close }, ic('x'))),
        h('div', { class: 'dialog-b', style: opts.bodyStyle || null }, body),
        footer ? h('div', { class: 'dialog-f' }, footer) : null));
    document.body.appendChild(root);
    document.addEventListener('keydown', onKey);
    return { el: root, close: close };
  }
  function lightbox(src) {
    var lb = h('div', { class: 'lb', onclick: function () { lb.remove(); } }, h('img', { src: src, alt: '' }));
    document.body.appendChild(lb);
  }

  /* Editor de ubicaciones de quimicos sobre una foto de area. */
  function openPinEditor(m, a, idx) {
    var ph = a.photos[idx];
    var active = a.chems[0] || null, selPin = -1;
    var body = h('div', { class: 'pin-editor' });
    var dlg = modal('Ubicar químicos en la foto · ' + a.name, body, [h('button', { class: 'btn primary', onclick: function () { dlg.close(); } }, 'Listo')],
      { wide: true, onClose: function () { renderAll(); document.removeEventListener('keydown', onDel); } });
    function onDel(e) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selPin >= 0 && !isTyping(e)) {
        e.preventDefault(); e.stopPropagation();
        commit(function () { ph.pins.splice(selPin, 1); }); selPin = -1; draw();
      }
    }
    document.addEventListener('keydown', onDel, true);
    function draw() {
      body.innerHTML = '';
      var box = h('div', { class: 'pin-box' });
      var img = h('img', { src: project.assets[ph.img], alt: '', draggable: 'false' });
      box.append(img);
      ph.pins.forEach(function (pn, i) {
        var c = chem(pn.chem);
        var el = h('div', { class: 'pin' + (i === selPin ? ' sel' : ''), title: c ? c.name : '', style: { left: pn.x + '%', top: pn.y + '%', '--f': c ? c.fill : '#ccc', '--r': c ? c.ring : '#999' } });
        el.addEventListener('pointerdown', function (e) {
          e.stopPropagation(); e.preventDefault();
          selPin = i; el.classList.add('sel');
          var snap = snapshot(), moved = false;
          el.setPointerCapture(e.pointerId);
          function mv(ev) {
            var r = img.getBoundingClientRect();
            pn.x = r3(clamp((ev.clientX - r.left) / r.width * 100, 0, 100)); pn.y = r3(clamp((ev.clientY - r.top) / r.height * 100, 0, 100));
            el.style.left = pn.x + '%'; el.style.top = pn.y + '%'; moved = true;
          }
          function up() { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); if (moved) { pushUndo(snap); scheduleSave(); } draw(); }
          el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up);
        });
        box.append(el);
      });
      box.addEventListener('pointerdown', function (e) {
        if (!active) { toast('Primero elige una sustancia de la lista', true); return; }
        var r = img.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
        if (x < 0 || y < 0 || x > 100 || y > 100) return;
        commit(function () { ph.pins.push({ chem: active, x: r3(x), y: r3(y) }); if (a.chems.indexOf(active) < 0) a.chems.push(active); });
        selPin = ph.pins.length - 1; draw();
      });
      var pal = h('div', { class: 'palette' });
      a.chems.forEach(function (cid) {
        var c = chem(cid); if (!c) return;
        var n = ph.pins.filter(function (p) { return p.chem === cid; }).length;
        pal.append(h('button', { 'aria-pressed': String(active === cid), onclick: function () { active = cid; draw(); } }, chemIc(c, 'sm'), h('span', { class: 'grow' }, c.name), n ? h('span', { class: 'badge ok' }, n) : null));
      });
      body.append(h('div', { class: 'pin-stage' }, box),
        h('div', null,
          h('p', { class: 'help' }, '1. Elige una sustancia. 2. Haz clic en la foto donde está el envase. Arrastra para mover; selecciona y pulsa Supr para eliminar.'),
          pal,
          h('div', { style: { margin: '10px 0' } }, chemSelect('', function (cid) { commit(function () { if (a.chems.indexOf(cid) < 0) a.chems.push(cid); }); active = cid; draw(); }, '+ Otra sustancia…', a.chems)),
          selPin >= 0 && ph.pins[selPin] ? h('button', { class: 'btn danger block', onclick: function () { commit(function () { ph.pins.splice(selPin, 1); }); selPin = -1; draw(); } }, ic('trash'), 'Eliminar ubicación seleccionada') : null,
          ph.pins.length ? h('button', { class: 'btn block', style: { 'margin-top': '6px' }, onclick: function () { if (confirm('¿Quitar todas las ubicaciones de esta foto?')) { commit(function () { ph.pins = []; }); selPin = -1; draw(); } } }, 'Quitar todas') : null));
    }
    draw();
  }

  // ---------------------------------------------------------- vista previa
  function openPreview(mapIds) {
    var ids = mapIds || (curMap() ? [curMap().id] : project.maps.map(function (m) { return m.id; }));
    if (!ids.length) return;
    var url = null, phone = false;
    var wrap = h('div', { class: 'preview-wrap' });
    function load() {
      if (url) URL.revokeObjectURL(url);
      var html = Exporter.buildHtml(project, ids);
      url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      wrap.innerHTML = '';
      wrap.className = 'preview-wrap' + (phone ? ' phone' : '');
      wrap.append(h('iframe', { src: url, title: 'Vista previa' }));
    }
    var pcBtn = h('button', { class: 'btn sm dark', onclick: function () { phone = false; pcBtn.className = 'btn sm dark'; phBtn.className = 'btn sm'; load(); } }, 'PC');
    var phBtn = h('button', { class: 'btn sm', onclick: function () { phone = true; phBtn.className = 'btn sm dark'; pcBtn.className = 'btn sm'; load(); } }, 'Teléfono');
    var dlg = modal('Vista previa del HTML exportado', wrap, null, {
      wide: true, bodyStyle: { padding: '0', display: 'flex' },
      headExtra: h('div', { class: 'row' }, pcBtn, phBtn, h('button', { class: 'btn sm primary', onclick: function () { exportMaps(ids); } }, ic('download'), 'Exportar')),
      onClose: function () { if (url) URL.revokeObjectURL(url); }
    });
    dlg.el.querySelector('.dialog-b').style.display = 'flex';
    load();
  }

  // ------------------------------------------------------- exportar / guardar
  function exportMaps(ids) {
    try {
      var html = Exporter.buildHtml(project, ids);
      Exporter.download(Exporter.fileNameFor(project, ids), html);
      toast('HTML exportado (' + (html.length / 1048576).toFixed(1) + ' MB)');
    } catch (e) { toast('No se pudo exportar: ' + e.message, true); }
  }
  function saveProjectFile() {
    var used = Exporter.referencedAssets(project);
    var out = clone(project);
    Object.keys(out.assets).forEach(function (k) { if (!used.has(k)) delete out.assets[k]; });
    out.app = 'creador-mapas-interactivos'; out.version = 1; out.savedAt = new Date().toISOString();
    var name = (project.name || 'proyecto').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_') + '.json';
    Exporter.download(name, JSON.stringify(out), 'application/json');
    toast('Proyecto guardado');
  }
  function openProjectFile() {
    pickFiles('.json,application/json').then(function (files) {
      if (!files[0]) return;
      var done = busy('Abriendo proyecto…');
      files[0].text().then(function (txt) {
        done();
        var p = JSON.parse(txt);
        if (!p || !Array.isArray(p.maps) || !Array.isArray(p.chemicals)) throw new Error('El archivo no es un proyecto válido.');
        loadProject(p, true);
        toast('Proyecto abierto');
      }).catch(function (e) { done(); toast(e.message, true); });
    });
  }
  function loadProject(p, keepUndo) {
    if (keepUndo && project) {
      // deshacer de una carga completa: conservamos tambien las imagenes previas
      var prevAssets = project.assets;
      pushUndo();
      project = normalizeProject(p);
      for (var k in prevAssets) if (!project.assets[k]) project.assets[k] = prevAssets[k];
    } else {
      project = normalizeProject(p);
    }
    ui.mapId = project.maps[0] ? project.maps[0].id : null;
    ui.sel = null; ui.view = 'map'; ui.views = {};
    changed();
  }

  // ------------------------------------------------------- editor de químico
  var SWATCHES = ['#FFFFFF', '#000000', '#FF0000', '#FFD800', '#FFFF00', '#00B050', '#00B0F0', '#0070C0', '#7030A0', '#ED7D31', '#A5A5A5', '#C9A3E6', '#8B4513', '#FF66CC'];
  function newChem() {
    var c = { id: uid('q'), name: 'Nuevo químico', fill: '#FFFFFF', ring: '#ED7D31', fichas: [] };
    commit(function () { project.chemicals.push(c); ui.view = 'chem'; ui.chemId = c.id; ui.left = 'chems'; });
    var inp = center.querySelector('input'); if (inp) { inp.focus({ preventScroll: true }); inp.select(); }
  }

  function renderChemEditor() {
    var c = chem(ui.chemId);
    var wrap = h('div', { class: 'chem-wrap' });
    var name = bindText(h('input'), function () { return c.name; }, function (v) { c.name = v; }, { refresh: function () { renderLeft(); bigTitle.textContent = c.name; } });
    var bigIc = chemIc(c, 'xl');
    var smallIc = chemIc(c);
    var bigTitle = h('h2', null, c.name);
    function colorPicker(prop) {
      var inp = h('input', { type: 'color', value: (c[prop] || '#ffffff').toLowerCase() });
      var snap = null;
      inp.addEventListener('focus', function () { snap = snapshot(); });
      inp.addEventListener('input', function () {
        if (snap) { pushUndo(snap); snap = null; }
        c[prop] = inp.value.toUpperCase(); updIcons(); scheduleSave(); renderLeft();
      });
      return h('div', null, h('div', { class: 'row' }, inp, h('code', null, c[prop])),
        h('div', { class: 'swatches' }, SWATCHES.map(function (col) {
          return h('button', { title: col, style: { background: col }, onclick: function () { pushUndo(); c[prop] = col; inp.value = col.toLowerCase(); updIcons(); scheduleSave(); renderLeft(); } });
        })));
    }
    function updIcons() {
      [bigIc, smallIc].forEach(function (el) { el.style.setProperty('--f', c.fill); el.style.setProperty('--r', c.ring); });
      wrap.querySelectorAll('code').forEach(function (cd, i) { cd.textContent = i === 0 ? c.fill : c.ring; });
    }
    wrap.append(
      h('div', { class: 'card' }, h('div', { class: 'chem-top' }, bigIc, h('div', { class: 'grow' }, bigTitle,
        h('div', { class: 'help', style: { margin: 0 } }, c.fichas.length ? c.fichas.length + (c.fichas.length === 1 ? ' ficha SGA' : ' fichas SGA') : 'Ficha SGA pendiente', ' · ', usageCount(c.id) + ' pictogramas en mapas')),
        h('button', { class: 'btn', onclick: function () { ui.view = 'map'; ui.left = 'maps'; renderAll(); } }, ic('left'), 'Volver al mapa'))),
      h('div', { class: 'card' }, h('h3', null, 'Identificación y pictograma'), h('div', { class: 'body' },
        field('Nombre', name),
        h('div', { class: 'colorrow' },
          h('div', { class: 'field' }, h('span', null, 'Color de relleno'), colorPicker('fill')),
          h('div', { class: 'field' }, h('span', null, 'Color del aro'), colorPicker('ring')),
          h('div', { class: 'field' }, h('span', null, 'Vista'), h('div', { class: 'preview-box' }, smallIc, h('span', { class: 'help', style: { margin: 0 } }, 'Así se ve en el plano')))),
        h('p', { class: 'help', style: { margin: 0 } }, 'Consejo: usa el mismo código de colores que la leyenda de la planta (relleno + aro).'))),
      fichasCard(c),
      usageCard(c));
    center.append(h('div', { class: 'chem-view' }, wrap));
  }

  function fichasCard(c) {
    var list = h('div');
    c.fichas.forEach(function (f, i) {
      var cap = bindText(h('input'), function () { return f.caption; }, function (v) { f.caption = v; }, { refresh: function () { } });
      var sig = h('select', { class: 'inp' }, ['', 'PELIGRO', 'ATENCIÓN'].map(function (s) { return h('option', { value: s, selected: (f.signal || '') === s }, s || '— Ninguna —'); }));
      sig.addEventListener('change', function () { commit(function () { f.signal = sig.value; }); });
      var haz = bindText(h('textarea', { rows: '4' }), function () { return (f.hazards || []).join('\n'); }, function (v) { f.hazards = v.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); }, { refresh: function () { } });
      var em = bindText(h('input'), function () { return f.emergency; }, function (v) { f.emergency = v; }, { refresh: function () { } });
      var notes = bindText(h('textarea', { rows: '2' }), function () { return f.notes; }, function (v) { f.notes = v; }, { refresh: function () { } });
      var src = bindText(h('input'), function () { return f.source; }, function (v) { f.source = v; }, { refresh: function () { } });
      list.append(h('div', { class: 'ficha' },
        h('div', null,
          f.img ? h('div', { class: 'thumb', title: 'Ampliar', onclick: function () { lightbox(project.assets[f.img]); } }, h('img', { src: project.assets[f.img], alt: '' })) : h('div', { class: 'pending-box' }, 'Sin imagen'),
          h('div', { class: 'acts' },
            h('button', { class: 'btn sm', title: 'Subir', disabled: i === 0, onclick: function () { commit(function () { c.fichas.splice(i - 1, 0, c.fichas.splice(i, 1)[0]); }); } }, ic('up')),
            h('button', { class: 'btn sm', title: 'Bajar', disabled: i === c.fichas.length - 1, onclick: function () { commit(function () { c.fichas.splice(i + 1, 0, c.fichas.splice(i, 1)[0]); }); } }, ic('down')),
            h('button', { class: 'btn sm', onclick: function () {
              pickFiles('image/*').then(function (fs) {
                if (!fs[0]) return;
                imageFileToDataUrl(fs[0], 1600, 0.8).then(function (r) { commit(function () { f.img = addAsset(r.data, 'ficha'); }); });
              });
            } }, ic('image'), 'Reemplazar'),
            h('button', { class: 'btn sm danger', onclick: function () { if (confirm('¿Eliminar esta ficha?')) commit(function () { c.fichas.splice(i, 1); }); } }, ic('trash')))),
        h('div', null,
          h('div', { class: 'two' }, field('Presentación / concentración', cap), field('Palabra de advertencia', sig)),
          field('Indicaciones de peligro (una por línea)', haz),
          h('div', { class: 'two' }, field('Contacto de emergencia', em), field('Fuente', src)),
          field('Notas (opcional)', notes))));
    });
    if (!c.fichas.length) list.append(h('div', { class: 'pending-box', style: { 'margin-bottom': '12px' } }, ic('file'), 'Ficha SGA pendiente. En el mapa exportado se mostrará «Ficha pendiente».'));
    return h('div', { class: 'card' }, h('h3', null, h('span', null, 'Fichas / etiquetas SGA'), h('span', { class: 'badge grey' }, c.fichas.length)),
      h('div', { class: 'body' }, list,
        h('div', { class: 'row wrap' },
          h('button', { class: 'btn', onclick: function () { addFichaImages(c); } }, ic('image'), 'Agregar imagen(es)…'),
          h('button', { class: 'btn', onclick: function () { openPdfImport(c); } }, ic('pdf'), 'Importar desde PDF…')),
        h('p', { class: 'help', style: { 'margin-top': '8px' } }, 'Si hay varias presentaciones (concentraciones, volúmenes), agrega una ficha por cada una: en el mapa aparecerán como pestañas.')));
  }
  function addFichaImages(c) {
    pickFiles('image/*', true).then(function (files) {
      if (!files.length) return;
      var done = busy('Procesando imágenes…');
      Promise.all(files.map(function (f) { return imageFileToDataUrl(f, 1600, 0.8); })).then(function (rs) {
        done();
        commit(function () { rs.forEach(function (r, i) { c.fichas.push({ img: addAsset(r.data, 'ficha'), caption: files[i].name.replace(/\.[^.]+$/, ''), signal: '', hazards: [], emergency: '', notes: '', source: '' }); }); });
      }).catch(function (e) { done(); toast(e.message, true); });
    });
  }
  function usageCard(c) {
    var body = h('div', { class: 'body' });
    var any = false;
    project.maps.forEach(function (m) {
      var mks = m.markers.filter(function (mk) { return mk.chem === c.id; });
      var areas = m.areas.filter(function (a) { return a.chems.indexOf(c.id) >= 0; });
      if (!mks.length && !areas.length) return;
      any = true;
      body.append(h('div', { class: 'usage-map' }, h('b', null, m.name + ' · ' + mks.length + ' pictogramas'),
        h('div', { class: 'row wrap' }, areas.map(function (a) {
          return h('button', { class: 'btn sm', onclick: function () { ui.mapId = m.id; ui.view = 'map'; ui.left = 'maps'; ui.sel = { type: 'area', id: a.id }; renderAll(); setTimeout(function () { focusArea(a); }, 50); } }, ic('pin'), a.name);
        }))));
    });
    if (!any) body.append(h('p', { class: 'help' }, 'Esta sustancia todavía no está ubicada en ningún mapa.'));
    body.append(h('button', { class: 'btn danger', style: { 'margin-top': '8px' }, onclick: function () {
      var n = usageCount(c.id);
      if (!confirm('¿Eliminar «' + c.name + '» de la biblioteca?' + (n ? ' También se eliminarán sus ' + n + ' pictogramas en los mapas.' : '') + ' Puedes deshacer con Ctrl+Z.')) return;
      commit(function () {
        project.chemicals = project.chemicals.filter(function (x) { return x !== c; });
        project.maps.forEach(function (m) {
          m.markers = m.markers.filter(function (mk) { return mk.chem !== c.id; });
          m.areas.forEach(function (a) { a.chems = a.chems.filter(function (x) { return x !== c.id; }); a.photos.forEach(function (ph) { ph.pins = ph.pins.filter(function (pn) { return pn.chem !== c.id; }); }); });
        });
        ui.view = 'map'; ui.chemId = null;
      });
    } }, ic('trash'), 'Eliminar químico'));
    return h('div', { class: 'card' }, h('h3', null, 'Uso en los mapas'), body);
  }
  function renderChemSide() {
    var c = chem(ui.chemId);
    right.append(inspHead(chemIc(c, 'lg'), c.name, 'Químico de la biblioteca'),
      h('div', { class: 'sec' }, h('h4', null, 'Así se verá la ficha'),
        h('p', { class: 'help' }, 'Al tocar el pictograma en el mapa exportado se abre la ficha con la imagen de la etiqueta (ampliable), las indicaciones de peligro, el contacto de emergencia y las áreas donde se encuentra.'),
        h('button', { class: 'btn block', disabled: !curMap(), onclick: function () { openPreview(); } }, ic('eye'), 'Vista previa del mapa')),
      h('div', { class: 'sec' }, h('h4', null, 'Colocar en el mapa'),
        h('p', { class: 'help' }, 'Vuelve al mapa, elige la herramienta «Pictograma» y haz clic en el plano.'),
        h('button', { class: 'btn block', disabled: !curMap(), onclick: function () { ui.view = 'map'; ui.left = 'maps'; ui.toolChem = c.id; ui.tool = 'marker'; renderAll(); } }, ic('marker'), 'Colocar en el mapa')));
  }

  // ------------------------------------------------- importación desde PDF
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = PDFJS + 'pdf.min.js';
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; resolve(window.pdfjsLib); };
      s.onerror = function () { reject(new Error('No se pudo cargar el lector de PDF (requiere conexión a internet). Alternativa: exporta las páginas como imágenes y usa «Agregar imagen(es)».')); };
      document.head.appendChild(s);
    });
  }
  /* Extrae datos de una etiqueta SGA a partir del texto de la pagina. */
  function parseLabel(lines) {
    var signal = '';
    lines.slice(0, 8).forEach(function (l) { if (!signal && /^(PELIGRO|ATENCI[OÓ]N)$/i.test(l)) signal = /^P/i.test(l) ? 'PELIGRO' : 'ATENCIÓN'; });
    var rest = lines.filter(function (l) { return !/^(PELIGRO|ATENCI[OÓ]N)$/i.test(l); });
    var title = rest[0] || '';
    var subtitle = rest[1] && !/^Componentes/i.test(rest[1]) ? rest[1] : '';
    var hazards = lines.filter(function (l) { return /^H\d{3}/.test(l); });
    var vol = '';
    lines.forEach(function (l) { var mm = l.match(/^VOLUMEN:\s*([\d.,]+\s*(kg|litros?|gal|ml|m3|l)\b)/i); if (mm && !vol) vol = mm[1]; });
    var em = '';
    lines.forEach(function (l, i) {
      if (!em && /^CONTACTO DE EMERGENCIA/i.test(l)) { em = (l.split(':').slice(1).join(':') || '').trim().replace(/^[.\s]+|[.\s]+$/g, ''); if (!em && lines[i + 1]) em = lines[i + 1]; }
    });
    return { title: title, subtitle: subtitle, signal: signal, hazards: hazards, volume: vol, emergency: em };
  }
  function pageLines(page) {
    return page.getTextContent().then(function (tc) {
      var rows = [];
      tc.items.forEach(function (it) {
        if (!it.str || !it.str.trim()) return;
        var y = it.transform[5], x = it.transform[4];
        var row = rows.filter(function (r) { return Math.abs(r.y - y) < 3; })[0];
        if (!row) { row = { y: y, items: [] }; rows.push(row); }
        row.items.push({ x: x, s: it.str });
      });
      rows.sort(function (a, b) { return b.y - a.y; });
      var lines = [];
      rows.forEach(function (r) {
        r.items.sort(function (a, b) { return a.x - b.x; });
        // separa columnas muy distantes (p. ej. pictogramas a la izquierda)
        var cur = '', lastX = null;
        r.items.forEach(function (it) {
          if (lastX != null && it.x - lastX > 160 && cur.trim()) { lines.push(cur.trim()); cur = ''; }
          cur += (cur && !/\s$/.test(cur) ? ' ' : '') + it.s; lastX = it.x + it.s.length * 4;
        });
        if (cur.trim()) lines.push(cur.trim().replace(/\s+/g, ' '));
      });
      return lines;
    });
  }
  function openPdfImport(target) {
    var state = { pdf: null, pages: [], sel: new Set(), mode: target ? 'current' : 'new' };
    var grid = h('div', { class: 'pdf-grid' });
    var info = h('p', { class: 'help' }, 'Elige el PDF con las etiquetas SGA (una etiqueta por página).');
    var modeSel = h('select', { class: 'inp', style: { width: 'auto' } },
      target ? h('option', { value: 'current', selected: true }, 'Agregar como fichas de «' + target.name + '»') : null,
      h('option', { value: 'new', selected: !target }, 'Crear un químico por página (o agregar al químico con el mismo nombre)'));
    modeSel.addEventListener('change', function () { state.mode = modeSel.value; });
    var importBtn = h('button', { class: 'btn primary', disabled: true, onclick: doImport }, ic('download'), 'Importar seleccionadas');
    var dlg = modal('Importar etiquetas SGA desde PDF', h('div', null,
      h('div', { class: 'row wrap', style: { 'margin-bottom': '10px' } },
        h('button', { class: 'btn', onclick: choose }, ic('pdf'), 'Elegir PDF…'), modeSel,
        h('button', { class: 'btn sm', onclick: function () { state.pages.forEach(function (p) { state.sel.add(p.n); }); drawGrid(); } }, 'Todas'),
        h('button', { class: 'btn sm', onclick: function () { state.sel.clear(); drawGrid(); } }, 'Ninguna')),
      info, grid), [h('button', { class: 'btn', onclick: function () { dlg.close(); } }, 'Cancelar'), importBtn], { wide: true });
    function choose() {
      pickFiles('application/pdf,.pdf').then(function (files) {
        if (!files[0]) return;
        info.textContent = 'Cargando PDF…';
        Promise.all([loadPdfJs(), files[0].arrayBuffer()]).then(function (r) {
          return r[0].getDocument({ data: r[1] }).promise;
        }).then(function (pdf) {
          state.pdf = pdf; state.pages = []; state.sel.clear();
          info.textContent = 'Leyendo ' + pdf.numPages + ' páginas…';
          var chain = Promise.resolve();
          for (var n = 1; n <= pdf.numPages; n++) (function (n) {
            chain = chain.then(function () { return pdf.getPage(n); }).then(function (page) {
              var vp = page.getViewport({ scale: 1 });
              var scale = 260 / vp.width;
              var c = document.createElement('canvas'), v2 = page.getViewport({ scale: scale });
              c.width = v2.width; c.height = v2.height;
              return page.render({ canvasContext: c.getContext('2d'), viewport: v2 }).promise.then(function () { return pageLines(page); }).then(function (lines) {
                var meta = parseLabel(lines);
                state.pages.push({ n: n, thumb: c.toDataURL('image/jpeg', 0.7), meta: meta });
                if (meta.title && meta.hazards.length) state.sel.add(n);
                drawGrid();
              });
            });
          })(n);
          return chain.then(function () { info.textContent = pdf.numPages + ' páginas. Se preseleccionaron las que parecen etiquetas SGA; haz clic para cambiar la selección.'; });
        }).catch(function (e) { info.textContent = e.message; toast(e.message, true); });
      });
    }
    function drawGrid() {
      grid.innerHTML = '';
      state.pages.forEach(function (p) {
        grid.append(h('button', { class: 'pdf-page' + (state.sel.has(p.n) ? ' on' : ''), onclick: function () { if (state.sel.has(p.n)) state.sel.delete(p.n); else state.sel.add(p.n); drawGrid(); } },
          h('img', { src: p.thumb, alt: 'Página ' + p.n }), h('b', null, p.meta.title || '(sin título)'),
          h('small', null, 'Pág. ' + p.n + (p.meta.signal ? ' · ' + p.meta.signal : '') + (p.meta.hazards.length ? ' · ' + p.meta.hazards.length + ' H' : ''))));
      });
      importBtn.disabled = !state.sel.size;
      importBtn.lastChild.textContent = 'Importar ' + state.sel.size + (state.sel.size === 1 ? ' página' : ' páginas');
    }
    function doImport() {
      var nums = Array.from(state.sel).sort(function (a, b) { return a - b; });
      var done = busy('Importando ' + nums.length + ' páginas…');
      var results = [];
      var chain = Promise.resolve();
      nums.forEach(function (n) {
        chain = chain.then(function () { return state.pdf.getPage(n); }).then(function (page) {
          var vp = page.getViewport({ scale: 1 });
          var v2 = page.getViewport({ scale: 1400 / vp.width });
          var c = document.createElement('canvas');
          c.width = v2.width; c.height = v2.height;
          var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
          return page.render({ canvasContext: ctx, viewport: v2 }).promise.then(function () {
            var data = c.toDataURL('image/webp', 0.75);
            if (data.indexOf('data:image/webp') !== 0) data = c.toDataURL('image/jpeg', 0.82);
            var meta = state.pages.filter(function (p) { return p.n === n; })[0].meta;
            results.push({ n: n, data: data, meta: meta });
          });
        });
      });
      chain.then(function () {
        done();
        var created = 0, added = 0;
        commit(function () {
          results.forEach(function (r) {
            var cap = [r.meta.subtitle, r.meta.volume].filter(Boolean).join(' · ') || r.meta.title;
            var ficha = { img: addAsset(r.data, 'ficha'), caption: cap, signal: r.meta.signal, hazards: r.meta.hazards, emergency: r.meta.emergency, notes: '', source: 'PDF, pág. ' + r.n };
            var c = null;
            if (state.mode === 'current' && target) c = target;
            else {
              var key = norm(r.meta.title).replace(/[^a-z0-9]/g, '');
              c = project.chemicals.filter(function (x) { return key && norm(x.name).replace(/[^a-z0-9]/g, '').indexOf(key) === 0; })[0];
              if (!c) {
                c = { id: uid('q'), name: r.meta.title || ('Etiqueta pág. ' + r.n), fill: '#FFFFFF', ring: SWATCHES[(project.chemicals.length) % SWATCHES.length], fichas: [] };
                project.chemicals.push(c); created++;
              }
            }
            c.fichas.push(ficha); added++;
          });
        });
        dlg.close();
        toast(added + ' fichas importadas' + (created ? ' · ' + created + ' químicos nuevos' : ''));
      }).catch(function (e) { done(); toast(e.message, true); });
    }
    if (!target) choose();
  }

  // ------------------------------------------------------------- teclado
  document.addEventListener('keydown', function (e) {
    if (document.querySelector('.modal')) return;
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { if (isTyping(e)) return; e.preventDefault(); undo(); return; }
    if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { if (isTyping(e)) return; e.preventDefault(); redo(); return; }
    if (isTyping(e) || mod) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { if (ui.sel && ui.view === 'map') { e.preventDefault(); deleteSelection(); } return; }
    if (e.key === 'Enter' && ui.tool === 'area' && ui.areaShape === 'cells' && ui.cellDraft) { e.preventDefault(); confirmCells(); return; }
    if (e.key === 'Escape' && ui.tool === 'area' && ui.areaShape === 'cells' && ui.cellDraft) { cancelCells(); return; }
    if (e.key === 'Escape') { if (ui.tool !== 'select') setTool('select'); else if (ui.sel) deselect(); return; }
    if (ui.view !== 'map' || !curMap()) return;
    var k = e.key.toLowerCase();
    if (k === 'v') setTool('select'); else if (k === 'a') setTool('area'); else if (k === 'p') setTool('marker'); else if (k === 't') setTool('label');
    else if (k === '+' || k === '=') zoomBy(1.3); else if (k === '-') zoomBy(1 / 1.3); else if (k === '0') fitView();
  });

  // --------------------------------------------------------------- inicio
  buildShell();
  app.append(h('div', { class: 'pad' }, 'Cargando…'));
  Store.load().then(function (saved) {
    var p = saved && saved.maps ? saved : (window.DEMO_PROJECT ? clone(window.DEMO_PROJECT) : { name: 'Nuevo proyecto', chemicals: [], maps: [], assets: {} });
    project = normalizeProject(p);
    ui.mapId = project.maps[0] ? project.maps[0].id : null;
    saveState = saved ? 'Guardado en este navegador' : 'Ejemplo cargado';
    buildShell();
    renderAll();
  });
  window.addEventListener('beforeunload', function () { if (saveTimer) Store.save(project); });
  window.__editor = { get project() { return project; }, ui: ui, exportMaps: exportMaps, buildHtml: function (ids) { return Exporter.buildHtml(project, ids); } };
})();
