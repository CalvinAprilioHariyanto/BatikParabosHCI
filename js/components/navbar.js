/* ─────────────────────────────────────────────────────────
   navbar.js  —  Shared navigation component
   Renders navbar + mobile drawer; manages scroll transparency
   and live badge counts for cart/wishlist.
───────────────────────────────────────────────────────── */

function renderNavbar() {
  const navbarHTML = `
    <nav class="navbar navbar--transparent" id="main-navbar" role="navigation" aria-label="Main navigation">
      <div class="container navbar-container">

        <a href="index.html" class="navbar-brand" aria-label="Batik Parabos Home">
          Batik Parabos
        </a>

        <ul class="navbar-nav" role="list">
          <li><a href="collection.html">Collection</a></li>
          <li><a href="heritage.html">Heritage</a></li>
          <li><a href="atelier.html">Atelier</a></li>
          <li><a href="track.html">Track Order</a></li>
        </ul>

        <div class="nav-actions">
          <a href="wishlist.html" aria-label="Wishlist">
            Wishlist
            <span id="nav-wishlist-badge" class="badge" aria-live="polite" style="display:none">0</span>
          </a>
          <a href="cart.html" aria-label="Cart">
            Cart
            <span id="nav-cart-badge" class="badge" aria-live="polite" style="display:none">0</span>
          </a>
          <button
            class="nav-burger"
            id="nav-burger"
            aria-label="Toggle menu"
            aria-expanded="false"
            aria-controls="nav-drawer"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

      </div>
    </nav>

    <div class="nav-drawer" id="nav-drawer" role="dialog" aria-label="Mobile navigation">
      <a href="collection.html">Collection</a>
      <a href="heritage.html">Heritage</a>
      <a href="atelier.html">Atelier</a>
      <a href="track.html">Track Order</a>
      <a href="wishlist.html">Wishlist</a>
      <a href="cart.html">Cart</a>
    </div>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbarHTML);

  _initScrollBehaviour();
  _initMobileDrawer();
  _initActiveLink();
  updateNavBadges();
}

/* ── Scroll: transparent at top, solid on scroll ── */
function _initScrollBehaviour() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  const hero = document.querySelector('.hero');
  const threshold = hero ? hero.offsetHeight * 0.15 : 80;

  function onScroll() {
    if (window.scrollY > threshold) {
      navbar.classList.remove('navbar--transparent');
    } else {
      navbar.classList.add('navbar--transparent');
    }
  }

  /* Only make navbar transparent on pages that have a hero */
  if (!hero) {
    navbar.classList.remove('navbar--transparent');
    return;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ── Mobile drawer toggle ── */
function _initMobileDrawer() {
  const burger  = document.getElementById('nav-burger');
  const drawer  = document.getElementById('nav-drawer');
  if (!burger || !drawer) return;

  burger.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('is-open');
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  /* Close drawer on any link click inside it */
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Highlight active nav link ── */
function _initActiveLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a, .nav-drawer a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current) {
      a.classList.add('is-active');
    }
  });
}

/* ── Badge counts ── */
function updateNavBadges() {
  const cartBadge     = document.getElementById('nav-cart-badge');
  const wishlistBadge = document.getElementById('nav-wishlist-badge');

  if (cartBadge && window.cartAPI) {
    const cart  = window.cartAPI.getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBadge.textContent = count;
    cartBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  if (wishlistBadge && window.wishlistAPI) {
    const count = window.wishlistAPI.getWishlist().length;
    wishlistBadge.textContent = count;
    wishlistBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  document.addEventListener('cartUpdated',     updateNavBadges);
  document.addEventListener('wishlistUpdated', updateNavBadges);
});
