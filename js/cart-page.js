document.addEventListener('DOMContentLoaded', () => {
  
  // DOM Elements
  const cartEmpty = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');

  // Format Helper
  const formatPrice = (value) => {
    return typeof window.formatRupiah === 'function' 
      ? window.formatRupiah(value) 
      : `IDR ${value.toLocaleString()}`;
  };

  function renderCart() {
    if (!window.cartAPI) {
      console.error("Cart API not found. Ensure state/cart.js is loaded.");
      return;
    }

    const cart = window.cartAPI.getCart();

    // Toggle Empty State
    if (cart.length === 0) {
      cartEmpty.classList.remove('hidden');
      cartContent.classList.add('hidden');
      return;
    }

    cartEmpty.classList.add('hidden');
    cartContent.classList.remove('hidden');

    // Clear Container
    cartItemsContainer.innerHTML = '';

    // Render Items
    cart.forEach(item => {
      // Safe fallback for image
      const imageSrc = (item.images && item.images.length > 0) ? item.images[0] : 'assets/images/placeholder.svg';
      const sizeText = item.size && item.size !== 'OS' ? `Size: ${item.size}` : '';
      const lineTotal = item.price * item.quantity;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      
      itemEl.innerHTML = `
        <img src="${imageSrc}" alt="${item.name}" class="cart-item__image" fetchpriority="high">
        
        <div class="cart-item__details">
          <h3 class="cart-item__title">${item.name}</h3>
          ${sizeText ? `<p class="cart-item__size">${sizeText}</p>` : ''}
          <p class="cart-item__unit-price">${formatPrice(item.price)}</p>
        </div>

        <div class="cart-item__actions">
          <div class="qty-control" aria-label="Quantity for ${item.name}">
            <button class="qty-control__btn qty-minus" aria-label="Decrease quantity">−</button>
            <span class="qty-control__val" aria-live="polite">${item.quantity}</span>
            <button class="qty-control__btn qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn-remove" aria-label="Remove ${item.name}">Remove</button>
        </div>

        <div class="cart-item__total">
          ${formatPrice(lineTotal)}
        </div>
      `;

      // Event Listeners for Item Actions
      const btnMinus = itemEl.querySelector('.qty-minus');
      const btnPlus = itemEl.querySelector('.qty-plus');
      const btnRemove = itemEl.querySelector('.btn-remove');

      btnMinus.addEventListener('click', () => {
        if (item.quantity > 1) {
          window.cartAPI.updateCartQty(item.id, item.size, item.quantity - 1);
        }
      });

      btnPlus.addEventListener('click', () => {
        window.cartAPI.updateCartQty(item.id, item.size, item.quantity + 1);
      });

      btnRemove.addEventListener('click', () => {
        window.cartAPI.removeFromCart(item.id, item.size);
        if (window.showToast) {
          window.showToast("Item removed from cart", "success");
        }
      });

      cartItemsContainer.appendChild(itemEl);
    });

    // Update Summary
    const subtotal = window.cartAPI.getCartSubtotal();
    const total = window.cartAPI.getCartTotal(); // Assuming complimentary shipping, this is identical

    summarySubtotal.textContent = formatPrice(subtotal);
    summaryTotal.textContent = formatPrice(total);
  }

  // Initial Render
  renderCart();

  // Listen to Global Cart Updates
  // The cart.js API triggers a 'cartUpdated' event on document whenever setCart is called.
  document.addEventListener('cartUpdated', () => {
    renderCart();
  });

});
