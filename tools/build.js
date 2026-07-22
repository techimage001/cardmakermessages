#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const ASSETS = path.join(ROOT, 'assets');
const configPath = path.join(ROOT, 'site.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const pagesData = JSON.parse(fs.readFileSync(path.join(SRC, 'seo-pages.json'), 'utf8'));
const toolPages = JSON.parse(fs.readFileSync(path.join(SRC, 'tool-pages.json'), 'utf8'));
const domain = config.domain.replace(/\/$/, '');
const version = config.assetVersion;

if (!/^https:\/\//.test(domain)) throw new Error('site.config.json domain must start with https://');
if (!/^[a-f0-9]{32}$/i.test(config.indexNowKey)) throw new Error('IndexNow key must be exactly 32 hexadecimal characters.');

fs.mkdirSync(ASSETS, { recursive: true });
for (const file of ['site.css', 'site.js', 'messages.js', 'pdf.js', 'app.js']) {
  fs.copyFileSync(path.join(SRC, file), path.join(ASSETS, file));
}

const pageList = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function absolute(pathname = '/') {
  return `${domain}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function brandMark() {
  return `<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48" role="presentation"><rect x="9" y="11" width="25" height="30" rx="5"></rect><rect x="15" y="7" width="25" height="30" rx="5"></rect><path d="M21 17h13M21 23h10M21 29h7"></path></svg></span>`;
}

function nav() {
  return `
    <a href="/card-maker.html">Card maker</a>
    <a href="/invitation-maker.html">Invitations</a>
    <a href="/occasions.html">Card messages</a>
    <a href="/printable-card-guide.html">Print guide</a>
    <a class="button button-primary" href="/app.html">Create free</a>`;
}

function header() {
  return `
<header class="site-header">
  <div class="container header-row">
    <a class="brand" href="/" aria-label="${escapeHtml(config.brand)} home">
      ${brandMark()}
      <span class="brand-wordmark"><strong>Card Maker</strong><em>Messages</em></span>
    </a>
    <nav class="site-nav" aria-label="Main navigation">${nav()}</nav>
    <div class="header-actions">
      <button class="icon-button" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark theme">☾</button>
      <button class="icon-button menu-toggle" type="button" data-menu-toggle aria-controls="mobileMenu" aria-expanded="false" aria-label="Open menu">☰</button>
    </div>
  </div>
  <nav id="mobileMenu" class="mobile-menu" data-mobile-menu aria-label="Mobile navigation" hidden>${nav()}</nav>
</header>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-topline">
      <div>
        <a class="brand footer-brand" href="/">${brandMark()}<span class="brand-wordmark"><strong>Card Maker</strong><em>Messages</em></span></a>
        <p>${escapeHtml(config.tagline)}. Choose the words, tap a design and create a card or invitation without a complicated editor.</p>
      </div>
      <a class="button button-gold" href="/app.html">Create a card or invitation</a>
    </div>
    <div class="footer-grid">
      <div><h3>Create</h3><a href="/card-maker.html">Card maker</a><a href="/invitation-maker.html">Invitation maker</a><a href="/digital-card-maker.html">Digital cards</a><a href="/postcard-maker.html">Postcards</a></div>
      <div><h3>Popular</h3><a href="/birthday-card-maker.html">Birthday cards</a><a href="/christmas-card-maker.html">Christmas cards</a><a href="/wedding-invitation-maker.html">Wedding invitations</a><a href="/mothers-day-card-maker.html">Mother’s Day cards</a></div>
      <div><h3>Messages</h3><a href="/occasions.html">All card messages</a><a href="/birthday-card-messages.html">Birthday messages</a><a href="/wedding-card-messages.html">Wedding messages</a><a href="/thank-you-card-messages.html">Thank-you messages</a></div>
      <div><h3>About</h3><a href="/how-it-works.html">How it works</a><a href="/methodology.html">How we write messages</a><a href="/contact.html">Contact</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div>
    </div>
    <div class="footer-bottom"><span>© ${escapeHtml(config.brand)}. Original wording and code-drawn designs.</span><span>No adverts. No paid API. Photos stay in your browser.</span></div>
  </div>
</footer>`;
}

function breadcrumb(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items.map((item, index) => {
    if (index === items.length - 1) return `<span aria-current="page">${escapeHtml(item.name)}</span>`;
    return `<a href="${item.url}">${escapeHtml(item.name)}</a> <span aria-hidden="true">›</span>`;
  }).join(' ')}</nav>`;
}

function graphSchema({ title, description, pathname, breadcrumbs, type = 'Article', faq = [], howTo = [] }) {
  const url = absolute(pathname);
  const graph = [
    {
      '@type': 'Organization', '@id': `${domain}/#organization`, name: config.brand, url: domain,
      logo: { '@type': 'ImageObject', url: absolute('/assets/icon-512.png'), width: 512, height: 512 }
    },
    {
      '@type': 'WebSite', '@id': `${domain}/#website`, url: domain, name: config.brand,
      publisher: { '@id': `${domain}/#organization` }, inLanguage: 'en-GB'
    },
    {
      '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.url)
      }))
    }
  ];

  if (type === 'WebApplication') {
    graph.push({
      '@type': 'WebApplication', '@id': `${url}#app`, name: title, description, url,
      applicationCategory: 'DesignApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' }, publisher: { '@id': `${domain}/#organization` }
    });
    if (howTo.length) {
      graph.push({
        '@type': 'HowTo', '@id': `${url}#howto`, name: `How to use ${title}`, description,
        step: howTo.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, name: `Step ${index + 1}`, text })),
        publisher: { '@id': `${domain}/#organization` }
      });
    }
  } else if (type === 'HowTo') {
    graph.push({
      '@type': 'HowTo', '@id': `${url}#howto`, name: title, description,
      step: howTo.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, name: `Step ${index + 1}`, text })),
      publisher: { '@id': `${domain}/#organization` }
    });
  } else {
    graph.push({
      '@type': 'Article', '@id': `${url}#article`, headline: title, description, mainEntityOfPage: url,
      author: { '@id': `${domain}/#organization` }, publisher: { '@id': `${domain}/#organization` }, inLanguage: 'en-GB'
    });
  }

  if (faq.length) {
    graph.push({
      '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map(([question, answer]) => ({
        '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer }
      }))
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

