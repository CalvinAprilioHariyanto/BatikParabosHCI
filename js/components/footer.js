/* ─────────────────────────────────────────────────────────
   footer.js  —  Shared footer component
───────────────────────────────────────────────────────── */

function renderFooter() {
  const year = new Date().getFullYear();

  const footerHTML = `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer-container">

          <div class="footer-brand footer-col">
            <a href="index.html" class="navbar-brand">Batik Parabos</a>
            <p>
              A digital atelier dedicated to the art of Indonesian Batik.
              Every piece is crafted with purpose, pattern, and heritage.
            </p>
          </div>

          <div class="footer-col">
            <h5>Collection</h5>
            <ul>
              <li><a href="collection.html">All Pieces</a></li>
              <li><a href="collection.html?category=Shirts">Shirts</a></li>
              <li><a href="collection.html?category=Jackets+%26+Blazers">Jackets &amp; Blazers</a></li>
              <li><a href="collection.html?category=Ceremonial">Ceremonial</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Atelier</h5>
            <ul>
              <li><a href="heritage.html">Our Heritage</a></li>
              <li><a href="atelier.html">Visit the Atelier</a></li>
              <li><a href="atelier.html">Bespoke Commission</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Assistance</h5>
            <ul>
              <li><a href="track.html">Track Order</a></li>
              <li><a href="cart.html">Your Cart</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
            </ul>
          </div>

        </div>

        <div class="footer-bottom">
          <p>&copy; ${year} Batik Parabos. All rights reserved.</p>
          <p>Handcrafted in Indonesia.</p>
        </div>
      </div>
    </footer>
  `;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

document.addEventListener('DOMContentLoaded', renderFooter);
