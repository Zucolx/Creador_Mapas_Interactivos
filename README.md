# Creador de Mapas Interactivos

Aplicación web para crear **mapas interactivos de sustancias químicas** (o de cualquier plano) y exportarlos como **archivos HTML independientes**: se abren con doble clic, funcionan sin internet, no usan almacenamiento local y se ven igual de bien en PC y en teléfono.

Incluye como ejemplo los mapas de **Línea 1** y **Línea 2** (envase), con sus áreas, pictogramas y fichas SGA.

## Cómo funciona el mapa exportado

1. **Mapa general**: el plano con las áreas marcadas y los pictogramas de colores de cada químico.
2. **Clic en un área** → abre el área: foto(s) de la ubicación, la lista de sustancias presentes y su posición en el plano. Equivale a los hipervínculos del PowerPoint *Layout L1*.
3. **Clic en un pictograma** (en el plano, en la foto o en la lista del área) → abre la **ficha del químico**: etiqueta SGA ampliable, palabra de advertencia, indicaciones de peligro (H), contacto de emergencia y las áreas donde se encuentra. Si hay varias presentaciones (p. ej. soda 50 % y 2 %) aparecen como pestañas.
4. **Leyenda**: lista de sustancias (con botón para resaltarlas en el mapa) y lista de áreas.

En el teléfono se puede pellizcar para ampliar, arrastrar para moverse, y el botón «atrás» del navegador vuelve al paso anterior.

## Archivos listos para usar

| Archivo | Contenido |
|---|---|
| `exportados/Mapa_Linea_1.html` | Mapa interactivo L1 (8 áreas con foto) |
| `exportados/Mapa_Linea_2.html` | Mapa interactivo L2 (9 áreas, fotos pendientes) |
| `exportados/Mapas_de_sustancias_quimicas_Envase.html` | L1 y L2 en un solo archivo, con selector |

## Manual de usuario

El manual completo, con capturas, está en [`manual/index.html`](manual/index.html) (también se abre con el botón **Ayuda** del editor). Incluye una sección para el personal que solo consulta los mapas.

## Usar el editor

Abre `index.html` en Chrome, Edge o Firefox (doble clic basta; también funciona publicado en GitHub Pages). La primera vez se carga el ejemplo L1/L2 y los cambios se guardan solos en el navegador.

- **Mapas** (panel izquierdo): crea un mapa nuevo y sube el plano base (PNG/JPG/WebP).
- Herramienta **Área** (`A`): dibuja un rectángulo sobre cada zona clicable. Selecciónala para ponerle nombre, descripción y **fotos**; toca una foto para **ubicar los químicos sobre ella**.
- Herramienta **Pictograma** (`P`): elige la sustancia y haz clic en el plano. Si cae dentro de un área, queda asociado a ella automáticamente.
- Herramienta **Texto** (`T`): rótulos como «Usted está aquí».
- **Químicos**: biblioteca compartida por todos los mapas. Cada químico tiene su código de colores (relleno + aro) y sus fichas SGA, que se pueden subir como imagen o **importar desde un PDF** (una etiqueta por página; esta opción necesita internet para cargar el lector de PDF).
- **Vista previa** (PC / teléfono) y **Exportar HTML** (un mapa, cada mapa por separado o todos en uno).
- **Proyecto → Guardar (.json)**: copia de seguridad editable para continuar en otro equipo o compartir con otra persona del equipo.
- Deshacer/rehacer: `Ctrl+Z` / `Ctrl+Y`. Suprimir borra la selección. Rueda del ratón = zoom, arrastrar el fondo = desplazar.

## Pendientes del ejemplo

- **Fotos de Línea 2**: las 9 áreas se muestran como «Foto pendiente». Se agregan desde el editor (área → *Agregar fotos…*) y se vuelve a exportar.
- **Fichas sin etiqueta en el PDF**: ALCOHOL y DRYEXX GF muestran «Ficha pendiente».
- Los nombres de las áreas se dedujeron de las fotos y del PowerPoint, y la posición de áreas y pictogramas se trasladó a mano desde el layout del PowerPoint a los planos nuevos. Conviene revisarlos; todo se corrige arrastrando en el editor.

## Estructura

```
index.html              editor
manual/                 manual de usuario (HTML + capturas)
css/editor.css          estilos del editor
js/editor.js            lógica del editor
js/viewer-runtime.js    visor (se incrusta tal cual en cada HTML exportado)
js/exporter.js          genera el HTML independiente
js/store.js             guardado automático del editor (IndexedDB)
demo/demo-data.js       proyecto de ejemplo L1/L2 con imágenes incrustadas
tools/build_demo.py     regenera demo/demo-data.js desde el PPTX, el PDF SGA y los planos
tools/exportar_demo.js  exporta los HTML desde la línea de comandos
exportados/             HTML generados
```

### Regenerar el ejemplo y los HTML (opcional)

```bash
python3 tools/build_demo.py --pptx "1. LAYOUT_QUIMICOS_ENVASE_L1_11-2025.pptx" --sga ETIQUETAS_FORMATO_SGA.pdf --plano-l1 plano_L1.webp --plano-l2 plano_L2.webp
```

```bash
node tools/exportar_demo.js
```

```bash
node tools/exportar_demo.js mi_proyecto.json carpeta_salida/
```

`build_demo.py` requiere `python-pptx`, `Pillow` y `poppler-utils`. La aplicación web en sí no necesita instalar nada.
