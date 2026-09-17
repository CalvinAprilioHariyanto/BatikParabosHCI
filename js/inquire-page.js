document.addEventListener('DOMContentLoaded', () => {
  const products = window.parabosProducts || [];
  
  // URL Params
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');

  // DOM Elements
  const layout = document.getElementById('inquire-layout');
  const errorScreen = document.getElementById('error-screen');
  const successScreen = document.getElementById('success-screen');
  
  const form = document.getElementById('inquiry-form');

  // Preview Elements
  const previewImg = document.getElementById('preview-image');
  const previewCategory = document.getElementById('preview-category');
  const previewName = document.getElementById('preview-name');
  const previewDesc = document.getElementById('preview-desc');
  const previewMotif = document.getElementById('preview-motif');
  const previewMaterial = document.getElementById('preview-material');
  const specMotifWrap = document.getElementById('spec-motif-wrap');
  const specMaterialWrap = document.getElementById('spec-material-wrap');
  const inputSize = document.getElementById('input-size');

  // Form Inputs
  const inputQty = document.getElementById('input-qty');
  const inputColor = document.getElementById('input-color');
  const inputMotif = document.getElementById('input-motif');
  const inputCustom = document.getElementById('input-custom');
  const inputName = document.getElementById('input-name');
  const inputEmail = document.getElementById('input-email');
  const inputPhone = document.getElementById('input-phone');
  const inputNotes = document.getElementById('input-notes');

  // Validate product
  const product = products.find(p => p.id === productId);

  if (!product) {
    showError();
    return;
  }

  // Double check if product is actually an inquiry product (if we want to restrict it).
  // But maybe they want to inquire about normal products too for customization? 
  // The prompt says "Some products are customization/inquiry-only", but doesn't explicitly forbid inquiring about normal products. 
  // For safety, we'll allow it, but we can assume they mostly arrive here via the INQUIRE button.

  renderProduct(product);
  initFormValidation();

  // ═══════════════════════════════════════════════════════
  // § RENDER PRODUCT
  // ═══════════════════════════════════════════════════════
  function renderProduct(p) {
    const safeMotif = p.motif || 'Signature Batik Motif';
    const safeMaterial = p.material || 'Premium Batik Textile';
    const safeCategory = p.category || 'Collection';
    const safeName = p.name || 'Batik Parabos Piece';
    const imageSrc = (p.images && p.images.length > 0) ? p.images[0] : 'assets/images/placeholder.svg';

    previewImg.src = imageSrc;
    previewImg.alt = safeName;
    previewCategory.textContent = safeCategory;
    previewName.textContent = safeName;
    previewDesc.textContent = p.description || '';

    if (p.motif) {
      previewMotif.textContent = p.motif;
      specMotifWrap.style.display = 'flex';
    } else {
      specMotifWrap.style.display = 'none';
    }

    if (p.material) {
      previewMaterial.textContent = p.material;
      specMaterialWrap.style.display = 'flex';
    } else {
      specMaterialWrap.style.display = 'none';
    }

    // Populate Size dropdown
    inputSize.innerHTML = '<option value="" disabled selected>Select a size...</option>';
    if (p.sizes && p.sizes.length > 0) {
      p.sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        inputSize.appendChild(option);
      });
    } else {
      const option = document.createElement('option');
      option.value = "OS";
      option.textContent = "One Size";
      inputSize.appendChild(option);
    }
    const customOption = document.createElement('option');
    customOption.value = "Custom / Bespoke";
    customOption.textContent = "Custom / Bespoke";
    inputSize.appendChild(customOption);
  }

  // ═══════════════════════════════════════════════════════
  // § FORM HANDLING & VALIDATION
  // ═══════════════════════════════════════════════════════
  function initFormValidation() {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      
      // Reset errors
      document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

      // Validate Size
      if (!inputSize.value) {
        showFieldError('group-size');
        isValid = false;
      }

      // Validate Quantity
      const qty = parseInt(inputQty.value, 10);
      if (isNaN(qty) || qty < 1) {
        showFieldError('group-quantity');
        isValid = false;
      }

      // Validate Customization Request
      if (inputCustom.value.trim() === '') {
        showFieldError('group-custom');
        isValid = false;
      }

      // Validate Name
      if (inputName.value.trim() === '') {
        showFieldError('group-name');
        isValid = false;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputEmail.value.trim())) {
        showFieldError('group-email');
        isValid = false;
      }

      // Validate Phone
      if (inputPhone.value.trim() === '') {
        showFieldError('group-phone');
        isValid = false;
      }

      if (isValid) {
        submitInquiry();
      } else {
        if (window.showToast) window.showToast("Please fix the errors in the form.", "error");
      }
    });

    // Remove error on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
    });
  }

  function showFieldError(groupId) {
    const group = document.getElementById(groupId);
    if (group) group.classList.add('has-error');
  }

  function generateRefNumber() {
    return 'PA-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  function submitInquiry() {
    const refNumber = generateRefNumber();
    const safeName = product.name || 'Batik Parabos Piece';

    const inquiryData = {
      inquiryNumber: refNumber,
      productId: product.id,
      productName: safeName,
      size: inputSize.value,
      preferredColor: inputColor.value.trim(),
      motifPreference: inputMotif.value.trim(),
      customizationRequest: inputCustom.value.trim(),
      quantity: parseInt(inputQty.value, 10),
      fullName: inputName.value.trim(),
      email: inputEmail.value.trim(),
      phone: inputPhone.value.trim(),
      additionalNotes: inputNotes.value.trim(),
      createdAt: new Date().toISOString(),
      status: "Submitted"
    };

    // Save to localStorage
    const STORAGE_KEY = 'parabos_inquiries';
    let inquiries = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) inquiries = JSON.parse(stored);
    } catch (e) {
      console.error("Error reading inquiries", e);
    }
    
    inquiries.push(inquiryData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));

    showSuccess(refNumber);
  }

  // ═══════════════════════════════════════════════════════
  // § VIEW TRANSITIONS
  // ═══════════════════════════════════════════════════════
  function showError() {
    layout.classList.add('hidden');
    errorScreen.classList.remove('hidden');
  }

  function showSuccess(ref) {
    layout.classList.add('hidden');
    document.getElementById('reference-number').textContent = ref;
    successScreen.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Reveal Animation
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
