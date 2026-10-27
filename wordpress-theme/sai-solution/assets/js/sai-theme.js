/**
 * SAI Solution Theme — sai-theme.js
 * Lightweight vanilla JS for interactive features.
 *
 * @package SAI_Solution
 */
(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Mobile Navigation Toggle
     -------------------------------------------------------------------------- */
  const toggle  = document.querySelector('.sai-header__mobile-toggle');
  const mobileNav = document.getElementById('sai-mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      const isOpen = mobileNav.hidden === false;
      mobileNav.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  /* --------------------------------------------------------------------------
     Scroll-triggered Animation (.sai-animate-in)
     -------------------------------------------------------------------------- */
  const animatedEls = document.querySelectorAll(
    '.sai-animate-in--delay-1, .sai-animate-in--delay-2, .sai-animate-in--delay-3'
  );

  if ('IntersectionObserver' in window && animatedEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    animatedEls.forEach((el) => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  } else {
    // Fallback: just show them immediately
    animatedEls.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* --------------------------------------------------------------------------
     Smooth anchor scrolling
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --------------------------------------------------------------------------
     Active nav link highlighting
     -------------------------------------------------------------------------- */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.sai-nav a').forEach((link) => {
    try {
      const linkPath = new URL(link.href).pathname;
      if (linkPath === currentPath) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    } catch (err) {
      // Invalid URL, skip
    }
  });

  /* --------------------------------------------------------------------------
     Lazy load images not already handled by WordPress
     -------------------------------------------------------------------------- */
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img:not([loading])').forEach((img) => {
      img.setAttribute('loading', 'lazy');
    });
  }

})();
