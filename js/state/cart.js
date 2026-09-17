function getCart() {
  const rawCart = window.parabosStorage.safeGet(window.parabosStorage.KEYS.CART, []);
  // Securely filter out any inquiry products that might have slipped into localStorage
  return rawCart.filter(item => {
    if (typeof window.isInquiryOnly === 'function' && window.isInquiryOnly(item)) {
      return false;
    }
    return true;
  });
}

function setCart(cart) {
  window.parabosStorage.safeSet(window.parabosStorage.KEYS.CART, cart);
  document.dispatchEvent(new Event('cartUpdated'));
}

function addToCart(product, size, quantity) {
  if (product.type === 'custom') {
    if (window.showToast) window.showToast("Custom products cannot be added to cart.", "error");
    return;
  }
  if (typeof window.isInquiryOnly === 'function' && window.isInquiryOnly(product)) {
    if (window.showToast) window.showToast("This product is for inquiry only.", "error");
    return;
  }
  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.id === product.id && item.size === size);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ ...product, size, quantity });
  }
  setCart(cart);
  if (window.showToast) window.showToast("Added to cart", "success");
  if (window.playUISound) window.playUISound('add-to-cart');
}

function removeFromCart(itemId, size) {
  const cart = getCart();
  const updatedCart = cart.filter(item => !(item.id === itemId && item.size === size));
  setCart(updatedCart);
}

function updateCartQty(itemId, size, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === itemId && item.size === size);
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      removeFromCart(itemId, size);
    } else {
      setCart(cart);
    }
  }
}

function clearCart() {
  setCart([]);
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartTotal() {
  return getCartSubtotal();
}

window.cartAPI = {
  getCart, setCart, addToCart, removeFromCart, updateCartQty, clearCart, getCartSubtotal, getCartTotal
};
