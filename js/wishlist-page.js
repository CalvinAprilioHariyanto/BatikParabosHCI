document.addEventListener('DOMContentLoaded', () => {
  
  // DOM Elements
  const wishlistEmpty   = document.getElementById('wishlist-empty');
  const wishlistContent = document.getElementById('wishlist-content');
  const wishlistGrid    = document.getElementById('wishlist-grid');

  // Format Helper
  const formatPrice = (value) => {
    return typeof window.formatRupiah === 'function'
      ? window.formatRupiah(value)
      : `IDR ${value.toLocaleString('id-ID')}`;
  };

  function renderWishlist() {
    if (!window.wishlistAPI || !window.parabosProducts) {
      console.error('Wishlist API or Product Data not found.');
      return;
    }

    const savedIds      = window.wishlistAPI.getWishlist();
    const savedProducts = window.parabosProducts.filter(p => savedIds.includes(p.id));

    // Toggle Empty State
    if (savedProducts.length === 0) {
      wishlistEmpty.classList.remove('hidden');
      wishlistContent.classList.add('hidden');
      return;
    }

    wishlistEmpty.classList.add('hidden');
    wishlistContent.classList.remove('hidden');

    // Clear Container
    wishlistGrid.innerHTML = '';

    // Render Items — use the same product-card structure as collection.js
    savedProducts.forEach(product => {
      const detailUrl = `product.html?id=${product.id}`;

      // Safely extract properties
      const safeMotif    = product.motif || 'Signature Batik Motif';
      const safeMaterial = product.material || 'Premium Batik Textile';
      const safeCategory = product.category || 'Collection';
      const safeName     = product.name || 'Batik Parabos Piece';

      let price = 'Inquire';
      if (product.priceLabel) {
        price = product.priceLabel;
      } else if (product.price !== null && product.price !== undefined) {
        price = typeof window.formatRupiah === 'function'
          ? window.formatRupiah(product.price)
          : `IDR ${product.price.toLocaleString('id-ID')}`;
      }

      const isBespoke = typeof window.isInquiryOnly === 'function' && window.isInquiryOnly(product);
      const overlayText = isBespoke ? 'INQUIRE' : 'View Piece';
      const actualUrl = isBespoke ? `inquire.html?product=${product.id}` : detailUrl;

      const card = document.createElement('article');
      card.className = 'product-card reveal';

      card.innerHTML = `
        <a href="${actualUrl}" class="product-card__link" aria-label="${overlayText} ${safeName}">
          <div class="product-card__image-wrap">
            <img
              src="${product.images && product.images.length > 0 ? product.images[0] : 'assets/images/placeholder.svg'}"
              alt="${safeName}"
              loading="lazy"
            >
            <div class="product-card__overlay">
              <span class="btn btn-ghost" style="font-size:0.6rem; padding:0.5rem 1rem;">${overlayText}</span>
            </div>
          </div>
          <div class="product-card__body">
            <span class="product-card__category">${safeCategory}</span>
            <h3 class="product-card__name">${safeName}</h3>
            <p class="product-card__motif">${safeMotif} · ${safeMaterial}</p>
            <div class="wishlist-card-actions">
              <p class="product-card__price">${price}</p>
              <button class="btn-remove-wishlist" aria-label="Remove ${safeName} from wishlist">Remove</button>
            </div>
          </div>
        </a>
      `;

      // Event Listener for Remove
      const btnRemove = card.querySelector('.btn-remove-wishlist');
      btnRemove.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.wishlistAPI.removeFromWishlist(product.id);
        if (window.showToast) {
          window.showToast('Removed from wishlist', 'success');
        }
      });

      wishlistGrid.appendChild(card);
    });

    initScrollReveal();
  }

  function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => observer.observe(el));
  }

  // Initial Render
  renderWishlist();

  // Listen to Global Wishlist Updates
  document.addEventListener('wishlistUpdated', renderWishlist);

});
