function renderFooter() {
  const footerHTML = `
    <footer class="footer">
      <div class="container footer-container">
        <div class="footer-col">
          <h4>Batik Parabos</h4>
          <p class="muted" style="font-size:0.875rem;">Digital Atelier & E-Commerce</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="collection.html">Collection</a></li>
            <li><a href="heritage.html">Heritage</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Assistance</h4>
          <ul>
            <li><a href="track.html">Track Order</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

document.addEventListener('DOMContentLoaded', renderFooter);
