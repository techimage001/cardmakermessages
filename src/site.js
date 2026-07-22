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
    let signupConfig = null;
    let signupConfigPromise = null;

    const loadSignupConfig = async () => {
      if (signupConfig) return signupConfig;
      if (!signupConfigPromise) {
        signupConfigPromise = fetch('/api/subscribe.php?config=1', {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store'
        }).then(async response => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || payload.ok === false) throw new Error('Email verification is temporarily unavailable.');
          signupConfig = payload;
          return payload;
        }).finally(() => { signupConfigPromise = null; });
      }
      return signupConfigPromise;
    };
    const sha256 = async value => {
      if (!window.crypto?.subtle || !window.TextEncoder) throw new Error('This browser cannot securely prepare the verification request.');
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
      return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    };

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
          button.title = `Verified as ${data.email}`;
          button.setAttribute('aria-label', `Open verified account for ${data.email}`);
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
      loadSignupConfig().then(config => {
        if (!config.configured && status) status.textContent = 'Email verification needs the private Hostinger SMTP settings before it can send links.';
      }).catch(() => { /* The form displays a clear error if submission is attempted. */ });
      window.setTimeout(() => emailInput?.focus(), 40);
    };
    const toggleAccount = () => {
      if (!accountMenu) return;
      accountMenu.hidden = !accountMenu.hidden;
    };
    const readVerifiedAccess = async ({ showSuccess = false } = {}) => {
      try {
        const response = await fetch('/api/status.php', { headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload.verified && payload.email) {
          Store.save({ unlocked: true, email: payload.email, usageCount: 3 });
          refresh();
          if (showSuccess) openModal('Email verified. Unlimited card creation is now unlocked on this browser.');
          return true;
        }
      } catch { /* Static previews and temporarily unavailable PHP should not break the card maker. */ }
      return false;
    };

    window.CardMakerSignup = {
      open: openModal,
      isUnlocked: () => Boolean(Store.load().unlocked),
      refresh: readVerifiedAccess
    };

    openers.forEach(button => button.addEventListener('click', event => {
      event.stopPropagation();
      const data = Store.load();
      if (data.unlocked && data.email) toggleAccount();
      else openModal();
    }));
    document.querySelectorAll('[data-signup-close]').forEach(button => button.addEventListener('click', closeModal));
    modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    document.querySelector('[data-signout]')?.addEventListener('click', async () => {
      try { await fetch('/api/logout.php', { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json' } }); } catch { /* Local sign-out still continues. */ }
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
      if (button) { button.disabled = true; button.textContent = 'Sending verification link…'; }
      if (status) status.textContent = 'Sending a private verification link…';
      try {
        const config = await loadSignupConfig();
        if (!config.configured) throw new Error('Email verification is not configured yet. Add the private Hostinger SMTP settings first.');
        const timestamp = Number(startedInput?.value || Date.now());
        const honeypot = form.querySelector('[name="company"]')?.value || '';
        const token = await sha256(`${email}|${timestamp}|${config.salt}`);
        const response = await fetch('/api/subscribe.php', {
          method: 'POST',
          body: JSON.stringify({ email, ts: timestamp, token, website: honeypot, page: location.pathname }),
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store'
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.ok === false) throw new Error(payload.message || 'The verification email could not be sent.');
        if (status) status.textContent = payload.message || 'Check your inbox and open the verification link. Access unlocks only after verification.';
        if (button) button.textContent = 'Send another verification link';
        if (startedInput) startedInput.value = String(Date.now());
      } catch (error) {
        if (status) status.textContent = error.message || 'Please try again.';
      } finally {
        if (button) {
          button.disabled = false;
          if (button.textContent === 'Sending verification link…') button.textContent = 'Email my verification link';
        }
      }
    });

    loadSignupConfig().catch(() => { /* Static preview or PHP not ready yet. */ });
    refresh();
    const params = new URLSearchParams(location.search);
    const returnedFromVerification = params.get('verified') === '1';
    readVerifiedAccess({ showSuccess: returnedFromVerification }).then(verified => {
      if (returnedFromVerification) {
        params.delete('verified');
        const query = params.toString();
        history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
        if (!verified) openModal('The verification could not be confirmed on this browser. Please request a new link.');
      }
    });
  }

  async function initFreshness() {
    // Earlier releases used an offline cache-first service worker. That made live updates
    // appear stale after deployment. Remove old registrations and versioned caches so the
    // browser always requests the current HTML, CSS and JavaScript from the server.
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hadController = Boolean(navigator.serviceWorker.controller);
        await Promise.all(registrations.map(async registration => {
          try { await registration.update(); } catch { /* Continue with removal. */ }
          try { await registration.unregister(); } catch { /* A browser may deny removal. */ }
        }));
        if (hadController && !sessionStorage.getItem('cmm-cache-refresh-complete')) {
          sessionStorage.setItem('cmm-cache-refresh-complete', '1');
          window.setTimeout(() => location.reload(), 80);
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith('card-maker-messages-v')).map(key => caches.delete(key)));
      }
    } catch { /* Cache cleanup must never block the card maker. */ }
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
    initFreshness();
    markCurrentPage();
  });
})();
