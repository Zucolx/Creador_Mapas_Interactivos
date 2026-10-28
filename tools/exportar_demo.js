#!/usr/bin/env node
/*
 * Exporta los mapas del proyecto de ejemplo (o de un proyecto .json guardado
 * desde el editor) a HTML independientes, usando el mismo exportador que la
 * aplicacion web.
 *
 *   node tools/exportar_demo.js                     -> exportados/ (demo L1 y L2)
 *   node tools/exportar_demo.js proyecto.json salida/
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
global.window = global;
for (const f of ['js/viewer-runtime.js', 'js/exporter.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, f), 'utf8'), { filename: f });
}

let project;
const src = process.argv[2];
if (src) {
  project = JSON.parse(fs.readFileSync(src, 'utf8'));
} else {
  vm.runInThisContext(fs.readFileSync(path.join(root, 'demo/demo-data.js'), 'utf8'), { filename: 'demo-data.js' });
  project = global.DEMO_PROJECT;
}
const outDir = process.argv[3] || path.join(root, 'exportados');
fs.mkdirSync(outDir, { recursive: true });

for (const m of project.maps) {
  const html = Exporter.buildHtml(project, [m.id]);
  const file = path.join(outDir, Exporter.fileNameFor(project, [m.id]));
  fs.writeFileSync(file, html);
  console.log(`${file}  (${(html.length / 1e6).toFixed(1)} MB)`);
}
if (project.maps.length > 1) {
  const ids = project.maps.map((m) => m.id);
  const html = Exporter.buildHtml(project, ids);
  const file = path.join(outDir, Exporter.fileNameFor(project, ids));
  fs.writeFileSync(file, html);
  console.log(`${file}  (${(html.length / 1e6).toFixed(1)} MB)`);
}
