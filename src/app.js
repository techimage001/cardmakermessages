(() => {
  'use strict';

  const DATA = window.CardMessageData;
  const Store = window.CardMakerStore;
  const canvas = document.getElementById('cardCanvas');
  const ctx = canvas.getContext('2d');
  const live = document.getElementById('appLiveRegion');

  // All visual motifs are original procedural canvas drawings. No external artwork, characters, logos or template assets are used.
  const presets = {
    floral: { label: 'Elegant floral', bg: '#f8f1e8', ink: '#4a2837', accent: '#b86a76', soft: '#e8c7c5', font: 'serif' },
    minimal: { label: 'Modern minimal', bg: '#f4f1ea', ink: '#172a3a', accent: '#b58c4b', soft: '#d7dde0', font: 'sans' },
    photo: { label: 'Photo focus', bg: '#293744', ink: '#ffffff', accent: '#f1c478', soft: '#80909a', font: 'serif' },
    bold: { label: 'Bold celebration', bg: '#d84d65', ink: '#ffffff', accent: '#ffd56a', soft: '#f3909f', font: 'sans' },
    luxury: { label: 'Luxury dark', bg: '#191d2a', ink: '#fffaf0', accent: '#d8aa4e', soft: '#474b58', font: 'serif' },
    playful: { label: 'Fun and colourful', bg: '#fff1dc', ink: '#3e3151', accent: '#f16f67', soft: '#7fc5b5', font: 'sans' },
    festive: { label: 'Traditional festive', bg: '#174a3a', ink: '#fffaf0', accent: '#d54545', soft: '#d7b66d', font: 'serif' },
    peaceful: { label: 'Peaceful light', bg: '#edf4f4', ink: '#334f55', accent: '#c99b66', soft: '#b9d1cf', font: 'serif' },
    botanical: { label: 'Rustic botanical', bg: '#dfe6d6', ink: '#33412e', accent: '#8b5f46', soft: '#93a485', font: 'serif' },
    cute: { label: 'Cute illustrated', bg: '#ffe8e2', ink: '#5b3851', accent: '#e88975', soft: '#f8bf9e', font: 'sans', motif: 'cute', frame: 'arch', illustration: 'none', accentChoice: 'heart', textStyle: 'clean' },
    ocean: { label: 'Ocean blue', bg: '#0e4f6f', ink: '#f6fbff', accent: '#54c2d4', soft: '#9fd9e5', font: 'sans', motif: 'minimal', frame: 'inset', illustration: 'waves', accentChoice: 'sparkles', textStyle: 'statement' },
    royal: { label: 'Royal blue', bg: '#233a84', ink: '#fffdf5', accent: '#e4bd58', soft: '#7185c7', font: 'serif', motif: 'luxury', frame: 'gold-deco', illustration: 'none', accentChoice: 'star', textStyle: 'clean' },
    sky: { label: 'Sky and cloud', bg: '#dceffc', ink: '#24445f', accent: '#75a9d1', soft: '#ffffff', font: 'sans', motif: 'peaceful', frame: 'arch', illustration: 'sunrise', accentChoice: 'sun', textStyle: 'clean' },
    teal: { label: 'Teal elegance', bg: '#146b6f', ink: '#f8fffd', accent: '#d6b978', soft: '#6eaaa5', font: 'serif', motif: 'botanical', frame: 'classic', illustration: 'botanical', accentChoice: 'leaf', textStyle: 'clean' },
    lavender: { label: 'Lavender grace', bg: '#eee8f7', ink: '#49355f', accent: '#8f73b5', soft: '#d2c3e8', font: 'serif', motif: 'floral', frame: 'lily', illustration: 'none', accentChoice: 'flower', textStyle: 'clean' },
    plum: { label: 'Plum evening', bg: '#4b254b', ink: '#fff7f2', accent: '#d9a6bf', soft: '#8a5c83', font: 'serif', motif: 'luxury', frame: 'deco-corners', illustration: 'none', accentChoice: 'sparkles', textStyle: 'statement' },
    emerald: { label: 'Emerald luxe', bg: '#114d3b', ink: '#fffaf0', accent: '#d7b766', soft: '#547b6b', font: 'serif', motif: 'luxury', frame: 'gold-deco', illustration: 'botanical', accentChoice: 'leaf', textStyle: 'clean' },
    terracotta: { label: 'Terracotta warmth', bg: '#b85f49', ink: '#fff7ed', accent: '#f0c087', soft: '#d9977f', font: 'serif', motif: 'bold', frame: 'arch', illustration: 'sunrise', accentChoice: 'sun', textStyle: 'clean' },
    mono: { label: 'Monochrome editorial', bg: '#f3f1ed', ink: '#1d1d1d', accent: '#777777', soft: '#d5d2cc', font: 'sans', motif: 'minimal', frame: 'inset', illustration: 'none', accentChoice: 'none', textStyle: 'statement' },
    champagne: { label: 'Champagne blush', bg: '#f5e6df', ink: '#5a3441', accent: '#c99a62', soft: '#e8c9c4', font: 'serif', motif: 'floral', frame: 'classic', illustration: 'none', accentChoice: 'flower', textStyle: 'clean' }
  };

  const sizes = {
    'whatsapp-square': { label: 'WhatsApp square', width: 1080, height: 1080, group: 'WhatsApp' },
    'whatsapp-portrait': { label: 'WhatsApp portrait', width: 1080, height: 1350, group: 'WhatsApp' },
    'whatsapp-landscape': { label: 'WhatsApp landscape', width: 1600, height: 900, group: 'WhatsApp' },
    'instagram-square': { label: 'Instagram square', width: 1080, height: 1080, group: 'Instagram' },
    'instagram-portrait': { label: 'Instagram portrait', width: 1080, height: 1350, group: 'Instagram' },
    'instagram-story': { label: 'Instagram Story', width: 1080, height: 1920, group: 'Instagram' },
    facebook: { label: 'Facebook post', width: 1200, height: 630, group: 'Social' },
    linkedin: { label: 'LinkedIn post', width: 1200, height: 627, group: 'Social' },
    x: { label: 'X post', width: 1600, height: 900, group: 'Social' },
    pinterest: { label: 'Pinterest pin', width: 1000, height: 1500, group: 'Social' },
    email: { label: 'Email card', width: 1200, height: 800, group: 'Digital' },
    landscape: { label: 'Standard digital landscape', width: 1600, height: 900, group: 'Digital' }
  };

  const legacySizeMap = {
    square: 'instagram-square', portrait: 'whatsapp-portrait', story: 'instagram-story'
  };

  const printSizes = {
    A4: { label: 'A4 one-page PDF', width: 2480, height: 3508, pdf: 'A4P' },
    A5: { label: 'A5 one-page PDF', width: 1748, height: 2480, pdf: 'A5P' },
    A6: { label: 'A6 one-page PDF', width: 1240, height: 1748, pdf: 'A6P' },
    '5x7': { label: '5 × 7 inch one-page PDF', width: 1500, height: 2100, pdf: '5X7' },
    '4x6': { label: '4 × 6 inch postcard PDF', width: 1200, height: 1800, pdf: '4X6' },
    square: { label: '6 × 6 inch square PDF', width: 1800, height: 1800, pdf: 'SQUARE' },
    Letter: { label: 'US Letter one-page PDF', width: 2550, height: 3300, pdf: 'LETTERP' }
  };

  const defaultState = {
    step: 1,
    creationType: 'card',
    occasion: 'birthday',
    occasionLabel: 'Birthday',
    customOccasion: '',
    recipient: 'Friend',
    tone: 'heartfelt',
    recipientName: '',
    senderName: '',
    personalNote: '',
    eventTitle: 'A Birthday Celebration',
    eventDate: '',
    eventTime: '',
    eventVenue: '',
    eventRsvp: '',
    eventHost: '',
    mainMessage: '',
    frontHeading: 'Happy Birthday',
    frontMessage: 'Wishing you a day filled with happiness and wonderful memories.',
    coverMessage: 'Wishing you a wonderful day',
    insideLeftMode: 'blank',
    insideLeftText: 'A little note, made especially for you.',
    insidePaper: 'ivory',
    backMessage: '',
    preset: 'floral',
    background: '',
    textColour: '',
    font: 'serif',
    frame: 'classic',
    illustration: 'none',
    accent: 'sparkles',
    textStyle: 'clean',
    photoData: '',
    photoX: 0.5,
    photoY: 0.5,
    photoZoom: 1.08,
    activePanel: 'front',
    outputMode: 'digital',
    size: 'instagram-square',
    singlePrintSize: 'A5',
    printPaper: 'A4',
    printQuality: 'home',
    showFoldMarks: true,
    showWebsite: true,
    reviewed: false,
    savedAt: 0,
    sizeSelected: false
  };

  const storedAppState = Store.load().app || {};
  let state = { ...defaultState, ...storedAppState, sizeSelected: storedAppState.sizeSelected === true };
  let photoImage = null;
  let messageOptions = [];
  let renderQueued = false;

  function announce(text) {
    if (!live) return;
    live.textContent = '';
    window.requestAnimationFrame(() => { live.textContent = text; });
  }

  function persist() {
    state.savedAt = Date.now();
    Store.save({ app: state });
  }

  function updateState(patch, options = {}) {
    const reviewSensitive = Object.keys(patch).some(key => !['step', 'activePanel', 'reviewed'].includes(key));
    state = { ...state, ...patch, ...(reviewSensitive ? { reviewed: false } : {}) };
    syncControls();
    if (options.persist !== false) persist();
    queueRender();
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderPreview();
    });
  }

  function queryDefaults() {
    const params = new URLSearchParams(location.search);
    const occasion = params.get('occasion');
    const tone = params.get('tone');
    const recipient = params.get('recipient');
    const message = params.get('message');
    const type = params.get('type');
    const size = params.get('size');
    const patch = {};
    if (['card','invitation','postcard'].includes(type)) patch.creationType = type;
    if (sizes[size]) { patch.size = size; patch.sizeSelected = true; }
    else if (legacySizeMap[size]) { patch.size = legacySizeMap[size]; patch.sizeSelected = true; }
    if (occasion && DATA.occasions[occasion]) {
      patch.occasion = occasion;
      patch.occasionLabel = DATA.occasions[occasion].label;
      patch.coverMessage = defaultCover(occasion);
      patch.frontMessage = defaultFrontMessage(occasion);
      patch.frontHeading = DATA.occasions[occasion].front || DATA.occasions[occasion].label;
    }
    if (tone && DATA.tones.some(item => item[0] === tone)) patch.tone = tone;
    if (recipient) patch.recipient = recipient;
    if (message) patch.mainMessage = message;
    if (Object.keys(patch).length) state = { ...state, ...patch };
  }

  function defaultCover(occasion) {
    const cover = {
      birthday: 'Wishing you a wonderful day', christmas: 'Peace, joy and warm wishes', wedding: 'For a beautiful life together',
      anniversary: 'Celebrating your love', easter: 'Hope and joy this Easter', thanks: 'With sincere appreciation',
      congratulations: 'You did something wonderful', 'new-baby': 'A beautiful new beginning', retirement: 'Enjoy your next chapter',
      'get-well': 'Sending care and warm wishes', valentine: 'With all my love', graduation: 'Your future starts here',
      'mothers-day': 'With love and gratitude', 'fathers-day': 'With appreciation and love', 'child-naming': 'Welcome, little one', 'job-promotion': 'A well-earned next step', custom: 'Made especially for this occasion', 'birthday-invitation': 'You’re invited', 'party-invitation': 'Let’s celebrate',
      'wedding-invitation': 'Together with joy', 'christmas-invitation': 'A festive invitation', postcard: 'A little note from me'
    };
    return cover[occasion] || 'Made especially for you';
  }

  function defaultFrontMessage(occasion) {
    const messages = {
      birthday: 'Wishing you a day filled with happiness and wonderful memories.', christmas: 'May your Christmas be filled with warmth, peace and joyful moments.',
      wedding: 'Wishing you a lifetime of love, laughter and beautiful memories together.', anniversary: 'Celebrating the love, memories and life you have built together.',
      easter: 'Wishing you hope, peace and happiness this Easter.', thanks: 'Your kindness has made a real difference. Thank you so much.',
      congratulations: 'Congratulations on this wonderful and well-deserved achievement.', 'new-baby': 'Warmest wishes as you welcome this beautiful new addition to your family.',
      retirement: 'Wishing you happiness, fulfilment and wonderful adventures in your next chapter.', 'get-well': 'Sending warm wishes for comfort, strength and a smooth recovery.',
      valentine: 'You make every day brighter, warmer and more meaningful.', graduation: 'Congratulations on everything you have achieved and the future ahead.',
      'mothers-day': 'Thank you for your love, strength and everything you do.', 'fathers-day': 'Thank you for your guidance, support and the difference you make.',
      'child-naming': 'Celebrating a precious name and a beautiful new beginning.', 'job-promotion': 'Congratulations on a well-earned achievement and an exciting next step.',
      custom: 'A special message created especially for this meaningful occasion.', 'birthday-invitation': 'Please join us to celebrate a very special birthday.',
      'party-invitation': 'Come and celebrate with us for a joyful and memorable occasion.', 'wedding-invitation': 'Please join us as we celebrate love and begin our life together.',
      'christmas-invitation': 'Please join us for a warm and joyful Christmas gathering.'
    };
    return messages[occasion] || 'A thoughtful message created especially for this occasion.';
  }

  function generateMessages(selectFirst = true) {
    state.reviewed = false;
    messageOptions = DATA.chooseMessages(
      state.occasion,
      state.tone,
      state.recipient,
      state.recipientName,
      state.personalNote
    );
    if (!state.mainMessage || (selectFirst && !messageOptions.includes(state.mainMessage))) {
      state.mainMessage = messageOptions[0] || '';
    }
    renderMessageOptions();
    persist();
    queueRender();
    announce('New message choices are ready.');
  }

  function renderMessageOptions() {
    const container = document.getElementById('messageOptions');
    if (!container) return;
    container.innerHTML = '';
    messageOptions.forEach((message, index) => {
      const article = document.createElement('article');
      article.className = `message-option${message === state.mainMessage ? ' selected' : ''}`;
      article.innerHTML = `
        <p>${escapeHtml(message)}</p>
        <div class="message-actions">
          <button type="button" class="button button-small ${message === state.mainMessage ? 'button-primary' : ''}" data-use-message="${index}">${message === state.mainMessage ? 'Selected' : 'Use this message'}</button>
          <button type="button" class="button button-small" data-copy-option="${index}">Copy</button>
        </div>`;
      container.appendChild(article);
    });
    container.querySelectorAll('[data-use-message]').forEach(button => {
      button.addEventListener('click', () => {
        state.mainMessage = messageOptions[Number(button.dataset.useMessage)];
        state.reviewed = false;
        document.getElementById('mainMessage').value = state.mainMessage;
        renderMessageOptions();
        persist();
        queueRender();
      });
    });
    container.querySelectorAll('[data-copy-option]').forEach(button => {
      button.addEventListener('click', async () => {
        await navigator.clipboard.writeText(messageOptions[Number(button.dataset.copyOption)]);
        announce('Message copied.');
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function syncControls() {
    document.querySelectorAll('[data-step]').forEach(button => {
      const active = Number(button.dataset.step) === state.step;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'step' : 'false');
    });
    document.querySelectorAll('[data-step-panel]').forEach(panel => {
      panel.hidden = Number(panel.dataset.stepPanel) !== state.step;
    });
    document.querySelectorAll('[data-creation-type]').forEach(button => {
      const active = button.dataset.creationType === state.creationType;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-occasion]').forEach(button => {
      const visible = button.dataset.kind === state.creationType;
      button.hidden = !visible;
      const active = visible && button.dataset.occasion === state.occasion;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-tone]').forEach(button => {
      const active = button.dataset.tone === state.tone;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-preset]').forEach(button => {
      const active = button.dataset.preset === state.preset;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-frame]').forEach(button => {
      const active = button.dataset.frame === state.frame;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-illustration]').forEach(button => {
      const active = button.dataset.illustration === state.illustration;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-accent]').forEach(button => {
      const active = button.dataset.accent === state.accent;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-text-style]').forEach(button => {
      const active = button.dataset.textStyle === state.textStyle;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-background]').forEach(button => {
      const active = button.dataset.background.toLowerCase() === String(state.background || '').toLowerCase();
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-inside-left]').forEach(button => {
      const active = button.dataset.insideLeft === state.insideLeftMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-inside-paper]').forEach(button => {
      const active = button.dataset.insidePaper === state.insidePaper;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-panel]').forEach(button => {
      const active = button.dataset.panel === state.activePanel;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-output-mode]').forEach(button => {
      const active = button.dataset.outputMode === state.outputMode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-size]').forEach(button => {
      const active = state.sizeSelected && button.dataset.size === state.size;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-paper]').forEach(button => {
      const active = state.sizeSelected && button.dataset.paper === state.printPaper;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-single-print-size]').forEach(button => {
      const active = state.sizeSelected && button.dataset.singlePrintSize === state.singlePrintSize;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-print-quality]').forEach(button => {
      const active = button.dataset.printQuality === state.printQuality;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const digitalSizeOptions = document.getElementById('digitalSizeOptions');
    const singlePrintSizeOptions = document.getElementById('singlePrintSizeOptions');
    const foldedSizeOptions = document.getElementById('foldedSizeOptions');
    const digitalActions = document.getElementById('digitalActions');
    const singlePrintActions = document.getElementById('singlePrintActions');
    const foldedActions = document.getElementById('foldedActions');
    const downloadWorkspace = document.getElementById('downloadWorkspace');
    if (digitalSizeOptions) digitalSizeOptions.hidden = state.outputMode !== 'digital';
    if (singlePrintSizeOptions) singlePrintSizeOptions.hidden = state.outputMode !== 'single-print';
    if (foldedSizeOptions) foldedSizeOptions.hidden = state.outputMode !== 'folded';
    if (digitalActions) digitalActions.hidden = state.outputMode !== 'digital';
    if (singlePrintActions) singlePrintActions.hidden = state.outputMode !== 'single-print';
    if (foldedActions) foldedActions.hidden = state.outputMode !== 'folded';
    if (downloadWorkspace) downloadWorkspace.hidden = !state.reviewed;
    const inputs = {
      recipientSelect: state.recipient,
      customOccasion: state.customOccasion,
      recipientName: state.recipientName,
      senderName: state.senderName,
      personalNote: state.personalNote,
      eventTitle: state.eventTitle,
      eventDate: state.eventDate,
      eventTime: state.eventTime,
      eventVenue: state.eventVenue,
      eventRsvp: state.eventRsvp,
      eventHost: state.eventHost,
      mainMessage: state.mainMessage,
      frontHeading: state.frontHeading,
      frontMessage: state.frontMessage,
      coverMessage: state.coverMessage,
      backMessage: state.backMessage,
      insideLeftText: state.insideLeftText,
      backgroundPicker: state.background || presets[state.preset].bg,
      textColourPicker: state.textColour || presets[state.preset].ink
    };
    Object.entries(inputs).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input && input.value !== value) input.value = value;
    });
    const photoControls = document.getElementById('photoPositionControls');
    const photoHelp = document.getElementById('photoPositionHelp');
    const photoZoom = document.getElementById('photoZoom');
    const removePhoto = document.getElementById('removePhoto');
    if (photoControls) photoControls.hidden = !state.photoData;
    if (photoHelp) photoHelp.hidden = !state.photoData;
    if (removePhoto) removePhoto.hidden = !state.photoData;
    if (photoZoom && Number(photoZoom.value) !== Number(state.photoZoom)) photoZoom.value = String(state.photoZoom || 1.08);
    const invitationDetails = document.getElementById('invitationDetails');
    if (invitationDetails) invitationDetails.hidden = state.creationType !== 'invitation';
    const customOccasionField = document.getElementById('customOccasionField');
    if (customOccasionField) customOccasionField.hidden = state.occasion !== 'custom';
    const customOccasion = document.getElementById('customOccasion');
    if (customOccasion && customOccasion.value !== state.customOccasion) customOccasion.value = state.customOccasion;
    const editor = document.getElementById('persistentMessageEditor');
    const slot = document.querySelector(`[data-editor-slot="${state.step}"]`);
    if (editor && slot && editor.parentElement !== slot) slot.appendChild(editor);
    const mainLabel = document.querySelector('label[for="mainMessage"]');
    if (mainLabel) mainLabel.textContent = state.creationType === 'invitation' ? 'Invitation wording' : state.creationType === 'postcard' ? 'Postcard message' : 'Your final message';
    const website = document.getElementById('showWebsite');
    const marks = document.getElementById('showFoldMarks');
    if (website) website.checked = state.showWebsite;
    if (marks) marks.checked = state.showFoldMarks;
    const selectedOccasion = DATA.occasions[state.occasion];
    state.occasionLabel = state.occasion === 'custom' && state.customOccasion.trim() ? state.customOccasion.trim() : (selectedOccasion?.label || state.occasionLabel);
    const format = selectedFormat();
    const formatSummary = document.getElementById('selectedFormatSummary');
    const reviewButton = document.getElementById('reviewCard');
    const downloadSummary = document.getElementById('downloadSummary');
    const reviewStepSummary = document.getElementById('reviewStepSummary');
    if (formatSummary) formatSummary.textContent = `${format.label} · ${format.detail}`;
    const summaryText = state.sizeSelected ? `${format.label} · ${format.detail}` : 'No size selected';
    if (reviewButton) reviewButton.textContent = state.sizeSelected ? `Review ${format.shortLabel}` : 'Choose a size before review';
    if (downloadSummary) downloadSummary.textContent = summaryText;
    if (reviewStepSummary) reviewStepSummary.textContent = summaryText;
    const noSizeReviewState = document.getElementById('noSizeReviewState');
    const reviewReadyState = document.getElementById('reviewReadyState');
    if (noSizeReviewState) noSizeReviewState.hidden = state.sizeSelected;
    if (reviewReadyState) reviewReadyState.hidden = !state.sizeSelected;
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const value = parseInt(clean.length === 3 ? clean.split('').map(x => x + x).join('') : clean, 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }

  function paletteFor(renderState) {
    const base = presets[renderState.preset] || presets.floral;
    return {
      ...base,
      bg: renderState.background || base.bg,
      ink: renderState.textColour || base.ink
    };
  }

  function drawBackground(context, x, y, width, height, renderState) {
    const p = paletteFor(renderState);
    context.fillStyle = p.bg;
    context.fillRect(x, y, width, height);

    context.save();
    context.beginPath();
    context.rect(x, y, width, height);
    context.clip();

    const motif = p.motif || renderState.preset;
    if (motif === 'floral') {
      drawLeafSprig(context, x + width * .08, y + height * .1, width * .16, p.accent, -0.4);
      drawLeafSprig(context, x + width * .9, y + height * .88, width * .18, p.accent, 2.7);
      context.strokeStyle = hexToRgba(p.accent, .24);
      context.lineWidth = Math.max(3, width * .005);
      context.beginPath(); context.arc(x + width * .08, y + height * .08, width * .17, 0, Math.PI * 2); context.stroke();
    } else if (motif === 'minimal') {
      context.fillStyle = hexToRgba(p.accent, .16);
      context.fillRect(x, y, width, height * .035);
      context.fillRect(x, y + height * .965, width, height * .035);
      context.strokeStyle = p.accent;
      context.lineWidth = Math.max(2, width * .003);
      context.beginPath(); context.moveTo(x + width * .12, y + height * .2); context.lineTo(x + width * .88, y + height * .2); context.stroke();
    } else if (motif === 'photo') {
      const grad = context.createLinearGradient(x, y, x + width, y + height);
      grad.addColorStop(0, p.bg); grad.addColorStop(1, '#71808b');
      context.fillStyle = grad; context.fillRect(x, y, width, height);
      context.fillStyle = 'rgba(255,255,255,.11)';
      for (let i = 0; i < 8; i += 1) {
        context.beginPath(); context.arc(x + width * (0.1 + i * .13), y + height * (.18 + (i % 3) * .25), width * .06, 0, Math.PI * 2); context.fill();
      }
    } else if (motif === 'bold') {
      drawConfetti(context, x, y, width, height, p.accent, p.soft);
      context.fillStyle = 'rgba(255,255,255,.11)';
      context.beginPath(); context.arc(x + width * .12, y + height * .2, width * .18, 0, Math.PI * 2); context.fill();
      context.beginPath(); context.arc(x + width * .92, y + height * .82, width * .24, 0, Math.PI * 2); context.fill();
    } else if (motif === 'luxury') {
      const grad = context.createRadialGradient(x + width * .3, y + height * .2, 0, x + width * .5, y + height * .5, width);
      grad.addColorStop(0, '#303649'); grad.addColorStop(1, p.bg);
      context.fillStyle = grad; context.fillRect(x, y, width, height);
      context.strokeStyle = p.accent; context.lineWidth = Math.max(2, width * .003);
      context.strokeRect(x + width * .06, y + height * .045, width * .88, height * .91);
      context.strokeRect(x + width * .075, y + height * .06, width * .85, height * .88);
    } else if (motif === 'playful') {
      const colours = [p.accent, p.soft, '#8da5e5', '#f7c45d'];
      [[.12,.12,.15],[.87,.16,.12],[.13,.86,.12],[.88,.84,.18]].forEach((item, index) => {
        context.fillStyle = hexToRgba(colours[index], .75);
        context.beginPath(); context.arc(x + width * item[0], y + height * item[1], width * item[2], 0, Math.PI * 2); context.fill();
      });
    } else if (motif === 'festive') {
      drawPine(context, x + width * .08, y + height * .06, width * .38, p.soft);
      drawPine(context, x + width * .92, y + height * .93, width * .4, p.soft, Math.PI);
      context.fillStyle = 'rgba(255,255,255,.7)';
      for (let i = 0; i < 45; i += 1) {
        const px = x + ((i * 73) % 997) / 997 * width;
        const py = y + ((i * 151) % 991) / 991 * height;
        context.beginPath(); context.arc(px, py, Math.max(1.5, width * .0025), 0, Math.PI * 2); context.fill();
      }
    } else if (motif === 'peaceful') {
      const grad = context.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#dfecef'); grad.addColorStop(.55, p.bg); grad.addColorStop(1, '#f7efe3');
      context.fillStyle = grad; context.fillRect(x, y, width, height);
      context.strokeStyle = hexToRgba(p.accent, .35); context.lineWidth = width * .015;
      context.beginPath(); context.arc(x + width * .5, y + height * .15, width * .22, Math.PI, Math.PI * 2); context.stroke();
      context.fillStyle = hexToRgba(p.soft, .3); context.beginPath(); context.arc(x + width * .5, y + height * 1.02, width * .65, Math.PI, Math.PI * 2); context.fill();
    } else if (motif === 'botanical') {
      drawLeafSprig(context, x + width * .07, y + height * .15, width * .24, p.ink, -.2);
      drawLeafSprig(context, x + width * .93, y + height * .83, width * .28, p.ink, 2.9);
      context.fillStyle = hexToRgba(p.accent, .16); context.fillRect(x + width * .05, y + height * .05, width * .9, height * .9);
      context.fillStyle = p.bg; context.fillRect(x + width * .065, y + height * .065, width * .87, height * .87);
    } else if (motif === 'cute') {
      drawStars(context, x, y, width, height, p.accent, p.soft);
      context.fillStyle = hexToRgba('#ffffff', .45);
      roundedRect(context, x + width * .08, y + height * .1, width * .84, height * .8, width * .06); context.fill();
    }

    context.restore();
  }

  function drawLeafSprig(context, x, y, length, colour, angle = 0) {
    context.save(); context.translate(x, y); context.rotate(angle);
    context.strokeStyle = colour; context.fillStyle = hexToRgba(colour, .7); context.lineWidth = Math.max(2, length * .018);
    context.beginPath(); context.moveTo(0, length * .45); context.quadraticCurveTo(length * .45, 0, length, -length * .12); context.stroke();
    for (let i = 1; i < 6; i += 1) {
      const px = length * i / 6;
      const py = length * .45 * (1 - i / 6) - length * .12 * i / 6;
      context.save(); context.translate(px, py); context.rotate(-.45 + i * .06);
      context.beginPath(); context.ellipse(0, 0, length * .09, length * .035, 0, 0, Math.PI * 2); context.fill(); context.restore();
      context.save(); context.translate(px * .92, py + length * .07); context.rotate(.6 - i * .04);
      context.beginPath(); context.ellipse(0, 0, length * .08, length * .03, 0, 0, Math.PI * 2); context.fill(); context.restore();
    }
    context.restore();
  }

  function drawConfetti(context, x, y, width, height, c1, c2) {
    const colours = [c1, c2, '#ffffff'];
    for (let i = 0; i < 36; i += 1) {
      const px = x + ((i * 83) % 991) / 991 * width;
      const py = y + ((i * 197) % 983) / 983 * height;
      context.save(); context.translate(px, py); context.rotate(i * .7);
      context.fillStyle = hexToRgba(colours[i % colours.length], .75);
      context.fillRect(-width * .006, -width * .018, width * .012, width * .036); context.restore();
    }
  }

  function drawPine(context, x, y, size, colour, rotation = 0) {
    context.save(); context.translate(x, y); context.rotate(rotation);
    context.strokeStyle = colour; context.lineWidth = Math.max(2, size * .02);
    context.beginPath(); context.moveTo(0, 0); context.lineTo(size, size * .22); context.stroke();
    for (let i = 0; i < 12; i += 1) {
      const t = i / 12;
      context.beginPath(); context.moveTo(size * t, size * .22 * t); context.lineTo(size * t - size * .09, size * .22 * t - size * .08); context.stroke();
      context.beginPath(); context.moveTo(size * t, size * .22 * t); context.lineTo(size * t - size * .04, size * .22 * t + size * .1); context.stroke();
    }
    context.restore();
  }

  function drawStars(context, x, y, width, height, c1, c2) {
    for (let i = 0; i < 24; i += 1) {
      const px = x + ((i * 137) % 997) / 997 * width;
      const py = y + ((i * 211) % 991) / 991 * height;
      const r = width * (.008 + (i % 4) * .003);
      context.fillStyle = hexToRgba(i % 2 ? c1 : c2, .7);
      context.beginPath();
      for (let p = 0; p < 10; p += 1) {
        const angle = -Math.PI / 2 + p * Math.PI / 5;
        const radius = p % 2 ? r * .42 : r;
        const sx = px + Math.cos(angle) * radius;
        const sy = py + Math.sin(angle) * radius;
        if (p === 0) context.moveTo(sx, sy); else context.lineTo(sx, sy);
      }
      context.closePath(); context.fill();
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function positionedImageMetrics(image, width, height, renderState) {
    const zoom = clamp(Number(renderState.photoZoom) || 1, 1, 2.5);
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const overflowX = Math.max(0, drawWidth - width);
    const overflowY = Math.max(0, drawHeight - height);
    const focalX = clamp(Number(renderState.photoX) || 0.5, 0, 1);
    const focalY = clamp(Number(renderState.photoY) || 0.5, 0, 1);
    return {
      drawWidth,
      drawHeight,
      dx: -overflowX * focalX,
      dy: -overflowY * focalY,
      overflowX,
      overflowY
    };
  }

  function drawCoverImage(context, image, x, y, width, height, renderState = state) {
    const metrics = positionedImageMetrics(image, width, height, renderState);
    context.drawImage(image, x + metrics.dx, y + metrics.dy, metrics.drawWidth, metrics.drawHeight);
    return metrics;
  }

  function frontPhotoRegion(width, height) {
    return {
      x: width * .09,
      y: height * .055,
      width: width * .82,
      height: height * .255,
      radius: Math.min(width, height) * .028
    };
  }

  function currentPhotoRegion() {
    if (!photoImage) return null;
    if (state.activePanel === 'front') return frontPhotoRegion(canvas.width, canvas.height);
    if (state.activePanel === 'inside-left' && state.insideLeftMode === 'photo') {
      const margin = canvas.width * .1;
      return { x: margin, y: margin, width: canvas.width - margin * 2, height: canvas.height - margin * 2, radius: canvas.width * .04 };
    }
    return null;
  }

  function fontFamily(renderState, p) {
    if (renderState.font === 'handwritten') return 'cursive';
    if (renderState.font === 'sans' || p.font === 'sans') return 'Arial, Helvetica, sans-serif';
    return 'Georgia, Times New Roman, serif';
  }

  function wrapLines(context, text, maxWidth) {
    const paragraphs = String(text || '').split(/\n+/);
    const lines = [];
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      let line = '';
      words.forEach(word => {
        const test = line ? `${line} ${word}` : word;
        if (context.measureText(test).width > maxWidth && line) {
          lines.push(line); line = word;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
      if (paragraphIndex < paragraphs.length - 1) lines.push('');
    });
    return lines;
  }

  function fitText(context, text, options) {
    let size = options.startSize;
    let lines = [];
    while (size >= options.minSize) {
      context.font = `${options.weight || 600} ${size}px ${options.family}`;
      lines = wrapLines(context, text, options.maxWidth);
      const total = lines.length * size * (options.lineHeight || 1.25);
      if (total <= options.maxHeight && lines.length <= (options.maxLines || 99)) break;
      size -= Math.max(1, options.step || 2);
    }
    return { size, lines };
  }

  function drawTextBlock(context, text, box, style) {
    context.save();
    context.textAlign = style.align || 'center';
    context.textBaseline = 'middle';
    context.fillStyle = style.colour;
    const fitted = fitText(context, text, {
      startSize: style.startSize,
      minSize: style.minSize,
      maxWidth: box.width,
      maxHeight: box.height,
      maxLines: style.maxLines,
      family: style.family,
      weight: style.weight,
      lineHeight: style.lineHeight
    });
    context.font = `${style.weight || 600} ${fitted.size}px ${style.family}`;
    const lineHeight = fitted.size * (style.lineHeight || 1.25);
    let y = box.y + box.height / 2 - (fitted.lines.length - 1) * lineHeight / 2;
    const x = style.align === 'left' ? box.x : style.align === 'right' ? box.x + box.width : box.x + box.width / 2;
    fitted.lines.forEach(line => {
      context.fillText(line, x, y, box.width);
      y += lineHeight;
    });
    context.restore();
    return fitted.size;
  }

  function drawHeart(context, cx, cy, size, colour, alpha = .8) {
    context.save();
    context.translate(cx, cy);
    context.scale(size, size);
    context.fillStyle = hexToRgba(colour, alpha);
    context.beginPath();
    context.moveTo(0, .3);
    context.bezierCurveTo(-.72, -.18, -.45, -.78, 0, -.42);
    context.bezierCurveTo(.45, -.78, .72, -.18, 0, .3);
    context.fill();
    context.restore();
  }


  function drawPaw(context, cx, cy, size, colour, alpha = .82) {
    context.save();
    context.fillStyle = hexToRgba(colour, alpha);
    context.beginPath(); context.ellipse(cx, cy + size * .3, size * .62, size * .5, 0, 0, Math.PI * 2); context.fill();
    [[-.62,-.35],[-.2,-.72],[.28,-.7],[.68,-.28]].forEach(([dx,dy], index) => {
      context.beginPath();
      context.ellipse(cx + size * dx, cy + size * dy, size * .22, size * (index === 1 || index === 2 ? .31 : .27), dx * .16, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function drawRainbow(context, cx, cy, radius, colours, alpha = .55) {
    context.save();
    context.lineCap = 'round';
    colours.forEach((colour, index) => {
      context.strokeStyle = hexToRgba(colour, alpha);
      context.lineWidth = Math.max(3, radius * .09);
      context.beginPath();
      context.arc(cx, cy, radius * (1 - index * .13), Math.PI, Math.PI * 2);
      context.stroke();
    });
    context.restore();
  }

  function drawSelectedIllustration(context, x, y, width, height, renderState, p) {
    const type = renderState.illustration || 'none';
    if (type === 'none') return;
    context.save();
    context.beginPath(); context.rect(x, y, width, height); context.clip();
    const cx = x + width * .5;
    const top = y + height * .13;
    if (type === 'heart') {
      drawHeart(context, cx, top, width * .09, p.accent, .34);
    } else if (type === 'sunrise') {
      context.strokeStyle = hexToRgba(p.accent, .55); context.lineWidth = Math.max(2, width * .004);
      context.beginPath(); context.arc(cx, top + width * .04, width * .12, Math.PI, Math.PI * 2); context.stroke();
      for (let i = -3; i <= 3; i += 1) {
        const angle = -Math.PI / 2 + i * .18;
        context.beginPath(); context.moveTo(cx + Math.cos(angle) * width * .15, top + width * .04 + Math.sin(angle) * width * .15); context.lineTo(cx + Math.cos(angle) * width * .21, top + width * .04 + Math.sin(angle) * width * .21); context.stroke();
      }
    } else if (type === 'hills') {
      context.fillStyle = hexToRgba(p.soft, .32);
      context.beginPath(); context.moveTo(x, y + height * .83); context.quadraticCurveTo(x + width * .24, y + height * .69, x + width * .5, y + height * .83); context.quadraticCurveTo(x + width * .76, y + height * .68, x + width, y + height * .81); context.lineTo(x + width, y + height); context.lineTo(x, y + height); context.fill();
    } else if (type === 'waves') {
      context.strokeStyle = hexToRgba(p.accent, .35); context.lineWidth = Math.max(3, width * .006);
      for (let row = 0; row < 3; row += 1) {
        const yy = y + height * (.78 + row * .035);
        context.beginPath(); context.moveTo(x + width * .08, yy);
        for (let i = 0; i < 4; i += 1) context.quadraticCurveTo(x + width * (.17 + i * .22), yy - width * .035, x + width * (.28 + i * .22), yy);
        context.stroke();
      }
    } else if (type === 'botanical') {
      drawLeafSprig(context, x + width * .14, y + height * .18, width * .22, p.accent, -.45);
      drawLeafSprig(context, x + width * .86, y + height * .82, width * .24, p.accent, 2.7);
    } else if (type === 'confetti') {
      drawConfetti(context, x, y, width, height, p.accent, p.soft);
    } else if (type === 'dove') {
      context.strokeStyle = hexToRgba(p.accent, .55); context.lineWidth = Math.max(3, width * .005);
      context.beginPath(); context.moveTo(cx - width * .13, top); context.quadraticCurveTo(cx - width * .02, top - width * .1, cx + width * .04, top); context.quadraticCurveTo(cx + width * .1, top - width * .06, cx + width * .16, top - width * .02); context.quadraticCurveTo(cx + width * .08, top + width * .08, cx, top + width * .04); context.quadraticCurveTo(cx - width * .08, top + width * .08, cx - width * .13, top); context.stroke();
    } else if (type === 'rainbow') {
      drawRainbow(context, cx, top + width * .08, width * .18, [p.accent, p.soft, '#8da5e5', '#f2c967']);
    } else if (type === 'paw') {
      drawPaw(context, cx, top + width * .06, width * .055, p.accent, .35);
      drawPaw(context, cx + width * .12, top + width * .12, width * .04, p.soft, .3);
    }
    context.restore();
  }

  function drawLittleAccent(context, x, y, width, height, renderState, p) {
    const type = renderState.accent || 'none';
    if (type === 'none') return;
    const cx = x + width * .5;
    const cy = y + height * .89;
    const size = width * .028;
    context.save();
    context.strokeStyle = p.accent; context.fillStyle = p.accent; context.lineWidth = Math.max(2, width * .003);
    if (type === 'heart') drawHeart(context, cx, cy, size, p.accent, .88);
    else if (type === 'star' || type === 'sparkles') {
      const points = type === 'star' ? 5 : 4;
      context.beginPath();
      for (let i = 0; i < points * 2; i += 1) {
        const a = -Math.PI / 2 + i * Math.PI / points;
        const r = i % 2 ? size * .4 : size;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        i ? context.lineTo(px, py) : context.moveTo(px, py);
      }
      context.closePath(); context.fill();
      if (type === 'sparkles') { context.beginPath(); context.arc(cx + size * 1.7, cy - size * .6, size * .18, 0, Math.PI * 2); context.fill(); }
    } else if (type === 'flower') {
      for (let i = 0; i < 6; i += 1) { const a = i * Math.PI / 3; context.beginPath(); context.ellipse(cx + Math.cos(a) * size * .65, cy + Math.sin(a) * size * .65, size * .55, size * .28, a, 0, Math.PI * 2); context.fill(); }
      context.fillStyle = p.ink; context.beginPath(); context.arc(cx, cy, size * .25, 0, Math.PI * 2); context.fill();
    } else if (type === 'leaf' || type === 'feather') drawLeafSprig(context, cx - size * 2.2, cy + size, size * 4.4, p.accent, -.25);
    else if (type === 'sun') { context.beginPath(); context.arc(cx, cy, size * .55, 0, Math.PI * 2); context.fill(); for (let i=0;i<8;i+=1){const a=i*Math.PI/4;context.beginPath();context.moveTo(cx+Math.cos(a)*size*.9,cy+Math.sin(a)*size*.9);context.lineTo(cx+Math.cos(a)*size*1.35,cy+Math.sin(a)*size*1.35);context.stroke();} }
    else if (type === 'candle') { context.fillRect(cx-size*.25,cy-size*.45,size*.5,size*1.25); context.beginPath(); context.moveTo(cx,cy-size*.7); context.quadraticCurveTo(cx-size*.35,cy-size*1.2,cx,cy-size*1.55); context.quadraticCurveTo(cx+size*.35,cy-size*1.2,cx,cy-size*.7); context.fill(); }
    else if (type === 'dove') { context.beginPath(); context.moveTo(cx-size*1.2,cy); context.quadraticCurveTo(cx-size*.2,cy-size*.9,cx+size*.35,cy); context.quadraticCurveTo(cx+size*.8,cy-size*.55,cx+size*1.25,cy-size*.2); context.quadraticCurveTo(cx+size*.65,cy+size*.5,cx,cy+size*.25); context.quadraticCurveTo(cx-size*.65,cy+size*.45,cx-size*1.2,cy); context.stroke(); }
    else if (type === 'paw') drawPaw(context, cx, cy, size * .78, p.accent, .9);
    context.restore();
  }

  function drawFrame(context, x, y, width, height, renderState, p) {
    const frame = renderState.frame || 'none';
    if (frame === 'none') return;
    context.save();
    const margin = width * .045;
    context.strokeStyle = hexToRgba(p.accent, frame === 'soft' ? .45 : .88);
    context.fillStyle = hexToRgba(p.accent, .8);
    context.lineWidth = Math.max(2, width * .003);
    const left = x + margin, top = y + margin, w = width - margin * 2, h = height - margin * 2;
    if (frame === 'arch') {
      roundedRect(context, left, top, w, h, width * .18); context.stroke();
    } else if (frame === 'gold-deco') {
      context.lineWidth = Math.max(3, width * .004); roundedRect(context,left,top,w,h,width*.018); context.stroke();
      const d=width*.035; [[left,top],[left+w,top],[left,top+h],[left+w,top+h]].forEach(([cx,cy],i)=>{context.save();context.translate(cx,cy);context.rotate((i%2?1:-1)*Math.PI/4);context.strokeRect(-d/2,-d/2,d,d);context.restore();});
    } else if (frame === 'botanical') {
      roundedRect(context,left,top,w,h,width*.018); context.stroke(); drawLeafSprig(context,left+width*.03,top+height*.08,width*.15,p.accent,-.55); drawLeafSprig(context,left+w-width*.02,top+h-height*.07,width*.16,p.accent,2.55);
    } else if (frame === 'ribbon') {
      roundedRect(context,left,top,w,h,width*.018); context.stroke(); context.fillStyle=hexToRgba(p.accent,.18); context.fillRect(left, y+height*.12, w, height*.055); context.fillRect(left, y+height*.83, w, height*.055);
    } else if (frame === 'inset') {
      const inner=margin*1.5; roundedRect(context,x+inner,y+inner,width-inner*2,height-inner*2,width*.016); context.stroke();
    } else if (frame === 'deco-corners') {
      const len=width*.11; context.lineWidth=Math.max(3,width*.004); [[left,top,1,1],[left+w,top,-1,1],[left,top+h,1,-1],[left+w,top+h,-1,-1]].forEach(([cx,cy,sx,sy])=>{context.beginPath();context.moveTo(cx+sx*len,cy);context.lineTo(cx,cy);context.lineTo(cx,cy+sy*len);context.stroke();context.beginPath();context.moveTo(cx+sx*len*.65,cy+sy*len*.2);context.lineTo(cx+sx*len*.2,cy+sy*len*.2);context.lineTo(cx+sx*len*.2,cy+sy*len*.65);context.stroke();});
    } else if (frame === 'wreath') {
      roundedRect(context,left,top,w,h,width*.018); context.stroke(); context.save(); context.translate(x+width/2,y+height*.13); for(let i=0;i<16;i+=1){context.rotate(Math.PI/8);context.beginPath();context.ellipse(width*.11,0,width*.024,width*.01,0,0,Math.PI*2);context.fill();} context.restore();
    } else if (frame === 'lily') {
      roundedRect(context,left,top,w,h,width*.018); context.stroke(); drawLeafSprig(context,left+width*.02,top+height*.06,width*.19,p.accent,-.2);
    } else if (frame === 'paw') {
      roundedRect(context,left,top,w,h,width*.018); context.stroke();
      drawPaw(context, left + width * .07, top + height * .08, width * .022, p.accent, .55);
      drawPaw(context, left + w - width * .07, top + h - height * .08, width * .022, p.accent, .55);
    } else if (frame === 'rainbow') {
      roundedRect(context,left,top,w,h,width*.018); context.stroke();
      drawRainbow(context, x + width * .5, y + height * .12, width * .18, [p.accent, p.soft, '#8da5e5', '#f2c967'], .42);
    } else {
      roundedRect(context, left, top, w, h, width * .02); context.stroke();
      if (frame === 'double') { const inner = margin * 1.35; roundedRect(context, x + inner, y + inner, width - inner * 2, height - inner * 2, width * .018); context.stroke(); }
    }
    context.restore();
  }

  function drawPhotoTopArea(context, x, y, width, height, renderState, p) {
    if (!photoImage) return false;
    const region = frontPhotoRegion(width, height);
    const rx = x + region.x;
    const ry = y + region.y;
    context.save();
    roundedRect(context, rx, ry, region.width, region.height, region.radius);
    context.clip();
    drawCoverImage(context, photoImage, rx, ry, region.width, region.height, renderState);
    context.restore();
    context.save();
    context.strokeStyle = hexToRgba(p.accent, .92);
    context.lineWidth = Math.max(3, width * .005);
    roundedRect(context, rx, ry, region.width, region.height, region.radius);
    context.stroke();
    context.restore();
    return true;
  }

  function formatEventDate(value) {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function drawPanel(context, x, y, width, height, panel, renderState, folded = false) {
    const exterior = paletteFor(renderState);
    const isInside = panel === 'inside-left' || panel === 'inside-right';
    const p = isInside ? { ...exterior, bg: renderState.insidePaper === 'white' ? '#ffffff' : '#fffaf0', ink: '#2e2930', soft: '#eee5d8' } : exterior;
    context.save();
    context.beginPath(); context.rect(x, y, width, height); context.clip();
    if (isInside) {
      context.fillStyle = p.bg; context.fillRect(x, y, width, height);
      context.strokeStyle = hexToRgba(exterior.accent, .28); context.lineWidth = Math.max(2, width * .0025);
      context.strokeRect(x + width * .055, y + height * .04, width * .89, height * .92);
    } else {
      drawBackground(context, x, y, width, height, renderState);
      drawSelectedIllustration(context, x, y, width, height, renderState, p);
      drawFrame(context, x, y, width, height, renderState, p);
    }
    const family = fontFamily(renderState, p);
    const pad = width * .12;

    if (panel === 'front' && renderState.creationType === 'invitation') {
      const hasPhoto = drawPhotoTopArea(context, x, y, width, height, renderState, p);
      context.fillStyle = p.accent;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `700 ${Math.max(20, width * .028)}px Arial, Helvetica, sans-serif`;
      context.fillText('YOU’RE INVITED', x + width / 2, y + height * (hasPhoto ? .355 : .12), width * .72);
      const eventName = renderState.eventTitle || DATA.occasions[renderState.occasion]?.front || 'A Special Celebration';
      drawTextBlock(context, eventName, {
        x: x + pad, y: y + height * (hasPhoto ? .39 : .19), width: width - pad * 2, height: height * (hasPhoto ? .14 : .22)
      }, { colour: p.ink, family, startSize: width * (hasPhoto ? .058 : .075), minSize: width * .032, weight: 700, lineHeight: 1.15, maxLines: hasPhoto ? 3 : 4 });
      const guest = renderState.recipientName ? `CELEBRATING ${renderState.recipientName.toUpperCase()}` : '';
      if (guest) {
        context.fillStyle = p.accent; context.font = `700 ${width * .026}px Arial, Helvetica, sans-serif`;
        context.fillText(guest, x + width / 2, y + height * (hasPhoto ? .56 : .45), width * .72);
      }
      const when = [formatEventDate(renderState.eventDate), renderState.eventTime].filter(Boolean).join('  •  ');
      const details = [when, renderState.eventVenue].filter(Boolean).join('\n');
      drawTextBlock(context, details || 'Add the date, time and venue', {
        x: x + pad, y: y + height * (hasPhoto ? .6 : .5), width: width - pad * 2, height: height * (hasPhoto ? .13 : .17)
      }, { colour: p.ink, family, startSize: width * .035, minSize: width * .023, weight: 600, lineHeight: 1.35, maxLines: 4 });
      drawTextBlock(context, renderState.mainMessage, {
        x: x + pad * 1.1, y: y + height * (hasPhoto ? .73 : .67), width: width - pad * 2.2, height: height * (hasPhoto ? .1 : .13)
      }, { colour: p.ink, family, startSize: width * .029, minSize: width * .02, weight: 500, lineHeight: 1.3, maxLines: hasPhoto ? 3 : 4 });
      const response = renderState.eventRsvp ? (/^rsvp/i.test(renderState.eventRsvp.trim()) ? renderState.eventRsvp : `RSVP  ${renderState.eventRsvp}`) : renderState.eventHost ? `HOSTED BY ${renderState.eventHost.toUpperCase()}` : '';
      if (response) {
        context.fillStyle = p.accent; context.font = `700 ${width * .024}px Arial, Helvetica, sans-serif`;
        context.fillText(response, x + width / 2, y + height * .88, width * .74);
      }
    } else if (panel === 'front') {
      const digital = renderState.outputMode === 'digital' && !folded;
      const hasPhoto = drawPhotoTopArea(context, x, y, width, height, renderState, p);
      context.fillStyle = p.accent;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `700 ${Math.max(20, width * .03)}px Arial, Helvetica, sans-serif`;
      context.fillText((renderState.occasion === 'custom' && renderState.customOccasion ? renderState.customOccasion : (DATA.occasions[renderState.occasion]?.label || renderState.occasionLabel || 'Special Occasion')).toUpperCase(), x + width / 2, y + height * (hasPhoto ? .365 : .18), width * .76);

      let title = renderState.frontHeading || (renderState.occasion === 'custom' && renderState.customOccasion ? renderState.customOccasion : (DATA.occasions[renderState.occasion]?.front || 'For You'));
      if (renderState.textStyle === 'statement') title = title.toUpperCase();
      drawTextBlock(context, title, {
        x: x + pad, y: y + height * (hasPhoto ? .405 : .245), width: width - pad * 2, height: height * (hasPhoto ? .15 : .17)
      }, {
        colour: p.ink, family, startSize: width * .085, minSize: width * .038,
        weight: renderState.font === 'handwritten' ? 500 : 700, lineHeight: 1.14, maxLines: 3
      });

      let frontCopy = renderState.frontMessage || defaultFrontMessage(renderState.occasion);
      if (renderState.textStyle === 'quotes') frontCopy = `“${frontCopy}”`;
      drawTextBlock(context, frontCopy, {
        x: x + pad * 1.05, y: y + height * (hasPhoto ? .555 : .43), width: width - pad * 2.1, height: height * (hasPhoto ? .18 : .22)
      }, {
        colour: p.ink, family, startSize: width * .042, minSize: width * .025,
        weight: 500, lineHeight: 1.32, maxLines: 6
      });

      const lower = digital
        ? [renderState.coverMessage, renderState.senderName ? `WITH LOVE, ${renderState.senderName}` : renderState.recipientName ? `FOR ${renderState.recipientName.toUpperCase()}` : ''].filter(Boolean).join('\n')
        : (renderState.recipientName ? `${renderState.coverMessage}\n${renderState.recipientName}` : renderState.coverMessage);
      if (lower) {
        drawTextBlock(context, lower, {
          x: x + pad, y: y + height * (hasPhoto ? .78 : .70), width: width - pad * 2, height: height * (hasPhoto ? .13 : .15)
        }, {
          colour: (p.motif || renderState.preset) === 'photo' ? '#ffffff' : p.ink, family, startSize: width * .032, minSize: width * .022,
          weight: 600, lineHeight: 1.3, maxLines: 3
        });
      }
      if (renderState.textStyle === 'underline') {
        context.strokeStyle = p.accent; context.lineWidth = Math.max(3, width * .004);
        context.beginPath(); context.moveTo(x + width * .31, y + height * .64); context.lineTo(x + width * .69, y + height * .64); context.stroke();
      }
      drawLittleAccent(context, x, y, width, height, renderState, p);
    } else if (panel === 'inside-left') {
      if (renderState.insideLeftMode === 'photo' && photoImage) {
        const margin = width * .1;
        context.save();
        roundedRect(context, x + margin, y + margin, width - margin * 2, height - margin * 2, width * .04); context.clip();
        drawCoverImage(context, photoImage, x + margin, y + margin, width - margin * 2, height - margin * 2, renderState);
        context.restore();
      } else if (renderState.insideLeftMode === 'quote') {
        context.fillStyle = p.accent;
        context.textAlign = 'center'; context.font = `700 ${width * .08}px Georgia, serif`;
        context.fillText('“', x + width / 2, y + height * .27);
        drawTextBlock(context, renderState.insideLeftText, {
          x: x + pad, y: y + height * .33, width: width - pad * 2, height: height * .32
        }, { colour: p.ink, family, startSize: width * .05, minSize: width * .03, weight: 600, lineHeight: 1.3, maxLines: 7 });
      } else if (renderState.insideLeftMode === 'illustration') {
        context.fillStyle = hexToRgba(p.accent, .2);
        context.beginPath(); context.arc(x + width / 2, y + height * .43, width * .25, 0, Math.PI * 2); context.fill();
        drawLeafSprig(context, x + width * .27, y + height * .48, width * .48, p.accent, -.2);
        context.fillStyle = p.ink; context.textAlign = 'center'; context.font = `600 ${width * .036}px ${family}`;
        context.fillText('Made with care, just for you', x + width / 2, y + height * .72, width * .7);
      }
    } else if (panel === 'inside-right') {
      const greeting = renderState.recipientName ? `Dear ${renderState.recipientName},` : '';
      if (greeting) {
        context.fillStyle = p.ink; context.textAlign = 'left'; context.textBaseline = 'top';
        context.font = `600 ${width * .038}px ${family}`;
        context.fillText(greeting, x + pad, y + height * .16, width - pad * 2);
      }
      drawTextBlock(context, renderState.mainMessage, {
        x: x + pad, y: y + height * (greeting ? .23 : .15), width: width - pad * 2, height: height * .47
      }, { colour: p.ink, family, startSize: width * .048, minSize: width * .027, weight: 500, lineHeight: 1.42, maxLines: 11, align: 'left' });
      const sign = renderState.senderName ? `With warm wishes,\n${renderState.senderName}` : 'With warm wishes';
      drawTextBlock(context, sign, {
        x: x + pad, y: y + height * .72, width: width - pad * 2, height: height * .14
      }, { colour: p.ink, family, startSize: width * .038, minSize: width * .026, weight: 600, lineHeight: 1.35, maxLines: 3, align: 'left' });
    } else if (panel === 'back') {
      context.textAlign = 'center'; context.textBaseline = 'middle';
      context.fillStyle = p.ink; context.font = `600 ${width * .038}px ${family}`;
      context.fillText(renderState.backMessage || (renderState.recipientName ? `Created especially for ${renderState.recipientName}` : 'Created especially for someone special'), x + width / 2, y + height * .44, width * .7);
      if (renderState.showWebsite) {
        context.fillStyle = hexToRgba(p.ink, .65); context.font = `500 ${width * .025}px Arial, Helvetica, sans-serif`;
        context.fillText(document.documentElement.dataset.siteDomain || location.hostname, x + width / 2, y + height * .9, width * .75);
      }
    }

    context.restore();
  }

  function selectedFormat() {
    if (state.outputMode === 'single-print') {
      const selected = printSizes[state.singlePrintSize] || printSizes.A5;
      return { label: selected.label, shortLabel: selected.label.replace(' one-page PDF', ''), detail: `${selected.width} × ${selected.height} print pixels`, width: selected.width, height: selected.height, kind: 'single-print' };
    }
    if (state.outputMode === 'folded') {
      const folded = {
        A4: { label: 'A4 folded to A5', detail: 'two-page folded PDF' },
        A5: { label: 'A5 folded to A6', detail: 'two-page folded PDF' },
        Letter: { label: 'US Letter folded card', detail: 'two-page folded PDF' }
      }[state.printPaper] || { label: 'A4 folded to A5', detail: 'two-page folded PDF' };
      return { ...folded, shortLabel: folded.label, width: 1000, height: 1400, kind: 'folded' };
    }
    const selected = sizes[state.size] || sizes['instagram-square'];
    return { label: selected.label, shortLabel: selected.label, detail: `${selected.width} × ${selected.height} pixels`, width: selected.width, height: selected.height, kind: 'digital' };
  }

  function previewDimensions() {
    if (state.outputMode === 'single-print') {
      const selected = printSizes[state.singlePrintSize] || printSizes.A5;
      return { width: 1000, height: Math.round(1000 * selected.height / selected.width) };
    }
    if (state.outputMode === 'folded') return { width: 1000, height: 1400 };
    return sizes[state.size] || sizes['instagram-square'];
  }

  function fitPreviewCanvas() {
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const availableWidth = Math.max(1, wrap.clientWidth - 10);
    const availableHeight = Math.max(1, wrap.clientHeight - 10);
    const ratio = canvas.width / canvas.height;
    const availableRatio = availableWidth / availableHeight;
    if (availableRatio > ratio) {
      canvas.style.height = `${availableHeight}px`;
      canvas.style.width = `${Math.round(availableHeight * ratio)}px`;
    } else {
      canvas.style.width = `${availableWidth}px`;
      canvas.style.height = `${Math.round(availableWidth / ratio)}px`;
    }
  }

  function renderPreview() {
    const dimensions = previewDimensions();
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.style.aspectRatio = `${dimensions.width} / ${dimensions.height}`;
    drawPanel(ctx, 0, 0, canvas.width, canvas.height, state.activePanel, state, state.outputMode === 'folded');
    const draggablePhoto = Boolean(currentPhotoRegion());
    canvas.classList.toggle('photo-draggable', draggablePhoto);
    canvas.tabIndex = draggablePhoto ? 0 : -1;
    canvas.setAttribute('aria-label', draggablePhoto ? 'Live card preview. Drag the photo to reposition it, or use the arrow keys.' : 'Live preview of your personalised card');
    requestAnimationFrame(() => { fitPreviewCanvas(); syncFloatingPreview(); });
    const label = document.getElementById('previewCaption');
    if (label) {
      const panelLabels = { front: 'Front cover', 'inside-left': 'Inside left', 'inside-right': 'Inside message', back: 'Back cover' };
      label.textContent = `${panelLabels[state.activePanel]}. Live preview. Downloads use full resolution.`;
    }
  }

  function createPanelCanvas(panel, width, height, folded = false) {
    const output = document.createElement('canvas');
    output.width = width; output.height = height;
    drawPanel(output.getContext('2d'), 0, 0, width, height, panel, state, folded);
    return output;
  }

  async function canvasBlob(type = 'image/png', quality = .95) {
    const selected = sizes[state.size] || sizes['instagram-square'];
    const output = createPanelCanvas('front', selected.width, selected.height, false);
    return new Promise((resolve, reject) => output.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create image.')), type, quality));
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function filename(ext) {
    return `${slug(state.occasionLabel)}-${slug(state.recipientName || state.recipient)}-card.${ext}`;
  }

  async function openImage(type) {
    const blob = await canvasBlob(type, .94);
    window.CardPDF.downloadBlob(blob, filename(type === 'image/png' ? 'png' : 'jpg'));
    announce('Your card was downloaded.');
  }

  function canonicalAppUrl() {
    const configuredHost = document.documentElement.dataset.siteDomain;
    const base = configuredHost ? `https://${configuredHost}` : location.origin;
    const url = new URL('/app.html', base);
    url.searchParams.set('occasion', state.occasion);
    url.searchParams.set('tone', state.tone);
    return url.toString();
  }

  async function shareImage() {
    const blob = await canvasBlob('image/png');
    const file = new File([blob], filename('png'), { type: 'image/png' });
    const appUrl = canonicalAppUrl();
    const shareText = `Create your own personalised card: ${appUrl}`;
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${state.occasionLabel} card`,
        text: shareText,
        url: appUrl
      });
      try { await navigator.clipboard?.writeText(appUrl); } catch (_) {}
      announce('Card shared. The permanent card-maker link was also copied so you can paste it if the social app removes the caption.');
      return;
    }
    try {
      await navigator.clipboard.writeText(appUrl);
      announce('The permanent card-maker link was copied. The finished image will now open for saving.');
    } catch (_) {
      announce('The finished image will open for saving. Share the Card Maker Messages app link rather than the temporary image-tab address.');
    }
    window.CardPDF.openBlob(blob, filename('png'));
  }

  async function copyImage() {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      announce('Image copying is not supported in this browser.');
      return;
    }
    const blob = await canvasBlob('image/png');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    announce('Card image copied.');
  }

  async function createSinglePagePdf() {
    const selected = printSizes[state.singlePrintSize] || printSizes.A5;
    const output = createPanelCanvas('front', selected.width, selected.height, false);
    const pdf = await window.CardPDF.canvasesToPdf([output], selected.pdf);
    window.CardPDF.downloadBlob(pdf, filename('pdf'));
    announce(`${selected.label} was downloaded.`);
  }

  async function createFoldedPdf() {
    const specs = {
      A4: { pageWidth: 3508, pageHeight: 2480, pdf: 'A4' },
      A5: { pageWidth: 2480, pageHeight: 1748, pdf: 'A5L' },
      Letter: { pageWidth: 3300, pageHeight: 2550, pdf: 'LETTER' }
    };
    const spec = specs[state.printPaper] || specs.A4;
    const { pageWidth, pageHeight } = spec;
    const margin = state.printQuality === 'shop' ? 35 : 120;
    const half = pageWidth / 2;
    const panelWidth = half - margin * 2;
    const panelHeight = pageHeight - margin * 2;
    const outside = document.createElement('canvas');
    const inside = document.createElement('canvas');
    outside.width = inside.width = pageWidth;
    outside.height = inside.height = pageHeight;
    const outCtx = outside.getContext('2d');
    const inCtx = inside.getContext('2d');
    [outCtx, inCtx].forEach(context => { context.fillStyle = '#ffffff'; context.fillRect(0, 0, pageWidth, pageHeight); });

    drawPanel(outCtx, margin, margin, panelWidth, panelHeight, 'back', state, true);
    drawPanel(outCtx, half + margin, margin, panelWidth, panelHeight, 'front', state, true);
    drawPanel(inCtx, margin, margin, panelWidth, panelHeight, 'inside-left', state, true);
    drawPanel(inCtx, half + margin, margin, panelWidth, panelHeight, 'inside-right', state, true);

    if (state.showFoldMarks && state.printQuality === 'home') {
      [outCtx, inCtx].forEach(context => {
        context.save();
        context.strokeStyle = '#777777'; context.lineWidth = 2; context.setLineDash([18, 16]);
        context.beginPath(); context.moveTo(half, 30); context.lineTo(half, 120); context.moveTo(half, pageHeight - 120); context.lineTo(half, pageHeight - 30); context.stroke();
        context.restore();
      });
    }

    const pdf = await window.CardPDF.canvasesToPdf([outside, inside], spec.pdf);
    window.CardPDF.downloadBlob(pdf, filename('pdf'));
    announce('Your folded card PDF was downloaded.');
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(state.mainMessage);
    announce('Message copied.');
  }

  async function shareLink() {
    const appUrl = canonicalAppUrl();
    const shareData = { title: `${state.occasionLabel} card maker`, text: 'Create a personalised card for free.', url: appUrl };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(appUrl);
      announce('Permanent card-maker link copied.');
    }
  }

  function surprise() {
    const keys = Object.keys(presets);
    const choices = keys.filter(key => key !== state.preset);
    const preset = choices[Math.floor(Math.random() * choices.length)];
    const chosen = presets[preset] || presets.floral;
    updateState({ preset, frame: chosen.frame || 'classic', illustration: chosen.illustration || 'none', accent: chosen.accentChoice || 'sparkles', textStyle: chosen.textStyle || 'clean', font: chosen.font, background: '', textColour: '' });
    announce(`Applied ${presets[preset].label}.`);
  }

  function loadPhoto(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      announce('Please choose an image file.'); return;
    }
    if (file.size > 12 * 1024 * 1024) {
      announce('Please choose a photo smaller than 12 MB.'); return;
    }
    announce('Adding your photo…');
    const reader = new FileReader();
    reader.onload = () => {
      const source = new Image();
      source.onload = () => {
        const maxEdge = 2200;
        const scale = Math.min(1, maxEdge / Math.max(source.naturalWidth, source.naturalHeight));
        const reduced = document.createElement('canvas');
        reduced.width = Math.max(1, Math.round(source.naturalWidth * scale));
        reduced.height = Math.max(1, Math.round(source.naturalHeight * scale));
        reduced.getContext('2d').drawImage(source, 0, 0, reduced.width, reduced.height);
        const photoData = reduced.toDataURL('image/jpeg', 0.9);
        state.photoData = photoData;
        state.photoX = 0.5;
        state.photoY = 0.5;
        state.photoZoom = 1.08;
        state.activePanel = 'front';
        state.reviewed = false;
        photoImage = new Image();
        photoImage.onload = () => {
          persist();
          syncControls();
          queueRender();
          canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
          announce('Photo added at the top of the card. Drag it in the preview to reposition it.');
        };
        photoImage.src = photoData;
      };
      source.onerror = () => announce('This image could not be opened. Please choose another photo.');
      source.src = String(reader.result);
    };
    reader.onerror = () => announce('This image could not be read. Please try again.');
    reader.readAsDataURL(file);
  }

  function restorePhoto() {
    if (!state.photoData) return;
    photoImage = new Image();
    photoImage.onload = queueRender;
    photoImage.src = state.photoData;
  }

  function renderReviewModal() {
    const format = selectedFormat();
    const summary = document.getElementById('reviewFormatSummary');
    const singleWrap = document.getElementById('reviewSingleWrap');
    const foldedWrap = document.getElementById('reviewFoldedWrap');
    if (summary) summary.textContent = `Reviewing: ${format.label} · ${format.detail}`;
    const reviewFigureCaption = document.getElementById('reviewFigureCaption');
    if (reviewFigureCaption) reviewFigureCaption.textContent = `${format.label} · ${format.detail}`;

    if (format.kind === 'folded') {
      if (singleWrap) singleWrap.hidden = true;
      if (foldedWrap) foldedWrap.hidden = false;
      document.querySelectorAll('[data-review-sheet]').forEach(canvasEl => {
        const sheet = canvasEl.dataset.reviewSheet;
        const width = 1400;
        const height = 980;
        canvasEl.width = width;
        canvasEl.height = height;
        canvasEl.style.aspectRatio = `${width} / ${height}`;
        const sheetCtx = canvasEl.getContext('2d');
        sheetCtx.clearRect(0, 0, width, height);
        if (sheet === 'outside') {
          drawPanel(sheetCtx, 0, 0, width / 2, height, 'back', state, true);
          drawPanel(sheetCtx, width / 2, 0, width / 2, height, 'front', state, true);
        } else {
          drawPanel(sheetCtx, 0, 0, width / 2, height, 'inside-left', state, true);
          drawPanel(sheetCtx, width / 2, 0, width / 2, height, 'inside-right', state, true);
        }
        sheetCtx.save();
        sheetCtx.setLineDash([18, 14]);
        sheetCtx.strokeStyle = 'rgba(39, 48, 58, .62)';
        sheetCtx.lineWidth = 4;
        sheetCtx.beginPath();
        sheetCtx.moveTo(width / 2, 0);
        sheetCtx.lineTo(width / 2, height);
        sheetCtx.stroke();
        sheetCtx.setLineDash([]);
        sheetCtx.fillStyle = 'rgba(255,255,255,.9)';
        sheetCtx.fillRect(width / 2 - 72, 12, 144, 38);
        sheetCtx.fillStyle = '#26313a';
        sheetCtx.font = '700 22px Arial';
        sheetCtx.textAlign = 'center';
        sheetCtx.fillText('FOLD LINE', width / 2, 39);
        sheetCtx.restore();
      });
    } else {
      if (singleWrap) singleWrap.hidden = false;
      if (foldedWrap) foldedWrap.hidden = true;
      const canvasEl = document.querySelector('[data-review-single]');
      if (canvasEl) {
        const ratio = format.width / format.height;
        const maxWidth = 900;
        const width = ratio >= 1 ? maxWidth : Math.round(700 * ratio);
        const height = ratio >= 1 ? Math.round(maxWidth / ratio) : 700;
        canvasEl.width = Math.max(420, width);
        canvasEl.height = Math.max(420, height);
        canvasEl.style.aspectRatio = `${format.width} / ${format.height}`;
        drawPanel(canvasEl.getContext('2d'), 0, 0, canvasEl.width, canvasEl.height, 'front', state, false);
      }
    }
  }

  function openReview() {
    // Review is a fixed overlay. It must never leave the user near the FAQ or footer.
    if (!state.sizeSelected) {
      updateState({ step: 4, reviewed: false }, { persist: false });
      announce('Please go back and select a size before reviewing your card.');
      window.setTimeout(scrollToWorkspace, 40);
      return;
    }
    state.step = 4;
    state.reviewed = false;
    syncControls();
    renderReviewModal();
    const modal = document.getElementById('reviewModal');
    if (!modal) return;
    modal.hidden = false;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.scrollTop = 0;
    window.requestAnimationFrame(() => {
      const dialog = modal.querySelector('.review-modal');
      if (dialog) dialog.scrollTop = 0;
      document.getElementById('reviewTitle')?.focus({ preventScroll: true });
    });
  }

  function closeReview() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
  }

  async function withUsageGate(action) {
    const access = window.CardMakerSignup;
    if (access && !access.isUnlocked()) {
      const current = Number(Store.load().usageCount || 0);
      if (current >= 3) { access.open('You have used your three free exports. Sign up free to keep creating.'); return; }
      Store.save({ usageCount: current + 1 });
    }
    await action();
  }

  function scrollToWorkspace() {
    const tabs = document.querySelector('.step-tabs');
    const panel = document.querySelector(`[data-step-panel="${state.step}"]`);
    const target = tabs || panel || document.getElementById('cardMakerWorkspace');
    if (!target) return;
    window.requestAnimationFrame(() => {
      const header = document.querySelector('.site-header');
      const offset = (header?.offsetHeight || 0) + 10;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({ top, behavior: 'smooth' });
      window.setTimeout(() => {
        const heading = panel?.querySelector('h2');
        if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
      }, 420);
    });
  }

  function goToStep(step) {
    const target = Math.max(1, Math.min(5, Number(step) || 1));
    if (target > 2 && !state.sizeSelected) {
      updateState({ step: 2, reviewed: false });
      announce('Please select a size before continuing.');
      scrollToWorkspace();
      window.setTimeout(() => document.getElementById('selectedFormatSummary')?.focus?.(), 80);
      return;
    }
    updateState({ step: target });
    scrollToWorkspace();
  }

  function openSocialLink(network) {
    const cleanUrl = canonicalAppUrl();
    const url = encodeURIComponent(cleanUrl);
    const text = encodeURIComponent(`${state.mainMessage}

Create your own card: ${cleanUrl}`);
    const targets = {
      whatsapp: `https://wa.me/?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?url=${url}&description=${encodeURIComponent(state.mainMessage)}`,
      email: `mailto:?subject=${encodeURIComponent(`${state.occasionLabel} card`)}&body=${text}`
    };
    if (targets[network]) window.open(targets[network], '_blank', 'noopener,noreferrer');
  }

  function syncFloatingPreview() {
    const floating = document.getElementById('floatingCardCanvas');
    if (!floating || !canvas.width || !canvas.height) return;
    floating.width = canvas.width;
    floating.height = canvas.height;
    floating.style.aspectRatio = `${canvas.width} / ${canvas.height}`;
    const fctx = floating.getContext('2d');
    fctx.clearRect(0, 0, floating.width, floating.height);
    fctx.drawImage(canvas, 0, 0);
  }

  function initFloatingPreview() {
    const dock = document.getElementById('floatingPreviewDock');
    const workspace = document.getElementById('cardMakerWorkspace');
    if (!dock || !workspace) return;
    const update = () => {
      if (document.body.classList.contains('modal-open')) { dock.hidden = true; return; }
      const rect = workspace.getBoundingClientRect();
      // The main preview is sticky while the editor is on screen. Once the editor has
      // passed, keep a compact live preview visible through the related links and footer.
      const belowEditor = rect.bottom < 110;
      dock.hidden = !belowEditor;
      if (!dock.hidden) syncFloatingPreview();
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function initControls() {
    const recipientSelect = document.getElementById('recipientSelect');
    DATA.recipients.forEach(recipient => {
      const option = document.createElement('option'); option.value = recipient; option.textContent = recipient; recipientSelect.appendChild(option);
    });

    document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => goToStep(Number(button.dataset.step))));
    document.querySelectorAll('[data-jump-step]').forEach(button => button.addEventListener('click', () => goToStep(Number(button.dataset.jumpStep))));
    document.querySelectorAll('[data-creation-type]').forEach(button => button.addEventListener('click', () => {
      const creationType = button.dataset.creationType;
      const defaults = { card: 'birthday', invitation: 'birthday-invitation', postcard: 'postcard' };
      const occasion = defaults[creationType];
      state.creationType = creationType;
      state.occasion = occasion;
      state.occasionLabel = occasion === 'custom' ? (state.customOccasion.trim() || 'Custom Occasion') : DATA.occasions[occasion].label;
      state.coverMessage = defaultCover(occasion);
      state.frontMessage = defaultFrontMessage(occasion);
      state.frontHeading = DATA.occasions[occasion]?.front || DATA.occasions[occasion]?.label || 'For You';
      state.reviewed = false;
      if (creationType === 'postcard') state.size = 'landscape';
      generateMessages(); syncControls();
    }));
    document.querySelectorAll('[data-next-step]').forEach(button => button.addEventListener('click', () => goToStep(state.step + 1)));
    document.querySelectorAll('[data-prev-step]').forEach(button => button.addEventListener('click', () => goToStep(state.step - 1)));
    document.querySelectorAll('[data-occasion]').forEach(button => button.addEventListener('click', () => {
      const occasion = button.dataset.occasion;
      state.creationType = button.dataset.kind || state.creationType;
      state.occasion = occasion;
      state.occasionLabel = occasion === 'custom' ? (state.customOccasion.trim() || 'Custom Occasion') : DATA.occasions[occasion].label;
      state.coverMessage = defaultCover(occasion);
      state.frontMessage = defaultFrontMessage(occasion);
      state.frontHeading = DATA.occasions[occasion]?.front || (occasion === 'custom' ? 'For Your Special Occasion' : DATA.occasions[occasion]?.label) || 'For You';
      state.reviewed = false;
      const eventTitles = { 'birthday-invitation': 'A Birthday Celebration', 'party-invitation': 'A Special Celebration', 'wedding-invitation': 'Our Wedding Celebration', 'christmas-invitation': 'A Christmas Gathering' };
      if (eventTitles[occasion]) state.eventTitle = eventTitles[occasion];
      generateMessages(); syncControls();
    }));
    document.querySelectorAll('[data-tone]').forEach(button => button.addEventListener('click', () => { state.tone = button.dataset.tone; generateMessages(); syncControls(); }));
    document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => { const chosen = presets[button.dataset.preset] || presets.floral; updateState({ preset: button.dataset.preset, background: '', textColour: '', font: chosen.font, frame: chosen.frame || state.frame, illustration: chosen.illustration || 'none', accent: chosen.accentChoice || state.accent, textStyle: chosen.textStyle || state.textStyle }); }));
    document.querySelectorAll('[data-frame]').forEach(button => button.addEventListener('click', () => updateState({ frame: button.dataset.frame })));
    document.querySelectorAll('[data-illustration]').forEach(button => button.addEventListener('click', () => updateState({ illustration: button.dataset.illustration })));
    document.querySelectorAll('[data-accent]').forEach(button => button.addEventListener('click', () => updateState({ accent: button.dataset.accent })));
    document.querySelectorAll('[data-text-style]').forEach(button => button.addEventListener('click', () => updateState({ textStyle: button.dataset.textStyle })));
    document.querySelectorAll('[data-background]').forEach(button => button.addEventListener('click', () => updateState({ background: button.dataset.background })));
    document.querySelectorAll('[data-inside-left]').forEach(button => button.addEventListener('click', () => updateState({ insideLeftMode: button.dataset.insideLeft })));
    document.querySelectorAll('[data-inside-paper]').forEach(button => button.addEventListener('click', () => updateState({ insidePaper: button.dataset.insidePaper })));
    document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => updateState({ activePanel: button.dataset.panel })));
    document.querySelectorAll('[data-output-mode]').forEach(button => button.addEventListener('click', () => updateState({ outputMode: button.dataset.outputMode, activePanel: 'front', reviewed: false, sizeSelected: false })));
    document.querySelectorAll('[data-single-print-size]').forEach(button => button.addEventListener('click', () => updateState({ singlePrintSize: button.dataset.singlePrintSize, sizeSelected: true })));
    document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => updateState({ size: button.dataset.size, sizeSelected: true })));
    document.querySelectorAll('[data-paper]').forEach(button => button.addEventListener('click', () => updateState({ printPaper: button.dataset.paper, sizeSelected: true })));
    document.querySelectorAll('[data-print-quality]').forEach(button => button.addEventListener('click', () => updateState({ printQuality: button.dataset.printQuality })));
    document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-font]').forEach(item => item.classList.remove('active'));
      button.classList.add('active'); updateState({ font: button.dataset.font });
    }));

    const bindings = {
      recipientSelect: 'recipient', customOccasion: 'customOccasion', recipientName: 'recipientName', senderName: 'senderName', personalNote: 'personalNote',
      eventTitle: 'eventTitle', eventDate: 'eventDate', eventTime: 'eventTime', eventVenue: 'eventVenue', eventRsvp: 'eventRsvp', eventHost: 'eventHost',
      mainMessage: 'mainMessage', frontHeading: 'frontHeading', frontMessage: 'frontMessage', coverMessage: 'coverMessage', backMessage: 'backMessage', insideLeftText: 'insideLeftText',
      backgroundPicker: 'background', textColourPicker: 'textColour'
    };
    Object.entries(bindings).forEach(([id, key]) => {
      document.getElementById(id)?.addEventListener('input', event => {
        const patch = { [key]: event.target.value };
        if (key === 'customOccasion') {
          patch.occasionLabel = event.target.value.trim() || 'Custom Occasion';
          patch.coverMessage = event.target.value.trim() ? `Celebrating ${event.target.value.trim()}` : 'Made especially for this occasion';
          patch.frontMessage = event.target.value.trim() ? `A special message for ${event.target.value.trim()}.` : defaultFrontMessage('custom');
          patch.frontHeading = event.target.value.trim() || 'For Your Special Occasion';
        }
        updateState(patch);
      });
    });

    document.getElementById('generateMessages')?.addEventListener('click', () => {
      const panel = document.getElementById('messageOptionsPanel');
      const button = document.getElementById('generateMessages');
      if (!panel || !button) return;
      const opening = panel.hidden;
      panel.hidden = !opening;
      button.textContent = opening ? 'Hide message choices' : 'Show message choices';
      button.setAttribute('aria-expanded', String(opening));
      if (opening) {
        generateMessages(false);
        window.setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    });
    document.getElementById('photoInput')?.addEventListener('change', event => loadPhoto(event.target.files?.[0]));
    document.getElementById('removePhoto')?.addEventListener('click', () => {
      photoImage = null;
      const input = document.getElementById('photoInput');
      if (input) input.value = '';
      updateState({ photoData: '', photoX: 0.5, photoY: 0.5, photoZoom: 1.08 });
      announce('Photo removed.');
    });
    document.getElementById('photoZoom')?.addEventListener('input', event => updateState({ photoZoom: Number(event.target.value) }, { persist: false }));
    document.getElementById('photoZoom')?.addEventListener('change', event => { state.photoZoom = Number(event.target.value); persist(); queueRender(); });
    document.getElementById('centrePhoto')?.addEventListener('click', () => {
      updateState({ photoX: 0.5, photoY: 0.5, photoZoom: 1.08 });
      announce('Photo centred.');
    });
    const nudgePhoto = (direction, amount = 0.04) => {
      if (!photoImage) return;
      const patch = {};
      if (direction === 'left') patch.photoX = clamp((Number(state.photoX) || 0.5) - amount, 0, 1);
      if (direction === 'right') patch.photoX = clamp((Number(state.photoX) || 0.5) + amount, 0, 1);
      if (direction === 'up') patch.photoY = clamp((Number(state.photoY) || 0.5) - amount, 0, 1);
      if (direction === 'down') patch.photoY = clamp((Number(state.photoY) || 0.5) + amount, 0, 1);
      updateState(patch);
      announce(`Photo moved ${direction}.`);
    };
    document.querySelectorAll('[data-photo-nudge]').forEach(button => button.addEventListener('click', () => nudgePhoto(button.dataset.photoNudge)));

    let photoDrag = null;
    const canvasPoint = event => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * canvas.width / Math.max(1, rect.width),
        y: (event.clientY - rect.top) * canvas.height / Math.max(1, rect.height)
      };
    };
    canvas.addEventListener('pointerdown', event => {
      const region = currentPhotoRegion();
      if (!region) return;
      const point = canvasPoint(event);
      if (point.x < region.x || point.x > region.x + region.width || point.y < region.y || point.y > region.y + region.height) return;
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      photoDrag = { pointerId: event.pointerId, point, region };
      canvas.classList.add('is-dragging-photo');
      announce('Move the photo, then release to keep its position.');
    });
    canvas.addEventListener('pointermove', event => {
      if (!photoDrag || photoDrag.pointerId !== event.pointerId || !photoImage) return;
      event.preventDefault();
      const point = canvasPoint(event);
      const dx = point.x - photoDrag.point.x;
      const dy = point.y - photoDrag.point.y;
      const metrics = positionedImageMetrics(photoImage, photoDrag.region.width, photoDrag.region.height, state);
      if (metrics.overflowX > 0.5) state.photoX = clamp((Number(state.photoX) || 0.5) - dx / metrics.overflowX, 0, 1);
      if (metrics.overflowY > 0.5) state.photoY = clamp((Number(state.photoY) || 0.5) - dy / metrics.overflowY, 0, 1);
      state.reviewed = false;
      photoDrag.point = point;
      queueRender();
    });
    const finishPhotoDrag = event => {
      if (!photoDrag || (event.pointerId != null && photoDrag.pointerId !== event.pointerId)) return;
      canvas.releasePointerCapture?.(photoDrag.pointerId);
      photoDrag = null;
      canvas.classList.remove('is-dragging-photo');
      persist();
      announce('Photo position saved.');
    };
    canvas.addEventListener('pointerup', finishPhotoDrag);
    canvas.addEventListener('pointercancel', finishPhotoDrag);
    canvas.addEventListener('dblclick', () => {
      if (!currentPhotoRegion()) return;
      updateState({ photoX: 0.5, photoY: 0.5, photoZoom: 1.08 });
      announce('Photo centred.');
    });
    canvas.addEventListener('keydown', event => {
      if (!currentPhotoRegion()) return;
      const direction = ({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' })[event.key];
      if (!direction) return;
      event.preventDefault();
      nudgePhoto(direction, event.shiftKey ? 0.1 : 0.025);
    });
    document.getElementById('surpriseDesign')?.addEventListener('click', surprise);
    document.getElementById('downloadPng')?.addEventListener('click', () => withUsageGate(() => openImage('image/png')).catch(handleError));
    document.getElementById('downloadJpg')?.addEventListener('click', () => withUsageGate(() => openImage('image/jpeg')).catch(handleError));
    document.getElementById('downloadSinglePdf')?.addEventListener('click', () => withUsageGate(createSinglePagePdf).catch(handleError));
    document.getElementById('downloadPdf')?.addEventListener('click', () => withUsageGate(createFoldedPdf).catch(handleError));
    document.getElementById('shareImage')?.addEventListener('click', () => withUsageGate(shareImage).catch(handleError));
    document.getElementById('shareLink')?.addEventListener('click', () => shareLink().catch(handleError));
    document.getElementById('copyImage')?.addEventListener('click', () => copyImage().catch(handleError));
    document.getElementById('copyMessage')?.addEventListener('click', () => copyMessage().catch(handleError));
    document.getElementById('whatsappShare')?.addEventListener('click', () => openSocialLink('whatsapp'));
    document.getElementById('facebookShare')?.addEventListener('click', () => openSocialLink('facebook'));
    document.getElementById('linkedinShare')?.addEventListener('click', () => openSocialLink('linkedin'));
    document.getElementById('xShare')?.addEventListener('click', () => openSocialLink('x'));
    document.getElementById('pinterestShare')?.addEventListener('click', () => openSocialLink('pinterest'));
    document.getElementById('emailShare')?.addEventListener('click', () => openSocialLink('email'));
    const resetCard = () => {
      if (!confirm('Start again and clear the current card?')) return;
      state = { ...defaultState };
      photoImage = null;
      generateMessages(); syncControls(); queueRender(); announce('Started a new card.');
    };
    document.getElementById('startAgain')?.addEventListener('click', resetCard);
    document.getElementById('startAgainBottom')?.addEventListener('click', resetCard);
    document.getElementById('reviewCard')?.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); openReview(); });
    document.getElementById('chooseSizeFromReview')?.addEventListener('click', () => { updateState({ step: 2, reviewed: false }); scrollToWorkspace(); });
    document.getElementById('closeReview')?.addEventListener('click', closeReview);
    document.getElementById('editFromReview')?.addEventListener('click', () => { updateState({ reviewed: false, step: 2 }); closeReview(); scrollToWorkspace(); });
    document.getElementById('reviewEditWords')?.addEventListener('click', () => { updateState({ reviewed: false, step: 1 }); closeReview(); scrollToWorkspace(); });
    document.getElementById('reviewChangeDesign')?.addEventListener('click', () => { updateState({ reviewed: false, step: 3 }); closeReview(); scrollToWorkspace(); });
    document.getElementById('reviewContinueHint')?.addEventListener('click', openReview);
    document.getElementById('continueFromReview')?.addEventListener('click', () => { updateState({ reviewed: true, step: 5 }); closeReview(); window.setTimeout(scrollToWorkspace, 60); });
    document.getElementById('reviewModal')?.addEventListener('click', event => { if (event.target.id === 'reviewModal') closeReview(); });
    document.getElementById('showWebsite')?.addEventListener('change', event => updateState({ showWebsite: event.target.checked }));
    document.getElementById('showFoldMarks')?.addEventListener('change', event => updateState({ showFoldMarks: event.target.checked }));
  }

  function handleError(error) {
    console.error(error);
    announce(error?.message || 'Something went wrong. Please try again.');
  }

  function init() {
    if (legacySizeMap[state.size]) state.size = legacySizeMap[state.size];
    if (!sizes[state.size]) state.size = 'instagram-square';
    queryDefaults();
    initControls();
    restorePhoto();
    const hasSaved = Boolean(Store.load().app?.savedAt);
    if (hasSaved) {
      const notice = document.getElementById('resumeNotice');
      if (notice) notice.hidden = false;
    }
    if (!state.frontHeading) state.frontHeading = DATA.occasions[state.occasion]?.front || state.occasionLabel || 'For You';
    if (!state.frontMessage) state.frontMessage = defaultFrontMessage(state.occasion);
    generateMessages(false);
    syncControls();
    queueRender();
    initFloatingPreview();
    window.setInterval(persist, 5000);
    window.addEventListener('pagehide', persist);
    window.addEventListener('resize', () => requestAnimationFrame(fitPreviewCanvas), { passive: true });
  }

  init();
})();
