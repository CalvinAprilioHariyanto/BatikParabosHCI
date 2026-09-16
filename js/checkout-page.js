document.addEventListener('DOMContentLoaded', () => {
  
  // APIs
  const cartAPI = window.cartAPI;
  const ordersAPI = window.ordersAPI;
  const formatPrice = window.formatRupiah || (val => `IDR ${val.toLocaleString()}`);

  if (!cartAPI || !ordersAPI) {
    console.error("Required APIs not found. Ensure cart.js and orders.js are loaded.");
    return;
  }

  // DOM Elements
  const header = document.getElementById('checkout-header');
  const emptyState = document.getElementById('checkout-empty');
  const contentLayout = document.getElementById('checkout-content');
  const confirmationState = document.getElementById('checkout-confirmation');
  
  const itemsContainer = document.getElementById('checkout-items-container');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryTotal = document.getElementById('summary-total');
  
  const form = document.getElementById('checkout-form');
  const placeOrderBtn = document.getElementById('place-order-btn');

  // Initialization
  const cart = cartAPI.getCart();

  if (cart.length === 0) {
    // Show empty state
    header.classList.add('hidden');
    contentLayout.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  // Render Summary Items
  cart.forEach(item => {
    const imageSrc = (item.images && item.images.length > 0) ? item.images[0] : 'assets/images/tes.jpg';
    const sizeText = item.size && item.size !== 'OS' ? `Size: ${item.size}` : '';
    const lineTotal = item.price * item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'checkout-item';
    itemEl.innerHTML = `
      <img src="${imageSrc}" alt="${item.name}" class="checkout-item__image" loading="lazy">
      <div class="checkout-item__details">
        <h4 class="checkout-item__title">${item.name}</h4>
        ${sizeText ? `<span class="checkout-item__meta">${sizeText}</span>` : ''}
        <span class="checkout-item__meta">Qty: ${item.quantity}</span>
      </div>
      <div class="checkout-item__price">
        ${formatPrice(lineTotal)}
      </div>
    `;
    itemsContainer.appendChild(itemEl);
  });

  // Render Totals
  const subtotal = cartAPI.getCartSubtotal();
  const total = cartAPI.getCartTotal();

  summarySubtotal.textContent = formatPrice(subtotal);
  summaryTotal.textContent = formatPrice(total);

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Trigger HTML5 validation UI
    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      if (window.showToast) window.showToast("Please complete all required fields.", "error");
      return;
    }

    // Ensure a payment method is selected (handled by required attribute on radio, but double check)
    const formData = new FormData(form);
    const paymentMethod = formData.get('payment-method');

    if (!paymentMethod) {
      if (window.showToast) window.showToast("Please select a payment method.", "error");
      return;
    }

    // Disable button to prevent double submission
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Processing...";

    // Construct Order Data
    const orderData = {
      items: cart,
      subtotal: subtotal,
      shipping: 0, // Complimentary
      total: total,
      paymentMethod: paymentMethod,
      customer: {
        name: formData.get('customer-name'),
        email: formData.get('customer-email'),
        phone: formData.get('customer-phone')
      },
      shippingAddress: {
        name: formData.get('shipping-name'),
        address: formData.get('shipping-address'),
        city: formData.get('shipping-city'),
        province: formData.get('shipping-province'),
        postalCode: formData.get('shipping-postal'),
        phone: formData.get('shipping-phone')
      }
    };

    // Save Order
    try {
      const newOrder = ordersAPI.addOrder(orderData);
      
      // Clear Cart ONLY after successful order creation
      cartAPI.clearCart();

      // Show Confirmation
      showConfirmation(newOrder);

    } catch (err) {
      console.error("Order creation failed:", err);
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
      if (window.showToast) window.showToast("An error occurred while creating your order.", "error");
    }
  });

  function showConfirmation(order) {
    // Hide Checkout Flow
    header.classList.add('hidden');
    contentLayout.classList.add('hidden');
    
    // Populate Confirmation Data
    document.getElementById('confirm-order-number').textContent = order.orderNumber;
    
    // Format Date safely
    const orderDate = new Date(order.date);
    const dateFormatted = isNaN(orderDate) ? order.date : orderDate.toLocaleDateString('en-GB', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    document.getElementById('confirm-order-date').textContent = dateFormatted;
    document.getElementById('confirm-payment-method').textContent = order.paymentMethod;
    document.getElementById('confirm-total').textContent = formatPrice(order.total);

    // Setup Track Order Link
    document.getElementById('track-order-link').href = `track.html?order=${order.orderNumber}`;

    // Show Confirmation
    confirmationState.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

});
