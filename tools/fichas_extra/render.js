#!/usr/bin/env node
/* Convierte etiquetas.html en imagenes (una por etiqueta) para build_demo.py. Requiere Playwright. */
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.goto('file://' + path.join(__dirname, 'etiquetas.html'));
  for (const id of await p.$$eval('.label', (els) => els.map((e) => e.id))) {
    const file = path.join(__dirname, id + '.png');
    await p.locator('#' + id).screenshot({ path: file });
    console.log(file);
  }
  await b.close();
})();
