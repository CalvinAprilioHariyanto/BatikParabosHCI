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
      const imageSrc  = (product.images && product.images.length > 0) ? product.images[0] : 'assets/images/tes.jpg';
      const detailUrl = `product.html?id=${product.id}`;
      const price     = formatPrice(product.price);

      const card = document.createElement('article');
      card.className = 'product-card';

      card.innerHTML = `
        <a href="${detailUrl}" class="product-card__link" aria-label="View ${product.name}">
          <div class="product-card__image-wrap">
            <img
              src="${imageSrc}"
              alt="${product.name}"
              loading="lazy"
            >
            <div class="product-card__overlay">
              <span class="btn btn-ghost" style="font-size:0.6rem; padding:0.5rem 1rem;">View Piece</span>
            </div>
          </div>
          <div class="product-card__body">
            <span class="product-card__category">${product.category}</span>
            <h3 class="product-card__name">${product.name}</h3>
            ${product.motif ? `<p class="product-card__motif">${product.motif} · ${product.material}</p>` : ''}
            <div class="wishlist-card-actions">
              <p class="product-card__price">${price}</p>
              <button class="btn-remove-wishlist" aria-label="Remove ${product.name} from wishlist">Remove</button>
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
  }

  // Initial Render
  renderWishlist();

  // Listen to Global Wishlist Updates
  document.addEventListener('wishlistUpdated', renderWishlist);

});