function htmlPage({ pathname, title, description, body, breadcrumbs = [{ name: 'Home', url: '/' }], type = 'Article', faq = [], howTo = [], noindex = false, extraScripts = '', extraHead = '' }) {
  const canonical = absolute(pathname);
  const fullTitle = title.includes(config.brand) ? title : `${title} | ${config.brand}`;
  const robots = noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  const schema = graphSchema({ title, description, pathname, breadcrumbs, type, faq, howTo });
  const result = `<!doctype html>
<html lang="en-GB" data-site-domain="${escapeHtml(domain.replace(/^https?:\/\//, ''))}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>try{document.documentElement.dataset.theme=JSON.parse(localStorage.getItem('card-maker-messages-state-v2')||'{}').theme||'light'}catch(e){document.documentElement.dataset.theme='light'}</script>
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#7c3f55">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(config.brand)}">
  <meta property="og:locale" content="${escapeHtml(config.defaultLocale)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absolute('/assets/og-image.png')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absolute('/assets/og-image.png')}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/site.css?v=${version}">
  ${extraHead}
  <script type="application/ld+json">${schema}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
${header()}
<main id="main">${body}</main>
${footer()}
<div id="appLiveRegion" class="skip-link" role="status" aria-live="polite" aria-atomic="true"></div>
<script src="/assets/site.js?v=${version}" defer></script>
${extraScripts}
</body>
</html>`;
  pageList.push({ pathname, noindex });
  return result;
}

function writePage(filename, options) {
  fs.writeFileSync(path.join(ROOT, filename), htmlPage(options));
}

function occasionCard(page) {
  const icons = { birthday: '🎂', christmas: '❄', wedding: '♡', anniversary: '∞', easter: '☼', thanks: '♥', congratulations: '★', 'new-baby': '✧', retirement: '☀', 'get-well': '✿', valentine: '♥', graduation: '◆' };
  return `<article class="card occasion-card">
    <span class="occasion-icon" aria-hidden="true">${icons[page.occasion] || '♡'}</span>
    <h3>${escapeHtml(page.keyword)}</h3>
    <p>${escapeHtml(page.answer.split('.').slice(0, 2).join('.') + '.')}</p>
    <a class="button" href="/${page.slug}.html">See messages</a>
  </article>`;
}

