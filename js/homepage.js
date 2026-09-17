/* ─────────────────────────────────────────────────────────
   homepage.js  —  Homepage interactions
   Scroll-driven craft animation + standard page behaviors.
   No external libraries. Vanilla JS only.
───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Respect reduced-motion preference ── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────
     1. SCROLL REVEAL
     Observe elements with .reveal class; add .is-visible
     when they enter the viewport.
  ───────────────────────────────────────────────────── */
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReduced) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────────────────
     2. PARALLAX — Hero + Immersive
  ───────────────────────────────────────────────────── */
  function initParallax() {
    if (prefersReduced) return;

    const heroFrame   = document.querySelector('.hero__image-frame');
    const immersiveBg = document.querySelector('.immersive__bg-layer');

    if (!heroFrame && !immersiveBg) return;

    let ticking = false;

    function applyParallax() {
      const scrollY = window.scrollY;

      if (heroFrame) {
        const heroH   = heroFrame.parentElement.offsetHeight;
        const progress = Math.min(scrollY / heroH, 1);
        
        // Slightly move down the image/video to create parallax
        heroFrame.style.transform = `translateY(${progress * 25}%)`;
      }

      if (immersiveBg) {
        const rect   = immersiveBg.parentElement.getBoundingClientRect();
        const offset = -rect.top * 0.22;
        immersiveBg.style.transform = `translateY(${offset}px)`;
      }

      ticking = false;
    }

    // Fallback handling for video
    const heroVideo = document.querySelector('.hero__video');
    if (heroVideo) {
      heroVideo.addEventListener('error', () => {
        heroVideo.style.display = 'none'; // Fallback to image
      });
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────
     3. HERO IMAGE/VIDEO SCALE IN
  ───────────────────────────────────────────────────── */
  function initHeroImageScale() {
    if (prefersReduced) return;
    const heroMediaEls = document.querySelectorAll('.hero__media');
    if (!heroMediaEls.length) return;

    heroMediaEls.forEach(media => {
      // For images
      if (media.tagName.toLowerCase() === 'img') {
        if (media.complete) {
          media.style.transform = 'scale(1)';
        } else {
          media.addEventListener('load', () => {
            media.style.transform = 'scale(1)';
          });
        }
      } 
      // For videos
      else if (media.tagName.toLowerCase() === 'video') {
        if (media.readyState >= 3) {
          media.style.transform = 'scale(1)';
        } else {
          media.addEventListener('canplay', () => {
            media.style.transform = 'scale(1)';
          });
        }
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     4. HERO SMOOTH SCROLL — "Explore the Craft" anchor
  ───────────────────────────────────────────────────── */
  function initHeroScrollTo() {
    const btn = document.querySelector('.hero__scroll-to');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      const target = document.getElementById('craft-story');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     5. CRAFT STORY — Scroll-driven process animation
     
     The scroll zone has:
       - A sticky left panel (.craft-story__sticky-panel)
       - Scrollable right stages (.craft-story__stages)
     
     As the user scrolls through the stages on the right,
     we track which stage is "in view" and:
       1. Activate the corresponding cloth layer
       2. Highlight the stage step on the right
       3. Update the progress bar
  ───────────────────────────────────────────────────── */
  function initCraftStory() {
    const scrollZone  = document.getElementById('craft-scroll-zone');
    const stages      = document.querySelectorAll('.craft-stage');
    const layers      = document.querySelectorAll('.craft-layer');
    const progressFill = document.getElementById('craft-progress-fill');
    const progressSteps = document.querySelectorAll('.craft-progress-step');

    if (!scrollZone || !stages.length || !layers.length) return;

    let currentStage = -1;

    // On reduced motion — show all visible, no transitions
    if (prefersReduced) {
      stages.forEach(s => s.classList.add('is-current'));
      layers[layers.length - 1]?.classList.add('is-active');
      return;
    }

    // Activate initial state (stage 0)
    function activateStage(idx) {
      if (idx === currentStage) return;
      currentStage = idx;

      // Notify soundscape of stage change
      if (window.parabos_soundscape) {
        window.parabos_soundscape.setStage(idx);
      }

      // Layers
      layers.forEach((layer, i) => {
        layer.classList.toggle('is-active', i === idx);
      });

      // Stages
      stages.forEach((stage, i) => {
        stage.classList.toggle('is-current', i === idx);
      });

      // Progress bar
      if (progressFill) {
        const pct = stages.length > 1
          ? (idx / (stages.length - 1)) * 100
          : 100;
        progressFill.style.width = `${pct}%`;
      }

      // Progress step dots
      progressSteps.forEach((step, i) => {
        step.classList.toggle('is-active', i <= idx);
      });
    }

    // Intersection Observer per stage
    const stageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.stage, 10);
          if (!isNaN(idx)) activateStage(idx);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -20% 0px'
    });

    stages.forEach(stage => stageObserver.observe(stage));

    // Activate stage 0 immediately on load if zone is visible
    activateStage(0);
  }

  /* ─────────────────────────────────────────────────────
     6. COLLECTION PREVIEW — render from central data
  ───────────────────────────────────────────────────── */
  function initCollectionPreview() {
    const grid = document.getElementById('collection-preview-grid');
    if (!grid || !window.parabosProducts) return;

    // Prefer featured products; fallback to first 3
    let featured = window.parabosProducts.filter(p => p.featured).slice(0, 3);
    if (featured.length === 0) {
      featured = window.parabosProducts.slice(0, 3);
    }

    if (featured.length === 0) {
      grid.closest('.collection-preview')?.style && (grid.closest('.collection-preview').style.display = 'none');
      return;
    }

    const formatPrice = window.formatRupiah
      ? window.formatRupiah
      : (val) => `Rp ${val.toLocaleString('id-ID')}`;

    featured.forEach((product, i) => {
      // Safely extract properties
      const safeMotif = product.motif || 'Signature Batik Motif';
      const safeMaterial = product.material || 'Premium Batik Textile';
      const safeCategory = product.category || 'Collection';
      const safeName = product.name || 'Batik Parabos Piece';

      let price = 'Inquire';
      if (product.priceLabel) {
        price = product.priceLabel;
      } else if (product.price !== null && product.price !== undefined) {
        price = typeof window.formatRupiah === 'function'
          ? window.formatRupiah(product.price)
          : `IDR ${product.price.toLocaleString('id-ID')}`;
      }

      const imgSrc = (product.images && product.images.length > 0)
        ? product.images[0]
        : 'assets/images/placeholder.svg';

      const isBespoke = typeof window.isInquiryOnly === 'function' && window.isInquiryOnly(product);
      const overlayText = isBespoke ? 'INQUIRE' : 'View Piece';

      const card = document.createElement('article');
      card.className = 'product-card reveal';
      card.innerHTML = `
        <a href="${isBespoke ? `inquire.html?product=${product.id}` : `product.html?id=${product.id}`}" class="product-card__link" aria-label="${overlayText} ${safeName}">
          <div class="product-card__image-wrap">
            <img
              src="${imgSrc}"
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
      `;
      grid.appendChild(card);
    });

    /* Re-observe newly added reveal elements */
    initReveal();
  }

  /* ─────────────────────────────────────────────────────
     7. MARQUEE — pause on hover
  ───────────────────────────────────────────────────── */
  function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }

  /* ─────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initParallax();
    initHeroImageScale();
    initHeroScrollTo();
    initCraftStory();
    initCollectionPreview();
    initMarquee();
  });

}());
