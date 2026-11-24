'use strict';

const inspectionDB = (() => {
  let opening;

  function open() {
    opening ??= new Promise((resolve, reject) => {
      const request = indexedDB.open('sgm-factory-inspection', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('inspections', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Close other inspection tabs and reload.'));
    }).catch(error => {
      opening = undefined;
      throw error;
    });
    return opening;
  }

  async function list() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction('inspections').objectStore('inspections').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function save(record, expectedRevision) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('inspections', 'readwrite');
      const store = transaction.objectStore('inspections');
      const lookup = store.get(record.id);
      let conflict;
      const updated = { ...record, revision: expectedRevision + 1 };
      lookup.onsuccess = () => {
        const current = lookup.result;
        if ((current?.revision ?? 0) !== expectedRevision || current?.status === 'complete') {
          conflict = new Error('This inspection changed in another tab. Copy any unsaved notes before going back to inspections or reloading.');
          transaction.abort();
          return;
        }
        store.put(updated);
      };
      transaction.oncomplete = () => resolve(updated);
      transaction.onabort = () => reject(conflict ?? transaction.error ?? new Error('Storage transaction failed.'));
    });
  }

  return { list, save };
})();