function homeBody() {
  const cards = pagesData.slice(0, 8).map(occasionCard).join('');
  return `
<section class="hero premium-hero">
  <div class="hero-glow hero-glow-one" aria-hidden="true"></div><div class="hero-glow hero-glow-two" aria-hidden="true"></div>
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow eyebrow-gold">Card maker and message library</p>
      <h1>Create the perfect card and find the right words</h1>
      <div class="answer-block answer-block-hero"><p>Card Maker Messages turns a few simple choices into a polished card or invitation. Choose the occasion, recipient and wording, tap a complete premium design, then download a high-resolution image or folded PDF. There are no layers, dragging tools or complicated menus.</p></div>
      <div class="button-row"><a class="button button-primary button-large" href="/app.html">Create a card or invitation</a><a class="button button-light button-large" href="/occasions.html">Browse messages</a></div>
      <div class="trust-row"><span><b>✓</b> Original messages</span><span><b>✓</b> Folded PDF</span><span><b>✓</b> Private photos</span><span><b>✓</b> No watermark</span></div>
      <div class="resume-card" data-resume-card hidden><p data-resume-text>Continue your card where you left off.</p><a class="button button-secondary" href="/app.html">Continue</a></div>
    </div>
    <div class="premium-card-stage" aria-label="Examples of cards made with Card Maker Messages">
      <div class="stage-orbit orbit-one" aria-hidden="true"></div><div class="stage-orbit orbit-two" aria-hidden="true"></div>
      <article class="showcase-card showcase-back"><span>YOU’RE INVITED</span><strong>A Birthday Celebration</strong><small>Saturday · 6:00 PM</small></article>
      <article class="showcase-card showcase-front"><span>HAPPY BIRTHDAY</span><strong>May your day feel every bit as special as you are.</strong><small>Made especially for Sarah</small></article>
      <div class="premium-float float-message"><span>01</span><b>Choose the words</b></div>
      <div class="premium-float float-design"><span>02</span><b>Tap a design</b></div>
      <div class="premium-float float-download"><span>03</span><b>Download or print</b></div>
    </div>
  </div>
</section>
<section class="premium-proof"><div class="container proof-row"><span>Cards</span><i></i><span>Invitations</span><i></i><span>Messages</span><i></i><span>Folded PDFs</span><i></i><span>Digital sharing</span></div></section>
<section class="section section-soft premium-section">
  <div class="container">
    <div class="section-heading split-heading"><div><p class="eyebrow">Start with the occasion</p><h2>What are you creating today?</h2></div><p>Use an original message guide or open the maker directly. Every design is complete, coordinated and easy to personalise.</p></div>
    <div class="grid grid-4">${cards}</div>
    <div class="centred-action"><a class="button button-secondary" href="/occasions.html">Browse every occasion</a></div>
  </div>
</section>
<section class="section premium-section">
  <div class="container">
    <div class="section-heading"><p class="eyebrow">One tool, three outputs</p><h2>Cards, invitations and postcards without the design work</h2><p>Choose the type that matches your task. The interface shows only the details you need.</p></div>
    <div class="create-type-grid">
      <article class="feature-panel feature-card"><span class="feature-number">01</span><div class="feature-icon">♡</div><h3>Greeting cards</h3><p>Find a message, add names or a photo and create a digital or folded printable card.</p><a href="/card-maker.html">Explore the card maker <span>→</span></a></article>
      <article class="feature-panel feature-invite"><span class="feature-number">02</span><div class="feature-icon">✦</div><h3>Invitations</h3><p>Add the date, time, venue and RSVP details to a complete birthday, wedding or party design.</p><a href="/invitation-maker.html">Explore invitations <span>→</span></a></article>
      <article class="feature-panel feature-post"><span class="feature-number">03</span><div class="feature-icon">▱</div><h3>Digital postcards</h3><p>Combine a short message with a photo or landscape design for travel, thanks or thinking of you.</p><a href="/postcard-maker.html">Explore postcards <span>→</span></a></article>
    </div>
  </div>
</section>
<section class="section section-dark premium-section">
  <div class="container">
    <div class="section-heading light-heading"><p class="eyebrow eyebrow-gold">Simple by design</p><h2>From blank idea to finished card in three steps</h2></div>
    <div class="process-grid"><article><span>1</span><h3>Choose the message</h3><p>Select an occasion, relationship and tone, or write your own wording.</p></article><article><span>2</span><h3>Choose the look</h3><p>Tap a complete visual preset that coordinates colour, type, frame and decoration.</p></article><article><span>3</span><h3>Choose the output</h3><p>Open a high-resolution image, share the link or create a two-page folded PDF.</p></article></div>
  </div>
</section>
<section class="section premium-section">
  <div class="container">
    <div class="section-heading split-heading"><div><p class="eyebrow">Everything useful is included</p><h2>A premium result without a complicated editor</h2></div><p>The tool handles spacing, contrast and text fitting automatically, while leaving the personal words and details with you.</p></div>
    <div class="benefit-grid"><div><b>One-tap design systems</b><span>Not isolated templates or loose elements.</span></div><div><b>Original message choices</b><span>Written for the occasion and easy to personalise.</span></div><div><b>Private browser processing</b><span>Photos and card content stay on the device.</span></div><div><b>Digital and print formats</b><span>PNG, JPG and folded PDF outputs.</span></div></div>
  </div>
</section>
<section class="section premium-cta"><div class="container cta-panel"><div><p class="eyebrow eyebrow-gold">Ready when you are</p><h2>Create something thoughtful in minutes</h2><p>Start with the message or go straight into the maker. Your progress is saved on this device.</p></div><div class="button-row"><a class="button button-gold button-large" href="/app.html">Create now</a><a class="button button-dark-outline button-large" href="/how-it-works.html">See how it works</a></div></div></section>`;
}
function appBody() {
  const icons = { birthday: '🎂', christmas: '❄', wedding: '♡', anniversary: '∞', easter: '☼', thanks: '♥', congratulations: '★', 'new-baby': '✧', retirement: '☀', 'get-well': '✿', valentine: '♥', graduation: '◆', 'mothers-day': '❀', 'birthday-invitation': '✦', 'party-invitation': '✹', 'wedding-invitation': '◇', 'christmas-invitation': '❄', postcard: '▱' };
  const cardButtons = pagesData.map(page => `<button type="button" class="choice occasion-choice" data-kind="card" data-occasion="${page.occasion}" aria-pressed="false"><span aria-hidden="true">${icons[page.occasion] || '♡'}</span><span>${escapeHtml(page.keyword.replace(' card messages', '').replace(' Card Messages', ''))}</span></button>`).join('');
  const invitationItems = [
    ['birthday-invitation','Birthday'],['party-invitation','Party'],['wedding-invitation','Wedding'],['christmas-invitation','Christmas']
  ];
  const invitationButtons = invitationItems.map(([value,label]) => `<button type="button" class="choice occasion-choice" data-kind="invitation" data-occasion="${value}" aria-pressed="false"><span aria-hidden="true">${icons[value]}</span><span>${label}</span></button>`).join('');
  const postcardButton = `<button type="button" class="choice occasion-choice" data-kind="postcard" data-occasion="postcard" aria-pressed="false"><span aria-hidden="true">▱</span><span>Postcard</span></button>`;
  const occasionButtons = cardButtons + invitationButtons + postcardButton;
  const tones = [['heartfelt','Heartfelt'],['short','Short'],['funny','Funny'],['formal','Formal'],['romantic','Romantic'],['religious','Religious'],['inspirational','Inspiring'],['professional','Professional']]
    .map(([value,label]) => `<button type="button" class="choice" data-tone="${value}" aria-pressed="false">${label}</button>`).join('');
  const presetButtons = [
    ['floral','Elegant floral'],['minimal','Modern minimal'],['photo','Photo focus'],['bold','Bold celebration'],['luxury','Luxury dark'],
    ['playful','Fun and colourful'],['festive','Traditional festive'],['peaceful','Peaceful light'],['botanical','Rustic botanical'],['cute','Cute illustrated']
  ].map(([value,label]) => `<button type="button" class="preset" data-preset="${value}" aria-pressed="false"><span class="preset-preview preset-${value}" aria-hidden="true"></span>${label}</button>`).join('');

  return `
<section class="app-shell">
  <div class="container">
    <div class="app-intro"><p class="eyebrow">Three simple steps</p><h1>Card Maker and Invitation Maker</h1><p>Choose the words or event details, tap a complete design and download a digital or folded printable card. There are no layers, dragging tools or complicated menus.</p></div>
    <p id="resumeNotice" class="resume-notice" hidden>Picked up where you left off. Use Start again below whenever you need a blank card.</p>
    <div class="step-tabs" role="navigation" aria-label="Card creation steps">
      <button class="step-tab" type="button" data-step="1">1. Message</button>
      <button class="step-tab" type="button" data-step="2">2. Design</button>
      <button class="step-tab" type="button" data-step="3">3. Download</button>
    </div>
    <div class="app-grid">
      <aside class="preview-column">
        <div class="preview-card">
          <div class="panel-tabs" aria-label="Card panels">
            <button type="button" data-panel="front" aria-pressed="false">Front</button>
            <button type="button" data-panel="inside-left" aria-pressed="false">Inside left</button>
            <button type="button" data-panel="inside-right" aria-pressed="false">Inside right</button>
            <button type="button" data-panel="back" aria-pressed="false">Back</button>
          </div>
          <div class="canvas-wrap"><canvas id="cardCanvas" role="img" aria-label="Live preview of your personalised card"></canvas></div>
          <p id="previewCaption" class="preview-caption">Front cover. Live preview. Downloads use full resolution.</p>
        </div>
      </aside>
      <section class="control-panel">
        <div data-step-panel="1">
          <div class="control-section">
            <h2>What are you making?</h2>
            <div class="creation-type-grid" aria-label="Choose what to create">
              <button type="button" class="creation-type" data-creation-type="card" aria-pressed="false"><span>♡</span><strong>Greeting card</strong><small>Digital or folded</small></button>
              <button type="button" class="creation-type" data-creation-type="invitation" aria-pressed="false"><span>✦</span><strong>Invitation</strong><small>Date, venue and RSVP</small></button>
              <button type="button" class="creation-type" data-creation-type="postcard" aria-pressed="false"><span>▱</span><strong>Postcard</strong><small>Wide photo or message</small></button>
            </div>
            <h3>Choose the occasion</h3>
            <div class="occasion-choices">${occasionButtons}</div>
            <div class="field-grid" style="margin-top:18px">
              <div class="field"><label for="recipientSelect">Recipient</label><select id="recipientSelect"></select></div>
              <div class="field"><label for="recipientName">Name, optional</label><input id="recipientName" autocomplete="off" placeholder="For example, Sarah"></div>
              <div class="field field-full"><span class="field-label">Tone</span><div class="choice-grid">${tones}</div></div>
              <div class="field field-full"><label for="personalNote">Personal detail, optional</label><input id="personalNote" placeholder="For example, our rainy trip to Edinburgh"></div>
              <div id="invitationDetails" class="invitation-fields field-full" hidden>
                <div class="invitation-fields-heading"><strong>Event details</strong><span>These appear automatically on the invitation.</span></div>
                <div class="field-grid">
                  <div class="field field-full"><label for="eventTitle">Event title</label><input id="eventTitle" placeholder="For example, Sarah’s 40th Birthday"></div>
                  <div class="field"><label for="eventDate">Date</label><input id="eventDate" type="date"></div>
                  <div class="field"><label for="eventTime">Time</label><input id="eventTime" type="time"></div>
                  <div class="field field-full"><label for="eventVenue">Venue</label><input id="eventVenue" placeholder="Venue name and address"></div>
                  <div class="field"><label for="eventRsvp">RSVP</label><input id="eventRsvp" placeholder="Email, phone or deadline"></div>
                  <div class="field"><label for="eventHost">Hosted by, optional</label><input id="eventHost" placeholder="For example, The Johnson family"></div>
                </div>
              </div>
              <div class="field field-full"><button id="generateMessages" type="button" class="button button-primary">Show message choices</button></div>
            </div>
          </div>
          <div class="control-section">
            <h2>Choose or write the message</h2>
            <div id="messageOptions" class="message-options" aria-label="Suggested messages"></div>
            <div class="field" style="margin-top:16px"><label for="mainMessage">Your final message</label><textarea id="mainMessage"></textarea></div>
            <div class="field-grid" style="margin-top:14px">
              <div class="field"><label for="senderName">From or signature</label><input id="senderName" placeholder="For example, James and family"></div>
              <div class="field"><label for="coverMessage">Short cover line</label><input id="coverMessage"></div>
            </div>
          </div>
          <div class="step-footer"><button id="startAgain" class="button button-quiet" type="button">Start again</button><button class="button button-primary" type="button" data-next-step>Continue to design</button></div>
        </div>

        <div data-step-panel="2" hidden>
          <div class="control-section">
            <h2>Pick a complete design</h2>
            <p>One tap sets the colours, font, decoration and layout together. You can still adjust the main details.</p>
            <div class="preset-grid">${presetButtons}</div>
            <p style="margin-top:12px"><button id="surpriseDesign" type="button" class="button button-secondary">Surprise me</button></p>
          </div>
          <div class="control-section">
            <h2>Add a photo or adjust the colours</h2>
            <div class="photo-row"><input id="photoInput" type="file" accept="image/*"><button id="removePhoto" type="button" class="button button-small">Remove photo</button></div>
            <p class="help">Photos stay in your browser. They are processed on this device and are not uploaded to the website.</p>
            <div class="field-grid" style="margin-top:18px">
              <div class="field"><label for="backgroundPicker">Background</label><input class="colour-input" id="backgroundPicker" type="color"></div>
              <div class="field"><label for="textColourPicker">Text colour</label><input class="colour-input" id="textColourPicker" type="color"></div>
            </div>
            <details class="more-options">
              <summary>More design options</summary>
              <h3>Font style</h3><div class="choice-grid"><button type="button" class="choice" data-font="serif">Elegant serif</button><button type="button" class="choice" data-font="sans">Clean modern</button><button type="button" class="choice" data-font="handwritten">Soft handwritten</button></div>
              <h3>Frame</h3><div class="choice-grid"><button type="button" class="choice" data-frame="none">None</button><button type="button" class="choice" data-frame="classic">Classic</button><button type="button" class="choice" data-frame="double">Double</button><button type="button" class="choice" data-frame="arch">Soft arch</button><button type="button" class="choice" data-frame="soft">Subtle</button></div>
              <h3>Inside-left panel</h3><div class="choice-grid"><button type="button" class="choice" data-inside-left="blank">Leave blank</button><button type="button" class="choice" data-inside-left="photo">Use photo</button><button type="button" class="choice" data-inside-left="quote">Add short note</button><button type="button" class="choice" data-inside-left="illustration">Illustration</button></div>
              <div class="field" style="margin-top:14px"><label for="insideLeftText">Inside-left note</label><textarea id="insideLeftText"></textarea></div>
              <label class="toggle-row"><input id="showWebsite" type="checkbox">Show a small website address on the back</label>
            </details>
          </div>
          <div class="step-footer"><button class="button" type="button" data-prev-step>Back to message</button><button class="button button-primary" type="button" data-next-step>Continue to download</button></div>
        </div>

        <div data-step-panel="3" hidden>
          <div class="control-section">
            <h2>How will you use the card?</h2>
            <div class="choice-grid"><button type="button" class="choice" data-output-mode="digital">Digital image</button><button type="button" class="choice" data-output-mode="print">Folded printable card</button></div>
          </div>
          <div id="digitalOptions" class="control-section">
            <h2>Choose the image shape</h2>
            <div class="choice-grid">
              <button type="button" class="choice" data-size="square">Square card</button><button type="button" class="choice" data-size="portrait">Portrait</button><button type="button" class="choice" data-size="landscape">Landscape</button><button type="button" class="choice" data-size="story">Story</button><button type="button" class="choice" data-size="pinterest">Pinterest pin</button>
            </div>
            <div class="download-card"><strong id="downloadSummary">Square card, high-resolution image</strong><span>Your file opens in a new tab so you can see it before saving or sharing.</span></div>
            <button id="downloadPng" type="button" class="button button-primary button-large primary-download">Open high-resolution PNG</button>
            <div class="secondary-actions"><button id="downloadJpg" class="button" type="button">Open JPG</button><button id="shareImage" class="button" type="button">Share the card</button><button id="copyImage" class="button" type="button">Copy image</button><button id="copyMessage" class="button" type="button">Copy message</button><button id="shareLink" class="button" type="button">Share link</button><button id="whatsappShare" class="button" type="button">WhatsApp text</button></div>
            <p class="info-note">Sharing an image file and sharing a clickable link are separate actions because some apps remove the link when an image is attached.</p>
          </div>
          <div id="printOptions" class="control-section" hidden>
            <h2>Create a folded card PDF</h2>
            <h3>Paper size</h3><div class="choice-grid"><button type="button" class="choice" data-paper="A4">A4 folded to A5</button><button type="button" class="choice" data-paper="LETTER">US Letter folded</button></div>
            <h3>How will you print it?</h3><div class="choice-grid"><button type="button" class="choice" data-print-quality="home">Home printer</button><button type="button" class="choice" data-print-quality="professional">Print shop</button></div>
            <label class="toggle-row"><input id="showFoldMarks" type="checkbox">Show small fold marks for home printing</label>
            <div class="download-card"><strong id="downloadSummaryPrint">Two-page folded card PDF</strong><span>Page one contains the back and front covers. Page two contains the two inside panels.</span></div>
            <button id="downloadPdf" type="button" class="button button-primary button-large primary-download">Open folded card PDF</button>
            <p class="info-note">For home printing, use landscape orientation, Actual Size or 100%, double-sided printing and flip on the short edge. Test with plain paper first.</p>
            <p><a href="/printable-card-guide.html">Read the complete printing guide</a></p>
          </div>
          <div class="step-footer"><button class="button" type="button" data-prev-step>Back to design</button><button id="startAgainBottom" class="button button-quiet" type="button" onclick="document.getElementById('startAgain').click()">Start another card</button></div>
        </div>
      </section>
    </div>
  </div>
</section>`;
}

