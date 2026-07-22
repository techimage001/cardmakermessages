(() => {
  'use strict';

  const DATA = window.CardMessageData;
  const Store = window.CardMakerStore;
  const canvas = document.getElementById('cardCanvas');
  const ctx = canvas.getContext('2d');
  const live = document.getElementById('appLiveRegion');

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
    cute: { label: 'Cute illustrated', bg: '#ffe8e2', ink: '#5b3851', accent: '#e88975', soft: '#f8bf9e', font: 'sans' }
  };

  const sizes = {
    square: { label: 'Square card', width: 1200, height: 1200 },
    portrait: { label: 'Portrait card', width: 1080, height: 1350 },
    landscape: { label: 'Landscape card', width: 1600, height: 900 },
    story: { label: 'Story', width: 1080, height: 1920 },
    pinterest: { label: 'Pinterest pin', width: 1000, height: 1500 }
  };

  const defaultState = {
    step: 1,
    creationType: 'card',
    occasion: 'birthday',
    occasionLabel: 'Birthday',
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
    coverMessage: 'Wishing you a wonderful day',
    insideLeftMode: 'blank',
    insideLeftText: 'A little note, made especially for you.',
    preset: 'floral',
    background: '',
    textColour: '',
    font: 'serif',
    frame: 'classic',
    illustration: 'auto',
    accent: 'sparkles',
    photoData: '',
    activePanel: 'front',
    outputMode: 'digital',
    size: 'square',
    printPaper: 'A4',
    printQuality: 'home',
    showFoldMarks: true,
    showWebsite: true,
    savedAt: 0
  };

  let state = { ...defaultState, ...(Store.load().app || {}) };
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
    state = { ...state, ...patch };
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
    if (sizes[size]) patch.size = size;
    if (occasion && DATA.occasions[occasion]) {
      patch.occasion = occasion;
      patch.occasionLabel = DATA.occasions[occasion].label;
      patch.coverMessage = defaultCover(occasion);
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
      'mothers-day': 'With love and gratitude', 'birthday-invitation': 'You’re invited', 'party-invitation': 'Let’s celebrate',
      'wedding-invitation': 'Together with joy', 'christmas-invitation': 'A festive invitation', postcard: 'A little note from me'
    };
    return cover[occasion] || 'Made especially for you';
  }

  function generateMessages(selectFirst = true) {
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
    document.querySelectorAll('[data-inside-left]').forEach(button => {
      const active = button.dataset.insideLeft === state.insideLeftMode;
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
      const active = button.dataset.size === state.size;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-paper]').forEach(button => {
      const active = button.dataset.paper === state.printPaper;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-print-quality]').forEach(button => {
      const active = button.dataset.printQuality === state.printQuality;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const digitalOptions = document.getElementById('digitalOptions');
    const printOptions = document.getElementById('printOptions');
    if (digitalOptions) digitalOptions.hidden = state.outputMode !== 'digital';
    if (printOptions) printOptions.hidden = state.outputMode !== 'print';
    const inputs = {
      recipientSelect: state.recipient,
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
      coverMessage: state.coverMessage,
      insideLeftText: state.insideLeftText,
      backgroundPicker: state.background || presets[state.preset].bg,
      textColourPicker: state.textColour || presets[state.preset].ink
    };
    Object.entries(inputs).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input && input.value !== value) input.value = value;
    });
    const invitationDetails = document.getElementById('invitationDetails');
    if (invitationDetails) invitationDetails.hidden = state.creationType !== 'invitation';
    const mainLabel = document.querySelector('label[for="mainMessage"]');
    if (mainLabel) mainLabel.textContent = state.creationType === 'invitation' ? 'Invitation wording' : state.creationType === 'postcard' ? 'Postcard message' : 'Your final message';
    const website = document.getElementById('showWebsite');
    const marks = document.getElementById('showFoldMarks');
    if (website) website.checked = state.showWebsite;
    if (marks) marks.checked = state.showFoldMarks;
    const summary = document.getElementById('downloadSummary');
    if (summary) {
      summary.textContent = state.outputMode === 'print'
        ? `${state.printPaper === 'A4' ? 'A4 folded to A5' : 'US Letter folded card'}, two-page PDF`
        : `${sizes[state.size].label}, high-resolution image`;
    }
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

    if (renderState.preset === 'floral') {
      drawLeafSprig(context, x + width * .08, y + height * .1, width * .16, p.accent, -0.4);
      drawLeafSprig(context, x + width * .9, y + height * .88, width * .18, p.accent, 2.7);
      context.strokeStyle = hexToRgba(p.accent, .24);
      context.lineWidth = Math.max(3, width * .005);
      context.beginPath(); context.arc(x + width * .08, y + height * .08, width * .17, 0, Math.PI * 2); context.stroke();
    } else if (renderState.preset === 'minimal') {
      context.fillStyle = hexToRgba(p.accent, .16);
      context.fillRect(x, y, width, height * .035);
      context.fillRect(x, y + height * .965, width, height * .035);
      context.strokeStyle = p.accent;
      context.lineWidth = Math.max(2, width * .003);
      context.beginPath(); context.moveTo(x + width * .12, y + height * .2); context.lineTo(x + width * .88, y + height * .2); context.stroke();
    } else if (renderState.preset === 'photo') {
      if (photoImage) {
        drawCoverImage(context, photoImage, x, y, width, height);
        const grad = context.createLinearGradient(x, y, x, y + height);
        grad.addColorStop(0, 'rgba(0,0,0,.08)');
        grad.addColorStop(.55, 'rgba(0,0,0,.35)');
        grad.addColorStop(1, 'rgba(0,0,0,.75)');
        context.fillStyle = grad; context.fillRect(x, y, width, height);
      } else {
        const grad = context.createLinearGradient(x, y, x + width, y + height);
        grad.addColorStop(0, p.bg); grad.addColorStop(1, '#71808b');
        context.fillStyle = grad; context.fillRect(x, y, width, height);
        context.fillStyle = 'rgba(255,255,255,.11)';
        for (let i = 0; i < 8; i += 1) {
          context.beginPath(); context.arc(x + width * (0.1 + i * .13), y + height * (.18 + (i % 3) * .25), width * .06, 0, Math.PI * 2); context.fill();
        }
      }
    } else if (renderState.preset === 'bold') {
      drawConfetti(context, x, y, width, height, p.accent, p.soft);
      context.fillStyle = 'rgba(255,255,255,.11)';
      context.beginPath(); context.arc(x + width * .12, y + height * .2, width * .18, 0, Math.PI * 2); context.fill();
      context.beginPath(); context.arc(x + width * .92, y + height * .82, width * .24, 0, Math.PI * 2); context.fill();
    } else if (renderState.preset === 'luxury') {
      const grad = context.createRadialGradient(x + width * .3, y + height * .2, 0, x + width * .5, y + height * .5, width);
      grad.addColorStop(0, '#303649'); grad.addColorStop(1, p.bg);
      context.fillStyle = grad; context.fillRect(x, y, width, height);
      context.strokeStyle = p.accent; context.lineWidth = Math.max(2, width * .003);
      context.strokeRect(x + width * .06, y + height * .045, width * .88, height * .91);
      context.strokeRect(x + width * .075, y + height * .06, width * .85, height * .88);
    } else if (renderState.preset === 'playful') {
      const colours = [p.accent, p.soft, '#8da5e5', '#f7c45d'];
      [[.12,.12,.15],[.87,.16,.12],[.13,.86,.12],[.88,.84,.18]].forEach((item, index) => {
        context.fillStyle = hexToRgba(colours[index], .75);
        context.beginPath(); context.arc(x + width * item[0], y + height * item[1], width * item[2], 0, Math.PI * 2); context.fill();
      });
    } else if (renderState.preset === 'festive') {
      drawPine(context, x + width * .08, y + height * .06, width * .38, p.soft);
      drawPine(context, x + width * .92, y + height * .93, width * .4, p.soft, Math.PI);
      context.fillStyle = 'rgba(255,255,255,.7)';
      for (let i = 0; i < 45; i += 1) {
        const px = x + ((i * 73) % 997) / 997 * width;
        const py = y + ((i * 151) % 991) / 991 * height;
        context.beginPath(); context.arc(px, py, Math.max(1.5, width * .0025), 0, Math.PI * 2); context.fill();
      }
    } else if (renderState.preset === 'peaceful') {
      const grad = context.createLinearGradient(x, y, x, y + height);
      grad.addColorStop(0, '#dfecef'); grad.addColorStop(.55, p.bg); grad.addColorStop(1, '#f7efe3');
      context.fillStyle = grad; context.fillRect(x, y, width, height);
      context.strokeStyle = hexToRgba(p.accent, .35); context.lineWidth = width * .015;
      context.beginPath(); context.arc(x + width * .5, y + height * .15, width * .22, Math.PI, Math.PI * 2); context.stroke();
      context.fillStyle = hexToRgba(p.soft, .3); context.beginPath(); context.arc(x + width * .5, y + height * 1.02, width * .65, Math.PI, Math.PI * 2); context.fill();
    } else if (renderState.preset === 'botanical') {
      drawLeafSprig(context, x + width * .07, y + height * .15, width * .24, p.ink, -.2);
      drawLeafSprig(context, x + width * .93, y + height * .83, width * .28, p.ink, 2.9);
      context.fillStyle = hexToRgba(p.accent, .16); context.fillRect(x + width * .05, y + height * .05, width * .9, height * .9);
      context.fillStyle = p.bg; context.fillRect(x + width * .065, y + height * .065, width * .87, height * .87);
    } else if (renderState.preset === 'cute') {
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

  function drawCoverImage(context, image, x, y, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sw = width / scale;
    const sh = height / scale;
    const sx = (image.naturalWidth - sw) / 2;
    const sy = (image.naturalHeight - sh) / 2;
    context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
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

  function drawFrame(context, x, y, width, height, renderState, p) {
    if (renderState.frame === 'none') return;
    context.save();
    const margin = width * .045;
    context.strokeStyle = hexToRgba(p.accent, renderState.frame === 'soft' ? .45 : .85);
    context.lineWidth = Math.max(2, width * (renderState.frame === 'double' ? .004 : .003));
    if (renderState.frame === 'arch') {
      roundedRect(context, x + margin, y + margin, width - margin * 2, height - margin * 2, width * .18); context.stroke();
    } else {
      roundedRect(context, x + margin, y + margin, width - margin * 2, height - margin * 2, width * .02); context.stroke();
      if (renderState.frame === 'double') {
        const inner = margin * 1.35;
        roundedRect(context, x + inner, y + inner, width - inner * 2, height - inner * 2, width * .018); context.stroke();
      }
    }
    context.restore();
  }

  function drawPhotoMedallion(context, x, y, width, height, renderState, p) {
    if (!photoImage || renderState.preset === 'photo') return 0;
    const size = Math.min(width * .5, height * .3);
    const cx = x + width / 2;
    const cy = y + height * .26;
    context.save();
    context.beginPath(); context.arc(cx, cy, size / 2, 0, Math.PI * 2); context.clip();
    drawCoverImage(context, photoImage, cx - size / 2, cy - size / 2, size, size);
    context.restore();
    context.strokeStyle = p.accent; context.lineWidth = Math.max(4, width * .008);
    context.beginPath(); context.arc(cx, cy, size / 2, 0, Math.PI * 2); context.stroke();
    return size;
  }

  function formatEventDate(value) {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function drawPanel(context, x, y, width, height, panel, renderState, folded = false) {
    const p = paletteFor(renderState);
    context.save();
    context.beginPath(); context.rect(x, y, width, height); context.clip();
    drawBackground(context, x, y, width, height, renderState);
    drawFrame(context, x, y, width, height, renderState, p);
    const family = fontFamily(renderState, p);
    const pad = width * .12;

    if (panel === 'front' && renderState.creationType === 'invitation') {
      context.fillStyle = p.accent;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `700 ${Math.max(20, width * .028)}px Arial, Helvetica, sans-serif`;
      context.fillText('YOU’RE INVITED', x + width / 2, y + height * .12, width * .72);
      const eventName = renderState.eventTitle || DATA.occasions[renderState.occasion]?.front || 'A Special Celebration';
      drawTextBlock(context, eventName, {
        x: x + pad, y: y + height * .19, width: width - pad * 2, height: height * .22
      }, { colour: p.ink, family, startSize: width * .075, minSize: width * .038, weight: 700, lineHeight: 1.15, maxLines: 4 });
      const guest = renderState.recipientName ? `CELEBRATING ${renderState.recipientName.toUpperCase()}` : '';
      if (guest) {
        context.fillStyle = p.accent; context.font = `700 ${width * .028}px Arial, Helvetica, sans-serif`;
        context.fillText(guest, x + width / 2, y + height * .45, width * .72);
      }
      const when = [formatEventDate(renderState.eventDate), renderState.eventTime].filter(Boolean).join('  •  ');
      const details = [when, renderState.eventVenue].filter(Boolean).join('\n');
      drawTextBlock(context, details || 'Add the date, time and venue', {
        x: x + pad, y: y + height * .5, width: width - pad * 2, height: height * .17
      }, { colour: p.ink, family, startSize: width * .038, minSize: width * .025, weight: 600, lineHeight: 1.42, maxLines: 4 });
      drawTextBlock(context, renderState.mainMessage, {
        x: x + pad * 1.1, y: y + height * .67, width: width - pad * 2.2, height: height * .13
      }, { colour: p.ink, family, startSize: width * .031, minSize: width * .021, weight: 500, lineHeight: 1.35, maxLines: 4 });
      const response = renderState.eventRsvp ? (/^rsvp/i.test(renderState.eventRsvp.trim()) ? renderState.eventRsvp : `RSVP  ${renderState.eventRsvp}`) : renderState.eventHost ? `HOSTED BY ${renderState.eventHost.toUpperCase()}` : '';
      if (response) {
        context.fillStyle = p.accent; context.font = `700 ${width * .025}px Arial, Helvetica, sans-serif`;
        context.fillText(response, x + width / 2, y + height * .88, width * .74);
      }
    } else if (panel === 'front') {
      const digital = renderState.outputMode === 'digital' && !folded;
      const photoSpace = drawPhotoMedallion(context, x, y, width, height, renderState, p);
      context.fillStyle = p.accent;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `700 ${Math.max(20, width * .03)}px Arial, Helvetica, sans-serif`;
      context.fillText((DATA.occasions[renderState.occasion]?.label || 'Special Occasion').toUpperCase(), x + width / 2, y + height * (photoSpace ? .47 : .18), width * .76);

      const title = digital ? renderState.mainMessage : (DATA.occasions[renderState.occasion]?.front || 'For You');
      drawTextBlock(context, title, {
        x: x + pad, y: y + height * (photoSpace ? .5 : .25), width: width - pad * 2, height: height * (digital ? .37 : .28)
      }, {
        colour: p.ink, family, startSize: width * (digital ? .07 : .095), minSize: width * .035,
        weight: renderState.font === 'handwritten' ? 500 : 700, lineHeight: 1.2, maxLines: digital ? 7 : 4
      });

      const lower = digital
        ? (renderState.senderName ? `WITH LOVE, ${renderState.senderName}` : renderState.recipientName ? `FOR ${renderState.recipientName.toUpperCase()}` : '')
        : (renderState.recipientName ? `${renderState.coverMessage}\n${renderState.recipientName}` : renderState.coverMessage);
      if (lower) {
        drawTextBlock(context, lower, {
          x: x + pad, y: y + height * .67, width: width - pad * 2, height: height * .18
        }, {
          colour: renderState.preset === 'photo' ? '#ffffff' : p.ink, family, startSize: width * .034, minSize: width * .024,
          weight: 600, lineHeight: 1.35, maxLines: 3
        });
      }
    } else if (panel === 'inside-left') {
      if (renderState.insideLeftMode === 'photo' && photoImage) {
        const margin = width * .1;
        context.save();
        roundedRect(context, x + margin, y + margin, width - margin * 2, height - margin * 2, width * .04); context.clip();
        drawCoverImage(context, photoImage, x + margin, y + margin, width - margin * 2, height - margin * 2);
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
      context.fillText(renderState.recipientName ? `Created especially for ${renderState.recipientName}` : 'Created especially for someone special', x + width / 2, y + height * .44, width * .7);
      if (renderState.showWebsite) {
        context.fillStyle = hexToRgba(p.ink, .65); context.font = `500 ${width * .025}px Arial, Helvetica, sans-serif`;
        context.fillText(document.documentElement.dataset.siteDomain || location.hostname, x + width / 2, y + height * .9, width * .75);
      }
    }

    context.restore();
  }

  function previewDimensions() {
    if (state.activePanel !== 'front' || state.outputMode === 'print') return { width: 1000, height: 1400 };
    if (state.creationType === 'postcard') return sizes.landscape;
    return sizes[state.size] || sizes.square;
  }

  function renderPreview() {
    const dimensions = previewDimensions();
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    drawPanel(ctx, 0, 0, canvas.width, canvas.height, state.activePanel, state, state.outputMode === 'print');
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
    const selected = sizes[state.size] || sizes.square;
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
    window.CardPDF.openBlob(blob, filename(type === 'image/png' ? 'png' : 'jpg'));
    announce('Your card opened in a new tab.');
  }

  async function shareImage() {
    const blob = await canvasBlob('image/png');
    const file = new File([blob], filename('png'), { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `${state.occasionLabel} card` });
      return;
    }
    window.CardPDF.openBlob(blob, filename('png'));
    announce('File sharing is not available here, so the card opened in a new tab.');
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

  async function createFoldedPdf() {
    const a4 = state.printPaper === 'A4';
    const pageWidth = a4 ? 3508 : 3300;
    const pageHeight = a4 ? 2480 : 2550;
    const margin = state.printQuality === 'professional' ? 35 : 120;
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

    const pdf = await window.CardPDF.canvasesToPdf([outside, inside], state.printPaper);
    window.CardPDF.openBlob(pdf, filename('pdf'));
    announce('Your folded card PDF opened in a new tab.');
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(state.mainMessage);
    announce('Message copied.');
  }

  async function shareLink() {
    const url = new URL(location.href);
    url.search = '';
    url.searchParams.set('occasion', state.occasion);
    url.searchParams.set('tone', state.tone);
    const shareData = { title: `${state.occasionLabel} card maker`, text: 'Create a personalised card for free.', url: url.toString() };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(url.toString());
      announce('Card maker link copied.');
    }
  }

  function surprise() {
    const keys = Object.keys(presets);
    const choices = keys.filter(key => key !== state.preset);
    const preset = choices[Math.floor(Math.random() * choices.length)];
    const frames = ['none', 'classic', 'double', 'arch', 'soft'];
    updateState({ preset, frame: frames[Math.floor(Math.random() * frames.length)], background: '', textColour: '' });
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
    const reader = new FileReader();
    reader.onload = () => {
      state.photoData = String(reader.result);
      photoImage = new Image();
      photoImage.onload = () => { persist(); queueRender(); announce('Photo added. It stays on this device.'); };
      photoImage.src = state.photoData;
    };
    reader.readAsDataURL(file);
  }

  function restorePhoto() {
    if (!state.photoData) return;
    photoImage = new Image();
    photoImage.onload = queueRender;
    photoImage.src = state.photoData;
  }

  function initControls() {
    const recipientSelect = document.getElementById('recipientSelect');
    DATA.recipients.forEach(recipient => {
      const option = document.createElement('option'); option.value = recipient; option.textContent = recipient; recipientSelect.appendChild(option);
    });

    document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => updateState({ step: Number(button.dataset.step) })));
    document.querySelectorAll('[data-creation-type]').forEach(button => button.addEventListener('click', () => {
      const creationType = button.dataset.creationType;
      const defaults = { card: 'birthday', invitation: 'birthday-invitation', postcard: 'postcard' };
      const occasion = defaults[creationType];
      state.creationType = creationType;
      state.occasion = occasion;
      state.occasionLabel = DATA.occasions[occasion].label;
      state.coverMessage = defaultCover(occasion);
      if (creationType === 'postcard') state.size = 'landscape';
      generateMessages(); syncControls();
    }));
    document.querySelectorAll('[data-next-step]').forEach(button => button.addEventListener('click', () => updateState({ step: Math.min(3, state.step + 1) })));
    document.querySelectorAll('[data-prev-step]').forEach(button => button.addEventListener('click', () => updateState({ step: Math.max(1, state.step - 1) })));
    document.querySelectorAll('[data-occasion]').forEach(button => button.addEventListener('click', () => {
      const occasion = button.dataset.occasion;
      state.creationType = button.dataset.kind || state.creationType;
      state.occasion = occasion;
      state.occasionLabel = DATA.occasions[occasion].label;
      state.coverMessage = defaultCover(occasion);
      const eventTitles = { 'birthday-invitation': 'A Birthday Celebration', 'party-invitation': 'A Special Celebration', 'wedding-invitation': 'Our Wedding Celebration', 'christmas-invitation': 'A Christmas Gathering' };
      if (eventTitles[occasion]) state.eventTitle = eventTitles[occasion];
      generateMessages(); syncControls();
    }));
    document.querySelectorAll('[data-tone]').forEach(button => button.addEventListener('click', () => { state.tone = button.dataset.tone; generateMessages(); syncControls(); }));
    document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => updateState({ preset: button.dataset.preset, background: '', textColour: '', font: presets[button.dataset.preset].font })));
    document.querySelectorAll('[data-frame]').forEach(button => button.addEventListener('click', () => updateState({ frame: button.dataset.frame })));
    document.querySelectorAll('[data-inside-left]').forEach(button => button.addEventListener('click', () => updateState({ insideLeftMode: button.dataset.insideLeft })));
    document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => updateState({ activePanel: button.dataset.panel })));
    document.querySelectorAll('[data-output-mode]').forEach(button => button.addEventListener('click', () => updateState({ outputMode: button.dataset.outputMode, activePanel: 'front' })));
    document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => updateState({ size: button.dataset.size })));
    document.querySelectorAll('[data-paper]').forEach(button => button.addEventListener('click', () => updateState({ printPaper: button.dataset.paper })));
    document.querySelectorAll('[data-print-quality]').forEach(button => button.addEventListener('click', () => updateState({ printQuality: button.dataset.printQuality })));
    document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-font]').forEach(item => item.classList.remove('active'));
      button.classList.add('active'); updateState({ font: button.dataset.font });
    }));

    const bindings = {
      recipientSelect: 'recipient', recipientName: 'recipientName', senderName: 'senderName', personalNote: 'personalNote',
      eventTitle: 'eventTitle', eventDate: 'eventDate', eventTime: 'eventTime', eventVenue: 'eventVenue', eventRsvp: 'eventRsvp', eventHost: 'eventHost',
      mainMessage: 'mainMessage', coverMessage: 'coverMessage', insideLeftText: 'insideLeftText',
      backgroundPicker: 'background', textColourPicker: 'textColour'
    };
    Object.entries(bindings).forEach(([id, key]) => {
      document.getElementById(id)?.addEventListener('input', event => updateState({ [key]: event.target.value }));
    });

    document.getElementById('generateMessages')?.addEventListener('click', generateMessages);
    document.getElementById('photoInput')?.addEventListener('change', event => loadPhoto(event.target.files?.[0]));
    document.getElementById('removePhoto')?.addEventListener('click', () => { photoImage = null; updateState({ photoData: '' }); });
    document.getElementById('surpriseDesign')?.addEventListener('click', surprise);
    document.getElementById('downloadPng')?.addEventListener('click', () => openImage('image/png').catch(handleError));
    document.getElementById('downloadJpg')?.addEventListener('click', () => openImage('image/jpeg').catch(handleError));
    document.getElementById('downloadPdf')?.addEventListener('click', () => createFoldedPdf().catch(handleError));
    document.getElementById('shareImage')?.addEventListener('click', () => shareImage().catch(handleError));
    document.getElementById('shareLink')?.addEventListener('click', () => shareLink().catch(handleError));
    document.getElementById('copyImage')?.addEventListener('click', () => copyImage().catch(handleError));
    document.getElementById('copyMessage')?.addEventListener('click', () => copyMessage().catch(handleError));
    document.getElementById('whatsappShare')?.addEventListener('click', () => {
      const text = encodeURIComponent(`${state.mainMessage}\n\nCreate a card: ${location.origin}${location.pathname}`);
      window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    });
    document.getElementById('startAgain')?.addEventListener('click', () => {
      if (!confirm('Start again and clear the current card?')) return;
      state = { ...defaultState };
      photoImage = null;
      generateMessages(); syncControls(); queueRender(); announce('Started a new card.');
    });
    document.getElementById('showWebsite')?.addEventListener('change', event => updateState({ showWebsite: event.target.checked }));
    document.getElementById('showFoldMarks')?.addEventListener('change', event => updateState({ showFoldMarks: event.target.checked }));
  }

  function handleError(error) {
    console.error(error);
    announce(error?.message || 'Something went wrong. Please try again.');
  }

  function init() {
    queryDefaults();
    initControls();
    restorePhoto();
    const hasSaved = Boolean(Store.load().app?.savedAt);
    if (hasSaved) {
      const notice = document.getElementById('resumeNotice');
      if (notice) notice.hidden = false;
    }
    generateMessages(false);
    syncControls();
    queueRender();
    window.setInterval(persist, 5000);
    window.addEventListener('pagehide', persist);
  }

  init();
})();
