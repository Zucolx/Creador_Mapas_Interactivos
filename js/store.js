/*
 * Guardado automatico del proyecto del EDITOR en IndexedDB del navegador.
 * (Los HTML exportados no usan ningun tipo de almacenamiento local.)
 */
(function (global) {
  'use strict';
  var DB = 'creador-mapas-interactivos', STORE = 'proyecto', KEY = 'actual';

  function open() {
    return new Promise(function (resolve, reject) {
      if (!global.indexedDB) return reject(new Error('IndexedDB no disponible'));
      var req = indexedDB.open(DB, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function tx(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(STORE, mode);
        var r = fn(t.objectStore(STORE));
        t.oncomplete = function () { resolve(r && r.result); db.close(); };
        t.onerror = t.onabort = function () { reject(t.error); db.close(); };
      });
    });
  }

  global.Store = {
    load: function () { return tx('readonly', function (s) { return s.get(KEY); }).catch(function () { return null; }); },
    save: function (project) { return tx('readwrite', function (s) { return s.put(project, KEY); }); },
    clear: function () { return tx('readwrite', function (s) { return s.delete(KEY); }); }
  };
})(window);