function seoPageBody(page) {
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Messages', url: '/occasions.html' }, { name: page.keyword, url: `/${page.slug}.html` }];
  const siblingLinks = pagesData.filter(item => item.slug !== page.slug).slice(0, 4).map(item => `<a href="/${item.slug}.html">${escapeHtml(item.keyword)}</a>`).join('');
  const messages = page.messages.map(message => `<article class="message-card" data-message-card><p data-message-text>${escapeHtml(message)}</p><div class="button-row"><button type="button" class="button button-small" data-copy-message>Copy message</button><a class="button button-small button-secondary" href="/app.html?occasion=${encodeURIComponent(page.occasion)}&message=${encodeURIComponent(message)}">Make this a card</a></div></article>`).join('');
  const faq = page.faqs.map(([q,a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join('');
  const steps = page.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('');
  return { crumbs, body: `
<section class="page-hero"><div class="container">${breadcrumb(crumbs)}<p class="eyebrow">Original wording you can personalise</p><h1>${escapeHtml(page.title)}</h1><div class="answer-block"><p>${escapeHtml(page.answer)}</p></div><div class="button-row"><a class="button button-primary button-large" href="/app.html?occasion=${encodeURIComponent(page.occasion)}">Create this card</a><a class="button button-large" href="#messages">See message examples</a></div></div></section>
<section class="section"><div class="container content-layout"><article class="prose">
<h2>${escapeHtml(page.question)}</h2><p>${escapeHtml(page.sectionAnswer)}</p>
<ol>${steps}</ol>
<h2 id="messages">Which ${escapeHtml(page.keyword.toLowerCase())} can I use?</h2><p>These examples are original wording created for this site. Copy one as it is, personalise it or open it directly in the card maker.</p>
<div class="message-list">${messages}</div>
<h2>How do I turn the message into a card?</h2><p>Open the card maker with your chosen occasion, add a recipient name and sender, then tap a complete design. Digital cards can be exported as high-resolution images. Printable cards produce a two-page PDF with the outside panels arranged correctly for folding.</p>
<ol><li>Use one of the messages above or write your own.</li><li>Choose a one-tap design and optional photo.</li><li>Preview the front, inside and back panels.</li><li>Open the image or folded PDF before saving it.</li></ol>
<section class="faq"><h2>What else should I know?</h2>${faq}</section>
</article><aside class="card side-card"><h3>Create the finished card</h3><p>Your message is only the first step. Add a name, photo and complete design without learning a complicated editor.</p><a class="button button-primary" href="/app.html?occasion=${encodeURIComponent(page.occasion)}">Open card maker</a><h3 style="margin-top:24px">Related messages</h3>${siblingLinks}</aside></div></section>` };
}

function staticBody(kind) {
  const content = {
    about: {
      title: `About ${config.brand}`,
      answer: `${config.brand} is a free message-first card maker. It helps people find suitable original wording, personalise it and turn it into a digital or folded printable card. The editor avoids layers and free-positioning tools, so a complete design can be chosen with one tap and adjusted only where useful.`,
      body: `<h2>Why does this card maker exist?</h2><p>Many people know the occasion but struggle to find the right words. Others can write the message but do not want to learn a full design application for one card. This site brings those tasks together in a focused tool that runs mostly inside the browser.</p><h2>What is free?</h2><p>The message generator, design presets, photo upload, image exports and folded card PDF are free. The site does not use adverts or a paid text-generation API. Keeping the core generation client-side makes the service practical to offer without charging for each card.</p><h2>Who publishes the messages?</h2><p>The site is published by ${escapeHtml(config.brand)} as an organisation. Messages are written as original examples and checked for clarity, tone, suitability and attribution risk. Read the <a href="/methodology.html">message methodology</a> for more detail.</p>`
    },
    methodology: {
      title: 'How We Write and Check Card Messages',
      answer: `Our card messages are written as original wording rather than copied quotations, lyrics, poems or branded phrases. Each message is checked for the intended occasion, relationship and tone, then reviewed for clarity, unnecessary assumptions, insensitive promises and wording that could embarrass or pressure the recipient.`,
      body: `<h2>How are the messages created?</h2><p>Each message begins with the communication goal: celebrate, thank, comfort, welcome or encourage. We then adapt the language for relationship and tone. A professional message is restrained, a close-family message can be warmer and a religious message is offered only as a clear choice.</p><h2>How do we avoid misattribution?</h2><p>We do not label original wording as a quotation from a famous person. The site does not rely on unattributed quote lists. Well-known lyrics, poems and prayers are not reproduced merely because they are popular. This keeps the messages safer to print and share.</p><h2>What quality checks are used?</h2><table><thead><tr><th>Check</th><th>What we look for</th></tr></thead><tbody><tr><td>Suitability</td><td>Does the wording fit the occasion and relationship?</td></tr><tr><td>Specificity</td><td>Can the user personalise it without rewriting everything?</td></tr><tr><td>Sensitivity</td><td>Does it avoid pressure, promises or harmful assumptions?</td></tr><tr><td>Clarity</td><td>Does it sound natural when read aloud?</td></tr><tr><td>Originality</td><td>Is it written for this site rather than copied from a creative work?</td></tr></tbody></table>`
    },
    privacy: {
      title: 'Privacy Policy',
      answer: `The card maker processes message text, settings and uploaded photos inside your browser. Your current card may be stored in local browser storage so you can resume it, but the site does not upload the photo or card content to a server. The launch version carries no adverts and no advertising or profiling network.`,
      body: `<h2>What information stays on the device?</h2><p>Card wording, names, design settings, favourites and uploaded photo data may be stored in your browser’s local storage. This allows the tool to restore an unfinished card. Use the Start again option or clear site data in your browser to remove it.</p><h2>Are photos uploaded?</h2><p>No. The card image is rendered using browser canvas on the device. Exports are created locally. Do not use a shared computer for private images unless you clear the card afterwards.</p><h2>Does the site use advertising trackers?</h2><p>No. The launch version contains no adverts, advertising tags or cross-site profiling. If privacy-respecting analytics is added later, this page must be updated before it is enabled.</p><h2>How can I ask a privacy question?</h2><p>Email <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>.</p>`
    },
    terms: {
      title: 'Terms of Use',
      answer: `You may use the card maker to create personal digital and printable cards. The original message examples and site designs remain protected content, but the finished cards you create may be shared with their intended recipients. You are responsible for names, photos and wording that you add to the tool.`,
      body: `<h2>What may I create?</h2><p>You may create and share cards for personal, family, community and ordinary workplace use. Do not use the service to harass, impersonate, deceive or violate another person’s privacy or intellectual-property rights.</p><h2>What about uploaded photos?</h2><p>Only use images you own or have permission to use. Photos are processed locally, but you remain responsible for the content you place in the final card.</p><h2>Are print results guaranteed?</h2><p>No. Printers, paper, ink and duplex settings vary. Use plain paper for a test and follow the print guide. The print-shop option prepares a clean high-resolution PDF, but a professional printer may request additional specifications.</p><h2>Is the service always available?</h2><p>Availability, browser support and features may change. Keep a copy of any finished card you need.</p>`
    },
    contact: {
      title: 'Contact the Card Maker Team',
      answer: `Contact ${config.brand} for help with the card maker, printing guidance, accessibility issues or corrections to message wording. Include the page you were using, the device and browser and a clear description of what happened. Do not send private photos or sensitive recipient information unless it is essential to the request.`,
      body: `<h2>How can I get help?</h2><p>Email <a href="mailto:${escapeHtml(config.email)}">${escapeHtml(config.email)}</a>. For a technical problem, include the exact button you pressed and what appeared afterwards. A screenshot can help, but remove private names and images first.</p><h2>What feedback is useful?</h2><p>Suggestions for missing occasions, unclear wording, printing problems and accessibility improvements are welcome. Message corrections should identify the page and the exact sentence.</p>`
    }
  };
  return content[kind];
}

function howItWorksBody() {
  const steps = [
    'Choose an occasion, recipient and tone.',
    'Select one of the suggested original messages or write your own.',
    'Tap a complete design and optionally add a photo.',
    'Preview the front, inside-left, inside-right and back panels.',
    'Open a high-resolution image or two-page folded card PDF.'
  ];
  return { steps, body: `<section class="page-hero"><div class="narrow">${breadcrumb([{name:'Home',url:'/'},{name:'How it works',url:'/how-it-works.html'}])}<p class="eyebrow">A focused card workflow</p><h1>How Does the Free Card Maker Work?</h1><div class="answer-block"><p>The card maker uses three stages: message, design and download. You choose the occasion and recipient, select or write the wording, then tap a complete visual preset. The finished card can be opened as a high-resolution image or arranged as a two-page folded PDF for home printing.</p></div><a class="button button-primary button-large" href="/app.html">Create a card</a></div></section><section class="section"><div class="narrow prose"><h2>What are the five steps?</h2><ol>${steps.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><h2>Why is the editor simpler than a design canvas?</h2><p>The tool does not ask you to position every object or manage layers. Each preset sets the typography, colours, decoration and spacing together. The system also fits text, protects margins and maintains readable contrast automatically.</p><h2>Where is my card information stored?</h2><p>Your unfinished card is stored in local browser storage so the tool can resume where you stopped. Uploaded photos are converted to local browser data and are not sent to a server. Use Start again to clear the current card.</p><h2>What can I download?</h2><table><thead><tr><th>Output</th><th>Best use</th></tr></thead><tbody><tr><td>PNG</td><td>WhatsApp, email and high-quality digital sharing</td></tr><tr><td>JPG</td><td>Smaller image file for general sharing</td></tr><tr><td>Folded PDF</td><td>Home printing or taking to a print shop</td></tr></tbody></table></div></section>` };
}

function printGuideBody() {
  const steps = [
    'Choose Print and then select A4 or US Letter.',
    'Select Home printer for safe margins and optional fold marks.',
    'Open the PDF and print a test copy on ordinary paper.',
    'Use landscape orientation, Actual Size or 100% and double-sided printing.',
    'Select flip on short edge, then fold the sheet down the centre.'
  ];
  return { steps, body: `<section class="page-hero"><div class="narrow">${breadcrumb([{name:'Home',url:'/'},{name:'Printable card guide',url:'/printable-card-guide.html'}])}<p class="eyebrow">Folded PDF instructions</p><h1>How Do I Print a Folded Card PDF?</h1><div class="answer-block"><p>Print the two-page card PDF in landscape orientation at Actual Size or 100%. Use double-sided printing and select flip on the short edge. Page one places the back cover on the left and front cover on the right. Page two places the inside-left panel on the left and the main message on the right.</p></div><a class="button button-primary button-large" href="/app.html">Create a printable card</a></div></section><section class="section"><div class="narrow prose"><h2>What print settings should I use?</h2><ol>${steps.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol><h2>How are the four card panels arranged?</h2><table><thead><tr><th>PDF page</th><th>Left half</th><th>Right half</th></tr></thead><tbody><tr><td>Outside</td><td>Back cover</td><td>Front cover</td></tr><tr><td>Inside</td><td>Inside-left panel</td><td>Main inside message</td></tr></tbody></table><h2>What paper should I use?</h2><p>Start with plain paper to confirm orientation. For the final copy, use card that your printer can feed safely. Many home printers handle 160 to 220 gsm, but the supported weight is model-specific. Check the printer manual before using heavy stock.</p><h2>What should I choose for a print shop?</h2><p>Select Print shop in the card maker. This reduces the home-print margin and removes fold marks. Tell the printer the finished folded size and ask whether they need bleed, crop marks or a different PDF specification. The exported design is raster-based, so very large resizing is not recommended.</p><h2>Why did the back print upside down?</h2><p>The duplex flip setting is the usual cause. For a landscape sheet that folds vertically, select flip on the short edge. Printer drivers sometimes describe this differently, which is why a test on ordinary paper is essential.</p></div></section>` };
}

function resolveRelated(slug) {
  const item = [...toolPages, ...pagesData].find(entry => entry.slug === slug);
  if (!item) return null;
  return { slug: item.slug, label: item.keyword || item.title };
}

function toolLandingBody(page) {
  const query = page.appQuery ? `?${page.appQuery}` : '';
  const related = (page.related || []).map(resolveRelated).filter(Boolean);
  const breadcrumbs = [{ name: 'Home', url: '/' }, { name: page.keyword, url: `/${page.slug}.html` }];
  const features = page.features.map(([name, text]) => `<article class="mini-feature"><span aria-hidden="true">✓</span><div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(text)}</p></div></article>`).join('');
  const links = related.map(item => `<a href="/${item.slug}.html">${escapeHtml(item.label)}</a>`).join('');
  return { breadcrumbs, body: `<section class="tool-hero"><div class="container tool-hero-grid"><div>${breadcrumb(breadcrumbs)}<p class="eyebrow eyebrow-gold">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.title)}</h1><div class="answer-block answer-block-hero"><p>${escapeHtml(page.answer)}</p></div><div class="button-row"><a class="button button-primary button-large" href="/app.html${query}">Open ${escapeHtml(page.keyword.toLowerCase())}</a><a class="button button-light button-large" href="#how-it-works">See how it works</a></div><div class="trust-row"><span><b>✓</b> No watermark</span><span><b>✓</b> Private photos</span><span><b>✓</b> High-resolution</span></div></div><div class="tool-mockup"><div class="mock-browser"><div class="mock-toolbar"><i></i><i></i><i></i><span>cardmakermessages.com</span></div><div class="mock-content"><div class="mock-card"><small>${escapeHtml(page.keyword.toUpperCase())}</small><strong>${escapeHtml(page.title.replace(/ with .*| for .*| and .*/i,''))}</strong><em>Beautifully made, simply personalised</em></div><div class="mock-controls"><span></span><span></span><span></span><button>Choose design</button></div></div></div></div></div></section><section class="section premium-section" id="how-it-works"><div class="container"><div class="section-heading split-heading"><div><p class="eyebrow">Focused and useful</p><h2>${escapeHtml(page.question)}</h2></div><p>${escapeHtml(page.sectionAnswer)}</p></div><div class="mini-feature-grid">${features}</div></div></section><section class="section section-soft premium-section"><div class="container"><div class="section-heading"><p class="eyebrow">Four simple steps</p><h2>How do I create it?</h2></div><ol class="premium-steps">${page.steps.map((step,index)=>`<li><span>${index+1}</span><p>${escapeHtml(step)}</p></li>`).join('')}</ol><div class="centred-action"><a class="button button-primary button-large" href="/app.html${query}">Start creating</a></div></div></section><section class="section"><div class="container"><div class="related-panel"><div><p class="eyebrow">Continue exploring</p><h2>Related card and invitation tools</h2></div><div class="related-links">${links}</div></div></div></section>` };
}

function occasionsBody() {
  return `<section class="page-hero"><div class="container">${breadcrumb([{name:'Home',url:'/'},{name:'All occasions',url:'/occasions.html'}])}<p class="eyebrow">Message library</p><h1>Card Messages for Every Occasion</h1><div class="answer-block"><p>Choose an occasion to find original messages organised by tone and relationship. Each page explains what to write, provides ready-to-use examples and links directly to a card maker that can turn the chosen wording into a digital image or folded printable PDF.</p></div><a class="button button-primary button-large" href="/app.html">Open the card maker</a></div></section><section class="section section-soft"><div class="container"><div class="grid grid-4">${pagesData.map(occasionCard).join('')}</div></div></section>`;
}

// Homepage
writePage('index.html', {
  pathname: '/', title: 'Card Maker Messages: Cards, Invitations and Messages',
  description: 'Card maker for personalised cards and invitations with original messages, premium designs, digital downloads and folded PDFs.',
  body: homeBody(), breadcrumbs: [{ name: 'Home', url: '/' }], type: 'WebApplication'
});

// App
const appSteps = ['Choose an occasion, recipient and tone.', 'Select or write the message.', 'Tap a complete design.', 'Preview every card panel.', 'Open an image or folded PDF.'];
writePage('app.html', {
  pathname: '/app.html', title: 'Card Maker and Invitation Maker',
  description: 'Card maker and invitation maker with original wording, premium one-tap designs, private photos and printable folded PDFs.',
  body: appBody(), breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Card maker', url: '/app.html' }], type: 'WebApplication', howTo: appSteps,
  extraScripts: `<script src="/assets/messages.js?v=${version}" defer></script><script src="/assets/pdf.js?v=${version}" defer></script><script src="/assets/app.js?v=${version}" defer></script>`
});

// SEO occasion pages
for (const page of pagesData) {
  const generated = seoPageBody(page);
  writePage(`${page.slug}.html`, {
    pathname: `/${page.slug}.html`, title: page.title, description: page.description, body: generated.body,
    breadcrumbs: generated.crumbs, type: 'Article', faq: page.faqs
  });
}

// Keyword-focused tool pages, each serving a distinct search intent
for (const page of toolPages) {
  const generated = toolLandingBody(page);
  writePage(`${page.slug}.html`, {
    pathname: `/${page.slug}.html`, title: page.title, description: page.description, body: generated.body,
    breadcrumbs: generated.breadcrumbs, type: 'HowTo', howTo: page.steps
  });
}

// Hubs and guides
writePage('occasions.html', {
  pathname: '/occasions.html', title: 'Card Messages for Every Occasion',
  description: 'Card messages for birthdays, weddings, Christmas, thanks, retirement and more, with original wording and free card designs.',
  body: occasionsBody(), breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'All occasions', url: '/occasions.html' }]
});
const how = howItWorksBody();
writePage('how-it-works.html', {
  pathname: '/how-it-works.html', title: 'How the Free Card Maker Works',
  description: 'How the free card maker turns a personalised message into a digital image or printable folded card in five simple steps.',
  body: how.body, breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'How it works', url: '/how-it-works.html' }], type: 'HowTo', howTo: how.steps
});
const print = printGuideBody();
writePage('printable-card-guide.html', {
  pathname: '/printable-card-guide.html', title: 'How to Print a Folded Card PDF',
  description: 'How to print a folded card PDF using A4 or US Letter paper, double-sided settings, short-edge flipping and a test sheet.',
  body: print.body, breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Printable card guide', url: '/printable-card-guide.html' }], type: 'HowTo', howTo: print.steps
});

