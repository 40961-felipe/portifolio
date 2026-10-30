/**
 * Portfolio – Main JavaScript
 * Pure vanilla JS · ES6+ · No dependencies
 */

(() => {
  'use strict';

  /* ============================
   * 0. Utility Helpers
   * ============================ */

  /** Throttle – limits fn to once per `delay` ms using rAF */
  const throttle = (fn, delay = 100) => {
    let last = 0;
    let raf = null;
    return (...args) => {
      const now = performance.now();
      if (now - last >= delay) {
        last = now;
        fn(...args);
      } else if (!raf) {
        raf = requestAnimationFrame(() => {
          last = performance.now();
          raf = null;
          fn(...args);
        });
      }
    };
  };

  /* ============================
   * 1. Splash Screen Controller
   * ============================ */

  const initSplash = () => {
    const MIN_DELAY = 2500; // ms
    const TRANSITION = 600; // matches CSS transition duration
    const start = performance.now();

    const hideSplash = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_DELAY - elapsed);

      setTimeout(() => {
        document.body.classList.add('loaded');

        // After the CSS fade-out transition, remove the splash entirely
        setTimeout(() => {
          const splash = document.getElementById('splash');
          if (splash) {
            splash.style.display = 'none';
            splash.remove();
          }
          // Trigger hero stagger animations once splash is gone
          triggerHeroAnimations();
        }, TRANSITION);
      }, remaining);
    };

    // Wait for DOM + minimum delay
    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash);
    }
  };

  /* ============================
   * 2. Theme Toggle (Light / Dark)
   * ============================ */

  const initTheme = () => {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    const applyTheme = (theme) => {
      html.setAttribute('data-theme', theme);
      if (toggle) {
        toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      }
    };

    // Determine initial theme: localStorage → prefers-color-scheme → default dark
    const saved = localStorage.getItem('theme');
    if (saved) {
      applyTheme(saved);
    } else {
      const preferLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(preferLight ? 'light' : 'dark');
    }

    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('theme', next);
      });
    }
  };

  /* ============================
   * 3. Scroll Reveal Animations
   * ============================ */

  const initRevealAnimations = () => {
    const elements = document.querySelectorAll('.reveal-up');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // one-time reveal
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  };

  /* ============================
   * 4. Active Navigation Highlighting
   * ============================ */

  const initActiveNav = () => {
    const sectionIds = ['about', 'skills', 'projects', 'contact'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const navLinks = document.querySelectorAll('.nav__link[data-section]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('data-section') === id);
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '-70px 0px -30% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  };

  /* ============================
   * 5. Mobile Navigation
   * ============================ */

  const initMobileNav = () => {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    const openMenu = () => {
      toggle.classList.add('active');
      menu.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('no-scroll');
    };

    const closeMenu = () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    };

    // Toggle on hamburger click
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('active');
      isOpen ? closeMenu() : openMenu();
    });

    // Close when a nav link is clicked
    menu.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close when clicking outside the menu
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });
  };

  /* ============================
   * 6. Smooth Scroll for Anchors
   * ============================ */

  const initSmoothScroll = () => {
    const HEADER_OFFSET = 70; // fixed header height in px

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  /* ============================
   * 7. Header Background on Scroll
   * ============================ */

  const initHeaderScroll = () => {
    const header = document.getElementById('header');
    if (!header) return;

    const SCROLL_THRESHOLD = 50;

    const onScroll = throttle(() => {
      header.classList.toggle('header--scrolled', window.scrollY > SCROLL_THRESHOLD);
    }, 50);

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load in case page is already scrolled
    onScroll();
  };

  /* ============================
   * 8. Contact Form Handler
   * ============================ */

  const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather required fields
      const fields = form.querySelectorAll('[required]');
      let valid = true;

      fields.forEach((field) => {
        const value = field.value.trim();
        if (!value) {
          valid = false;
          field.classList.add('input--error');
        } else if (field.type === 'email' && !EMAIL_RE.test(value)) {
          valid = false;
          field.classList.add('input--error');
        } else {
          field.classList.remove('input--error');
        }
      });

      if (!valid) {
        showToast('Please fill in all fields correctly.', 'error');
        return;
      }

      // Success
      showToast('Message sent successfully!', 'success');
      form.reset();
    });

    // Remove error styling on input
    form.addEventListener('input', (e) => {
      e.target.classList.remove('input--error');
    });
  };

  /* ============================
   * 9. Hero Title Stagger Animation
   * ============================ */

  const triggerHeroAnimations = () => {
    const heroElements = document.querySelectorAll('.hero .reveal-up');
    heroElements.forEach((el) => {
      const delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
      setTimeout(() => el.classList.add('revealed'), delay);
    });
  };

  /* ============================
   * 10. Toast Notification System
   * ============================ */

  /** Injects the toast container once */
  const getToastContainer = () => {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.setAttribute('aria-live', 'polite');
      container.style.cssText =
        'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;';
      document.body.appendChild(container);
    }
    return container;
  };

  /**
   * Show a small toast notification.
   * @param {string} message – Text to display
   * @param {'success'|'error'} type – Visual style
   */
  const showToast = (message, type = 'success') => {
    const container = getToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      pointer-events:auto;padding:.75rem 1.25rem;border-radius:.5rem;
      font-size:.875rem;font-weight:500;color:#fff;
      background:${type === 'success' ? '#16a34a' : '#dc2626'};
      box-shadow:0 4px 12px rgba(0,0,0,.15);
      opacity:0;transform:translateY(.5rem);
      transition:opacity .3s ease,transform .3s ease;
    `;

    container.appendChild(toast);

    // Trigger entrance
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto-dismiss after 3s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(.5rem)';
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
  };

  /* ============================
   * Boot – Wire everything up
   * ============================ */

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSplash();
    initMobileNav();
    initSmoothScroll();
    initHeaderScroll();
    initRevealAnimations();
    initActiveNav();
    initContactForm();
  });
})();
