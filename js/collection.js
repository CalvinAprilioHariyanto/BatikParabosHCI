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
  let currentSearchQuery = '';

  // Search Elements
  const searchInput = document.getElementById('collection-search');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  // Initialize
  initFilters();
  initSearch();
  renderProducts();

  // Play subtle entrance sound once
  if (window.playUISound) window.playUISound('collection-enter');

  // ═══════════════════════════════════════════════════════
  // § 1. RENDER PRODUCTS
  // ═══════════════════════════════════════════════════════
  function renderProducts() {
    let filteredProducts = products.filter(p => {
      // 1. Category Filter
      if (currentCategory !== 'all' && p.category !== currentCategory) return false;
      
      // 2. Search Filter
      if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        const searchableText = `${p.name} ${p.description || ''} ${p.motif || ''} ${p.category || ''} ${p.material || ''}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });

    // Sort
    filteredProducts.sort((a, b) => {
      if (currentSort === 'price-asc') return a.price - b.price;
      if (currentSort === 'price-desc') return b.price - a.price;
      if (currentSort === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
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
        // Safely extract properties
        const safeMotif = product.motif || 'Signature Batik Motif';
        const safeMaterial = product.material || 'Premium Batik Textile';
        const safeCategory = product.category || 'Collection';
        const safeName = product.name || 'Batik Parabos Piece';

        const isBespoke = typeof window.isInquiryOnly === 'function' && window.isInquiryOnly(product);
        const overlayText = isBespoke ? 'INQUIRE' : 'View Piece';

        // Use priceLabel if available, otherwise format numeric price safely
        let price = 'Inquire';
        if (product.priceLabel) {
          price = product.priceLabel;
        } else if (product.price !== null && product.price !== undefined) {
          price = typeof window.formatRupiah === 'function'
            ? window.formatRupiah(product.price)
            : `IDR ${product.price.toLocaleString('id-ID')}`;
        }
        
        const isWishlisted = window.wishlistAPI ? window.wishlistAPI.isWishlisted(product.id) : false;
        
        const card = document.createElement('article');
        card.className = 'product-card reveal';
        card.innerHTML = `
          <a href="${isBespoke ? `inquire.html?product=${product.id}` : `product.html?id=${product.id}`}" class="product-card__link" aria-label="${overlayText} ${safeName}">
            <div class="product-card__image-wrap">
              <img
                src="${product.images && product.images.length > 0 ? product.images[0] : 'assets/images/placeholder.svg'}"
                alt="${safeName} — ${safeMotif} motif"
                loading="lazy"
              >
              ${product.type === 'custom' || product.type === 'Jacket' || product.type === 'Blazer' ? '<span class="product-card__type-badge">Bespoke</span>' : ''}
              <div class="product-card__overlay">
                <span class="btn btn-ghost" style="font-size:0.6rem; padding:0.5rem 1rem;">${overlayText}</span>
              </div>
            </div>
            <div class="product-card__body">
              <span class="product-card__category">${safeCategory}</span>
              <h3 class="product-card__name">${safeName}</h3>
              <p class="product-card__motif">${safeMotif} · ${safeMaterial}</p>
              <p class="product-card__price">${price}</p>
            </div>
          </a>
          <button
            class="product-card__wishlist-btn${isWishlisted ? ' is-active' : ''}"
            data-id="${product.id}"
            aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
            aria-pressed="${isWishlisted}"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        `;
        
        productGrid.appendChild(card);
      });

      // Bind wishlist toggle events
      productGrid.querySelectorAll('.product-card__wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!window.wishlistAPI) return;
          
          const id = btn.getAttribute('data-id');
          const wasListed = window.wishlistAPI.isWishlisted(id);
          
          if (wasListed) {
            window.wishlistAPI.removeFromWishlist(id);
            btn.classList.remove('is-active');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', 'Add to wishlist');
            btn.querySelector('svg').setAttribute('fill', 'none');
          } else {
            window.wishlistAPI.addToWishlist(id);
            btn.classList.add('is-active');
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('aria-label', 'Remove from wishlist');
            btn.querySelector('svg').setAttribute('fill', 'currentColor');
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
    // Handle URL param for category (from footer links)
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    if (urlCategory) {
      currentCategory = urlCategory;
    }

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

    // Set initial active state
    const allFilterBtns = categoryFilters.querySelectorAll('.filter-btn');
    allFilterBtns.forEach(b => {
      if (b.getAttribute('data-category') === currentCategory) {
        b.classList.add('is-active');
        b.setAttribute('aria-selected', 'true');
      }
    });
    const allBtn = categoryFilters.querySelector('[data-category="all"]');
    if (currentCategory === 'all' && allBtn) {
      allBtn.classList.add('is-active');
      allBtn.setAttribute('aria-selected', 'true');
    }

    // Event listener
    categoryFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
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
  // § 4.1 SEARCH (Empty State + Clear)
  // ═══════════════════════════════════════════════════════
  function initSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (currentSearchQuery.trim() !== '') {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
      renderProducts();
    });

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearchQuery = '';
        clearSearchBtn.classList.add('hidden');
        renderProducts();
      });
    }
  }

  // ═══════════════════════════════════════════════════════
  // § 5. SCROLL REVEAL
  // ═══════════════════════════════════════════════════════
  function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
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
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => observer.observe(el));
  }
  
  initScrollReveal();
});