for (const kind of ['about','methodology','privacy','terms','contact']) {
  const item = staticBody(kind);
  const filename = `${kind}.html`;
  const descriptions = {
    about: `About ${config.brand}, a free message-first card maker with one-tap designs and printable folded PDFs.`,
    methodology: 'How original card messages are written and checked for tone, clarity, sensitivity, suitability and attribution risk.',
    privacy: 'Privacy policy for browser-based card creation, local storage, photo processing, downloads and the ad-free launch site.',
    terms: 'Terms for creating personal digital and printable cards, using photos and wording responsibly and testing print settings.',
    contact: `Contact ${config.brand} for card maker help, print questions, message corrections and accessibility feedback.`
  };
  const crumbs = [{ name: 'Home', url: '/' }, { name: item.title, url: `/${filename}` }];
  writePage(filename, {
    pathname: `/${filename}`, title: item.title, description: descriptions[kind],
    body: `<section class="page-hero"><div class="narrow">${breadcrumb(crumbs)}<h1>${escapeHtml(item.title)}</h1><div class="answer-block"><p>${escapeHtml(item.answer)}</p></div></div></section><section class="section"><article class="narrow prose">${item.body}</article></section>`,
    breadcrumbs: crumbs
  });
}

// Real 404
writePage('404.html', {
  pathname: '/404.html', title: 'Page Not Found', description: 'The requested card message page could not be found.', noindex: true,
  body: `<section class="section"><div class="narrow"><p class="eyebrow">404</p><h1>That card page is not here</h1><div class="answer-block"><p>The link may be outdated or the address may have been typed incorrectly. Browse all card occasions, return to the homepage or open the card maker to continue creating your message and design.</p></div><div class="button-row"><a class="button button-primary" href="/app.html">Create a card</a><a class="button" href="/occasions.html">Browse occasions</a></div></div></section>`,
  breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Page not found', url: '/404.html' }]
});

