document.addEventListener('DOMContentLoaded', () => {
  fetchOrders(); // Fetch and display all orders when the page loads
});

// Function to fetch all orders from the server
function fetchOrders() {
  fetch('http://localhost:3000/orders') // Ensure json-server is running on port 3000
    .then(response => response.json())
    .then(data => renderOrders(data))  // Pass the data to renderOrders function
    .catch(error => console.error('Error fetching orders:', error));
}

// Function to render the orders in the DOM
function renderOrders(orders) {
  const orderList = document.getElementById('order-list');
  orderList.innerHTML = orders.map(order => `
    <div class="order">
      <h3>${order.title} - $${order.cost}</h3>
      <p>Order ID: ${order.id}</p>
      <p>Timestamp: ${new Date(order.timestamp).toLocaleString()}</p>
    </div>
  `).join('');  // Display each order with title, cost, and additional info
}

// Handle form submission to add a new order
document.getElementById('order-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const cost = document.getElementById('cost').value;

  const newOrder = {
    title,
    cost: parseFloat(cost),     // Ensure cost is treated as a number
    timestamp: Date.now()
  };

  // Check if online or offline
  if (!navigator.onLine) {
    saveOrderToIDB(newOrder);
  } else {
    sendOrderToServer(newOrder);
  }

  // Clear the form after submission
  document.getElementById('order-form').reset();
});

// Function to send an order to the server
function sendOrderToServer(order) {
  fetch('http://localhost:3000/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(order)
  }).then(() => {
    console.log('Order synced with server');
    fetchOrders(); // Update the list after the new order is synced
  }).catch(() => {
    saveOrderToIDB(order); // Save to IndexedDB if failed
  });
}

// Function to save an order offline (IndexedDB)
function saveOrderToIDB(order) {
  openIDB().then(db => {
    const tx = db.transaction('orders', 'readwrite');
    tx.objectStore('orders').add(order);
    return tx.complete;
  }).then(() => {
    console.log('Order saved offline.');
    fetchOrders(); // Update the list with the new offline order
  });
}
