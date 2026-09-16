function getWishlist() {
  return window.parabosStorage.safeGet(window.parabosStorage.KEYS.WISHLIST, []);
}

function addToWishlist(productId) {
  const wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    window.parabosStorage.safeSet(window.parabosStorage.KEYS.WISHLIST, wishlist);
    document.dispatchEvent(new Event('wishlistUpdated'));
    if (window.showToast) window.showToast("Added to wishlist", "success");
  }
}

function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  window.parabosStorage.safeSet(window.parabosStorage.KEYS.WISHLIST, wishlist);
  document.dispatchEvent(new Event('wishlistUpdated'));
}

function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

window.wishlistAPI = {
  getWishlist, addToWishlist, removeFromWishlist, isWishlisted
};
