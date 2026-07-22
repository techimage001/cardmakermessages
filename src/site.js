(() => {
  'use strict';

  const STORAGE_KEY = 'card-maker-messages-state-v2';
  const defaultStore = {
    theme: 'light',
    favourites: [],
    recent: [],
    app: null,
    lastPath: ''
  };

  const Store = {
    load() {
      try {
        return { ...defaultStore, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
      } catch {
        return { ...defaultStore };
      }
    },
    save(patch) {
      const next = { ...Store.load(), ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Storage can be disabled by the browser. */ }
      return next;
    },
    clear() {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* Storage can be disabled by the browser. */ }
    }
  };

  window.CardMakerStore = Store;

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const button = document.querySelector('[data-theme-toggle]');
    if (button) {
      const isDark = theme === 'dark';
      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      button.textContent = isDark ? '☀' : '☾';
    }
  }

  function initTheme() {
    const stored = Store.load().theme;
    applyTheme(stored || 'light');
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      Store.save({ theme: next });
      applyTheme(next);
    });
  }

  function initNavigation() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;
    const close = () => {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };
    toggle.addEventListener('click', () => {
      const opening = menu.hidden;
      menu.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
      document.body.classList.toggle('menu-open', opening);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth > 820) close(); });
  }

  function initResumeCard() {
    const target = document.querySelector('[data-resume-card]');
    const data = Store.load();
    if (!target || !data.app) return;
    target.hidden = false;
    const occasion = data.app.occasionLabel || 'card';
    target.querySelector('[data-resume-text]').textContent = `Continue your ${occasion.toLowerCase()} card where you left off.`;
  }

  function initCopyButtons() {
    document.querySelectorAll('[data-copy-message]').forEach(button => {
      button.addEventListener('click', async () => {
        const card = button.closest('[data-message-card]');
        const text = card?.querySelector('[data-message-text]')?.textContent?.trim();
        if (!text) return;
        await navigator.clipboard.writeText(text);
        const old = button.textContent;
        button.textContent = 'Copied';
        window.setTimeout(() => { button.textContent = old; }, 1500);
      });
    });
  }

  function initServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }

  function markCurrentPage() {
    Store.save({ lastPath: location.pathname + location.search + location.hash });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initResumeCard();
    initCopyButtons();
    initServiceWorker();
    markCurrentPage();
  });
})();
