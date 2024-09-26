function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ordersDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject('Error opening IndexedDB');
    };
  });
}

function saveOrderToIDB(order) {
  openIDB().then(db => {
    const tx = db.transaction('orders', 'readwrite');
    tx.objectStore('orders').add(order);
    return tx.complete;
  }).then(() => {
    console.log('Order saved offline.');
  });
}

function getUnsyncedOrdersFromIDB() {
  return openIDB().then(db => {
    const tx = db.transaction('orders', 'readonly');
    const store = tx.objectStore('orders');
    return store.getAll();
  });
}

function deleteSyncedOrdersFromIDB() {
  openIDB().then(db => {
    const tx = db.transaction('orders', 'readwrite');
    tx.objectStore('orders').clear();
    return tx.complete;
  }).then(() => {
    console.log('Synced orders cleared from IndexedDB.');
  });
}
