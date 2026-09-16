const KEYS = {
  CART: 'parabos_cart',
  WISHLIST: 'parabos_wishlist',
  ORDERS: 'parabos_orders',
  COMMISSIONS: 'parabos_commissions',
  APPOINTMENTS: 'parabos_appointments'
};

function safeGet(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
}

window.parabosStorage = {
  KEYS,
  safeGet,
  safeSet
};
