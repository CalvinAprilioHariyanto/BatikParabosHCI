function renderNavbar() {
  const navbarHTML = `
    <nav class="navbar">
      <div class="container navbar-container">
        <a href="index.html" class="navbar-brand">Batik Parabos</a>
        <ul class="navbar-nav">
          <li><a href="collection.html">Collection</a></li>
          <li><a href="heritage.html">Heritage</a></li>
          <li><a href="track.html">Track Order</a></li>
        </ul>
        <div class="nav-actions">
          <a href="wishlist.html">Wishlist <span id="nav-wishlist-badge" class="badge">0</span></a>
          <a href="cart.html">Cart <span id="nav-cart-badge" class="badge">0</span></a>
        </div>
      </div>
    </nav>
  `;
  document.body.insertAdjacentHTML('afterbegin', navbarHTML);
  updateBadges();
}

function updateBadges() {
  const cartBadge = document.getElementById('nav-cart-badge');
  const wishlistBadge = document.getElementById('nav-wishlist-badge');
  
  if (cartBadge && window.cartAPI) {
    const cart = window.cartAPI.getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBadge.textContent = count;
  }
  
  if (wishlistBadge && window.wishlistAPI) {
    const wishlist = window.wishlistAPI.getWishlist();
    wishlistBadge.textContent = wishlist.length;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  document.addEventListener('cartUpdated', updateBadges);
  document.addEventListener('wishlistUpdated', updateBadges);
});
