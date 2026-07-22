(() => {
  'use strict';

  const STORAGE_KEY = 'card-maker-messages-state-v2';
  const defaultStore = {
    theme: 'light',
    favourites: [],
    recent: [],
    app: null,
    lastPath: '',
    usageCount: 0,
    unlocked: false,
    email: ''
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


  function initSignup() {
    const modal = document.querySelector('[data-signup-modal]');
    const form = document.getElementById('signupForm');
    const status = document.querySelector('[data-signup-status]');
    const emailInput = document.getElementById('signupEmail');
    const startedInput = document.getElementById('signupStarted');
    const openers = [...document.querySelectorAll('[data-signup-open]')];
    const accountMenu = document.querySelector('[data-account-menu]');
    const accountEmail = document.querySelector('[data-account-email]');

    const closeModal = () => {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
    };
    const closeAccount = () => { if (accountMenu) accountMenu.hidden = true; };
    const refresh = () => {
      const data = Store.load();
      if (accountEmail) accountEmail.textContent = data.email || '';
      openers.forEach(button => {
        if (data.unlocked && data.email) {
          if (button.classList.contains('mobile-signup')) {
            button.textContent = 'Account';
            button.classList.remove('account-initial');
          } else {
            button.textContent = data.email.slice(0, 1).toUpperCase();
            button.classList.add('account-initial');
          }
          button.title = `Signed in as ${data.email}`;
          button.setAttribute('aria-label', `Open account for ${data.email}`);
          button.setAttribute('aria-haspopup', 'menu');
        } else {
          button.textContent = button.classList.contains('mobile-signup') ? 'Sign up free' : 'Sign up';
          button.classList.remove('account-initial');
          button.removeAttribute('title');
          button.setAttribute('aria-label', 'Sign up free');
          button.setAttribute('aria-haspopup', 'dialog');
        }
      });
    };
    const openModal = (message = '') => {
      if (!modal) return;
      closeAccount();
      modal.hidden = false;
      document.body.classList.add('modal-open');
      if (status) status.textContent = message;
      if (startedInput) startedInput.value = String(Date.now());
      window.setTimeout(() => emailInput?.focus(), 40);
    };
    const toggleAccount = () => {
      if (!accountMenu) return;
      accountMenu.hidden = !accountMenu.hidden;
    };

    window.CardMakerSignup = {
      open: openModal,
      isUnlocked: () => Boolean(Store.load().unlocked)
    };

    openers.forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      const data = Store.load();
      if (data.unlocked && data.email) toggleAccount();
      else openModal();
    }));
    document.querySelectorAll('[data-signup-close]').forEach(button => button.addEventListener('click', closeModal));
    modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    document.querySelector('[data-signout]')?.addEventListener('click', () => {
      Store.save({ unlocked: false, email: '', usageCount: 0 });
      closeAccount();
      refresh();
    });
    document.addEventListener('click', event => {
      if (!accountMenu || accountMenu.hidden) return;
      if (!accountMenu.contains(event.target) && !event.target.closest('[data-signup-open]')) closeAccount();
    });

    form?.addEventListener('submit', async event => {
      event.preventDefault();
      const email = emailInput?.value.trim() || '';
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        if (status) status.textContent = 'Please enter a valid email address.';
        return;
      }
      const button = form.querySelector('button[type="submit"]');
      if (button) { button.disabled = true; button.textContent = 'Signing you up…'; }
      if (status) status.textContent = 'Saving your free access…';
      try {
        const data = new FormData(form);
        data.set('email', email);
        data.set('page', location.pathname);
        const response = await fetch('/api/subscribe.php', { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) throw new Error(payload.message || 'The sign-up could not be completed.');
        Store.save({ unlocked: true, email, usageCount: 3 });
        if (status) status.textContent = 'Thank you. Unlimited card creation is now unlocked on this device.';
        refresh();
        window.setTimeout(closeModal, 900);
      } catch (error) {
        if (status) status.textContent = error.message || 'Please try again.';
      } finally {
        if (button) { button.disabled = false; button.textContent = 'Sign up and continue'; }
      }
    });
    refresh();
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
    initSignup();
    initCopyButtons();
    initServiceWorker();
    markCurrentPage();
  });
})();
