document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Get Product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  // 2. DOM Elements
  const productContainer = document.getElementById('product-container');
  const errorState = document.getElementById('product-error');
  
  // Validate Product
  const products = window.parabosProducts || [];
  const product = products.find(p => p.id === productId);

  if (!product) {
    productContainer.classList.add('hidden');
    errorState.classList.remove('hidden');
    return; // Stop execution
  }

  // State
  let selectedSize = null;
  const hasSizes = product.sizes && product.sizes.length > 0;

  // Render Product Data
  renderProductData();
  initGallery();
  initSizeSelector();
  initQuantity();
  initActions();
  initWishlist();
  initModals();

  // ═══════════════════════════════════════════════════════
  // § RENDER DATA
  // ═══════════════════════════════════════════════════════
  function renderProductData() {
    // Breadcrumbs
    document.getElementById('breadcrumb-category').textContent = product.category;
    document.getElementById('breadcrumb-name').textContent = product.name;

    // Info
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = 
      typeof window.formatRupiah === 'function' ? window.formatRupiah(product.price) : `IDR ${product.price.toLocaleString()}`;
    
    document.getElementById('product-desc').textContent = product.description;

    // Specs
    const motifEl = document.getElementById('product-motif');
    if (product.motif) {
      motifEl.textContent = product.motif;
    } else {
      document.getElementById('spec-motif-container').style.display = 'none';
    }

    const materialEl = document.getElementById('product-material');
    if (product.material) {
      materialEl.textContent = product.material;
    } else {
      document.getElementById('spec-material-container').style.display = 'none';
    }
  }

  // ═══════════════════════════════════════════════════════
  // § GALLERY
  // ═══════════════════════════════════════════════════════
  function initGallery() {
    const mainImg = document.getElementById('main-product-image');
    const thumbContainer = document.getElementById('thumbnail-container');
    
    // Set main image
    if (product.images && product.images.length > 0) {
      mainImg.src = product.images[0];
      
      // Render thumbnails if multiple
      if (product.images.length > 1) {
        product.images.forEach((imgSrc, index) => {
          const btn = document.createElement('button');
          btn.className = 'thumbnail-btn' + (index === 0 ? ' is-active' : '');
          btn.setAttribute('aria-label', `View image ${index + 1}`);
          btn.innerHTML = `<img src="${imgSrc}" alt="Thumbnail ${index + 1}">`;
          
          btn.addEventListener('click', () => {
            // Update main image
            mainImg.src = imgSrc;
            // Update active state
            document.querySelectorAll('.thumbnail-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
          });
          
          thumbContainer.appendChild(btn);
        });
      }
    }

    // Zoom
    const zoomBtn = document.getElementById('zoom-open-btn');
    const zoomModal = document.getElementById('zoom-modal');
    const zoomClose = document.getElementById('zoom-close-btn');
    const zoomImg = document.getElementById('zoom-image');

    zoomBtn.addEventListener('click', () => {
      zoomImg.src = mainImg.src;
      zoomModal.showModal();
    });

    zoomClose.addEventListener('click', () => zoomModal.close());
    zoomModal.addEventListener('click', (e) => {
      if (e.target === zoomModal) zoomModal.close(); // click backdrop
    });
  }

  // ═══════════════════════════════════════════════════════
  // § SIZE
  // ═══════════════════════════════════════════════════════
  function initSizeSelector() {
    const sizeSection = document.getElementById('size-section');
    const optionsContainer = document.getElementById('size-options');

    if (!hasSizes) {
      sizeSection.style.display = 'none';
      return;
    }

    product.sizes.forEach(size => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-btn';
      btn.textContent = size;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');

      btn.addEventListener('click', () => {
        // Remove active from all
        document.querySelectorAll('.size-btn').forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-checked', 'false');
        });
        
        // Add to clicked
        btn.classList.add('is-active');
        btn.setAttribute('aria-checked', 'true');
        selectedSize = size;
      });

      optionsContainer.appendChild(btn);
    });
  }

  // ═══════════════════════════════════════════════════════
  // § QUANTITY
  // ═══════════════════════════════════════════════════════
  function initQuantity() {
    const qtyInput = document.getElementById('qty-input');
    const btnMinus = document.getElementById('qty-minus');
    const btnPlus = document.getElementById('qty-plus');

    function updateQty(newVal) {
      let val = parseInt(newVal);
      if (isNaN(val) || val < 1) val = 1;
      qtyInput.value = val;
    }

    btnMinus.addEventListener('click', () => updateQty(qtyInput.value - 1));
    btnPlus.addEventListener('click', () => updateQty(parseInt(qtyInput.value) + 1));
    qtyInput.addEventListener('change', (e) => updateQty(e.target.value));
  }

  // ═══════════════════════════════════════════════════════
  // § PURCHASE ACTIONS (Add to Cart / Buy Now)
  // ═══════════════════════════════════════════════════════
  function initActions() {
    const btnAdd = document.getElementById('add-to-cart-btn');
    const btnBuy = document.getElementById('buy-now-btn');
    const qtyInput = document.getElementById('qty-input');

    function handlePurchase(isBuyNow = false) {
      if (hasSizes && !selectedSize) {
        if (window.showToast) window.showToast("Please select a size.", "error");
        return;
      }

      const qty = parseInt(qtyInput.value) || 1;

      if (window.cartAPI) {
        window.cartAPI.addToCart(product, selectedSize || 'OS', qty);
        if (isBuyNow) {
          window.location.href = 'checkout.html';
        }
      } else {
        console.error("Cart API not found.");
      }
    }

    btnAdd.addEventListener('click', () => handlePurchase(false));
    btnBuy.addEventListener('click', () => handlePurchase(true));
  }

  // ═══════════════════════════════════════════════════════
  // § WISHLIST
  // ═══════════════════════════════════════════════════════
  function initWishlist() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    const wishlistText = document.getElementById('wishlist-text');

    function updateUI() {
      if (!window.wishlistAPI) return;
      const isActive = window.wishlistAPI.isWishlisted(product.id);
      if (isActive) {
        wishlistBtn.classList.add('is-active');
        wishlistText.textContent = "Remove from Wishlist";
      } else {
        wishlistBtn.classList.remove('is-active');
        wishlistText.textContent = "Add to Wishlist";
      }
    }

    wishlistBtn.addEventListener('click', () => {
      if (!window.wishlistAPI) return;
      if (window.wishlistAPI.isWishlisted(product.id)) {
        window.wishlistAPI.removeFromWishlist(product.id);
      } else {
        window.wishlistAPI.addToWishlist(product.id);
      }
      updateUI();
    });

    // Initial state
    updateUI();
  }

  // ═══════════════════════════════════════════════════════
  // § SIMULATION MODALS
  // ═══════════════════════════════════════════════════════
  function initModals() {
    // Shared close behavior
    document.querySelectorAll('dialog').forEach(dialog => {
      const closeBtn = dialog.querySelector('.simulation-modal__close');
      if (closeBtn) closeBtn.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });
    });

    // Size Assistant
    const btnSizeAssistant = document.getElementById('open-size-assistant');
    const modalSize = document.getElementById('size-modal');
    if (btnSizeAssistant) {
      btnSizeAssistant.addEventListener('click', () => {
        modalSize.showModal();
      });
    }

    // Size Calculation Simulation
    const calcBtn = document.getElementById('sim-calculate-btn');
    const simResult = document.getElementById('sim-result');
    const suggestedSizeEl = document.getElementById('sim-suggested-size');
    const applySizeBtn = document.getElementById('sim-apply-size');

    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        const height = document.getElementById('sim-height').value;
        const fit = document.getElementById('sim-fit').value;
        
        if (!height || !fit) {
          if (window.showToast) window.showToast("Please select both preferences.", "error");
          return;
        }

        // Mock logic
        let suggested = 'M';
        if (height === '1') suggested = fit === 'tight' ? 'S' : 'M';
        if (height === '3') suggested = fit === 'loose' ? 'XL' : 'L';
        
        // Ensure suggestion is available in product sizes
        if (product.sizes && !product.sizes.includes(suggested)) {
          suggested = product.sizes[0]; 
        }

        suggestedSizeEl.textContent = suggested;
        simResult.classList.remove('hidden');
      });
    }

    if (applySizeBtn) {
      applySizeBtn.addEventListener('click', () => {
        const suggested = suggestedSizeEl.textContent;
        // Trigger click on corresponding size button
        const sizeBtns = document.querySelectorAll('.size-btn');
        sizeBtns.forEach(b => {
          if (b.textContent === suggested) {
            b.click();
          }
        });
        modalSize.close();
      });
    }

    // Virtual Fitting
    const btnFitting = document.getElementById('open-virtual-fitting');
    const modalFitting = document.getElementById('fitting-modal');
    const fittingGarment = document.getElementById('fitting-garment');
    
    if (btnFitting) {
      btnFitting.addEventListener('click', () => {
        if (product.images && product.images.length > 0) {
          fittingGarment.src = product.images[0];
        }
        modalFitting.showModal();
      });
    }
  }

});