// Indexing and platform files
const indexable = pageList.filter(page => !page.noindex);
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${indexable.map(page => {
  const image = page.pathname === '/' || page.pathname === '/app.html' ? `\n    <image:image><image:loc>${absolute('/assets/og-image.png')}</image:loc><image:title>${escapeHtml(config.brand)} card maker</image:title></image:image>` : '';
  return `  <url><loc>${absolute(page.pathname)}</loc><lastmod>${today}</lastmod>${image}\n  </url>`;
}).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

const robots = `User-agent: *\nAllow: /\nDisallow: /api/\n\nUser-agent: Googlebot\nAllow: /\nUser-agent: Bingbot\nAllow: /\nUser-agent: Slurp\nAllow: /\nUser-agent: DuckDuckBot\nAllow: /\nUser-agent: YandexBot\nAllow: /\nUser-agent: Baiduspider\nAllow: /\nUser-agent: Yeti\nAllow: /\nUser-agent: SeznamBot\nAllow: /\nUser-agent: Applebot\nAllow: /\nUser-agent: facebookexternalhit\nAllow: /\nUser-agent: Twitterbot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\nUser-agent: ChatGPT-User\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Claude-SearchBot\nAllow: /\n\n# Training bots are allowed in this launch configuration.\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: CCBot\nAllow: /\nUser-agent: Applebot-Extended\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
fs.writeFileSync(path.join(ROOT, `${config.indexNowKey}.txt`), config.indexNowKey);

const manifest = {
  name: config.brand, short_name: config.shortBrand, description: config.tagline, start_url: '/app.html', scope: '/', display: 'standalone',
  background_color: '#f8f4ec', theme_color: '#7c3f55',
  icons: [
    { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }
  ]
};
fs.writeFileSync(path.join(ROOT, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

const cacheFiles = ['/','/index.html','/app.html','/occasions.html','/assets/site.css','/assets/site.js','/assets/messages.js','/assets/pdf.js','/assets/app.js','/assets/icon-192.png','/assets/icon-512.png'];
fs.writeFileSync(path.join(ROOT, 'service-worker.js'), `const CACHE='card-maker-messages-v${version}';\nconst FILES=${JSON.stringify(cacheFiles)};\nself.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));\nself.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match('/404.html'))));});\n`);

const llms = `# ${config.brand}\n\n> ${config.tagline}. A client-side card and invitation maker with original messages and one-tap designs.\n\n## Key pages\n- ${absolute('/app.html')}: Create a personalised digital or folded printable card.\n- ${absolute('/occasions.html')}: Browse all occasion message guides.\n- ${absolute('/printable-card-guide.html')}: Print and fold the generated PDF.\n- ${absolute('/methodology.html')}: How original messages are written and checked.\n`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms);

