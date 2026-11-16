/*
 * Visor de mapas interactivos.
 *
 * Esta funcion se incrusta tal cual (Function.prototype.toString) dentro de
 * cada HTML exportado, por eso debe ser autocontenida: no usa variables
 * externas, ni localStorage, ni recursos de red. Recibe los datos del
 * proyecto (quimicos, mapas e imagenes en data-URL) y el nodo raiz.
 */
function MapaViewerRuntime(DATA, ROOT, OPTIONS) {
  'use strict';
  OPTIONS = OPTIONS || {};

  var CSS = `
:root{color-scheme:light}
.mv-root,.mv-root *{box-sizing:border-box}
.mv-root{--bg:#eef0f3;--panel:#fff;--ink:#1c2330;--muted:#5d6676;--line:#dde1e7;--accent:#b8860b;--accent-2:#f2c94c;--accent-soft:rgba(184,134,11,.12);--head:#1f2a37;--danger:#c62828;--warn:#e67700;--ok:#2e7d32;
  position:fixed;inset:0;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);
  font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-text-size-adjust:100%;overflow:hidden}
.mv-root button{font:inherit;color:inherit;cursor:pointer}
.mv-root img{-webkit-user-drag:none;user-select:none}
.mv-head{flex:none;display:flex;align-items:center;gap:12px;padding:8px 14px;padding-top:max(8px,env(safe-area-inset-top));background:var(--head);color:#fff;min-height:56px;box-shadow:0 2px 6px rgba(0,0,0,.18);z-index:30}
.mv-brand{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
.mv-logo{flex:none;width:34px;height:34px;border-radius:9px;background:var(--accent-2);display:grid;place-items:center;color:#3b2b00}
.mv-logo svg{width:20px;height:20px}
.mv-titles{min-width:0}
.mv-title{font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mv-sub{font-size:12.5px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mv-maps{display:flex;background:rgba(255,255,255,.1);border-radius:10px;padding:3px;gap:2px;flex:none}
.mv-maps button{border:0;background:transparent;color:#fff;padding:6px 12px;border-radius:8px;font-weight:600;font-size:13.5px;white-space:nowrap}
.mv-maps button[aria-pressed=true]{background:var(--accent-2);color:#2b2000}
.mv-hbtn{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;border-radius:10px;padding:7px 12px;font-weight:600;font-size:13.5px}
.mv-hbtn svg{width:18px;height:18px}
.mv-hbtn[aria-pressed=true]{background:#fff;color:var(--head)}
.mv-main{flex:1;display:flex;min-height:0;position:relative}
.mv-mapwrap{flex:1;position:relative;min-width:0}
.mv-viewport{position:absolute;inset:0;overflow:hidden;touch-action:none;cursor:grab;background:#fff}
.mv-viewport.mv-grabbing{cursor:grabbing}
.mv-content{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}
.mv-content.mv-anim{transition:transform .22s ease}
.mv-bg{display:block;width:100%;height:100%;pointer-events:none}
.mv-area{position:absolute;border:calc(var(--inv,1)*2px) dashed var(--accent);background:rgba(242,201,76,.10);border-radius:calc(var(--inv,1)*8px);padding:0;cursor:pointer;transition:background .15s}
.mv-area:hover,.mv-area:focus-visible{background:rgba(242,201,76,.28);outline:none;border-style:solid}
.mv-area-tag{position:absolute;left:calc(var(--inv,1)*-2px);top:calc(var(--inv,1)*-2px);transform:translateY(-100%) scale(var(--inv,1));transform-origin:0 100%;display:flex;align-items:center;gap:5px;background:var(--head);color:#fff;font-size:12.5px;font-weight:600;padding:3px 9px 3px 4px;border-radius:999px;white-space:nowrap;max-width:240px;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer}
.mv-area-tag span{overflow:hidden;text-overflow:ellipsis}
.mv-area-tag{max-width:max(150px,min(260px,calc(var(--aw) / var(--inv,1))))}
.mv-procmap .mv-area-tag{max-width:max(190px,min(300px,calc(var(--aw) / var(--inv,1))))}
.mv-area-tag i{flex:none;width:19px;height:19px;border-radius:50%;background:var(--accent-2);color:#2b2000;display:grid;place-items:center}
.mv-area-tag i svg{width:12px;height:12px}
.mv-compact .mv-area-tag span{display:none}
.mv-compact .mv-area-tag{padding:3px}
.mv-area:hover .mv-area-tag{background:var(--accent)}
.mv-mk{position:absolute;width:var(--mk);height:var(--mk);transform:translate(-50%,-50%);border-radius:50%;padding:0;border:calc(var(--mk)*.2) solid var(--r);background:var(--f);box-shadow:0 0 0 calc(var(--mk)*.06) #fff,0 1px 4px rgba(0,0,0,.45);transition:transform .12s,opacity .2s;z-index:2}
.mv-mk:hover,.mv-mk:focus-visible{transform:translate(-50%,-50%) scale(1.25);outline:none;z-index:3}
.mv-small .mv-mk.mv-in-area{pointer-events:none}
.mv-hl .mv-mk{opacity:.18}
.mv-hl .mv-mk.mv-on{opacity:1;animation:mv-pulse 1.2s ease-in-out infinite;z-index:4}
@keyframes mv-pulse{50%{transform:translate(-50%,-50%) scale(1.45)}}
.mv-label{position:absolute;transform:translate(-50%,-50%) scale(var(--inv,1));display:flex;align-items:center;gap:4px;background:#1565c0;color:#fff;font-weight:700;font-size:12px;letter-spacing:.02em;padding:4px 10px 4px 6px;border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.3);pointer-events:none}
.mv-label svg{width:14px;height:14px}
.mv-zoom{position:absolute;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:6px;z-index:5}
.mv-zoom button{width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:#fff;display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.15)}
.mv-zoom svg{width:20px;height:20px}
.mv-hint{position:absolute;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));right:70px;z-index:5;pointer-events:none;display:flex}
.mv-hint div{background:rgba(31,42,55,.88);color:#fff;font-size:12.5px;padding:7px 11px;border-radius:10px;max-width:520px}
.mv-hl-bar{position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:999px;padding:5px 6px 5px 12px;box-shadow:0 2px 10px rgba(0,0,0,.15);font-size:13.5px;font-weight:600;max-width:calc(100% - 24px)}
.mv-hl-bar[hidden]{display:none}
.mv-hl-bar button{border:0;background:var(--bg);border-radius:999px;padding:4px 10px;font-size:12.5px}
.mv-side{flex:none;width:330px;background:var(--panel);border-left:1px solid var(--line);display:flex;flex-direction:column;min-height:0;z-index:10}
.mv-side[hidden]{display:none}
.mv-tabs{display:flex;border-bottom:1px solid var(--line);padding:0 8px;flex:none}
.mv-tabs button{flex:1;border:0;background:none;padding:12px 6px;font-weight:600;color:var(--muted);border-bottom:3px solid transparent}
.mv-tabs button[aria-selected=true]{color:var(--ink);border-bottom-color:var(--accent)}
.mv-search{flex:none;padding:10px 12px 6px}
.mv-search input{width:100%;border:1px solid var(--line);border-radius:10px;padding:9px 12px;font:inherit;background:var(--bg)}
.mv-list{flex:1;overflow:auto;padding:4px 8px 16px;-webkit-overflow-scrolling:touch}
.mv-row{display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;text-align:left;padding:9px 8px;border-radius:10px}
.mv-row:hover{background:var(--bg)}
.mv-row .mv-grow{flex:1;min-width:0}
.mv-row b{display:block;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mv-row small{display:block;color:var(--muted);font-size:12px}
.mv-ic{flex:none;width:24px;height:24px;border-radius:50%;border:5px solid var(--r);background:var(--f);box-shadow:0 0 0 1px rgba(0,0,0,.25)}
.mv-ic.mv-lg{width:34px;height:34px;border-width:7px}
.mv-loc{flex:none;border:1px solid var(--line);background:#fff;border-radius:8px;width:34px;height:34px;display:grid;place-items:center;color:var(--muted)}
.mv-loc[aria-pressed=true]{background:var(--accent-2);border-color:var(--accent);color:#2b2000}
.mv-loc svg{width:17px;height:17px}
.mv-athumb{flex:none;width:46px;height:34px;border-radius:7px;background:var(--bg) center/cover;display:grid;place-items:center;color:var(--muted)}
.mv-athumb svg{width:18px;height:18px}
.mv-pend{display:inline-block;font-size:11px;font-weight:700;color:var(--warn);background:#fff3e0;border-radius:6px;padding:1px 6px;margin-left:4px;vertical-align:1px}
.mv-backdrop{position:fixed;inset:0;background:rgba(15,20,28,.45);z-index:40}
.mv-modal>.mv-backdrop{z-index:0}
.mv-sheet-close{display:none}
/* --- vista de area --- */
.mv-area-view{position:absolute;inset:0;background:var(--bg);z-index:20;display:flex;flex-direction:column;overflow:auto;-webkit-overflow-scrolling:touch}
.mv-av-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--panel);border-bottom:1px solid var(--line)}
.mv-back{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 12px;font-weight:600}
.mv-back svg{width:18px;height:18px}
.mv-crumb{min-width:0}
.mv-crumb small{display:block;color:var(--muted);font-size:12px}
.mv-crumb h2{margin:0;font-size:18px;line-height:1.2}
.mv-av-body{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;padding:16px;max-width:1400px;width:100%;margin:0 auto}
.mv-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.mv-card h3{margin:0;padding:12px 14px 4px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.mv-photo-stage{position:relative;background:#11161d;display:flex;align-items:center;justify-content:center;min-height:260px;padding:8px}
.mv-photo-box{position:relative;display:inline-block;max-width:100%}
.mv-photo-box img{display:block;max-width:100%;max-height:64vh;border-radius:6px;cursor:zoom-in}
.mv-pin{position:absolute;width:30px;height:30px;transform:translate(-50%,-50%);border-radius:50%;border:6px solid var(--r);background:var(--f);box-shadow:0 0 0 2px #fff,0 2px 8px rgba(0,0,0,.6);padding:0;animation:mv-pin 2s ease-in-out infinite}
.mv-pin:hover{transform:translate(-50%,-50%) scale(1.2)}
@keyframes mv-pin{50%{box-shadow:0 0 0 2px #fff,0 0 0 9px rgba(255,255,255,.35),0 2px 8px rgba(0,0,0,.6)}}
.mv-nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border-radius:50%;border:0;background:rgba(255,255,255,.9);display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.3)}
.mv-nav svg{width:22px;height:22px}
.mv-nav.mv-prev{left:12px}.mv-nav.mv-next{right:12px}
.mv-count{position:absolute;right:12px;top:12px;background:rgba(0,0,0,.6);color:#fff;font-size:12px;border-radius:999px;padding:3px 9px}
.mv-thumbs{display:flex;gap:8px;padding:10px;overflow:auto}
.mv-thumbs button{flex:none;width:72px;height:52px;border-radius:8px;border:2px solid transparent;background:#000 center/cover;padding:0}
.mv-thumbs button[aria-current=true]{border-color:var(--accent)}
.mv-pending{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#cfd6df;text-align:center;padding:40px 20px;min-height:260px}
.mv-pending svg{width:54px;height:54px;opacity:.7}
.mv-pending b{color:#fff;font-size:16px}
.mv-desc{padding:12px 14px;color:var(--muted);font-size:14px;border-top:1px solid var(--line)}
.mv-chems{display:grid;gap:8px;padding:10px 12px 14px}
.mv-chem{display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:#fff;border-radius:12px;padding:10px 12px;text-align:left;width:100%}
.mv-chem:hover{border-color:var(--accent);background:#fffbef}
.mv-chem .mv-grow{flex:1;min-width:0}
.mv-chem b{display:block;font-size:15px}
.mv-chem small{color:var(--muted);font-size:12.5px}
.mv-chem .mv-go{color:var(--muted)}
.mv-chem .mv-go svg{width:18px;height:18px}
.mv-sig{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.05em;border-radius:5px;padding:2px 6px;color:#fff;background:var(--danger);vertical-align:1px}
.mv-sig.mv-atn{background:var(--warn)}
.mv-sig.mv-none{background:#90a4ae}
.mv-minimap{position:relative;margin:8px 12px 14px;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff;cursor:pointer}
.mv-minimap img{display:block;width:100%}
.mv-minimap div{position:absolute;border:2px solid var(--danger);background:rgba(198,40,40,.15);border-radius:4px;box-shadow:0 0 0 999px rgba(255,255,255,.35)}
/* --- ficha --- */
.mv-modal{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px}
.mv-dialog{position:relative;z-index:1;background:var(--panel);border-radius:18px;width:min(860px,100%);max-height:100%;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.mv-dh{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}
.mv-dh .mv-grow{flex:1;min-width:0}
.mv-dh h2{margin:0;font-size:19px;line-height:1.2}
.mv-dh small{color:var(--muted)}
.mv-x{flex:none;width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:#fff;display:grid;place-items:center}
.mv-x svg{width:20px;height:20px}
.mv-db{overflow:auto;-webkit-overflow-scrolling:touch;padding:0 0 16px}
.mv-variants{display:flex;gap:6px;padding:12px 16px 0;overflow:auto}
.mv-variants button{flex:none;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600}
.mv-variants button[aria-pressed=true]{background:var(--head);border-color:var(--head);color:#fff}
.mv-label-img{display:block;margin:12px 16px 0;border:1px solid var(--line);border-radius:10px;overflow:hidden;cursor:zoom-in;padding:0;background:#fff;width:calc(100% - 32px)}
.mv-label-img img{display:block;width:100%}
.mv-zoomtip{display:flex;align-items:center;justify-content:center;gap:6px;color:var(--muted);font-size:12.5px;padding:6px 0 0}
.mv-zoomtip svg{width:15px;height:15px}
.mv-sec{padding:12px 16px 0}
.mv-sec h4{margin:0 0 6px;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.mv-haz{margin:0;padding:0;list-style:none;display:grid;gap:4px}
.mv-haz li{background:#fff5f5;border-left:4px solid var(--danger);padding:6px 10px;border-radius:6px;font-size:14px}
.mv-emerg{display:flex;align-items:center;gap:8px;background:#e8f5e9;border-radius:10px;padding:9px 12px;font-weight:600;color:#1b5e20}
.mv-emerg svg{width:18px;height:18px;flex:none}
.mv-places{display:flex;flex-wrap:wrap;gap:6px}
.mv-places button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px;font-size:13px;display:inline-flex;align-items:center;gap:6px}
.mv-places button svg{width:14px;height:14px}
.mv-places button:hover{border-color:var(--accent)}
.mv-nofile{margin:16px;border:2px dashed var(--line);border-radius:14px;padding:30px 20px;text-align:center;color:var(--muted)}
.mv-nofile svg{width:44px;height:44px;opacity:.6}
.mv-nofile b{display:block;color:var(--ink);font-size:16px;margin:6px 0 2px}
.mv-src{padding:12px 16px 0;color:var(--muted);font-size:12px}
/* --- mapas de procesos --- */
.mv-cnt{flex:none;background:var(--accent-2);color:#2b2000;border-radius:999px;font-size:11px;font-weight:800;padding:0 6px;margin-left:2px}
.mv-compact .mv-cnt{display:none}
.mv-procmap .mv-area{border:calc(var(--inv,1)*2.5px) solid #1565c0;background:rgba(21,101,192,.12)}
.mv-procmap .mv-area:hover,.mv-procmap .mv-area:focus-visible{background:rgba(21,101,192,.26)}
.mv-procmap .mv-area-tag{background:#1565c0}
.mv-procmap .mv-area-tag i{background:#fff;color:#1565c0}
.mv-procmap .mv-area:hover .mv-area-tag{background:var(--head)}
/* --- color propio del área y avance --- */
.mv-area.mv-colored{border-color:var(--ac)!important;background:var(--acf)}
.mv-area.mv-colored:hover,.mv-area.mv-colored:focus-visible{background:var(--ach)}
.mv-area.mv-colored .mv-area-tag{background:var(--ac);color:var(--act)}
.mv-area.mv-colored .mv-area-tag i{background:var(--act);color:var(--ac)}
.mv-area.mv-colored .mv-cells .cf{fill:var(--acf)}
.mv-area.mv-colored .mv-cells .ce{stroke:var(--ac)}
.mv-area.mv-colored.mv-sh-cells:hover .cf{fill:var(--ach)}
.mv-pct{flex:none;font-style:normal;background:rgba(255,255,255,.92);color:#1c2330;border-radius:999px;font-size:11px;font-weight:800;padding:0 7px;margin-left:2px}
.mv-pct.mv-ok{background:#2e7d32;color:#fff}
.mv-compact .mv-pct{display:none}
.mv-check{display:none;position:absolute;left:50%;top:50%;width:34px;height:34px;border-radius:50%;background:#2e7d32;color:#fff;place-items:center;font-size:20px;font-weight:900;transform:translate(-50%,-50%) scale(var(--inv,1));box-shadow:0 0 0 3px #fff,0 2px 6px rgba(0,0,0,.35);pointer-events:none;z-index:2}
.mv-area.mv-complete .mv-check{display:grid}
.mv-prog{gap:8px}
.mv-prog .mv-bar{width:70px;height:8px;border-radius:999px;background:rgba(255,255,255,.25);overflow:hidden}
.mv-prog .mv-bar i{display:block;height:100%;background:#7bd389;transition:width .25s}
.mv-prog[hidden]{display:none}
.mv-avance{flex:none;margin:10px 12px 2px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:#f7faf7}
.mv-avance b{display:flex;justify-content:space-between;font-size:14px}
.mv-avance .mv-bar2{height:10px;border-radius:999px;background:#e3e8e3;overflow:hidden;margin:6px 0}
.mv-avance .mv-bar2 i{display:block;height:100%;background:var(--ok);transition:width .25s}
.mv-avance small{color:var(--muted);font-size:12px}
.mv-avance button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:2px 8px;font-size:12px;float:right}
.mv-dot{flex:none;width:12px;height:12px;border-radius:50%;background:var(--ac,#1565c0);box-shadow:0 0 0 1px rgba(0,0,0,.2)}
.mv-aprog{padding:2px 14px 10px}
.mv-aprog .mv-bar2{height:8px;border-radius:999px;background:var(--bg);overflow:hidden;border:1px solid var(--line);margin:4px 0}
.mv-aprog .mv-bar2 i{display:block;height:100%;background:var(--ok)}
.mv-aprog small{color:var(--muted);font-size:12.5px}
.mv-aprog .mv-mark{margin-top:6px;border:1px solid var(--line);background:#fff;border-radius:9px;padding:7px 12px;font-weight:600;display:inline-flex;gap:8px;align-items:center}
.mv-pstate{flex:none;font-size:12px;font-weight:800;color:var(--muted);min-width:42px;text-align:right}
.mv-pstate.mv-ok{color:#fff;background:#2e7d32;border-radius:999px;min-width:0;width:26px;height:26px;display:grid;place-items:center;font-size:15px}
.mv-worth{display:inline-block;background:#e8f5e9;color:#1b5e20;border-radius:6px;padding:1px 7px;font-size:12px;font-weight:700}
.mv-markall{border:1px solid var(--line);background:#fff;border-radius:8px;padding:3px 9px;font-size:12px}
.mv-mark-proc{display:flex;align-items:center;gap:10px;margin:10px 16px 0;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff;font-weight:600;cursor:pointer}
.mv-mark-proc input{width:20px;height:20px;accent-color:var(--ok)}
/* --- formas de área --- */
.mv-sh-ellipse{border-radius:50%!important}
.mv-area.mv-sh-cells{border:0!important;background:none!important;pointer-events:none}
.mv-area.mv-sh-cells .mv-area-tag{pointer-events:auto}
.mv-cells{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.mv-cells .cf{fill:rgba(242,201,76,.12);pointer-events:all;cursor:pointer;transition:fill .15s}
.mv-cells .ce{fill:none;stroke:var(--accent);stroke-width:calc(var(--inv,1)*2px);stroke-linecap:square}
.mv-area.mv-sh-cells:hover .cf{fill:rgba(242,201,76,.3)}
.mv-procmap .mv-cells .cf{fill:rgba(21,101,192,.13)}
.mv-procmap .mv-cells .ce{stroke:#1565c0;stroke-width:calc(var(--inv,1)*2.5px)}
.mv-procmap .mv-area.mv-sh-cells:hover .cf{fill:rgba(21,101,192,.28)}
.mv-minimap .mv-mm-cells{border:0;background:none;box-shadow:none}
.mv-minimap .mv-mm-cells .cf{fill:rgba(198,40,40,.25)}
.mv-minimap .mv-mm-cells .ce{fill:none;stroke:var(--danger);stroke-width:2;vector-effect:non-scaling-stroke}
.mv-pic{flex:none;width:34px;height:34px;border-radius:10px;background:#e8f1fc;color:#1565c0;display:grid;place-items:center}
.mv-pic svg{width:20px;height:20px}
.mv-pic.mv-sm{width:26px;height:26px;border-radius:8px}
.mv-pic.mv-sm svg{width:16px;height:16px}
.mv-meta{display:flex;flex-wrap:wrap;gap:6px;padding:12px 16px 0}
.mv-meta span{display:inline-flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-size:13px}
.mv-meta b{font-weight:700}
.mv-meta svg{width:16px;height:16px;flex:none;color:var(--muted)}
.mv-pdesc{padding:12px 16px 0;margin:0;color:var(--ink);font-size:15px;white-space:pre-line}
.mv-progress{display:flex;align-items:center;gap:10px;padding:14px 16px 0;font-size:13px;color:var(--muted);font-weight:600}
.mv-progress div{flex:1;height:8px;border-radius:999px;background:var(--bg);overflow:hidden;border:1px solid var(--line)}
.mv-progress i{display:block;height:100%;background:var(--ok);transition:width .25s}
.mv-progress button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:3px 9px;font-size:12px}
.mv-steps{list-style:none;margin:0;padding:10px 16px 0;display:grid;gap:8px}
.mv-step{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff}
.mv-step.mv-warn{border-color:#f0b35a;background:#fff8ec}
.mv-step label{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer}
.mv-num{width:30px;height:30px;border-radius:50%;background:var(--head);color:#fff;font-weight:800;display:grid;place-items:center;font-size:14px}
.mv-step.mv-done .mv-num{background:var(--ok)}
.mv-step input{width:18px;height:18px;margin:0;accent-color:var(--ok)}
.mv-step-t{font-size:15px;line-height:1.45;white-space:pre-line;padding-top:4px}
.mv-step.mv-done .mv-step-t{color:var(--muted);text-decoration:line-through}
.mv-step-n{display:block;margin-top:4px;font-size:13px;color:#8a4b00;font-weight:600}
.mv-step-img{display:block;margin-top:8px;border:1px solid var(--line);border-radius:8px;padding:0;background:#000;overflow:hidden;max-width:320px;cursor:zoom-in}
.mv-step-img img{display:block;width:100%}
/* --- visor de imagen ampliada --- */
.mv-lightbox{position:fixed;inset:0;z-index:60;background:#0b0f14}
.mv-lightbox .mv-viewport{background:#0b0f14;cursor:grab}
.mv-lightbox .mv-x{position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;z-index:2;background:rgba(255,255,255,.95)}
.mv-lb-cap{position:absolute;left:12px;top:calc(14px + env(safe-area-inset-top));z-index:2;color:#fff;font-weight:600;background:rgba(0,0,0,.45);padding:6px 12px;border-radius:10px;max-width:calc(100% - 90px)}
.mv-lightbox .mv-zoom button{background:rgba(255,255,255,.95)}
.mv-foot{flex:none;font-size:11.5px;color:var(--muted);padding:8px 14px;border-top:1px solid var(--line)}
@media (max-width:860px){
  .mv-step-img{max-width:100%}
  .mv-side{position:fixed;left:0;right:0;bottom:0;width:auto;height:min(72vh,560px);border-left:0;border-radius:18px 18px 0 0;box-shadow:0 -10px 30px rgba(0,0,0,.25);z-index:45;padding-bottom:env(safe-area-inset-bottom)}
  .mv-sheet-close{display:grid}
  .mv-tabs{align-items:center}
  .mv-av-body{grid-template-columns:1fr;padding:10px}
  .mv-modal{padding:0;align-items:stretch}
  .mv-dialog{border-radius:0;max-height:none;height:100%}
  .mv-hbtn span{display:none}
  .mv-hbtn{padding:7px 9px}
}
@media (max-width:560px){
  .mv-head{gap:8px;padding:8px 10px}
  .mv-logo{display:none}
  .mv-title{font-size:15px}
  .mv-maps button{padding:6px 9px}
  .mv-hint div{font-size:12px}
}
@media print{.mv-zoom,.mv-hint,.mv-hbtn{display:none}}
`;

  // ---------------------------------------------------------------- utilidades
  var ICONS = {
    hazard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.5" stroke-linecap="round"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="6" r="1.6" fill="currentColor"/><circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="5" cy="18" r="1.6" fill="currentColor"/><path d="M10 6h10M10 12h10M10 18h10"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    enter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h12M12 6l6 6-6 6"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M10.5 7.5v6M7.5 10.5h6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    steps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M8.5 10l1.5 1.5 3-3M8.5 16l1.5 1.5 3-3"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5M9 13h7M9 17h7"/></svg>'
  };

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') for (var s in v) el.style.setProperty(s, v[s]);
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x != null && x !== false) el.append(x); });
      else el.append(c);
    }
    return el;
  }
  function icon(name) { return h('span', { html: ICONS[name], style: { display: 'contents' } }); }
  function asset(id) { return (id && DATA.assets && DATA.assets[id]) || ''; }
  function chemById(id) { return CHEMS[id]; }
  function chemIcon(c, big) {
    return h('span', { class: 'mv-ic' + (big ? ' mv-lg' : ''), style: { '--f': c.fill, '--r': c.ring }, 'aria-hidden': 'true' });
  }
  function signalOf(c) {
    var f = (c.fichas || [])[0];
    return f && f.signal ? f.signal : '';
  }
  function signalBadge(sig) {
    if (!sig) return null;
    return h('span', { class: 'mv-sig' + (/ATEN/.test(sig) ? ' mv-atn' : '') }, sig);
  }
  function norm(s) { return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  function isProc(m) { return m && m.type === 'procesos'; }
  function procById(m, id) {
    var found = null;
    (m.areas || []).forEach(function (a) { (a.processes || []).forEach(function (p) { if (p.id === id) found = { p: p, a: a }; }); });
    return found;
  }
  function allProcs(m) {
    var out = [];
    (m.areas || []).forEach(function (a) { (a.processes || []).forEach(function (p) { out.push({ p: p, a: a }); }); });
    return out;
  }
  /* SVG de un área por celdas (cuadrícula): relleno y contorno exterior. */
  function cellsSvg(a, cls) {
    var size = a.grid.size, keys = a.grid.cells, set = {};
    var c0 = Infinity, r0 = Infinity, c1 = -Infinity, r1 = -Infinity;
    var cells = keys.map(function (k) { var p = k.split(','); var c = [parseInt(p[0], 10), parseInt(p[1], 10)]; set[k] = 1;
      c0 = Math.min(c0, c[0]); r0 = Math.min(r0, c[1]); c1 = Math.max(c1, c[0]); r1 = Math.max(r1, c[1]); return c; });
    var bx = c0 * size, by = r0 * size, fill = '', edge = '';
    cells.forEach(function (c) {
      var x = c[0] * size - bx, y = c[1] * size - by;
      fill += 'M' + x + ' ' + y + 'h' + size + 'v' + size + 'h' + (-size) + 'z';
      if (!set[c[0] + ',' + (c[1] - 1)]) edge += 'M' + x + ' ' + y + 'h' + size;
      if (!set[c[0] + ',' + (c[1] + 1)]) edge += 'M' + x + ' ' + (y + size) + 'h' + size;
      if (!set[(c[0] - 1) + ',' + c[1]]) edge += 'M' + x + ' ' + y + 'v' + size;
      if (!set[(c[0] + 1) + ',' + c[1]]) edge += 'M' + (x + size) + ' ' + y + 'v' + size;
    });
    var w = (c1 - c0 + 1) * size, hgt = (r1 - r0 + 1) * size;
    return h('span', { html: '<svg class="' + (cls || 'mv-cells') + '" viewBox="0 0 ' + w + ' ' + hgt + '" preserveAspectRatio="none"><path class="cf" d="' + fill + '"/><path class="ce" d="' + edge + '"/></svg>', style: { display: 'contents' } });
  }
  function shapeClass(a) { return a.shape === 'ellipse' ? ' mv-sh-ellipse' : (a.shape === 'cells' && a.grid && a.grid.cells.length ? ' mv-sh-cells' : ''); }
  function hexRgba(hex, al) {
    var x = (hex || '').replace('#', ''); if (x.length === 3) x = x.replace(/./g, '$&$&');
    var n = parseInt(x, 16); if (isNaN(n)) return '';
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + al + ')';
  }
  function textOn(hex) {
    var x = (hex || '').replace('#', ''); if (x.length === 3) x = x.replace(/./g, '$&$&');
    var n = parseInt(x, 16); if (isNaN(n)) return '#fff';
    var l = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255;
    return l > 0.62 ? '#1c2330' : '#fff';
  }
  function colorVars(a) {
    if (!a.color) return {};
    return { '--ac': a.color, '--acf': hexRgba(a.color, 0.16), '--ach': hexRgba(a.color, 0.3), '--act': textOn(a.color) };
  }

  /* Avance (mapas de procesos). Cada área vale lo mismo en el mapa y cada
     proceso lo mismo dentro de su área, salvo pesos fijados en el editor:
     los que quedan en automático se reparten lo que falta hasta 100 %.
     Las marcas viven solo en memoria: no se guardan al cerrar el archivo. */
  var doneProc = {}, doneArea = {};
  function shares(items) {
    var fixed = 0, auto = 0;
    items.forEach(function (it) { var w = +it.weight; if (w > 0) fixed += w; else auto++; });
    var rest = Math.max(0, 100 - fixed);
    var ws = items.map(function (it) { var w = +it.weight; return w > 0 ? w : (auto ? rest / auto : 0); });
    var tot = ws.reduce(function (t, w) { return t + w; }, 0) || 1;
    return ws.map(function (w) { return w / tot; });
  }
  function procFrac(p) {
    var st = p.steps || [];
    if (!st.length) return doneProc[p.id] ? 1 : 0;
    var d = checks[p.id] || {};
    return st.filter(function (x, i) { return d[i]; }).length / st.length;
  }
  function areaFrac(a) {
    var ps = a.processes || [];
    if (!ps.length) return doneArea[a.id] ? 1 : 0;
    var w = shares(ps);
    return ps.reduce(function (t, p, i) { return t + w[i] * procFrac(p); }, 0);
  }
  function areaShare(m, a) { var as = m.areas || []; return shares(as)[as.indexOf(a)] || 0; }
  function procShare(a, p) { var ps = a.processes || []; return shares(ps)[ps.indexOf(p)] || 0; }
  function mapFrac(m) { var as = m.areas || [], w = shares(as); return as.reduce(function (t, a, i) { return t + w[i] * areaFrac(a); }, 0); }
  function isDone(f) { return f >= 0.9995; }
  function pct(x, noSign) {
    var v = Math.round(x * 1000) / 10;
    var t = Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1).replace('.', ',');
    return noSign ? t : t + '%';
  }
  function areaBadge(m, a) {
    var w = areaShare(m, a), f = areaFrac(a);
    if (isDone(f)) return '✓ ' + pct(w);
    return f > 0 ? pct(w * f, true) + ' / ' + pct(w) : pct(w);
  }
  function resetProgress() { checks = {}; doneProc = {}; doneArea = {}; }

  function stepsLabel(n) { return n + (n === 1 ? ' paso' : ' pasos'); }

  var CHEMS = {};
  (DATA.chemicals || []).forEach(function (c) { CHEMS[c.id] = c; });
  var MAPS = DATA.maps || [];
  if (!MAPS.length) { ROOT.textContent = 'Este archivo no contiene mapas.'; return; }

  // --------------------------------------------------------------- pan & zoom
  function PanZoom(viewport, content, cw, ch, onChange, pad) {
    pad = pad || 0;
    var s = 1, tx = 0, ty = 0, minS = 0.05, maxS = 8, atFit = true;
    var pts = new Map(), start = null, pinch = null, dragged = false;
    var self = this;
    content.style.width = cw + 'px';
    content.style.height = ch + 'px';

    function vp() { return { w: viewport.clientWidth, h: viewport.clientHeight }; }
    function clamp() {
      var v = vp(), w = cw * s, hh = ch * s;
      tx = w <= v.w - 2 * pad ? (v.w - w) / 2 : Math.min(pad, Math.max(v.w - w - pad, tx));
      ty = hh <= v.h - 2 * pad ? (v.h - hh) / 2 : Math.min(pad, Math.max(v.h - hh - pad, ty));
    }
    function apply(anim) {
      content.classList.toggle('mv-anim', !!anim);
      content.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
      if (onChange) onChange(s, self);
    }
    this.fit = function (anim) {
      var v = vp();
      if (!v.w || !v.h) return;
      minS = Math.max(0.01, Math.min((v.w - 2 * pad) / cw, (v.h - 2 * pad) / ch));
      maxS = Math.max(minS * 10, 2.5);
      s = minS; atFit = true; clamp(); apply(anim);
    };
    this.zoomAt = function (f, cx, cy, anim) {
      var v = vp();
      if (cx == null) { cx = v.w / 2; cy = v.h / 2; }
      var ns = Math.min(maxS, Math.max(minS, s * f));
      tx = cx - (cx - tx) * (ns / s); ty = cy - (cy - ty) * (ns / s);
      s = ns; atFit = s <= minS * 1.001; clamp(); apply(anim);
    };
    /* Centra un rectangulo (en px del contenido) con zoom suficiente */
    this.focus = function (x, y, w, hgt, anim) {
      var v = vp();
      var ns = Math.min(maxS, Math.max(minS, Math.min(v.w / (w * 1.8), v.h / (hgt * 1.8))));
      s = ns; tx = v.w / 2 - (x + w / 2) * s; ty = v.h / 2 - (y + hgt / 2) * s;
      atFit = false; clamp(); apply(anim);
    };
    this.scale = function () { return s; };
    this.wasDragged = function () { return dragged; };

    function local(e) { var r = viewport.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var p = local(e);
      pts.set(e.pointerId, p);
      if (pts.size === 1) { start = { x: p.x, y: p.y, tx: tx, ty: ty }; dragged = false; }
      else if (pts.size === 2) {
        var a = Array.from(pts.values());
        pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1, mx: (a[0].x + a[1].x) / 2, my: (a[0].y + a[1].y) / 2, s: s, tx: tx, ty: ty };
        start = null;
      }
    });
    window.addEventListener('pointermove', function (e) {
      if (!pts.has(e.pointerId)) return;
      var p = local(e);
      pts.set(e.pointerId, p);
      if (pts.size === 1 && start) {
        var dx = p.x - start.x, dy = p.y - start.y;
        if (!dragged && Math.hypot(dx, dy) > 6) { dragged = true; viewport.classList.add('mv-grabbing'); }
        if (dragged) { tx = start.tx + dx; ty = start.ty + dy; atFit = false; clamp(); apply(); }
      } else if (pts.size >= 2 && pinch) {
        var a = Array.from(pts.values());
        var d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1;
        var mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
        var ns = Math.min(maxS, Math.max(minS, pinch.s * d / pinch.d));
        var px = (pinch.mx - pinch.tx) / pinch.s, py = (pinch.my - pinch.ty) / pinch.s;
        s = ns; tx = mx - px * s; ty = my - py * s; dragged = true; atFit = false; clamp(); apply();
      }
    });
    function up(e) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      viewport.classList.remove('mv-grabbing');
      if (pts.size === 1) { var p = Array.from(pts.values())[0]; start = { x: p.x, y: p.y, tx: tx, ty: ty }; pinch = null; }
      else if (pts.size === 0) { start = null; pinch = null; }
    }
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    viewport.addEventListener('click', function (e) {
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; }
    }, true);
    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = local(e);
      var dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      self.zoomAt(Math.exp(-dy * 0.0016), p.x, p.y);
    }, { passive: false });
    viewport.addEventListener('dblclick', function (e) {
      if (e.target.closest('button')) return;
      var p = local(e); self.zoomAt(2, p.x, p.y, true);
    });
    if (window.ResizeObserver) new ResizeObserver(function () {
      var v = vp(); if (!v.w) return;
      var newMin = Math.max(0.01, Math.min((v.w - 2 * pad) / cw, (v.h - 2 * pad) / ch));
      if (atFit || s < newMin) self.fit(); else { minS = newMin; clamp(); apply(); }
    }).observe(viewport);
  }

  function zoomButtons(pz) {
    return h('div', { class: 'mv-zoom' },
      h('button', { type: 'button', 'aria-label': 'Acercar', title: 'Acercar', onclick: function () { pz.zoomAt(1.6, null, null, true); } }, icon('plus')),
      h('button', { type: 'button', 'aria-label': 'Alejar', title: 'Alejar', onclick: function () { pz.zoomAt(1 / 1.6, null, null, true); } }, icon('minus')),
      h('button', { type: 'button', 'aria-label': 'Ver todo', title: 'Ver todo el mapa', onclick: function () { pz.fit(true); } }, icon('fit')));
  }

  // ------------------------------------------------------------------- estado
  var state = { map: MAPS[0].id, area: null, ficha: null, proc: null, hl: null, side: null, tab: 'chems', q: '' };
  var checks = {};     // pasos marcados (solo en memoria, se pierden al cerrar)
  var progChip = null;
  var views = {};      // vistas de mapa ya construidas
  var hashStack = [];
  var isNarrow = function () { return window.matchMedia('(max-width:860px)').matches; };

  function mapById(id) { return MAPS.filter(function (m) { return m.id === id; })[0]; }
  function areaById(m, id) { return (m.areas || []).filter(function (a) { return a.id === id; })[0]; }
  function curMap() { return mapById(state.map) || MAPS[0]; }

  function hashFor(st) {
    var p = '#/' + encodeURIComponent(st.map);
    if (st.area) p += '/a/' + encodeURIComponent(st.area);
    if (st.ficha) p += '/f/' + encodeURIComponent(st.ficha);
    if (st.proc) p += '/p/' + encodeURIComponent(st.proc);
    return p;
  }
  /* Navegacion: se guarda en el '#' de la direccion para que funcione el
     boton «atras». Si el navegador no lo permite (p. ej. la vista previa de
     SharePoint, que muestra el HTML en un marco aislado 'about:srcdoc' con
     origen 'null'), se navega en memoria y el mapa funciona igual. */
  var memMode = false, memHash = '';
  function currentHash() { return memMode ? memHash : location.hash; }
  function sameHash(a, b) {
    try { return decodeURIComponent(a || '') === decodeURIComponent(b || ''); } catch (e) { return a === b; }
  }
  function toMemory(target) { memMode = true; memHash = target; onHash(); }
  function navigate(target, replace) {
    if (memMode) return toMemory(target);
    try {
      if (replace) history.replaceState(null, '', location.href.split('#')[0] + target);
      else location.hash = target;
    } catch (e) { return toMemory(target); }
    if (!sameHash(location.hash, target)) return toMemory(target);
    if (replace) onHash();
  }
  function parseHash() {
    var parts = currentHash().replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    var st = { map: MAPS[0].id, area: null, ficha: null, proc: null };
    if (parts[0] && mapById(parts[0])) st.map = parts[0];
    for (var i = 1; i < parts.length - 1; i += 2) {
      if (parts[i] === 'a' && areaById(mapById(st.map), parts[i + 1])) st.area = parts[i + 1];
      if (parts[i] === 'f' && CHEMS[parts[i + 1]]) st.ficha = parts[i + 1];
      if (parts[i] === 'p' && procById(mapById(st.map), parts[i + 1])) st.proc = parts[i + 1];
    }
    return st;
  }
  function go(partial) {
    var st = { map: state.map, area: state.area, ficha: state.ficha, proc: state.proc };
    for (var k in partial) st[k] = partial[k];
    var target = hashFor(st);
    if (sameHash(target, currentHash())) return;
    if (!memMode && hashStack.length > 1 && sameHash(hashStack[hashStack.length - 2], target)) history.back();
    else navigate(target);
  }
  function onHash() {
    var cur = currentHash();
    if (hashStack.length > 1 && sameHash(hashStack[hashStack.length - 2], cur)) hashStack.pop();
    else if (!sameHash(hashStack[hashStack.length - 1], cur)) hashStack.push(cur);
    var st = parseHash();
    var mapChanged = st.map !== state.map;
    state.map = st.map; state.area = st.area; state.ficha = st.ficha; state.proc = st.proc;
    if (mapChanged) { state.hl = null; state.q = ''; }
    render();
  }

  // ------------------------------------------------------------- estructura
  var style = h('style', { text: CSS });
  document.head.appendChild(style);
  ROOT.innerHTML = '';
  var root = h('div', { class: 'mv-root' });
  ROOT.appendChild(root);

  var titleEl = h('div', { class: 'mv-title' });
  var subEl = h('div', { class: 'mv-sub' });
  var mapsSwitch = MAPS.length > 1 ? h('div', { class: 'mv-maps', role: 'group', 'aria-label': 'Mapas' },
    MAPS.map(function (m) {
      return h('button', { type: 'button', 'data-map': m.id, onclick: function () { go({ map: m.id, area: null, ficha: null, proc: null }); } }, m.name || m.id);
    })) : null;
  var legendBtn = h('button', { type: 'button', class: 'mv-hbtn', 'aria-pressed': 'false', title: 'Leyenda', onclick: function () { toggleSide(); } },
    icon('list'), h('span', null, 'Leyenda'));
  var head = h('header', { class: 'mv-head' },
    h('div', { class: 'mv-brand' },
      h('div', { class: 'mv-logo', id: 'mv-logo', html: ICONS.hazard }),
      h('div', { class: 'mv-titles' }, titleEl, subEl)),
    mapsSwitch, (progChip = h('button', { type: 'button', class: 'mv-hbtn mv-prog', hidden: true, title: 'Avance del mapa', onclick: function () { state.tab = 'areas'; toggleSide(true); } },
      h('span', { class: 'mv-bar' }, h('i', { style: { width: '0%' } })), h('b', null, '0%'))), legendBtn);
  var mapwrap = h('div', { class: 'mv-mapwrap' });
  var side = h('aside', { class: 'mv-side', 'aria-label': 'Leyenda' });
  var main = h('div', { class: 'mv-main' }, mapwrap, side);
  root.append(head, main);
  var sideBackdrop = null;

  // ----------------------------------------------------------- vista de mapa
  function buildMapView(m) {
    var W = m.bgWidth || 2000, H = m.bgHeight || 1400;
    var wrap = h('div', { style: { position: 'absolute', inset: '0' } });
    var viewport = h('div', { class: 'mv-viewport' });
    var content = h('div', { class: 'mv-content' + (isProc(m) ? ' mv-procmap' : '') });
    content.appendChild(h('img', { class: 'mv-bg', src: asset(m.background), alt: m.title || m.name || '', draggable: 'false' }));
    var base = W * 0.0165 * (m.markerSize || 1);
    var areaEls = {};

    (m.areas || []).forEach(function (a) {
      var st = { left: a.x + '%', top: a.y + '%', width: a.w + '%', height: a.h + '%', '--aw': (a.w / 100 * W).toFixed(1) + 'px' };
      var cv = colorVars(a); for (var k in cv) st[k] = cv[k];
      var badge = isProc(m) ? h('em', { class: 'mv-pct', title: 'Avance del área / peso en el mapa' }, '') : null;
      var btn = h('button', {
        type: 'button', class: 'mv-area' + shapeClass(a) + (a.color ? ' mv-colored' : ''), 'data-area': a.id, 'aria-label': 'Abrir área: ' + a.name,
        title: a.name, style: st,
        onclick: function () { go({ area: a.id, ficha: null, proc: null }); }
      }, h('span', { class: 'mv-area-tag' }, h('i', { html: ICONS.enter }), h('span', null, a.name), badge),
        isProc(m) ? h('span', { class: 'mv-check', 'aria-hidden': 'true' }, '✓') : null);
      areaEls[a.id] = { btn: btn, badge: badge };
      if (shapeClass(a) === ' mv-sh-cells') btn.prepend(cellsSvg(a));
      content.appendChild(btn);
    });
    (m.markers || []).forEach(function (mk) {
      var c = chemById(mk.chem); if (!c) return;
      content.appendChild(h('button', {
        type: 'button', class: 'mv-mk' + (mk.area ? ' mv-in-area' : ''), 'data-chem': c.id,
        title: c.name, 'aria-label': 'Ficha: ' + c.name,
        style: { left: mk.x + '%', top: mk.y + '%', '--f': c.fill, '--r': c.ring },
        onclick: function (e) { e.stopPropagation(); go({ ficha: c.id }); }
      }));
    });
    (m.labels || []).forEach(function (l) {
      content.appendChild(h('div', { class: 'mv-label', style: { left: l.x + '%', top: l.y + '%', 'font-size': (12 * (l.size || 1)) + 'px' } }, icon('pin'), l.text));
    });
    viewport.appendChild(content);
    var pz = new PanZoom(viewport, content, W, H, function (s) {
      content.style.setProperty('--inv', (1 / s).toFixed(4));
      var screen = Math.max(12, Math.min(34, base * s));
      content.style.setProperty('--mk', (screen / s).toFixed(2) + 'px');
      content.classList.toggle('mv-small', base * s < 15);
      content.classList.toggle('mv-compact', W * s < 640);
    }, 34);
    var hlBar = h('div', { class: 'mv-hl-bar', hidden: true });
    var hint = h('div', { class: 'mv-hint' }, h('div', null, isProc(m)
      ? 'Toca un área para ver sus fotos y los procesos que se deben seguir. Arrastra o pellizca para mover y ampliar.'
      : 'Toca un área para ver sus fotos y químicos · toca un pictograma para ver su ficha. Arrastra o pellizca para mover y ampliar.'));
    setTimeout(function () { hint.style.transition = 'opacity .6s'; hint.style.opacity = '0'; }, 9000);
    wrap.append(viewport, zoomButtons(pz), hint, hlBar);
    return { el: wrap, pz: pz, content: content, hlBar: hlBar, m: m, W: W, H: H, fitted: false, areaEls: areaEls };
  }

  function showMap(m) {
    var v = views[m.id];
    if (!v) { v = views[m.id] = buildMapView(m); mapwrap.appendChild(v.el); }
    for (var id in views) views[id].el.style.display = id === m.id ? '' : 'none';
    if (!v.fitted) { requestAnimationFrame(function () { v.pz.fit(); }); v.fitted = true; }
    applyHighlight(v);
    return v;
  }

  function applyHighlight(v) {
    var id = state.hl;
    v.content.classList.toggle('mv-hl', !!id);
    Array.prototype.forEach.call(v.content.querySelectorAll('.mv-mk'), function (el) {
      el.classList.toggle('mv-on', el.getAttribute('data-chem') === id);
    });
    v.hlBar.hidden = !id;
    v.hlBar.innerHTML = '';
    if (id && CHEMS[id]) {
      var n = (v.m.markers || []).filter(function (mk) { return mk.chem === id; }).length;
      v.hlBar.append(chemIcon(CHEMS[id]), h('span', null, CHEMS[id].name + ' · ' + n + (n === 1 ? ' ubicación' : ' ubicaciones')),
        h('button', { type: 'button', onclick: function () { go({ ficha: id }); } }, 'Ficha'),
        h('button', { type: 'button', onclick: function () { state.hl = null; applyHighlight(v); renderSide(); } }, 'Quitar'));
    }
  }

  function refreshProgress() {
    var m = curMap();
    progChip.hidden = !isProc(m);
    if (!isProc(m)) return;
    var f = mapFrac(m);
    progChip.querySelector('i').style.width = (f * 100) + '%';
    progChip.querySelector('b').textContent = pct(f);
    progChip.setAttribute('aria-label', 'Avance del mapa: ' + pct(f));
    var v = views[m.id];
    if (v) (m.areas || []).forEach(function (a) {
      var e = v.areaEls[a.id]; if (!e) return;
      var done = isDone(areaFrac(a));
      e.btn.classList.toggle('mv-complete', done);
      if (e.badge) { e.badge.textContent = areaBadge(m, a); e.badge.classList.toggle('mv-ok', done); }
    });
    if (areaView && areaView._refresh) areaView._refresh();
    if (!side.hidden) renderSide();
  }

  // --------------------------------------------------------------- leyenda
  function usedChems(m) {
    var count = {};
    (m.markers || []).forEach(function (mk) { count[mk.chem] = (count[mk.chem] || 0) + 1; });
    (m.areas || []).forEach(function (a) {
      (a.chems || []).forEach(function (c) { if (!count[c]) count[c] = 0; });
    });
    var ids = Object.keys(count).filter(function (id) { return CHEMS[id]; });
    ids.sort(function (a, b) { return CHEMS[a].name.localeCompare(CHEMS[b].name, 'es'); });
    return ids.map(function (id) { return { c: CHEMS[id], n: count[id] }; });
  }
  function areasWith(m, chemId) {
    return (m.areas || []).filter(function (a) {
      return (a.chems || []).indexOf(chemId) >= 0 || (m.markers || []).some(function (mk) { return mk.area === a.id && mk.chem === chemId; });
    });
  }

  function toggleSide(force) {
    var open = force != null ? force : side.hidden;
    side.hidden = !open;
    legendBtn.setAttribute('aria-pressed', String(open));
    if (sideBackdrop) { sideBackdrop.remove(); sideBackdrop = null; }
    if (open && isNarrow()) {
      sideBackdrop = h('div', { class: 'mv-backdrop', onclick: function () { toggleSide(false); } });
      root.appendChild(sideBackdrop);
    }
    if (open) renderSide();
  }

  function renderSide() {
    if (side.hidden) return;
    var m = curMap();
    side.innerHTML = '';
    var tabs = h('div', { class: 'mv-tabs', role: 'tablist' },
      h('button', { type: 'button', role: 'tab', 'aria-selected': String(state.tab === 'chems'), onclick: function () { state.tab = 'chems'; renderSide(); } }, isProc(m) ? 'Procesos' : 'Sustancias'),
      h('button', { type: 'button', role: 'tab', 'aria-selected': String(state.tab === 'areas'), onclick: function () { state.tab = 'areas'; renderSide(); } }, 'Áreas'),
      h('button', { type: 'button', class: 'mv-x mv-sheet-close', 'aria-label': 'Cerrar', style: { 'margin-left': '6px', flex: 'none' }, onclick: function () { toggleSide(false); } }, icon('close')));
    var input = h('input', { type: 'search', placeholder: state.tab === 'chems' ? (isProc(m) ? 'Buscar proceso…' : 'Buscar sustancia…') : 'Buscar área…', value: state.q, 'aria-label': 'Buscar' });
    var list = h('div', { class: 'mv-list' });
    var avance = null;
    if (isProc(m)) {
      var mf = mapFrac(m), nDoneA = (m.areas || []).filter(function (a) { return isDone(areaFrac(a)); }).length;
      avance = h('div', { class: 'mv-avance' },
        h('b', null, h('span', null, 'Avance del mapa'), h('span', null, pct(mf))),
        h('div', { class: 'mv-bar2' }, h('i', { style: { width: (mf * 100) + '%' } })),
        mf > 0 ? h('button', { type: 'button', onclick: function () { if (confirm('¿Borrar todas las marcas de avance?')) { resetProgress(); closeFicha(); render(); refreshProgress(); } } }, 'Reiniciar') : null,
        h('small', null, nDoneA + ' de ' + (m.areas || []).length + ' áreas completadas · las marcas no se guardan al cerrar'));
    }
    input.addEventListener('input', function () { state.q = input.value; fill(); });
    function fill() {
      list.innerHTML = '';
      var q = norm(state.q);
      if (state.tab === 'chems' && isProc(m)) {
        allProcs(m).filter(function (x) { return !q || norm(x.p.name + ' ' + x.a.name).indexOf(q) >= 0; }).forEach(function (x) {
          list.append(h('button', { type: 'button', class: 'mv-row', onclick: function () { if (isNarrow()) toggleSide(false); go({ area: x.a.id, proc: x.p.id, ficha: null }); } },
            h('span', { class: 'mv-pic mv-sm', html: ICONS.steps }),
            h('span', { class: 'mv-grow' }, h('b', null, x.p.name || 'Proceso'),
              h('small', null, x.a.name + ' · ' + stepsLabel((x.p.steps || []).length))),
            isDone(procFrac(x.p)) ? h('span', { class: 'mv-pstate mv-ok', title: 'Completado' }, '✓') : h('span', { class: 'mv-pstate' }, pct(procFrac(x.p)))));
        });
      } else if (state.tab === 'chems') {
        usedChems(m).filter(function (x) { return !q || norm(x.c.name).indexOf(q) >= 0; }).forEach(function (x) {
          var c = x.c, nf = (c.fichas || []).length;
          list.append(h('div', { class: 'mv-row', style: { padding: '4px 4px 4px 8px' } },
            h('button', { type: 'button', class: 'mv-row', style: { padding: '5px 0' }, onclick: function () { if (isNarrow()) toggleSide(false); go({ ficha: c.id }); } },
              chemIcon(c),
              h('span', { class: 'mv-grow' }, h('b', null, c.name),
                h('small', null, (x.n ? x.n + (x.n === 1 ? ' ubicación' : ' ubicaciones') : 'Sin pictograma en el mapa') + ' · ',
                  nf ? (nf === 1 ? 'Ficha SGA' : nf + ' fichas SGA') : h('span', { class: 'mv-pend' }, 'Ficha pendiente')))),
            x.n ? h('button', {
              type: 'button', class: 'mv-loc', title: 'Resaltar en el mapa', 'aria-label': 'Resaltar ' + c.name + ' en el mapa',
              'aria-pressed': String(state.hl === c.id),
              onclick: function () {
                state.hl = state.hl === c.id ? null : c.id;
                if (state.area) go({ area: null, ficha: null });
                applyHighlight(views[m.id]); renderSide();
                if (isNarrow() && state.hl) toggleSide(false);
              }
            }, icon('target')) : null));
        });
      } else {
        (m.areas || []).filter(function (a) { return !q || norm(a.name).indexOf(q) >= 0; }).forEach(function (a) {
          var ph = (a.photos || [])[0];
          list.append(h('button', { type: 'button', class: 'mv-row', onclick: function () { if (isNarrow()) toggleSide(false); go({ area: a.id, ficha: null, proc: null }); } },
            h('span', { class: 'mv-athumb', style: ph ? { 'background-image': 'url("' + asset(ph.img) + '")' } : null }, ph ? null : icon('camera')),
            isProc(m) ? h('span', { class: 'mv-dot', style: colorVars(a) }) : null,
            h('span', { class: 'mv-grow' }, h('b', null, a.name),
              h('small', null, isProc(m) ? (a.processes || []).length + ' procesos · ' + areaBadge(m, a) : areaChems(m, a).length + ' sustancias', ph ? null : h('span', { class: 'mv-pend' }, 'Foto pendiente'))),
            isProc(m) && isDone(areaFrac(a)) ? h('span', { class: 'mv-pstate mv-ok' }, '✓') : null));
        });
      }
      if (!list.children.length) list.append(h('p', { style: { color: 'var(--muted)', padding: '12px' } }, 'Sin resultados.'));
    }
    fill();
    side.append(tabs, avance, h('div', { class: 'mv-search' }, input), list,
      h('div', { class: 'mv-foot' }, isProc(m) ? 'Toca un proceso para ver sus pasos. ' : 'Toca una sustancia para ver su ficha SGA. ', OPTIONS.footer || ''));
  }

  // ------------------------------------------------------------ vista de área
  var areaView = null;
  function areaChems(m, a) {
    var ids = (a.chems || []).slice();
    (m.markers || []).forEach(function (mk) { if (mk.area === a.id && ids.indexOf(mk.chem) < 0) ids.push(mk.chem); });
    (a.photos || []).forEach(function (p) { (p.pins || []).forEach(function (pn) { if (ids.indexOf(pn.chem) < 0) ids.push(pn.chem); }); });
    return ids.filter(function (id) { return CHEMS[id]; });
  }

  function renderArea(m, a) {
    if (areaView && areaView.getAttribute('data-key') === m.id + '/' + a.id) return;
    closeArea();
    var photos = a.photos || [];
    var idx = 0;
    var stage = h('div', { class: 'mv-photo-stage' });
    var thumbs = photos.length > 1 ? h('div', { class: 'mv-thumbs' }) : null;

    function drawPhoto() {
      stage.innerHTML = '';
      if (!photos.length) {
        stage.append(h('div', { class: 'mv-pending' }, icon('camera'), h('b', null, 'Foto pendiente'),
          h('span', null, 'La fotografía de esta área se agregará posteriormente.')));
        return;
      }
      var p = photos[idx];
      var box = h('div', { class: 'mv-photo-box' });
      var img = h('img', { src: asset(p.img), alt: a.name + ' — foto ' + (idx + 1), onclick: function () { openLightbox(asset(p.img), a.name); } });
      box.append(img);
      (p.pins || []).forEach(function (pn) {
        var c = CHEMS[pn.chem]; if (!c) return;
        box.append(h('button', { type: 'button', class: 'mv-pin', title: c.name, 'aria-label': 'Ficha: ' + c.name, style: { left: pn.x + '%', top: pn.y + '%', '--f': c.fill, '--r': c.ring }, onclick: function () { go({ ficha: c.id }); } }));
      });
      stage.append(box);
      if (photos.length > 1) {
        stage.append(
          h('button', { type: 'button', class: 'mv-nav mv-prev', 'aria-label': 'Foto anterior', onclick: function () { idx = (idx - 1 + photos.length) % photos.length; drawPhoto(); } }, icon('back')),
          h('button', { type: 'button', class: 'mv-nav mv-next', 'aria-label': 'Foto siguiente', onclick: function () { idx = (idx + 1) % photos.length; drawPhoto(); } }, icon('next')),
          h('div', { class: 'mv-count' }, (idx + 1) + ' / ' + photos.length));
        Array.prototype.forEach.call(thumbs.children, function (b, i) { b.setAttribute('aria-current', String(i === idx)); });
      }
    }
    if (thumbs) photos.forEach(function (p, i) {
      thumbs.append(h('button', { type: 'button', 'aria-label': 'Foto ' + (i + 1), style: { 'background-image': 'url("' + asset(p.img) + '")' }, onclick: function () { idx = i; drawPhoto(); } }));
    });
    drawPhoto();

    var chemsBox = h('div', { class: 'mv-chems' });
    var ids = isProc(m) ? [] : areaChems(m, a);
    ids.forEach(function (id) {
      var c = CHEMS[id], nf = (c.fichas || []).length;
      chemsBox.append(h('button', { type: 'button', class: 'mv-chem', onclick: function () { go({ ficha: id }); } },
        chemIcon(c, true),
        h('span', { class: 'mv-grow' }, h('b', null, c.name),
          h('small', null, signalBadge(signalOf(c)), ' ', nf ? 'Ver ficha SGA' : h('span', { class: 'mv-pend', style: { 'margin-left': 0 } }, 'Ficha pendiente'))),
        h('span', { class: 'mv-go' }, icon('next'))));
    });
    if (!ids.length) chemsBox.append(h('p', { style: { color: 'var(--muted)', margin: '4px' } }, 'No hay sustancias registradas en esta área.'));
    var aprog = null;
    if (isProc(m)) {
      chemsBox = h('div', { class: 'mv-chems' });
      aprog = h('div', { class: 'mv-aprog' });
      var drawProcs = function () {
        chemsBox.innerHTML = ''; aprog.innerHTML = '';
        var af = areaFrac(a), aw = areaShare(m, a);
        aprog.append(h('small', null, 'Avance del área: ', h('b', null, pct(af)), ' · aporta ', h('b', null, pct(aw * af)), ' de ', h('b', null, pct(aw)), ' del mapa'),
          h('div', { class: 'mv-bar2' }, h('i', { style: { width: (af * 100) + '%' } })));
        if (!(a.processes || []).length) {
          aprog.append(h('button', { type: 'button', class: 'mv-mark', 'aria-pressed': String(!!doneArea[a.id]), onclick: function () { doneArea[a.id] = !doneArea[a.id]; refreshProgress(); } },
            doneArea[a.id] ? '✓ Área completada · desmarcar' : 'Marcar área como completada'));
        }
        (a.processes || []).forEach(function (p, i) {
          var n = (p.steps || []).length, f = procFrac(p);
          var meta = [stepsLabel(n), p.owner, p.freq].filter(Boolean).join(' · ');
          chemsBox.append(h('button', { type: 'button', class: 'mv-chem', onclick: function () { go({ proc: p.id, ficha: null }); } },
            h('span', { class: 'mv-num', style: { background: a.color || 'var(--blue,#1565c0)', color: a.color ? textOn(a.color) : '#fff' } }, String(i + 1)),
            h('span', { class: 'mv-grow' }, h('b', null, p.name || 'Proceso'), h('small', null, meta),
              h('small', null, h('span', { class: 'mv-worth' }, 'Vale ' + pct(aw * procShare(a, p)) + ' del mapa'))),
            isDone(f) ? h('span', { class: 'mv-pstate mv-ok', title: 'Completado' }, '✓') : h('span', { class: 'mv-pstate' }, pct(f)),
            h('span', { class: 'mv-go' }, icon('next'))));
        });
        if (!(a.processes || []).length) chemsBox.append(h('p', { style: { color: 'var(--muted)', margin: '4px' } }, 'No hay procesos registrados en esta área.'));
      };
      drawProcs();
    }

    var mini = h('div', { class: 'mv-minimap', title: 'Ver en el mapa', onclick: function () { go({ area: null, ficha: null, proc: null }); setTimeout(function () { var v = views[m.id]; v.pz.focus(a.x / 100 * v.W, a.y / 100 * v.H, a.w / 100 * v.W, a.h / 100 * v.H, true); }, 30); } },
      h('img', { src: asset(m.background), alt: '' }),
      h('div', { class: shapeClass(a) === ' mv-sh-cells' ? 'mv-mm-cells' : shapeClass(a).trim() || null, style: { left: a.x + '%', top: a.y + '%', width: a.w + '%', height: a.h + '%' } },
        shapeClass(a) === ' mv-sh-cells' ? cellsSvg(a, 'mv-cells') : null));

    areaView = h('section', { class: 'mv-area-view', 'data-key': m.id + '/' + a.id, 'aria-label': a.name },
      h('div', { class: 'mv-av-head' },
        h('button', { type: 'button', class: 'mv-back', onclick: function () { go({ area: null, ficha: null, proc: null }); } }, icon('back'), h('span', null, 'Mapa')),
        h('div', { class: 'mv-crumb' }, h('small', null, (m.name || '') + ' · Área'), h('h2', null, a.name))),
      h('div', { class: 'mv-av-body' },
        h('div', { class: 'mv-card' }, stage, thumbs, a.desc ? h('div', { class: 'mv-desc' }, a.desc) : null),
        h('div', null,
          h('div', { class: 'mv-card' }, h('h3', null, isProc(m) ? 'Procesos en esta área' : 'Sustancias en esta área'), aprog, chemsBox),
          h('div', { class: 'mv-card', style: { 'margin-top': '16px' } }, h('h3', null, 'Ubicación en el mapa'), mini))));
    if (isProc(m)) areaView._refresh = drawProcs;
    mapwrap.appendChild(areaView);
  }
  function closeArea() { if (areaView) { areaView.remove(); areaView = null; } }

  // ------------------------------------------------------------------- ficha
  var modal = null, lastFocus = null;
  function renderFicha(m, c) {
    if (modal && modal.getAttribute('data-chem') === c.id) return;
    closeFicha();
    lastFocus = document.activeElement;
    var fichas = c.fichas || [];
    var vi = 0;
    var body = h('div', { class: 'mv-db' });

    function draw() {
      body.innerHTML = '';
      if (fichas.length > 1) {
        body.append(h('div', { class: 'mv-variants', role: 'group', 'aria-label': 'Presentaciones' }, fichas.map(function (f, i) {
          return h('button', { type: 'button', 'aria-pressed': String(i === vi), onclick: function () { vi = i; draw(); } }, f.caption || ('Ficha ' + (i + 1)));
        })));
      }
      var f = fichas[vi];
      if (!f) {
        body.append(h('div', { class: 'mv-nofile' }, icon('doc'), h('b', null, 'Ficha SGA pendiente'),
          h('span', null, 'La etiqueta / ficha de este químico se agregará posteriormente.')));
      } else {
        if (f.img) {
          body.append(h('button', { type: 'button', class: 'mv-label-img', 'aria-label': 'Ampliar etiqueta', onclick: function () { openLightbox(asset(f.img), c.name + (f.caption ? ' · ' + f.caption : '')); } },
            h('img', { src: asset(f.img), alt: 'Etiqueta SGA de ' + c.name })),
            h('div', { class: 'mv-zoomtip' }, icon('zoom'), 'Toca la etiqueta para ampliarla'));
        }
        if (f.hazards && f.hazards.length) {
          body.append(h('div', { class: 'mv-sec' }, h('h4', null, 'Indicaciones de peligro'),
            h('ul', { class: 'mv-haz' }, f.hazards.map(function (t) { return h('li', null, t); }))));
        }
        if (f.emergency) {
          body.append(h('div', { class: 'mv-sec' }, h('h4', null, 'Contacto de emergencia'),
            h('div', { class: 'mv-emerg' }, icon('phone'), h('span', null, f.emergency))));
        }
        if (f.notes) body.append(h('div', { class: 'mv-sec' }, h('h4', null, 'Notas'), h('p', { style: { margin: 0 } }, f.notes)));
      }
      var places = areasWith(m, c.id);
      var loose = (m.markers || []).filter(function (mk) { return mk.chem === c.id && !mk.area; }).length;
      if (places.length || loose) {
        body.append(h('div', { class: 'mv-sec' }, h('h4', null, 'Ubicaciones en ' + (m.name || 'este mapa')),
          h('div', { class: 'mv-places' },
            places.map(function (a) { return h('button', { type: 'button', onclick: function () { go({ area: a.id, ficha: null }); } }, icon('pin'), a.name); }),
            loose ? h('button', { type: 'button', onclick: function () { state.hl = c.id; go({ area: null, ficha: null }); applyHighlight(views[m.id]); } }, icon('target'), 'Ver en el mapa') : null)));
      }
      if (f && f.source) body.append(h('div', { class: 'mv-src' }, 'Fuente: ' + f.source));
    }
    draw();
    var close = h('button', { type: 'button', class: 'mv-x', 'aria-label': 'Cerrar ficha', onclick: function () { go({ ficha: null }); } }, icon('close'));
    var f0 = fichas[0];
    modal = h('div', { class: 'mv-modal', 'data-chem': c.id, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Ficha de ' + c.name },
      h('div', { class: 'mv-backdrop', style: { position: 'absolute' }, onclick: function () { go({ ficha: null }); } }),
      h('div', { class: 'mv-dialog' },
        h('div', { class: 'mv-dh' }, chemIcon(c, true),
          h('div', { class: 'mv-grow' }, h('h2', null, c.name),
            h('small', null, signalBadge(signalOf(c)), ' ', f0 ? (fichas.length > 1 ? fichas.length + ' presentaciones' : (f0.caption || 'Ficha SGA')) : 'Etiqueta SGA')),
          close),
        body));
    root.appendChild(modal);
    close.focus({ preventScroll: true });
  }
  function closeFicha() {
    if (modal) { modal.remove(); modal = null; if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) { } }
  }

  // ----------------------------------------------------------------- proceso
  function renderProc(m, found) {
    var p = found.p, a = found.a;
    if (modal && modal.getAttribute('data-proc') === p.id) return;
    closeFicha();
    lastFocus = document.activeElement;
    var steps = p.steps || [];
    var done = checks[p.id] || (checks[p.id] = {});
    var body = h('div', { class: 'mv-db' });
    function draw() {
      body.innerHTML = '';
      var meta = [];
      if (p.owner) meta.push(h('span', null, icon('user'), h('b', null, 'Responsable:'), ' ' + p.owner));
      if (p.freq) meta.push(h('span', null, icon('clock'), h('b', null, 'Frecuencia:'), ' ' + p.freq));
      if (p.ppe) meta.push(h('span', null, icon('shield'), h('b', null, 'EPP:'), ' ' + p.ppe));
      if (meta.length) body.append(h('div', { class: 'mv-meta' }, meta));
      if (p.desc) body.append(h('p', { class: 'mv-pdesc' }, p.desc));
      if (isProc(m)) {
        var share = areaShare(m, a) * procShare(a, p);
        body.append(h('div', { class: 'mv-meta' }, h('span', { class: 'mv-worth' }, 'Vale ' + pct(share) + ' del mapa (' + pct(procShare(a, p)) + ' del área)'),
          steps.length ? h('span', null, 'Cada paso: ' + pct(share / steps.length)) : null));
      }
      if (!steps.length) {
        var mk = h('input', { type: 'checkbox' }); mk.checked = !!doneProc[p.id];
        mk.addEventListener('change', function () { doneProc[p.id] = mk.checked; draw(); refreshProgress(); });
        body.append(h('label', { class: 'mv-mark-proc' }, mk, 'Marcar proceso como completado'));
        body.append(h('div', { class: 'mv-nofile' }, icon('steps'), h('b', null, 'Pasos pendientes'), h('span', null, 'Los pasos de este proceso se agregarán posteriormente.')));
      } else {
        var nDone = steps.filter(function (s, i) { return done[i]; }).length;
        body.append(h('div', { class: 'mv-progress' }, h('span', null, nDone + ' de ' + steps.length + ' pasos'),
          h('div', null, h('i', { style: { width: (nDone / steps.length * 100) + '%' } })),
          nDone < steps.length ? h('button', { type: 'button', class: 'mv-markall', onclick: function () { steps.forEach(function (x, i) { done[i] = true; }); draw(); refreshProgress(); } }, 'Marcar todos') : null,
          nDone ? h('button', { type: 'button', onclick: function () { checks[p.id] = done = {}; draw(); refreshProgress(); } }, 'Reiniciar') : null));
        body.append(h('ol', { class: 'mv-steps' }, steps.map(function (s, i) {
          var cb = h('input', { type: 'checkbox', 'aria-label': 'Paso ' + (i + 1) + ' realizado' });
          cb.checked = !!done[i];
          cb.addEventListener('change', function () { done[i] = cb.checked; draw(); refreshProgress(); });
          return h('li', { class: 'mv-step' + (s.warn ? ' mv-warn' : '') + (done[i] ? ' mv-done' : '') },
            h('label', null, h('span', { class: 'mv-num' }, String(i + 1)), cb),
            h('div', null, h('div', { class: 'mv-step-t' }, s.text || ''),
              s.note ? h('span', { class: 'mv-step-n' }, (s.warn ? '⚠ ' : '') + s.note) : null,
              s.img ? h('button', { type: 'button', class: 'mv-step-img', 'aria-label': 'Ampliar imagen del paso ' + (i + 1), onclick: function () { openLightbox(asset(s.img), (p.name || '') + ' · paso ' + (i + 1)); } },
                h('img', { src: asset(s.img), alt: 'Paso ' + (i + 1) })) : null));
        })));
      }
      body.append(h('div', { class: 'mv-sec' }, h('h4', null, 'Ubicación'),
        h('div', { class: 'mv-places' }, h('button', { type: 'button', onclick: function () { go({ area: a.id, proc: null }); } }, icon('pin'), a.name))));
      if (p.source) body.append(h('div', { class: 'mv-src' }, 'Referencia: ' + p.source));
    }
    draw();
    var close = h('button', { type: 'button', class: 'mv-x', 'aria-label': 'Cerrar proceso', onclick: function () { go({ proc: null }); } }, icon('close'));
    modal = h('div', { class: 'mv-modal', 'data-proc': p.id, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Proceso: ' + (p.name || '') },
      h('div', { class: 'mv-backdrop', style: { position: 'absolute' }, onclick: function () { go({ proc: null }); } }),
      h('div', { class: 'mv-dialog' },
        h('div', { class: 'mv-dh' }, h('span', { class: 'mv-pic', html: ICONS.steps }),
          h('div', { class: 'mv-grow' }, h('h2', null, p.name || 'Proceso'), h('small', null, a.name + ' · ' + stepsLabel(steps.length))),
          close),
        body));
    root.appendChild(modal);
    close.focus({ preventScroll: true });
  }

  // -------------------------------------------------------- imagen ampliada
  var lightbox = null;
  function openLightbox(src, caption) {
    closeLightbox();
    var vp = h('div', { class: 'mv-viewport' });
    var content = h('div', { class: 'mv-content' });
    var img = h('img', { class: 'mv-bg', src: src, alt: caption || '' });
    content.append(img); vp.append(content);
    lightbox = h('div', { class: 'mv-lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': caption || 'Imagen' },
      vp, caption ? h('div', { class: 'mv-lb-cap' }, caption) : null,
      h('button', { type: 'button', class: 'mv-x', 'aria-label': 'Cerrar', onclick: closeLightbox }, icon('close')));
    root.appendChild(lightbox);
    function init() {
      var pz = new PanZoom(vp, content, img.naturalWidth || 1600, img.naturalHeight || 1000);
      lightbox.append(zoomButtons(pz));
      pz.fit();
    }
    if (img.complete && img.naturalWidth) init(); else img.onload = init;
  }
  function closeLightbox() { if (lightbox) { lightbox.remove(); lightbox = null; return true; } return false; }

  // ------------------------------------------------------------------ render
  function render() {
    var m = curMap();
    titleEl.textContent = m.title || (isProc(m) ? 'Mapa de procesos' : 'Mapa de sustancias químicas');
    document.getElementById('mv-logo').innerHTML = isProc(m) ? ICONS.steps : ICONS.hazard;
    subEl.textContent = m.subtitle || m.name || '';
    document.title = (m.title || 'Mapa') + (m.subtitle ? ' · ' + m.subtitle : (m.name ? ' · ' + m.name : ''));
    if (mapsSwitch) Array.prototype.forEach.call(mapsSwitch.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-map') === m.id)); });
    showMap(m);
    var a = state.area ? areaById(m, state.area) : null;
    if (a) renderArea(m, a); else closeArea();
    var c = state.ficha ? CHEMS[state.ficha] : null;
    var pr = state.proc ? procById(m, state.proc) : null;
    if (pr) renderProc(m, pr); else if (c) renderFicha(m, c); else closeFicha();
    renderSide();
    refreshProgress();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (closeLightbox()) return;
    if (state.proc) go({ proc: null });
    else if (state.ficha) go({ ficha: null });
    else if (!side.hidden && isNarrow()) toggleSide(false);
    else if (state.area) go({ area: null, proc: null });
  });
  window.addEventListener('hashchange', function () { if (!memMode) onHash(); });

  side.hidden = true;
  if (!isNarrow() && OPTIONS.legendOpen !== false) toggleSide(true);
  if (!location.hash || location.hash.length < 3) navigate(hashFor(state), true);
  else onHash();
}
