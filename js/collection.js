document.addEventListener('DOMContentLoaded', () => {
  const products = window.parabosProducts || [];
  
  // DOM Elements
  const productGrid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');
  const categoryFilters = document.getElementById('category-filters');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('reset-filters-btn');
  
  // State
  let currentCategory = 'all';
  let currentSort = 'featured';

  // Initialize
  initFilters();
  renderProducts();

  // ═══════════════════════════════════════════════════════
  // § 1. RENDER PRODUCTS
  // ═══════════════════════════════════════════════════════
  function renderProducts() {
    let filteredProducts = products.filter(p => {
      if (currentCategory === 'all') return true;
      return p.category === currentCategory;
    });

    // Sort
    filteredProducts.sort((a, b) => {
      if (currentSort === 'price-asc') return a.price - b.price;
      if (currentSort === 'price-desc') return b.price - a.price;
      // Default / Featured: featured items first
      if (currentSort === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0; // maintain original order for non-featured
      }
      return 0;
    });

    productGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
      productGrid.style.display = 'none';
      emptyState.classList.remove('hidden');
    } else {
      productGrid.style.display = 'grid';
      emptyState.classList.add('hidden');
      
      filteredProducts.forEach(product => {
        const formatPrice = typeof window.formatCurrency === 'function' 
          ? window.formatCurrency(product.price)
          : `IDR ${product.price.toLocaleString()}`;
          
        const cardHTML = `
          <div class="product-card reveal">
            <a href="product.html?id=${product.id}" class="product-card__image-link">
              <div class="product-card__image-wrap">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
              </div>
            </a>
            <div class="product-card__info">
              <div class="product-card__meta">
                <span class="product-card__category">${product.category}</span>
                <button class="btn-icon wishlist-toggle" data-id="${product.id}" aria-label="Add to wishlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
              <h3 class="product-card__title">
                <a href="product.html?id=${product.id}">${product.name}</a>
              </h3>
              <p class="product-card__price">${formatPrice}</p>
            </div>
          </div>
        `;
        productGrid.insertAdjacentHTML('beforeend', cardHTML);
      });

      // Bind wishlist events
      const wishlistBtns = productGrid.querySelectorAll('.wishlist-toggle');
      wishlistBtns.forEach(btn => {
        const id = btn.getAttribute('data-id');
        // Initial state
        if (window.Wishlist && window.Wishlist.isInWishlist(id)) {
          btn.classList.add('is-active');
        }
        
        btn.addEventListener('click', (e) => {
          e.preventDefault(); // Prevent navigating if wrapped in a link somehow
          if (window.Wishlist) {
            window.Wishlist.toggle(id);
            btn.classList.toggle('is-active');
          }
        });
      });
      
      // Initialize observer for new revealed elements
      initScrollReveal();
    }
  }

  // ═══════════════════════════════════════════════════════
  // § 2. CATEGORY FILTERS
  // ═══════════════════════════════════════════════════════
  function initFilters() {
    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))];
    
    categories.forEach(cat => {
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');
      
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('data-category', cat);
      btn.textContent = cat;
      
      li.appendChild(btn);
      categoryFilters.appendChild(li);
    });

    // Event listener for filters
    categoryFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        // Update active state
        const allBtns = categoryFilters.querySelectorAll('.filter-btn');
        allBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        
        e.target.classList.add('is-active');
        e.target.setAttribute('aria-selected', 'true');
        
        currentCategory = e.target.getAttribute('data-category');
        renderProducts();
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // § 3. SORTING
  // ═══════════════════════════════════════════════════════
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // ═══════════════════════════════════════════════════════
  // § 4. RESET (Empty State)
  // ═══════════════════════════════════════════════════════
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset filter button states
      const allBtns = categoryFilters.querySelectorAll('.filter-btn');
      allBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      
      const allBtn = categoryFilters.querySelector('[data-category="all"]');
      if (allBtn) {
        allBtn.classList.add('is-active');
        allBtn.setAttribute('aria-selected', 'true');
      }

      currentCategory = 'all';
      renderProducts();
    });
  }

  // ═══════════════════════════════════════════════════════
  // § 5. SCROLL REVEAL (Re-use from global or define simple one)
  // ═══════════════════════════════════════════════════════
  function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal:not(.is-visible)');
    revealElements.forEach(el => observer.observe(el));
  }
  
  // Run once on load for static elements (header, controls)
  initScrollReveal();
});
