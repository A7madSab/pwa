self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  const unsyncedOrders = await getUnsyncedOrdersFromIDB();
  if (unsyncedOrders.length > 0) {
    for (const order of unsyncedOrders) {
      await sendOrderToServer(order);
    }
    deleteSyncedOrdersFromIDB();
  }
}