const htaccess = `Options -Indexes\nErrorDocument 404 /404.html\n\n<IfModule mod_headers.c>\n  Header always set X-Content-Type-Options "nosniff"\n  Header always set Referrer-Policy "strict-origin-when-cross-origin"\n  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"\n  <FilesMatch "\\.(html|css|js)$">\n    Header set Cache-Control "no-cache, no-store, must-revalidate"\n  </FilesMatch>\n  <FilesMatch "\\.(png|jpg|jpeg|webp|svg|ico)$">\n    Header set Cache-Control "public, max-age=31536000, immutable"\n  </FilesMatch>\n</IfModule>\n\n<IfModule mod_rewrite.c>\n  RewriteEngine On\n  RewriteRule ^(?:src|tools|docs)/ - [F,L]\n</IfModule>\n\n<FilesMatch "^(site\.config\.json|package(?:-lock)?\.json|README\.md|DEPLOY-CHECKLIST\.txt|build\.(?:bat|sh))$">\n  Require all denied\n</FilesMatch>\n\n<FilesMatch "\\.(sqlite|db|env|log)$">\n  Require all denied\n</FilesMatch>\n`;
fs.writeFileSync(path.join(ROOT, '.htaccess'), htaccess);

console.log(`Built ${pageList.length} HTML pages, ${indexable.length} indexable URLs and shared assets.`);
