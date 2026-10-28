/*
 * Exportador: genera un HTML independiente (sin dependencias externas ni
 * almacenamiento local) con el visor y solo los datos/imagenes necesarios.
 */
(function (global) {
  'use strict';

  /* Ids de quimicos usados en un mapa (pictogramas, areas y fotos). */
  function chemsOfMap(m) {
    var ids = new Set();
    (m.markers || []).forEach(function (mk) { ids.add(mk.chem); });
    (m.areas || []).forEach(function (a) {
      (a.chems || []).forEach(function (c) { ids.add(c); });
      (a.photos || []).forEach(function (p) { (p.pins || []).forEach(function (pn) { ids.add(pn.chem); }); });
    });
    return ids;
  }

  /* Copia reducida del proyecto con los mapas indicados. */
  function collect(project, mapIds) {
    var maps = project.maps.filter(function (m) { return mapIds.indexOf(m.id) >= 0; });
    var chemIds = new Set();
    maps.forEach(function (m) { chemsOfMap(m).forEach(function (id) { chemIds.add(id); }); });
    var chemicals = project.chemicals.filter(function (c) { return chemIds.has(c.id); });
    var assets = {};
    function use(id) { if (id && project.assets[id]) assets[id] = project.assets[id]; }
    maps.forEach(function (m) {
      use(m.background);
      (m.areas || []).forEach(function (a) { (a.photos || []).forEach(function (p) { use(p.img); }); });
    });
    chemicals.forEach(function (c) { (c.fichas || []).forEach(function (f) { use(f.img); }); });
    return JSON.parse(JSON.stringify({ name: project.name, chemicals: chemicals, maps: maps, assets: assets }));
  }

  /* Ids de imagenes referenciadas por el proyecto completo. */
  function referencedAssets(project) {
    var used = new Set();
    project.maps.forEach(function (m) {
      used.add(m.background);
      (m.areas || []).forEach(function (a) { (a.photos || []).forEach(function (p) { used.add(p.img); }); });
    });
    project.chemicals.forEach(function (c) { (c.fichas || []).forEach(function (f) { used.add(f.img); }); });
    return used;
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  /* JSON seguro para incrustar dentro de <script>. */
  function safeJson(obj) {
    return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }

  function buildHtml(project, mapIds, opts) {
    opts = opts || {};
    if (typeof global.MapaViewerRuntime !== 'function') throw new Error('No se encontró el visor (viewer-runtime.js).');
    var data = collect(project, mapIds);
    var first = data.maps[0] || {};
    var title = data.maps.length === 1
      ? (first.title || 'Mapa') + (first.subtitle ? ' · ' + first.subtitle : ' · ' + (first.name || ''))
      : (project.name || 'Mapas interactivos');
    var date = new Date().toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
    var runtimeOpts = { footer: 'Actualizado: ' + date, legendOpen: opts.legendOpen !== false };
    return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<meta name="theme-color" content="#1f2a37">\n' +
      '<meta name="generator" content="Creador de Mapas Interactivos">\n' +
      '<title>' + escHtml(title) + '</title>\n' +
      '<style>html,body{margin:0;height:100%;background:#eef0f3;overscroll-behavior:none}</style>\n' +
      '</head>\n<body>\n<div id="mapa-app"><p style="font-family:system-ui,sans-serif;padding:24px;color:#555">Cargando mapa…</p></div>\n' +
      '<noscript><p style="font-family:sans-serif;padding:24px">Este mapa interactivo necesita JavaScript activado.</p></noscript>\n' +
      '<script>\nvar MAPA_DATA = ' + safeJson(data) + ';\n</script>\n' +
      '<script>\n(' + global.MapaViewerRuntime.toString() + ')(MAPA_DATA, document.getElementById("mapa-app"), ' + safeJson(runtimeOpts) + ');\n</script>\n' +
      '</body>\n</html>\n';
  }

  function slug(s) {
    return (s || 'mapa').toString().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'mapa';
  }

  function download(filename, content, type) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: type || 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  global.Exporter = {
    chemsOfMap: chemsOfMap,
    collect: collect,
    referencedAssets: referencedAssets,
    buildHtml: buildHtml,
    fileNameFor: function (project, mapIds) {
      if (mapIds.length === 1) {
        var m = project.maps.filter(function (x) { return x.id === mapIds[0]; })[0];
        return 'Mapa_' + slug(m ? (m.name || m.id) : 'mapa') + '.html';
      }
      return slug(project.name || 'Mapas') + '.html';
    },
    download: download
  };
})(window);
