document.addEventListener('DOMContentLoaded', () => {
  
  // DOM Elements
  const wishlistEmpty = document.getElementById('wishlist-empty');
  const wishlistContent = document.getElementById('wishlist-content');
  const wishlistGrid = document.getElementById('wishlist-grid');

  // Format Helper
  const formatPrice = (value) => {
    return typeof window.formatRupiah === 'function' 
      ? window.formatRupiah(value) 
      : `IDR ${value.toLocaleString()}`;
  };

  function renderWishlist() {
    if (!window.wishlistAPI || !window.parabosProducts) {
      console.error("Wishlist API or Product Data not found.");
      return;
    }

    const savedIds = window.wishlistAPI.getWishlist();
    
    // Filter the full product list by the saved IDs
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

    // Render Items
    savedProducts.forEach(product => {
      // Safe fallback for image
      const imageSrc = (product.images && product.images.length > 0) ? product.images[0] : 'assets/images/placeholder.svg';
      const detailUrl = `product.html?id=${product.id}`;

      // Build product card (reusing foundation structure)
      const cardEl = document.createElement('article');
      cardEl.className = 'product-card';
      
      cardEl.innerHTML = `
        <a href="${detailUrl}" class="product-card__image-link">
          <img src="${imageSrc}" alt="${product.name}" class="product-card__image" loading="lazy">
        </a>
        <div class="product-card__info">
          <div class="product-card__header">
            <span class="product-card__category">${product.category}</span>
            <a href="${detailUrl}" class="product-card__title-link">
              <h3 class="product-card__title">${product.name}</h3>
            </a>
          </div>
          <div class="wishlist-card-actions">
            <p class="product-card__price">${formatPrice(product.price)}</p>
            <button class="btn-remove-wishlist" aria-label="Remove ${product.name} from wishlist">Remove</button>
          </div>
        </div>
      `;

      // Event Listener for Remove
      const btnRemove = cardEl.querySelector('.btn-remove-wishlist');
      btnRemove.addEventListener('click', (e) => {
        // Prevent click from affecting the card links just in case
        e.preventDefault(); 
        window.wishlistAPI.removeFromWishlist(product.id);
        
        // Let the global event listener handle the re-render
        if (window.showToast) {
          window.showToast("Removed from wishlist", "success");
        }
      });

      wishlistGrid.appendChild(cardEl);
    });
  }

  // Initial Render
  renderWishlist();

  // Listen to Global Wishlist Updates
  // The wishlist.js API triggers a 'wishlistUpdated' event on document whenever the state changes.
  document.addEventListener('wishlistUpdated', () => {
    renderWishlist();
  });

});
