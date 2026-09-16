document.addEventListener('DOMContentLoaded', () => {
  
  // APIs
  const ordersAPI = window.ordersAPI;
  const formatPrice = window.formatRupiah || (val => `IDR ${val.toLocaleString()}`);

  if (!ordersAPI) {
    console.error("Required APIs not found. Ensure orders.js is loaded.");
    return;
  }

  // DOM Elements
  const searchState = document.getElementById('track-search-state');
  const errorState = document.getElementById('track-error-state');
  const detailsState = document.getElementById('track-details-state');

  const searchForm = document.getElementById('track-search-form');
  const searchInput = document.getElementById('search-order-number');
  const btnTryAgain = document.getElementById('btn-try-again');

  // URL Parsing
  const urlParams = new URLSearchParams(window.location.search);
  const orderParam = urlParams.get('order');

  if (orderParam) {
    loadOrder(orderParam);
  } else {
    showSearchState();
  }

  // Search Logic
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchForm.classList.add('was-validated');

    if (searchForm.checkValidity()) {
      const orderNumber = searchInput.value.trim();
      // Update URL without full reload if possible, but simplest is just changing location to maintain native history
      window.location.href = `track.html?order=${orderNumber}`;
    }
  });

  btnTryAgain.addEventListener('click', () => {
    window.location.href = 'track.html';
  });

  // Flow Control Functions
  function showSearchState() {
    searchState.classList.remove('hidden');
    errorState.classList.add('hidden');
    detailsState.classList.add('hidden');
  }

  function showErrorState() {
    searchState.classList.add('hidden');
    errorState.classList.remove('hidden');
    detailsState.classList.add('hidden');
  }

  function showDetailsState() {
    searchState.classList.add('hidden');
    errorState.classList.add('hidden');
    detailsState.classList.remove('hidden');
  }

  // Load and Render Order
  function loadOrder(orderNumber) {
    const order = ordersAPI.getOrderByNumber(orderNumber);

    if (!order) {
      showErrorState();
      return;
    }

    renderOrderDetails(order);
    showDetailsState();
  }

  function renderOrderDetails(order) {
    // 1. Header
    document.getElementById('display-order-number').textContent = order.orderNumber;
    
    const orderDate = new Date(order.date);
    const dateFormatted = isNaN(orderDate) ? order.date : orderDate.toLocaleDateString('en-GB', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });
    document.getElementById('display-order-date').textContent = dateFormatted;

    // 2. Timeline Status Simulation
    renderTimeline(orderDate);

    // 3. Order Items
    const itemsContainer = document.getElementById('order-items-container');
    itemsContainer.innerHTML = ''; // clear

    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const imageSrc = (item.images && item.images.length > 0) ? item.images[0] : 'assets/images/placeholder.svg';
        const sizeText = item.size && item.size !== 'OS' ? `Size: ${item.size}` : '';
        const lineTotal = item.price * item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'order-item';
        itemEl.innerHTML = `
          <img src="${imageSrc}" alt="${item.name}" class="order-item__image" loading="lazy">
          <div class="order-item__details">
            <h4 class="order-item__title">${item.name}</h4>
            ${sizeText ? `<span class="order-item__meta">${sizeText}</span>` : ''}
            <span class="order-item__meta">Qty: ${item.quantity}</span>
          </div>
          <div class="order-item__price">
            ${formatPrice(lineTotal)}
          </div>
        `;
        itemsContainer.appendChild(itemEl);
      });
    }

    // 4. Shipping Address
    const addr = order.shippingAddress;
    const addrContainer = document.getElementById('display-shipping-address');
    if (addr) {
      addrContainer.innerHTML = `
        <p>${addr.name}</p>
        <p>${addr.address}</p>
        <p>${addr.city}, ${addr.province} ${addr.postalCode}</p>
        <p>${addr.phone}</p>
      `;
    }

    // 5. Payment & Summary
    document.getElementById('display-payment-method').innerHTML = `<p>${order.paymentMethod}</p>`;
    
    document.getElementById('display-subtotal').textContent = formatPrice(order.subtotal);
    document.getElementById('display-shipping').textContent = order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping);
    document.getElementById('display-total').textContent = formatPrice(order.total);
  }

  function renderTimeline(orderDate) {
    const timelineContainer = document.getElementById('order-timeline');
    
    // Simulate progression based on time difference
    // For demo purposes, we will assume:
    // < 1 minute = Received
    // < 2 minutes = Processing
    // < 3 minutes = Shipped
    // >= 3 minutes = Completed
    // (Accelerated timeframe for easy frontend testing without needing to wait hours)
    
    let activeIndex = 0; // 0: Received, 1: Processing, 2: Shipped, 3: Completed
    
    if (!isNaN(orderDate)) {
      const now = new Date();
      const diffMinutes = (now - orderDate) / (1000 * 60);

      if (diffMinutes >= 3) {
        activeIndex = 3;
      } else if (diffMinutes >= 2) {
        activeIndex = 2;
      } else if (diffMinutes >= 1) {
        activeIndex = 1;
      } else {
        activeIndex = 0;
      }
    }

    const steps = [
      { title: "Order Received", desc: "Your order has been received." },
      { title: "Processing", desc: "Your piece is being prepared." },
      { title: "Shipped", desc: "Your order has been handed to the courier." },
      { title: "Completed", desc: "Your order has been delivered." }
    ];

    let html = '';
    
    steps.forEach((step, index) => {
      let statusClass = '';
      if (index < activeIndex) {
        statusClass = 'completed';
      } else if (index === activeIndex) {
        statusClass = 'active';
      }

      html += `
        <div class="timeline-item ${statusClass}">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h4 class="timeline-content__title">${step.title}</h4>
            <p class="timeline-content__desc">${step.desc}</p>
          </div>
        </div>
      `;
    });

    timelineContainer.innerHTML = html;
  }

});
