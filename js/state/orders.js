function getOrders() {
  return window.parabosStorage.safeGet(window.parabosStorage.KEYS.ORDERS, []);
}

function generateOrderNumber() {
  const min = 100;
  const max = 999;
  const random = Math.floor(Math.random() * (max - min + 1)) + min;
  return `PB-2026-${random}`;
}

function addOrder(orderData) {
  const orders = getOrders();
  const newOrder = {
    ...orderData,
    orderNumber: generateOrderNumber(),
    date: new Date().toISOString(),
    status: 'Processing'
  };
  orders.push(newOrder);
  window.parabosStorage.safeSet(window.parabosStorage.KEYS.ORDERS, orders);
  return newOrder;
}

function getOrderByNumber(orderNumber) {
  const orders = getOrders();
  return orders.find(o => o.orderNumber === orderNumber);
}

function getOrderStatus(orderNumber) {
  const order = getOrderByNumber(orderNumber);
  return order ? order.status : null;
}

window.ordersAPI = {
  getOrders, addOrder, getOrderByNumber, generateOrderNumber, getOrderStatus
};
