document.addEventListener('DOMContentLoaded', () => {
  
  // Subtle Scroll Reveal Animation using IntersectionObserver
  // Respects prefers-reduced-motion via CSS overrides
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.fade-in-up');
  animatedElements.forEach(el => {
    observer.observe(el);
  });

});
