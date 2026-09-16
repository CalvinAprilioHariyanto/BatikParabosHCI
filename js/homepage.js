/* ─────────────────────────────────────────────────────────
   homepage.js  —  Homepage interactions
   Lightweight scroll-driven effects. No external libraries.
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
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────────────────
     2. PARALLAX — Hero image layer
     translateY relative to scroll position, capped for
     performance. Uses requestAnimationFrame batching.
  ───────────────────────────────────────────────────── */
  function initParallax() {
    if (prefersReduced) return;

    const heroFrame = document.querySelector('.hero__image-frame');
    const immersiveBg = document.querySelector('.immersive__bg-layer');

    if (!heroFrame && !immersiveBg) return;

    let ticking = false;

    function applyParallax() {
      const scrollY = window.scrollY;

      if (heroFrame) {
        const heroH = heroFrame.parentElement.offsetHeight;
        const progress = Math.min(scrollY / heroH, 1);
        heroFrame.style.transform = `translateY(${progress * 80}px)`;
      }

      if (immersiveBg) {
        const rect = immersiveBg.parentElement.getBoundingClientRect();
        const offset = -rect.top * 0.25;
        immersiveBg.style.transform = `translateY(${offset}px)`;
      }

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────
     3. HERO IMAGE SCALE IN
     Once loaded, animate hero image from scale(1.06) → 1
  ───────────────────────────────────────────────────── */
  function initHeroImageScale() {
    if (prefersReduced) return;
    const heroImg = document.querySelector('.hero__image-frame img');
    if (!heroImg) return;

    // Image already loaded
    if (heroImg.complete) {
      heroImg.style.transform = 'scale(1)';
    } else {
      heroImg.addEventListener('load', () => {
        heroImg.style.transform = 'scale(1)';
      });
    }
  }

  /* ─────────────────────────────────────────────────────
     4. COLLECTION PREVIEW — render from central data
     Pulls featured products from window.parabosProducts,
     renders product cards into #collection-preview-grid.
     Does NOT create its own product array.
  ───────────────────────────────────────────────────── */
  function initCollectionPreview() {
    const grid = document.getElementById('collection-preview-grid');
    if (!grid || !window.parabosProducts) return;

    const featured = window.parabosProducts.filter(p => p.featured).slice(0, 3);

    if (featured.length === 0) {
      grid.closest('.collection-preview').style.display = 'none';
      return;
    }

    featured.forEach((product, i) => {
      const price = window.formatRupiah
        ? window.formatRupiah(product.price)
        : `Rp ${product.price.toLocaleString('id-ID')}`;

      const card = document.createElement('article');
      card.className = `product-card reveal reveal--delay-${i + 1}`;
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <a href="product.html?id=${product.id}" class="product-card__link" aria-label="View ${product.name}">
          <div class="product-card__image-wrap">
            <img
              src="${product.images[0]}"
              alt="${product.name} — ${product.motif} motif"
              loading="lazy"
              width="600"
              height="800"
            >
            ${product.type === 'custom'
              ? '<span class="product-card__type-badge">Bespoke</span>'
              : ''}
            <div class="product-card__overlay">
              <span class="btn btn-ghost" style="font-size:0.6rem; padding:0.5rem 1rem;">View Piece</span>
            </div>
          </div>
          <div class="product-card__body">
            <span class="product-card__category">${product.category}</span>
            <h3 class="product-card__name">${product.name}</h3>
            <p class="product-card__motif">${product.motif} · ${product.material}</p>
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
     5. MARQUEE — pause on hover
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
    initCollectionPreview();
    initMarquee();
  });

}());
